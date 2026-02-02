import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { SettingTab } from './settings';

export interface CaseStudyFigmaSettings {
    mySetting: string;
}

export const DEFAULT_SETTINGS: CaseStudyFigmaSettings = {
    mySetting: 'default'
}

interface Block {
    type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'list';
    level?: number;
    text?: string;
    items?: string[];
    id: string;
}

export default class CaseStudyFigmaPlugin extends Plugin {

    settings: CaseStudyFigmaSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SettingTab(this.app, this));
        // Add command to export current note
        this.addCommand({
            id: 'export-to-figma',
            name: 'Export case study to figma (clipboard)',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                const content = editor.getValue();
                const blocks = this.parseMarkdown(content);

                const json = JSON.stringify(blocks, null, 2);
                navigator.clipboard.writeText(json);

                new Notice(`✓ Copied ${blocks.length} blocks to clipboard. Paste in Figma plugin!`);
            }
        });

        // Add ribbon icon for quick access
        this.addRibbonIcon('upload-cloud', 'Export to figma', () => {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                const content = activeView.editor.getValue();
                const blocks = this.parseMarkdown(content);

                const json = JSON.stringify(blocks, null, 2);
                navigator.clipboard.writeText(json);

                new Notice(`✓ ${blocks.length} blocks ready for figma`);
            } else {
                new Notice('No active markdown file');
                return;
            }
        });
    }

    parseMarkdown(markdown: string): Block[] {
        const lines = markdown.split('\n');
        const blocks: Block[] = [];
        let blockId = 0;

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) {
                continue;
            }

            // Check for headings
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const hashes = headingMatch[1];
                const headingText = headingMatch[2];
                if (!hashes || !headingText) continue;

                const level = hashes.length;
                const text = headingText.trim();

                blocks.push({
                    type: `h${level}` as Block['type'],
                    level,
                    text,
                    id: `h${level}-${blockId++}`,
                });
                continue;
            }

            // Check for list items (-, *, +) - EACH ITEM SEPARATE
            const listMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
            if (listMatch) {
                const itemText = listMatch[1];
                if (!itemText) continue;

                blocks.push({
                    type: 'list',
                    text: itemText.trim(),
                    id: `list-${blockId++}`,
                });
                continue;
            }

            // Everything else is body text - each line separate
            blocks.push({
                type: 'body',
                text: trimmed,
                id: `body-${blockId++}`
            });
        }

        return blocks;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    onunload() {
        // Cleanup if needed
    }
}
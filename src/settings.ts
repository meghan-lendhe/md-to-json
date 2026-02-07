import {App, PluginSettingTab, Setting} from "obsidian";
import MarkdownToJSONPlugin from "./main";

export interface MarkdownToJSONSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: MarkdownToJSONSettings = {
	mySetting: 'default'
}

export class SettingTab extends PluginSettingTab {
	plugin: MarkdownToJSONPlugin;

	constructor(app: App, plugin: MarkdownToJSONPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
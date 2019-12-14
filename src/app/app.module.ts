import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { NvmSettingsModule, NvmSettingsService } from 'nvm-settings';
import { NvmChartsModule } from 'projects/nvm-charts/src/public_api';

export const settingsProvider = (config: NvmSettingsService) => () => {
	return config.load('/assets/settings.json');
};

export const useAppConfigProvider = { provide: APP_INITIALIZER, useFactory: settingsProvider, deps: [NvmSettingsService], multi: true };

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		NvmChartsModule,
		NvmSettingsModule.forRoot()
	],
	providers: [useAppConfigProvider],
	bootstrap: [AppComponent]
})
export class AppModule {}

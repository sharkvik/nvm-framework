import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { NvmSettingsModule, NvmSettingsService } from 'nvm-settings';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';

export const settingsProvider = (config: NvmSettingsService) => () => {
	return config.load('/assets/settings.json');
};

export const useAppConfigProvider = { provide: APP_INITIALIZER, useFactory: settingsProvider, deps: [NvmSettingsService], multi: true };

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		RouterModule,
		BrowserModule,
		AppRoutingModule,
		NvmSettingsModule.forRoot()
	],
	providers: [
		useAppConfigProvider
	],
	bootstrap: [
		AppComponent
	]
})
export class AppModule { }

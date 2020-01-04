import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { NvmSettingsModule, NvmSettingsService } from 'nvm-settings';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
		BrowserAnimationsModule,
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

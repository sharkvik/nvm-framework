# NvmSettings

[nvm-settings](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-settings/src/lib)

Модуль доступа к настройкам хранящимя на сервере в *.json
Установка

```
npm install nvm-settings --save
```

Интеграция

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { NvmSettingsModule, NvmSettingsService } from 'nvm-settings';

export const settingsProvider = (config: NvmSettingsService) => () => {
	return config.load('/assets/settings.json');
};

export const useAppConfigProvider = { provide: APP_INITIALIZER, useFactory: settingsProvider, deps: [NvmSettingsService], multi: true };

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		NvmSettingsModule.forRoot(),
	],
	providers: [
		useAppConfigProvider
	],
	bootstrap: [AppComponent]
})
export class AppModule { }


import { Component } from '@angular/core';
import { NvmSettingsService } from 'nvm-settings';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	private _value: string;
	constructor(
		private _settings: NvmSettingsService
	) {
		this._value = this._settings.get<string>('key');
	}
}
```

### getAsync<T>(key: string): Observable<T | null>

Асинхронное получение значения свойства key

```typescript
this.getAsync<string>(key).subscribe((value: string) => this._value = value);
```

### get<T>(key: string): T | null

Cинхронное получение значения свойства key

```typescript
this._value = this._settings.get<string>('key');
```

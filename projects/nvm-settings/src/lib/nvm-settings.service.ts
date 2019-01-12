import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NvmSubject } from 'nvm-cache';
import { tap, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class NvmSettingsService {
	private _settings: NvmSubject<any>;
	private _syncSettings: any;
	private _settingsUrl: string;

	constructor(private _http: HttpClient) {
		this._settings = new NvmSubject(() =>
				this._http
					.get(this._settingsUrl)
					.pipe(tap(res => this._syncSettings = res))
			);
	}

	public load(settingsUrl: string): Promise<void> {
		this._settingsUrl = settingsUrl;
		return this._settings.getOnce().toPromise();
	}

	public getAsync<T>(key: string): Observable<T | null> {
		return this._settings.getOnce().pipe(map((val: any) => val[key]))
	}

	public get<T>(key: string): T | null {
		return !!this._syncSettings ? (this._syncSettings[key] as T) : null;
	}
}

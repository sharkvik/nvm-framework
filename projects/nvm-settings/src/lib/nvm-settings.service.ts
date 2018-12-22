import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NvmSubject } from 'nvm-cache';
import { tap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class NvmSettingsService {
	private _settings: NvmSubject<any>;
	private _syncSettings: any;

	constructor(private _http: HttpClient) {}

	public load(settingsUrl: string): Promise<void> {
		if (!this._settings) {
			this._settings = new NvmSubject(() =>
				this._http
					.get(settingsUrl)
					.pipe(tap(res => (this._syncSettings = res)))
			);
		}
		return this._settings.getOnce().toPromise();
	}

	public getAsync<T>(key: string): Observable<T | null> {
		return !!this._settings ? this._settings.getOnce() : of(null);
	}

	public get<T>(key: string): T | null {
		return !!this._syncSettings ? (this._syncSettings[key] as T) : null;
	}
}

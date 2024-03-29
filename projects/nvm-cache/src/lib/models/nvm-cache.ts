import { NvmSubject } from './nvm-subject';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { isNil } from 'lodash';

export class NvmCache<T> {
	private _cache: Map<string, NvmSubject<T>> = new Map<string, NvmSubject<T>>();

	constructor(
		private _action: (id: string) => Observable<T>,
		private _ignoreCase: boolean = true
	) { }

	public get = (id: string): NvmSubject<T> => this._get(this._prepareKey(id));
	public getOnce = (id: string): Observable<T> => this._get(this._prepareKey(id)).getOnce();

	public refresh = (id: string, data?: T): Observable<T> => {
		id = this._prepareKey(id);
		return !isNil(data)
			? new Observable(s => this._onUpdate(s, id, data))
			: new Observable(s => this._onRefresh(s, id));
	}

	public delete = (id: string): void => {
		id = this._prepareKey(id);
		if (!this._cache.has(id)) {
			return;
		}
		this._cache.get(id).complete();
		this._cache.delete(id);
	}

	public get keys(): string[] {
		const keys = [];
		this._cache.forEach((v, k) => {
			keys.push(k);
		});
		return keys;
	}

	public has = (id: string): boolean => this._cache.has(this._prepareKey(id));
	public clear = (): void => Array.from(this._cache.keys()).forEach(this.delete);

	public reset = (id: string): void => {
		id = this._prepareKey(id);
		if (!this._cache.has(id)) {
			return;
		}
		this._cache.get(id).reset();
	}

	private _onUpdate = (s: Subscriber<T>, id: string, data: T) => {
		let subscription: Subscription;
		if (!this._cache.has(id)) {
			subscription = this._cacheItem(id, data)
				.getOnce()
				.subscribe((d: T) => {
					this._emit(s, d);
					setTimeout(() => this._unsubscribe(subscription));
				});
			return;
		}
		subscription = this._cache
			.get(id)
			.update(data)
			.subscribe(() => {
				this._emit(s, data);
				setTimeout(() => this._unsubscribe(subscription));
			});
	}

	private _onRefresh = (s: Subscriber<T>, id: string) => {
		const obs = !this._cache.has(id)
			? this._cacheItem(id).getOnce()
			: this._cache.get(id).refresh();

		const subscription = obs.subscribe((data: T) => {
			this._emit(s, data);
			setTimeout(() => this._unsubscribe(subscription));
		});
	}

	private _emit = (s: Subscriber<T>, data?: T): void => {
		s.next(data);
		s.complete();
	}

	private _cacheItem(id: string, itemData?: T): NvmSubject<T> {
		const item = new NvmSubject<T>(() => this._action(id));
		this._cache.set(id, item);
		if (!isNil(itemData)) {
			item.next(itemData);
		} else {
			item.refresh().subscribe();
		}
		return item;
	}

	private _get = (id: string): NvmSubject<T> => this._cache.has(id) ? this._cache.get(id) : this._cacheItem(id);
	private _prepareKey = (key: string): string => this._ignoreCase ? key.toUpperCase() : key;
	private _unsubscribe = (s: Subscription) => {
		if (!isNil(s) && !s.closed) {
			s.unsubscribe();
		}
	}
}

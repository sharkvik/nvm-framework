import isNil from 'lodash/isNil';
import { Injectable } from '@angular/core';
import { Subject, Observable, Subscriber } from 'rxjs';
import { IdItem } from './IdItem';

@Injectable({
	providedIn: 'root'
})
export class IDBWrapperService {
	public isActive: boolean = false;

	private _dbFactory: IDBFactory;
	private _connection: IDBOpenDBRequest;
	private _db: IDBDatabase;
	private _migrations: Array<(db: IDBDatabase, ev: IDBRequest) => void> = [];

	constructor() {
		this._dbFactory = window.indexedDB;
	}

	public open(name): Subject<boolean> {
		this._connection = this._dbFactory.open(name, this._migrations.length);
		const isActive$ = new Subject<boolean>();
		this._connection.onsuccess = (ev: Event) => {
			const target = ev.target as IDBRequest;
			this._db = target.result;
			if (!isNil(target)) {
				this.isActive = true;
			}
			isActive$.next(this.isActive);
			isActive$.complete();
		};
		this._connection.onerror = (ev: Event) => {
			const target = ev.target as IDBRequest;
			console.error(target.error);
		};
		this._connection.onupgradeneeded = (ev: Event) => {
			const target = ev.target as IDBRequest;
			const db = target.result;
			this._migrations
				.slice(db.version - 1)
				.forEach((migration: (db: IDBDatabase, ev: IDBRequest) => void) => {
					migration(db, target);
				});
		};
		return isActive$;
	}

	public insert(obj: IdItem): Observable<IdItem> {
		const store = this._findTable(obj.constructor.name);
		return new Observable<IdItem>((result$: Subscriber<IdItem>) => {
			if (isNil(store)) {
				result$.error(`Store ${obj.constructor.name} does not exists.`);
				result$.complete();
				return;
			}
			const request = store.add(obj);
			request.onsuccess = (ev) => {
				const target = ev.target as IDBRequest;
				obj.id = target.result;
				this.update(obj, obj.id)
					.subscribe((newObj: IdItem) => {
						result$.next(newObj);
						result$.complete();
					});
			};
			request.onerror = (ev) => {
				result$.error(ev);
				result$.complete();
			};
		});
	}

	public delete(table: string, key: string): Observable<boolean> {
		const store = this._findTable(table);
		return new Observable<boolean>((result$: Subscriber<boolean>) => {
			if (isNil(store)) {
				result$.next(false);
				result$.complete();
				return;
			}
			const request = store.delete(key);
			request.onsuccess = (ev) => {
				result$.next(true);
				result$.complete();
			};
			request.onerror = (ev) => {
				result$.next(false);
				result$.complete();
			};
		});
	}

	public update(obj: IdItem, key: number): Observable<IdItem> {
		const store = this._findTable(obj.constructor.name);
		return new Observable<IdItem>((result$: Subscriber<IdItem>) => {
			if (isNil(store)) {
				result$.next(null);
				result$.complete();
				return;
			}
			const request = store.put(obj, key);
			request.onsuccess = (ev) => {
				result$.next(obj);
				result$.complete();
			};
			request.onerror = (ev) => {
				result$.next(null);
				result$.complete();
			};
		});
	}

	public select<T>(table: string, query?: IDBKeyRange): Observable<Array<T>> {
		const store = this._findTable(table);
		return new Observable<Array<T>>((result$: Subscriber<Array<T>>) => {
			if (isNil(store)) {
				result$.next(null);
				result$.complete();
				return;
			}
			const request = (store as any).getAll(query);
			request.onsuccess = (ev) => {
				const result = (ev.target as IDBRequest).result as T[];
				result$.next(result);
				result$.complete();
			};
			request.onerror = (ev) => {
				result$.next(null);
				result$.complete();
			};
		});
	}

	public addMigration(migration: (db: IDBDatabase, ev: IDBRequest) => void) {
		this._migrations.push(migration);
	}

	private _findTable(table: string): IDBObjectStore {
		if (table.toUpperCase() === 'OBJECT') {
			return null;
		}
		const trx = this._db.transaction(table, 'readwrite');
		return trx.objectStore(table);
	}
}

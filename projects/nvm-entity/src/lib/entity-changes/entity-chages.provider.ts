import { isNil } from 'lodash/isNil';
import { Injectable } from '@angular/core';
import { IEntity } from '../entity/entity';
import { Subscription, Subject } from 'rxjs';
import { EntityChanges } from './EntityChanges';

@Injectable({
	providedIn: 'root'
})
export class EntityChagesProvider {
	private _registrations: Subscription[] = [];
	private _keys: Map<string, string[]> = new Map<string, string[]>();
	private _subscribers: Map<string, Subject<EntityChanges<IEntity<any>>[]>> = new Map<string, Subject<EntityChanges<IEntity<any>>[]>>();
	private _subscriptions: Map<string, Subscription> = new Map<string, Subscription>();

	constructor() { }

	public register<T>(entity: IEntity<T>): void {
		this._registrations.push(entity.changed.subscribe((changes: EntityChanges<IEntity<T>>[]) => {
			// что-то...
		}));
	}

	public subscribe<T>(entityId: string, action: (changes: EntityChanges<IEntity<T>>[]) => void): string {
		const subscriptionId = (this.newGuid() + ':' + entityId).toUpperCase();
		if (!this._keys.has(entityId)) {
			this._keys.set(entityId, []);
		}
		const keys = this._keys.get(entityId);
		keys.push(subscriptionId);
		const subj = new Subject<EntityChanges<IEntity<T>>[]>();
		this._subscriptions.set(subscriptionId, subj.subscribe((changes: EntityChanges<IEntity<T>>[]) => action(changes)));
		this._subscribers.set(subscriptionId, subj);
		return subscriptionId;
	}

	public unsubscribe(subscriptionId: string): void {
		subscriptionId = subscriptionId.toUpperCase();
		if (this._subscriptions.has(subscriptionId)) {
			const subscription = this._subscriptions.get(subscriptionId);
			if (!isNil(subscription) && !subscription.closed) {
				subscription.unsubscribe();
			}
			this._subscriptions.delete(subscriptionId);
		}
		if (this._subscribers.has(subscriptionId)) {
			this._subscribers.delete(subscriptionId);
		}
	}

	public clear(): void {
		this._keys = new Map<string, string[]>();
		this._subscriptions.forEach((val: Subscription, key: string) => this.unsubscribe(key));
		this._registrations.forEach((s: Subscription) => {
			if (!isNil(s) && !s.closed) {
				s.unsubscribe();
			}
		});
	}

	public newGuid() {
		return this._s4() + this._s4() + '-' + this._s4() + '-' + this._s4() + '-' +
			this._s4() + '-' + this._s4() + this._s4() + this._s4();
	}

	private _s4() {
		return Math
			.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
}

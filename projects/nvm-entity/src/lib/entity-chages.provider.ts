import { Injectable } from '@angular/core';
import { IEntity } from './entity/entity';
import { Subscription, Subject } from 'rxjs';
import { EntityChanges } from './entity-changes/entity-changes';
import { isNil } from 'lodash';

@Injectable({
	providedIn: 'root'
})
export class EntityChagesProvider {
	private _registrations: Subscription[] = [];
	private _keys: Map<string, string[]> = new Map<string, string[]>();
	private _subscribers: Map<string, Subject<EntityChanges<any>>> = new Map<string, Subject<EntityChanges<any>>>();
	private _subscriptions: Map<string, Subscription> = new Map<string, Subscription>();

	private get newGuid() {
		return `${this._s4}${this._s4}-${this._s4}-${this._s4}-${this._s4}-${this._s4}${this._s4}${this._s4}`;
	}

	private get _s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	public register<T>(entity: IEntity<T>): void {
		this._registrations.push(entity.changed.subscribe(this._onEntityChanged));
	}

	public subscribe<T>(entityId: string, action: (changes: EntityChanges<T>) => void): string {
		const subscriptionId = `${this.newGuid}:${entityId}`.toUpperCase();
		if (!this._keys.has(entityId)) {
			this._keys.set(entityId, []);
		}
		const keys = this._keys.get(entityId);
		keys.push(subscriptionId);
		const subj = new Subject<EntityChanges<T>>();
		this._subscriptions.set(subscriptionId, subj.subscribe(action));
		this._subscribers.set(subscriptionId, subj);
		return subscriptionId;
	}

	public unsubscribe(subscriptionId: string): void {
		subscriptionId = subscriptionId.toUpperCase();
		if (this._subscriptions.has(subscriptionId)) {
			this._unsubscribe(this._subscriptions.get(subscriptionId));
			this._subscriptions.delete(subscriptionId);
		}
		if (this._subscribers.has(subscriptionId)) {
			this._subscribers.delete(subscriptionId);
		}
	}

	public clear(): void {
		this._keys = new Map<string, string[]>();
		this._subscriptions.forEach(this._fromMapUnsubscribe);
		this._registrations.forEach(this._unsubscribe);
	}

	private _onEntityChanged = (changes: EntityChanges<any>) => {
		const entityId = changes.entity.id.toUpperCase();
		if (!this._keys.has(entityId)) {
			return;
		}
		const subscriptionIds = this._keys.get(entityId);
		subscriptionIds.forEach((s) => this._notify(s, changes));
	};

	private _unsubscribe = (s: Subscription): void => {
		if (isNil(s) || s.closed) {
			return;
		}
		s.unsubscribe();
	};

	private _fromMapUnsubscribe = (val: Subscription, key: string): void => this.unsubscribe(key);

	private _notify = (id: string, changes: EntityChanges<any>) => {
		if (!this._subscribers.has(id)) {
			return;
		}
		this._subscribers.get(id).next(changes);
	}
}

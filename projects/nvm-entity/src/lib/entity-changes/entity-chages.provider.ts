import { Injectable } from '@angular/core';
import { IEntity } from '../entity/entity';
import { Subscription } from 'rxjs';
import { EntityChanges } from './EntityChanges';

@Injectable({
	providedIn: 'root'
})
export class EntityChagesProvider {
	private _subscriptions: Subscription[] = [];
	private _subscribers: Map<string, any> = new Map<string, any>();
	constructor() { }
	public register<T>(entity: IEntity<T>): void {
		this._subscriptions.push(entity.changed.subscribe((changes: EntityChanges<IEntity<T>>[]) => {
			// что-то...
		}));
	}

	public subscribe(entityId: string): string {
		const subscriptionId = this.newGuid();
		this._subscribers.set(subscriptionId, entityId);
		return subscriptionId;
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

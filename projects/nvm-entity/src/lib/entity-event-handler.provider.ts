import { Injectable } from '@angular/core';
import { EntityChagesProvider } from './entity-chages.provider';
import { IEntity } from './entity/entity';
import { EntityEventHandler } from './entity-event-handler';

@Injectable({
	providedIn: 'root'
})
export class EntityEventHandlerProvider {
	constructor(private _changesProvider: EntityChagesProvider) { }

	public createHandler<T>(entity: IEntity<T>): EntityEventHandler<T> {
		return new EntityEventHandler<T>(this._changesProvider, entity);
	}
}

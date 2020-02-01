import { IEntity } from './entity/entity';
import { EntityChagesProvider } from './entity-chages.provider';
import { Subject } from 'rxjs';
import { FieldChanges } from './entity-changes/field-changes';
import { EntityChanges } from './entity-changes/entity-changes';

export class EntityEventHandler<T> {
	private _eventEmiters: Map<string, Subject<FieldChanges>> = new Map<string, Subject<FieldChanges>>();
	private _entityEventEmiter: Subject<EntityChanges<T>> = new Subject<EntityChanges<T>>();
	private _entitySubscription: string;

	constructor(private _changesProvider: EntityChagesProvider, private _entity: IEntity<T>) {
		Object.keys(this._entity).forEach((key) => this._eventEmiters.set(key, new Subject()));
		this._entitySubscription = this._changesProvider.subscribe(this._entity.id, this._notifyAll);
	}

	public fieldHandler(field: string): Subject<FieldChanges> {
		if (this._eventEmiters.has(field)) {
			return this._eventEmiters.get(field);
		}
		return null;
	}

	public entityHandler(): Subject<EntityChanges<T>> {
		return this._entityEventEmiter;
	}

	public destroy(): void {
		this._eventEmiters.forEach((val: Subject<FieldChanges>) => val.complete());
		this._entityEventEmiter.complete();
		this._changesProvider.unsubscribe(this._entitySubscription);
	}

	private _notifyAll = (changes: EntityChanges<T>): void => {
		this._entityEventEmiter.next(changes);
		changes.changes.forEach(this._notify);
	}

	private _notify = (changing: FieldChanges): void => {
		if (!this._eventEmiters.has(changing.field)) {
			return;
		}
		this._eventEmiters.get(changing.field).next(changing);
	}
}

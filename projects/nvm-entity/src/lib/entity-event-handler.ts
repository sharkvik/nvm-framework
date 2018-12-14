import { isNil } from 'lodash/isNil';
import { IEntity } from './entity/entity';
import { EntityChagesProvider } from './entity-chages.provider';
import { Subject, Observable } from 'rxjs';
import { FieldChanges } from './entity-changes/field-changes';
import { EntityChanges } from './entity-changes/entity-changes';
import { reduce } from 'rxjs/operators';

export class EntityEventHandler<T> {
	private _eventEmiters: Map<string, Subject<FieldChanges>> = new Map<string, Subject<FieldChanges>>();
	private _combinedEventEmiters: Map<string, Subject<FieldChanges>> = new Map<string, Subject<FieldChanges>>();
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

	public fieldsHandler(fields: string[]): Observable<EntityChanges<T>> {
		const subject = this._getCombinedSubject(fields);
		if (isNil(subject)) {
			return null;
		}
		// TODO: не будет работать.
		return subject.pipe(reduce((acc: EntityChanges<T>, val: FieldChanges) => {
			acc.changes.push(val);
			return acc;
		}, new EntityChanges<T>(this._entity, [])));
	}

	private _getCombinedSubject(fields: string[]): Subject<FieldChanges> {
		const subjects = fields
			.map((field: string) => this.fieldHandler(field))
			.filter((s: Subject<FieldChanges>) => !isNil(s));
		if (subjects.length === 0) {
			return null;
		}
		const key = fields.join(';').toUpperCase();
		if (this._combinedEventEmiters.has(key)) {
			return this._combinedEventEmiters.get(key);
		}
		const combinedSubject = new Subject<FieldChanges>();
		subjects.forEach((s: Subject<FieldChanges>) => {
			s.subscribe((c: FieldChanges) => {
				combinedSubject.next(c)
			});
		})
		this._combinedEventEmiters.set(key, combinedSubject);
		return this._combinedEventEmiters.get(key);
	}

	private _notifyAll = (changes: EntityChanges<T>): void => {
		changes.changes.forEach(this._notify)
	}

	private _notify = (changing: FieldChanges): void => {
		if (!this._eventEmiters.has(changing.field)) {
			return;
		}
		this._eventEmiters.get(changing.field).next(changing);
	}

	public destroy(): void {
		this._eventEmiters.forEach((val: Subject<FieldChanges>) => val.complete());
		this._changesProvider.unsubscribe(this._entitySubscription);
	}
}

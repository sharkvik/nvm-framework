import { Subject } from 'rxjs';
import { EntityChanges } from '../entity-changes/entity-changes';
import { FieldChanges } from '../entity-changes/field-changes';
export class IEntity<T> {
	public id: string;
	protected _data: T;
	public changed: Subject<EntityChanges<T>> = new Subject<EntityChanges<T>>();

	constructor(data: T) {
		this._data = data;
	}

	public refresh(data: T): void {
		const changes = [];
		Object.keys(data).forEach((key: string) => {
			if (key === 'changed' || key === '_data' || key === 'id') {
				return;
			}
			if (JSON.stringify(data[key]) !== JSON.stringify(this._data[key])) {
				changes.push(new FieldChanges(key, this._data[key], data[key]));
			}
			this._data[key] = data[key];
		});
		if (changes.length > 0) {
			this.changed.next(new EntityChanges<T>(this, changes));
		}
	}
}

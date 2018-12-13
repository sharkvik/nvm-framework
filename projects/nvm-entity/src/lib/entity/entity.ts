import { Subject } from 'rxjs';
import { EntityChanges } from '../entity-changes/EntityChanges';
import { FieldChanges } from '../entity-changes/field-changes';
export class IEntity<T> {
	public id: string;
	protected _data: T
	public changed: Subject<EntityChanges<IEntity<T>>>;

	public refresh(data: T): void {
		const changes = [];
		Object.keys((key: string) => {
			let changes = null;
			if (JSON.stringify(data[key]) !== JSON.stringify(this._data[key])) {
				changes.push(new FieldChanges(key, this._data[key], data[key]));
			}
			this._data[key] = data[key];
		})
		if (changes.length > 0) {
			this.changed.next(new EntityChanges(this, changes));
		}
	}
}

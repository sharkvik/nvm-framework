import { FieldChanges } from './field-changes';
import { IEntity } from '../entity/entity';

export class Changes<T> {
	constructor(public entity: T, public changes: FieldChanges[]) {}
}

export class EntityChanges<T> extends Changes<IEntity<T>> {
	constructor(public entity: IEntity<T>, public changes: FieldChanges[]) {
		super(entity, changes);
	}
}

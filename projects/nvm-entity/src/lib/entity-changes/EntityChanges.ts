import { IEntity } from './../entity/entity';
import { FieldChanges } from './field-changes';

export class EntityChanges<IEntity> {
	constructor(public entity: IEntity, public changes: FieldChanges[]) {}
}

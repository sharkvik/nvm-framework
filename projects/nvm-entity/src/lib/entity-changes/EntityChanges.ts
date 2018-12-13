import { IEntity } from './../entity/entity';

export class EntityChanges<IEntity> {
	constructor(public entity: IEntity, public field: string, public previosValue: any, public currentValue: any) {}
}

import { FieldChanges } from './../../projects/nvm-entity/src/lib/entity-changes/field-changes';
import { Component } from '@angular/core';
import { EntityEventHandlerProvider, IEntity, EntityChagesProvider } from 'projects/nvm-entity/src/public_api';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

export class Model extends IEntity<{id: string, name: string, type: string}> {
	constructor(public id: string, public name: string, public type: string) {
		super({id, name, type});
	}
}

@Component({
	selector: 'nvm-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	title = 'nvm';
	private _model: Model;

	constructor(private _eehp: EntityEventHandlerProvider, private _ecp: EntityChagesProvider) {
		this._initEventHandlers();
		interval(5000)
			.pipe(takeWhile(val => val <= 5))
			.subscribe((val) => {
				this._model.name = 'b' + val;
				this._model.refresh(this._model);
			});
		interval(3000)
			.pipe(takeWhile(val => val <= 5))
			.subscribe((val) => {
				this._model.type = 'c' + val;
				this._model.refresh(this._model);
			});
	}

	private _initEventHandlers() {
		this._model = new Model('1', 'a', '9');
		this._ecp.register(this._model);
		const nameSubj = this._eehp.createHandler(this._model).fieldHandler('name');
		nameSubj.subscribe((c: FieldChanges) => {
				console.log(`field: 'name'; entityId: ${this._model.id}; prev: ${c.previosValue}; cur: ${c.currentValue}`);
			});
		nameSubj.subscribe((c: FieldChanges) => {
				console.log(`*field: 'name'; entityId: ${this._model.id}; prev: ${c.previosValue}; cur: ${c.currentValue}`);
			});

		const typeSubj = this._eehp.createHandler(this._model).fieldHandler('type');
		typeSubj.subscribe((c: FieldChanges) => {
				if(c.currentValue === 'c3') {
					this._ecp.clear();
				}
				console.log(`field: 'type'; entityId: ${this._model.id}; prev: ${c.previosValue}; cur: ${c.currentValue}`);
			});

		const entitySubj = this._eehp.createHandler(this._model).entityHandler()
		entitySubj.subscribe((c) => {
				console.log(JSON.stringify(c.changes));
			});
	}
}

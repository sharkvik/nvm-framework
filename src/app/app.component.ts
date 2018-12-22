import { FieldChanges } from './../../projects/nvm-entity/src/lib/entity-changes/field-changes';
import { Component, OnInit } from '@angular/core';
import { EntityEventHandlerProvider, IEntity, EntityChagesProvider } from 'projects/nvm-entity/src/public_api';
import { interval, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NvmCache } from 'projects/nvm-cache/src/lib/models/nvm-cache';
import isNil from 'lodash/isNil';
import { NvmSettingsService } from 'nvm-settings';

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
export class AppComponent implements OnInit {
	title = 'nvm';
	private _model: Model;
	private _data = [{ '1': ['1.1', '1.2', '1.3'] }, { '2': ['2.1', '2.2', '2.3'] }, { '3': ['3.1', '3.2', '3.3'] }];
	private _cache: NvmCache<string> = new NvmCache<string>((id: string) => {
		return new Observable((s) => {
			console.log(`calculate ${id}`);
			this._result.push(`calculate ${id}`);
			const vals = this._data.find(x => !isNil(x[id]))[id];
			const val = vals.shift(0);
			s.next(val);
			s.complete();
		});
	});

	private _result = [];
	private _control = [
		'calculate 1',
		'1.1',
		'calculate 2',
		'2.1',
		'2.1',
		'calculate 3',
		'3.1',
		'3.1',
		'1.5',
		'calculate 1',
		'1.2',
		'calculate 2',
		'2.2',
		'2.2',
		'calculate 2',
		'2.3',
		'calculate 3',
		'3.2',
		'3.2'
	];

	constructor(
		private _eehp: EntityEventHandlerProvider,
		private _ecp: EntityChagesProvider,
		private _setings: NvmSettingsService
	) {
		const test = this._setings.get<string>('test');
		console.log(test);
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

	public ngOnInit(): void {
		this._cache.get('1').subscribe((s) => this._onSucsess(s, 'red')); 				// вывод 1
		this._cache.get('2').subscribe((s) => this._onSucsess(s, 'green')); 			// вывод 2
		const subscription = this._cache.get('2').subscribe((d) => {
			this._onSucsess(d, 'green', true);
		}); 																			// вывод 3
		this._cache.get('3').subscribe((s) => this._onSucsess(s, 'blue'));				// вывод 4
		this._cache.get('3').subscribe((s) => this._onSucsess(s, 'blue'));				// вывод 5
		setTimeout(() => {
			this._cache.refresh('1').subscribe();										// вывод 7
			this._cache.refresh('2').subscribe(() => {
				setTimeout(() => {
					if (!subscription.closed) {
						subscription.unsubscribe();
					}
				});
			});																			// вывод 8 - 2x
			this._cache.refresh('1', '1.5').subscribe();								// вывод 6
			setTimeout(() => this._cache.refresh('1').subscribe(), 100);				// пропущен, так как прошло только 100мс
			setTimeout(() => this._cache.refresh('2').subscribe(() => {					// вывод 9 - 1x
				this._cache.refresh('3').subscribe(() => {
					if (JSON.stringify(this._control) === JSON.stringify(this._result)) {
						console.log('pass');
					} else {
						console.log('fail');
					}
				});																		// вывод 10 - 2x
			}), 500);
		}, 1000);
	}

	private _onSucsess = (data: string, color: string, toUnsubscribe?: boolean): void => {
		this._result.push(data);
		console.log(`%c ${data} - ${new Date()}${!isNil(toUnsubscribe) ? ` ${toUnsubscribe}` : ''}`, `color: ${color};`);
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

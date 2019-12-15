import { FieldChanges } from './../../projects/nvm-entity/src/lib/entity-changes/field-changes';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EntityEventHandlerProvider, IEntity, EntityChagesProvider } from 'projects/nvm-entity/src/public_api';
import { interval, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NvmCache } from 'projects/nvm-cache/src/lib/models/nvm-cache';
import isNil from 'lodash/isNil';
import { NvmSettingsService } from 'nvm-settings';
import { ChartsBlock } from 'projects/nvm-charts/src/lib/charts-block/charts-block';
import { ChartType } from 'projects/nvm-charts/src/lib/chart/chart-type';
import { Chart } from 'projects/nvm-charts/src/lib/chart/chart';
import * as _ from 'lodash';

export class Model extends IEntity<{ id: string, name: string, type: string }> {
	constructor(public id: string, public name: string, public type: string) {
		super({ id, name, type });
	}
}

@Component({
	selector: 'nvm-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
	public charts: ChartsBlock;
	public charts1: ChartsBlock;
	public charts2: ChartsBlock;
	public foldersChart: Chart;
	public gisto: ChartsBlock;

	public get minHeight() {
		return 50 * this.gisto.charts[0].charts[0].data.length;
	}

	public get custom() {
		return [this.charts.charts[0], this.charts.charts[1]];
	}
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
		'ok',
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
		const donut = new Chart({
			id: Math.random().toString(),
			type: ChartType.DoughnutPercents,
			legend: ['Четыре', 'Пять'],
			label: 'column 3',
			charts: [{ label: 'Парам', data: [55, 45], backgroundColor: ['rgba(255, 0, 0, 0.7)', 'rgba(0,0,0,0.3)'] }],
			options: {
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						gridLines: {
							display: false
						},
						ticks: {
							display: false,
							beginAtZero: true
						}
					}],
					yAxes: [{
						gridLines: {
							display: false
						},
						ticks: {
							display: false,
							beginAtZero: true
						}
					}]
				},
				cutoutPercentage: 90
			}
		});
		this.foldersChart = new Chart({
			id: Math.random().toString(),
			label: 'Папочки 1',
			type: ChartType.HorizontalBar,
			legend: ['Один', 'Два', 'Три'],
			charts: [
				{
					data: [1, 2, 3],
					backgroundColor: ['green', 'red', 'blue']
				}
			]
		});
		const stuff = [
			new Chart({
				id: Math.random().toString(),
				label: 'column 1',
				type: ChartType.HorizontalBar,
				legend: ['Один', 'Два', 'Три'],
				charts: [
					{
						label: 'Парам',
						data: [1, 2, 3],
						backgroundColor: '#2ed297',
						barThickness: 10
					},
					{
						label: 'Пам',
						data: [2, 5, 1],
						backgroundColor: '#fc4a58',
						barThickness: 10
					}
				],
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							stacked: true,
							gridLines: {
								display: false
							},
							ticks: {
								display: false,
								beginAtZero: true
							}
						}],
						yAxes: [{
							stacked: true,
							gridLines: {
								display: false
							},
							ticks: {
								beginAtZero: true
							}
						}]
					}
				}
			}),
			new Chart({
				id: Math.random().toString(),
				type: ChartType.Bar,
				label: 'column 2',
				legend: ['Четыре', 'Пять', 'Шесть'],
				charts: [
					{ label: 'Парам', data: [5, 2, 4], backgroundColor: '#2e97d2' },
					{ label: 'Пам', data: [2, 5, 1], backgroundColor: '#fc4a58' }
				],
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							stacked: true,
							ticks: {
								beginAtZero: true
							}
						}],
						yAxes: [{
							stacked: true,
							ticks: {
								beginAtZero: true
							}
						}]
					}
				}
			})
		];
		const lines = [
			new Chart({
				id: Math.random().toString(),
				label: 'column 1',
				type: ChartType.Line,
				legend: ['Один', 'Два', 'Три'],
				charts: [
					{
						label: 'Парам',
						data: [1, 2, 3],
						borderColor: '#2ed297',
						lineTension: 0,
						fill: false
					},
					{
						label: 'Пам',
						data: [2, 5, 1],
						borderColor: '#fc4a58',
						lineTension: 0,
						fill: false
					}
				],
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							stacked: false,
							ticks: {
								beginAtZero: true
							}
						}],
						yAxes: [{
							stacked: false,
							ticks: {
								beginAtZero: true
							}
						}]
					}
				}
			}),
			new Chart({
				id: Math.random().toString(),
				type: ChartType.Line,
				label: 'column 2',
				legend: ['Четыре', 'Пять', 'Шесть'],
				charts: [
					{
						label: 'Парам',
						data: [5, 2, 4],
						borderColor: '#2e97d2',
						lineTension: 0,
						fill: false
					},
					{
						label: 'Пам',
						data: [2, 5, 1],
						borderColor: '#fc4a58',
						lineTension: 0,
						fill: false
					}
				],
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							ticks: {
								beginAtZero: true
							}
						}],
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					}
				}
			})
		];
		this.gisto = {
			label: 'Шесть',
			charts: [new Chart({
				id: Math.random().toString(),
				label: 'column 1',
				type: ChartType.HorizontalBar,
				legend: ['Один', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'Семь', 'Восемь'],
				charts: [
					{
						label: 'Парам',
						data: [1, 2, 3, 9, 2, 6, 4, 3],
						backgroundColor: '#2ed297',
						barThickness: 30
					}
				],
				options: {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							ticks: {
								display: false,
								beginAtZero: true
							}
						}],
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					}
				}
			})]
		}
		const clone = _.cloneDeep(donut);
		clone.type = ChartType.Doughnut;
		this.charts1 = {
			label: 'Один',
			charts: [clone, clone]
		};
		this.charts2 = {
			label: 'Пять',
			charts: [donut, donut, ...lines]
		};
		this.charts = {
			label: 'Два',
			charts: [...stuff, donut]
		};
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
			setTimeout(() => this._cache.refresh('1').subscribe(() => this._result.push('ok')), 100);				// пропущен, так как прошло только 100мс
			setTimeout(() => this._cache.refresh('2').subscribe(() => {					// вывод 9 - 1x
				this._cache.refresh('3').subscribe(() => {
					if (JSON.stringify(this._control) === JSON.stringify(this._result)) {
						console.log('pass');
					} else {
						console.log(`fail: ${JSON.stringify(this._result)}`);
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
			console.log(`field: 'name'; entityId: ${this._model.id}; prev: ${c.previousValue}; cur: ${c.currentValue}`);
		});
		nameSubj.subscribe((c: FieldChanges) => {
			console.log(`*field: 'name'; entityId: ${this._model.id}; prev: ${c.previousValue}; cur: ${c.currentValue}`);
		});

		const typeSubj = this._eehp.createHandler(this._model).fieldHandler('type');
		typeSubj.subscribe((c: FieldChanges) => {
			if (c.currentValue === 'c3') {
				this._ecp.clear();
			}
			console.log(`field: 'type'; entityId: ${this._model.id}; prev: ${c.previousValue}; cur: ${c.currentValue}`);
		});

		const entitySubj = this._eehp.createHandler(this._model).entityHandler()
		entitySubj.subscribe((c) => {
			console.log(JSON.stringify(c.changes));
		});
	}
}

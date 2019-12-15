import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartType } from './chart-type';

@Component({
	selector: 'chart',
	templateUrl: './chart.component.html',
	styleUrls: ['./chart.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit {
	@ViewChild('canvas') public context: ElementRef<HTMLCanvasElement>;
	@Input() public type: ChartType;
	@Input() public legend: string[];
	@Input() public charts: any[];
	@Input() public options: any;
	@Input() public height: string;
	@Input() public width: string;
	@Input() public id: string;
	@Output() public chartClicked: EventEmitter<{ id: string, chart: Chart, ev: any }> = new EventEmitter<{ id: string, chart: Chart, ev: any }>();

	public get activeColor(): string {
		if (!this.charts || !this.charts[0] || !this.charts[0].backgroundColor || !this.charts[0].backgroundColor[0]) {
			return '';
		}
		return this.charts[0].backgroundColor[0];
	}

	public get percents(): number {
		if (!this.charts || !this.charts[0] || !this.charts[0].data) {
			return 0;
		}
		if (!this.charts[0].data[1]) {
			return 100;
		}
		return Math.round((this.charts[0].data[1] + this.charts[0].data[0]) * this.charts[0].data[0] / 100);
	}

	public get info(): string {
		if (!this.charts || !this.charts[0] || !this.charts[0].data) {
			return `${0} из ${0}`;
		}
		if (!this.charts[0].data[1]) {
			return `${this.charts[0].data[0]} из ${this.charts[0].data[0]}`;
		}
		return `${this.charts[0].data[0]} из ${this.charts[0].data[1] + this.charts[0].data[0]}`;
	}

	public chart: any;
	private _typesMap: { [id: number]: string } = {
		1: 'line',
		2: 'bar',
		3: 'doughnut',
		4: 'horizontalBar',
		5: 'doughnut'
	};

	constructor() { }

	public ngOnInit() {
		setTimeout(() => {
			const context = this.context.nativeElement.getContext('2d');
			this.options.onClick = this._chartClicked;
			if (this.type === ChartType.DoughnutPercents) {
				this.charts[0].backgroundColor[0] = this.percents <= 33
					? 'red'
					: this.percents > 33 && this.percents <= 66
						? 'yellow'
						: 'green';
				this.charts[0].backgroundColor[1] = 'rgba(0,0,0,0.1)'
			}
			this.chart = new Chart(context, {
				type: this._typesMap[this.type],
				data: {
					labels: this.legend,
					datasets: this.charts
				},
				options: this.options
			});
		}, 1000);
	}

	private _chartClicked = (ev: any) => {
		this.chartClicked.emit({id: this.id, chart: this.chart, ev: ev});
	}
}

import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Chart } from './../../chart/chart';

@Component({
	selector: 'custom-chart-line',
	templateUrl: './custom-chart-line.component.html',
	styleUrls: ['./custom-chart-line.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class CustomChartLineComponent implements OnInit {
	@Input() public chart: Chart
	@Input() public xAxe: number;

	public data: number[];
	public colors: string[];
	public dataWidth: number[];
	public maxValue: number = 0;
	public maxPixelValue: number = 300;

	constructor() { }

	public ngOnInit() {
		this.maxValue = this.chart.charts.reduce((result: number, ch: any) => {
			const lineResult = ch.data.reduce((r: number, x: number) => r + x, 0);
			return result > lineResult ? result : lineResult;
		}, 0) + 10;
		this.maxValue = this.maxValue

		this.data = this.chart.charts.map(x => x.data[this.xAxe]);
		const pixelPerValue = this.maxPixelValue / this.maxValue;
		this.dataWidth = this.data.map(x => x * pixelPerValue);
		this.colors = this.chart.charts.map(x => x.backgroundColor);
	}
}

import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Chart } from '../chart/chart';
import { ChartType } from '../chart/chart-type';
import { ChartsBlock } from './charts-block';

@Component({
	selector: 'charts-block',
	templateUrl: './charts-block.component.html',
	styleUrls: ['./charts-block.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ChartsBlockComponent implements OnInit {
	@Input() public grid: [number, number] = [2, 2];
	@Input() public charts: ChartsBlock;
	public chartWidth: string;
	public chartHeight: string;

	constructor() {
	}

	public ngOnInit() {
		this.chartWidth = `calc(${Math.ceil(100 / this.grid[1])}% - 10px)`;
		this.chartHeight = `calc(${Math.ceil(100 / this.grid[0])}% - 10px)`;
	}

	public onChartClicked = (ev: { id: string, chart: any, ev: any }) => {
		const chart = this.charts.charts.find(x => x.id === ev.id);
		if (!chart || chart.type === ChartType.Doughnut) {
			return;
		}
		const element = ev.chart.getElementAtEvent(ev.ev);
		if (!element || !element[0]) {
			return;
		}
		const dataset = chart.charts.find(x => x.label === element[0]._view.datasetLabel).data;
		const value = dataset[chart.legend.indexOf(element[0]._view.label)];
		console.log(value);
	}
}

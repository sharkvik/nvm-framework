import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Chart } from './../chart/chart';
import * as _ from 'lodash';

@Component({
	selector: 'custom-chart',
	templateUrl: './custom-chart.component.html',
	styleUrls: ['./custom-chart.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CustomChartComponent implements OnInit {
	@Input() public label: string;
	@Input() public charts: Chart[] = [];

	public legend: {label: string, color: string}[] = [];

	constructor() { }

	public ngOnInit() {
		this.legend = _.uniqBy(this.charts.map(x => x.charts.map(y => ({
			label: y.label,
			color: y.backgroundColor
		}))).reduce((r, c) => [...r, ...c], []), (x) => x.label + x.color);
	}

}

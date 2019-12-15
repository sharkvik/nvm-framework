import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Chart } from './../chart/chart';

@Component({
	selector: 'blocks-chart',
	templateUrl: './blocks-chart.component.html',
	styleUrls: ['./blocks-chart.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class BlocksChartComponent implements OnInit {
	@Input() public chart: Chart;

	constructor() { }

	public ngOnInit() {
	}

}

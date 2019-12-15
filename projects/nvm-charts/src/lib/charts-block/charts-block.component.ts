import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Chart } from '../chart/chart';
import { ChartType } from '../chart/chart-type';

@Component({
	selector: 'charts-block',
	templateUrl: './charts-block.component.html',
	styleUrls: ['./charts-block.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class ChartsBlockComponent implements OnInit {
	@Input() public grid: [number, number] = [2, 2];
	public block: any;
	public chartWidth: string;
	public chartHeight: string;
	public get custom() {
		return [this.block.charts[0], this.block.charts[1]];
	}

	constructor() {
		this.block = {
			label: 'Один',
			charts: [
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
				}),
				new Chart({
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
						circumference: Math.PI * 6 / 4,
						rotation: -Math.PI - Math.PI / 4,
						cutoutPercentage: 90
					}
				})
			]
		};
		this.chartWidth = `calc(${Math.ceil(100 / this.grid[1])}% - 10px)`;
		this.chartHeight = `calc(${Math.ceil(100 / this.grid[0])}% - 10px)`;
	}

	public ngOnInit() {

	}

	public onChartClicked = (ev: { id: string, chart: any, ev: any }) => {
		const chart = this.block.charts.find(x => x.id === ev.id);
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

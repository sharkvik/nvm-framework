import { Component, OnInit } from '@angular/core';
import { ChartsBlock, Chart, ChartType } from '@nvm/nvm-charts';
import { cloneDeep } from 'lodash';

@Component({
	selector: 'nvm-charts',
	templateUrl: './nvm-charts.component.html',
	styleUrls: ['./nvm-charts.component.scss']
})
export class NvmChartsComponent implements OnInit {
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

	constructor(
	) {
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
		};
		const clone = cloneDeep(donut);
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
	}
}

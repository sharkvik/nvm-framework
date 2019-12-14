import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	AfterViewInit,
	ViewEncapsulation
} from "@angular/core";
import { Chart } from "chart.js";

@Component({
	selector: "chart",
	templateUrl: "./chart.component.html",
	styleUrls: ["./chart.component.less"],
	encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit, AfterViewInit {
	@ViewChild("canvas") public canvas: ElementRef<HTMLCanvasElement>;
	data = {
		labels: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July"
		],
		datasets: [
			{
				label: "Dataset 1",
				backgroundColor: "rgb(200, 0, 0)",
				borderColor: "rgb(200, 0, 0)",
				borderWidth: 1,
				data: [1, 2, 3, 4, 5, 6, 7]
			},
			{
				label: "Dataset 2",
				backgroundColor: "rgb(0, 200, 0)",
				borderColor: "rgb(0, 200, 0)",
				borderWidth: 1,
				data: [1, 2, 3, 4, 5, 6, 7]
			}
		]
	};
	public chart: any;

	constructor() {}

	ngOnInit() {
		setTimeout(() => {
			this.chart = new Chart(document.getElementById("canvas"), {
				type: "bar",
				data: {
					labels: [
						"Browser",
						"Game",
						"Word Processing",
						"Database",
						"Spreadsheet",
						"Multimedia"
					],
					datasets: [
						{
							label: "number of applications related to",
							data: [24, 10, 30, 20, 46, 78],
							backgroundColor: "rgba(54, 162, 235, 0.2",
							borderColor: "rgba(54, 162, 235, 1)",
							pointHoverBackgroundColor: "red",
							borderWidth: 1
						}
					]
				},
				options: {
					title: {
						text: "Application Logs",
						display: true
					},
					scales: {
						yAxes: [
							{
								ticks: {
									beginAtZero: true
								}
							}
						]
					}
				}
			});
		}, 1000);
	}

	public ngAfterViewInit(): void {}
}

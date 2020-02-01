import { ChartType } from './chart-type';

export class Chart {
	public id: string;
	public type: ChartType;
	public legend: string[];
	public charts: any[];
	public options: any;
	public label: string;
	constructor(data?: any) {
		if (data) {
			this.type = data.type;
			this.legend = data.legend;
			this.charts = data.charts;
			this.options = data.options;
			this.id = data.id;
			this.label = data.label;
		}
	}
}

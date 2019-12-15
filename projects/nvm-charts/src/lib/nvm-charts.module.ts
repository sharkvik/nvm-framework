import { NgModule } from "@angular/core";
import { ChartComponent } from "./chart/chart.component";
import { ChartsBlockComponent } from "./charts-block/charts-block.component";
import { CommonModule } from "@angular/common";
import { CustomChartComponent } from "./custom-chart/custom-chart.component";
import { CustomChartLineComponent } from "./custom-chart/custom-chart-line/custom-chart-line.component";

@NgModule({
	imports: [CommonModule],
	declarations: [
		ChartComponent,
		ChartsBlockComponent,
		CustomChartComponent,
		CustomChartLineComponent
	],
	exports: [
		ChartComponent,
		ChartsBlockComponent,
		CustomChartComponent,
		CustomChartLineComponent
	]
})
export class NvmChartsModule { }

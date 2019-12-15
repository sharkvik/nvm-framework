import { NgModule } from "@angular/core";
import { ChartComponent } from "./chart/chart.component";
import { ChartsBlockComponent } from "./charts-block/charts-block.component";
import { CommonModule } from "@angular/common";
import { CustomChartComponent } from "./custom-chart/custom-chart.component";
import { CustomChartLineComponent } from "./custom-chart/custom-chart-line/custom-chart-line.component";
import { BlocksChartComponent } from "./blocks-chart/blocks-chart.component";

@NgModule({
	imports: [CommonModule],
	declarations: [
		ChartComponent,
		ChartsBlockComponent,
		CustomChartComponent,
		CustomChartLineComponent,
		BlocksChartComponent
	],
	exports: [
		ChartComponent,
		ChartsBlockComponent,
		CustomChartComponent,
		CustomChartLineComponent,
		BlocksChartComponent
	]
})
export class NvmChartsModule { }

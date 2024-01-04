import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import * as d3 from 'd3';

import { ticker, STOCKS } from 'src/app/models/stocks';

@Component({
  selector: 'app-line-chart',
  encapsulation: ViewEncapsulation.None,

  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit, AfterViewInit, OnChanges {
  title = 'Line Chart';
  currentData: any;
  margin = { top: 20, right: 20, bottom: 30, left: 50 };
  width: number;
  height: number;
  x: any;
  y: any;
  svg: any;
  line?: d3.Line<[number, number]>;
  xAxis: any;
  yAxis: any;
  chartContainer: any;
  g: any;
  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.currentData = ticker;
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();
    this.initZoom();
    console.log(this.svg);
  }
  ngOnChanges(changes: SimpleChanges): void {
    // this.initSvg();
    // this.initAxis();
    // this.drawAxis();
    // this.drawLine();
  }
  ngAfterViewInit(): void {
    console.log(this.margin);
  }
  initSvg() {
    this.svg = d3.select('#svg').style('pointer-events', 'none');

    this.g = this.svg
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    let rect = this.g
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    this.chartContainer = this.g
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('class', 'chart-container');
    console.log(this.chartContainer, this.svg);

    // svg.selectAll(".bars rect").attr("x", d => x(d.letter)).attr("width", x.bandwidth());
  }

  initAxis() {
    this.x = d3.scaleTime().range([0, this.width]);
    // this.x = D3.scaleBand()
    //   .domain(D3.sort(this.currentData, (d) => -d.close).map((d) => d.date.toISOString()))
    //   .range([this.margin.left, this.width])
    //   .padding(0.1);
    let low: any = d3.min(this.currentData, (d: any) => d.low);
    let high: any = d3.max(this.currentData, (d: any) => d.high);
    this.y = d3
      .scaleLog()
      .domain([low ? low : 0, high ? high : 0])
      .rangeRound([this.height, this.margin.top]);
    this.x.domain(d3.extent(this.currentData, (d: any) => d.date));
    // this.y.domain(d3Array.extent(this.currentData, (d) => d.value));
  }

  drawAxis() {
    this.xAxis = d3.axisBottom(this.x);
    this.g
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height + this.margin.bottom)
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    this.yAxis = d3.axisLeft(this.y);
    this.g
      // .append('svg')
      // .attr('width', this.width)
      // .attr('height', this.height + this.margin.bottom)
      .append('g')
      .attr('class', 'axis axis--y')
      .call(this.yAxis)
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)');
  }

  drawLine() {
    this.line = d3
      .line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.close));

    let g = this.chartContainer
      .append('g')
      .attr('stroke-linecap', 'round')
      .attr('stroke', 'black')
      .selectAll('g')
      .data(this.currentData)
      .join('g')
      .attr(
        'transform',
        (d: any) => `translate(${this.x(d.date) ? this.x(d.date) : 0},0)`
      );

    g.append('line')
      .attr('y1', (d: any) => this.y(d.low))
      .attr('y2', (d: any) => this.y(d.high));

    g.append('line')
      .attr('y1', (d: any) => this.y(d.open))
      .attr('y2', (d: any) => this.y(d.close))
      .attr('stroke-width', 4)
      .attr('stroke', (d: any) =>
        d.open > d.close
          ? d3.schemeSet1[0]
          : d.close > d.open
          ? d3.schemeSet1[2]
          : d3.schemeSet1[8]
      );

    this.chartContainer
      .append('path')
      .datum(this.currentData)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('stroke-width', 3);
  }
  initZoom() {
    const extent: [[number, number], [number, number]] = [
      [this.margin.left, this.margin.top],
      [
        this.width + this.margin.right + this.margin.left,
        this.height + this.margin.bottom + this.margin.top,
      ],
    ];
    console.log(this.height, this.margin.bottom, this.margin.top);

    this.g.call(
      d3
        .zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', (event) => {
          this.x.range([0, this.width].map((d) => event.transform.applyX(d)));
          this.g.select('.axis--x').call(this.xAxis.scale(this.x));

          // let low = d3.min(this.currentData, (d: any) => d.low);
          // let high = d3.max(this.currentData, (d: any) => d.high);
          console.log(this.y);

          this.y.range([this.height, 0].map((d) => event.transform.applyY(d)));

          // this.y.range([0, this.height].map((d) => event.transform.applyX(d)));
          this.g.select('.axis--y').call(this.yAxis);
          this.chartContainer.attr('transform', event.transform);
        })
    );
  }
}

import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  componentDidMount() {
    console.log(this.props.csv_data);
    this.createStreamgraph();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.csv_data !== this.props.csv_data && this.props.csv_data) {
      console.log(this.props.csv_data);
      this.createStreamgraph();
    }
  }

  createStreamgraph() {
    const { csv_data: data } = this.props;
    if (!data) return;

    d3.select("#streamgraph").selectAll("*").remove();
    d3.select("#legend").selectAll("*").remove();
    d3.select(".tooltip").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const modelColorMap = {
      "GPT-4": "#e41a1c",
      Gemini: "#377eb8",
      "PaLM-2": "#4daf4a",
      Claude: "#984ea3",
      "LLaMA-3.1": "#ff7f00",
    };

    const parseDate = d3.timeParse("%Y-%m-%d");
    const formattedData = data.map((d) => ({
      date: parseDate(d.Date),
      "GPT-4": +d["GPT-4"],
      Gemini: +d.Gemini,
      "PaLM-2": +d["PaLM-2"],
      Claude: +d.Claude,
      "LLaMA-3.1": +d["LLaMA-3.1"],
    }));

    const stack = d3.stack().keys(Object.keys(modelColorMap)).offset(d3.stackOffsetWiggle);

    const stackedData = stack(formattedData);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(formattedData, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])), d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1]))])
      .range([height - margin.bottom, margin.top]);

    const area = d3
      .area()
      .x((d) => xScale(d.data.date))
      .curve(d3.curveCardinal)
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]));

    const svg = d3
      .select("#streamgraph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    svg
      .selectAll(".layer")
      .data(stackedData)
      .join("path")
      .attr("class", "layer")
      .attr("d", area)
      .attr("fill", (d) => modelColorMap[d.key] || "#ccc")
      .attr("opacity", 0.8)
      .on("mouseover", function (event, d) {
        tooltip.style("display", "block");
        const modelKey = d.key;
        const miniChartData = formattedData.map((data) => ({
          date: data.date,
          value: data[modelKey],
        }));

        renderMiniBarChart(miniChartData, modelKey, tooltip, modelColorMap[modelKey]);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 15}px`).style("top", `${event.pageY + 15}px`);
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
        tooltip.selectAll("*").remove();
      });

    const renderMiniBarChart = (data, modelKey, tooltip, color) => {
      tooltip.selectAll("*").remove();

      tooltip.append("h4").text(modelKey).style("margin", "0 0 10px 0");

      const miniWidth = 200;
      const miniHeight = 150;
      const miniMargin = { top: 10, right: 10, bottom: 30, left: 30 };

      const miniSvg = tooltip
        .append("svg")
        .attr("width", miniWidth + miniMargin.left + miniMargin.right)
        .attr("height", miniHeight + miniMargin.top + miniMargin.bottom)
        .append("g")
        .attr("transform", `translate(${miniMargin.left},${miniMargin.top})`);

      const xMiniScale = d3
        .scaleBand()
        .domain(data.map((d) => d.date))
        .range([0, miniWidth])
        .padding(0.2);

      const yMiniScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([miniHeight, 0]);

      miniSvg
        .selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => xMiniScale(d.date))
        .attr("y", (d) => yMiniScale(d.value))
        .attr("width", xMiniScale.bandwidth())
        .attr("height", (d) => miniHeight - yMiniScale(d.value))
        .attr("fill", color);

      const xAxis = d3.axisBottom(xMiniScale).tickFormat(d3.timeFormat("%b"));
      miniSvg.append("g").attr("transform", `translate(0,${miniHeight})`).call(xAxis).selectAll("text").style("text-anchor", "middle").attr("dx", "-0.5em").attr("dy", "0.5em");

      miniSvg.select(".x-axis").selectAll(".tick:last-child text").style("display", "none");

      const yAxis = d3.axisLeft(yMiniScale).ticks(8);
      miniSvg.append("g").call(yAxis);
    };

    const xAxis = d3.axisBottom(xScale).ticks(d3.timeMonth).tickFormat(d3.timeFormat("%b"));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height + 5})`)
      .call(xAxis);

    const legendContainer = d3.select("#legend");
    const legend = legendContainer.selectAll(".legend-item").data(Object.entries(modelColorMap).reverse()).join("div").attr("class", "legend-item");

    legend.append("div").style("background-color", ([, color]) => color);

    legend.append("span").text(([key]) => key);
  }

  render() {
    return (
      <div className="Child1">
        <div id="streamgraph" />
        <div id="legend" />
      </div>
    );
  }
}

export default Child1;

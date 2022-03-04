import { useRef, useEffect, useState } from "react";

export default function Heatmap() {
  const w = 1400;
  const h = 600;
  const svgRef = useRef();
  const [avgTemp, setAvgTemp] = useState(undefined)
  const [data, setData] = useState(undefined);
  const svg = window.d3.select(svgRef.current);
  const tooltip = window.d3.select("#tooltip");
  const month = ["January","February","March","April","May","June","July",
  "August","September","October","November","December"];

  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

  // fetch data
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(url);
      const json = await response.json();
      setAvgTemp(json.baseTemperature);
      // formating the data
      const tempdata = json.monthlyVariance.map((month) => {
        return [month.year, month.month, month.variance, `${month.year}-${month.month}-01`]
      });
      setData(tempdata);
    }
    fetchData()
  }, [])

  // setting the graph
  useEffect(() => {
    function drawGraph() {
      const cellWidth = (w - 200) / (2015 - 1753);
      const cellHeight = (h - 100) / 12;
      const xScale = window.d3.scaleTime()
        .domain([window.d3.min(data, (d) => new Date(d[0].toString())), window.d3.max(data, (d) => new Date(d[0].toString()))])
        .range([0, w - 200]);
      const xAxis = window.d3.axisBottom()
        .ticks(20)
        .scale(xScale);
      const yScale = window.d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range([0, h - 100]);
      const yAxis = window.d3.axisLeft()
        .scale(yScale)
        .tickFormat((d, i) => month[i]);
      svg.attr("width", w)
        .attr("height", h)
        .style("background-color", "white")
      // calling the axes
      svg.select("#x-axis")
        .call(xAxis)
        .attr("transform", `translate(80, ${h - 50})`)
      svg.select("#y-axis")
        .call(yAxis)
        .attr("transform", `translate(80, 50)`)
      // binding the data
      svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("x", d => xScale(new Date(d[0].toString())))
        .attr("y", d => yScale(d[1]))
        .attr("transform",`translate(80, 50)`)
        .attr("class", "cell")
        .attr("data-year", d => d[0])
        .attr("data-month", d => yScale(d[1]));
    }

    data && drawGraph();
  }, [data, svg, tooltip])
  return (
    <main>
      <h2 >Heatmap</h2>
      <section>
        <p id="title">Global Temperature</p>
        <div className="graph-container">
          <div id="tooltip" style={{ padding: "0.5em 1em" }}></div>
          <svg className="graph" ref={svgRef}>
            <g id="x-axis"></g>
            <g id="y-axis"></g>
            <text id="y-axis-label"></text>
            <g id="legend"></g>
          </svg>
        </div>
      </section>
    </main>
  );
}
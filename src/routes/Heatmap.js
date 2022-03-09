import { useRef, useEffect, useState } from "react";

export default function Heatmap() {
  const w = 1200;
  const h = 500;
  const svgRef = useRef();
  const [avgTemp, setAvgTemp] = useState(undefined)
  const [data, setData] = useState(undefined);
  const svg = window.d3.select(svgRef.current);
  const tooltip = window.d3.select("#tooltip");
  const legend = window.d3.select("#legend");

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
    const month = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];

    const colors = ["#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb", "#4575b4"];

    function drawGraph() {
      const cellWidth = (w - 200) / (2015 - 1753);
      const cellHeight = (h - 100) / 12;
      const minTemp = avgTemp + window.d3.min(data, d => d[2]);
      const maxTemp = avgTemp + window.d3.max(data, d => d[2]);
      // setting up color threshold maping 
      const color = window.d3.scaleQuantize()
        .domain([minTemp, maxTemp])
        .range(colors.reverse());
      // setting up the scaling for axes
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
        .attr("height", h);
      // calling the axes
      svg.select("#x-axis")
        .call(xAxis)
        .attr("transform", `translate(80, ${h - 50})`);
      svg.select("#y-axis")
        .call(yAxis)
        .attr("transform", `translate(80, 50)`);
      // binding the data
      svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("x", d => xScale(new Date(d[0].toString())))
        .attr("y", d => yScale(d[1]))
        .attr("transform", `translate(80, 50)`)
        .attr("class", "cell")
        .attr("fill", d => color(d[2] + avgTemp))
        .attr("data-year", d => d[0])
        .attr("data-month", d => d[1] - 1)
        .attr("data-temp", d => d[2])
        .attr("index", (d, i) => i)
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

      // displaying tooltip on hover
      function onMouseOver(e) {
        const x = e.pageX;
        const y = e.pageY;
        const index = e.target.getAttribute("index");
        const info = data[index];
        tooltip
          .style("top", y + "px")
          .style("left", x + "px")
          .html(
            month[info[1]] + ", " + info[0] + "<br>" +
            window.d3.format(".1f")(info[2] + avgTemp) + "&#8451; <br>" +
            (info[2] > 0 ? "+" + info[2] : info[2]) + "&#8451;")
          .style("opacity", "0.8")
          .attr("data-year", info[0])
          .style("background-color", "black")
          .style("color", "white");

        // hightlighting cell
        e.target.style.stroke = "black";
        e.target.style.strokeWidth = "2";
      }

      function onMouseOut(e) {
        tooltip.style("opacity", 0);
        // hide highlight of cell
        e.target.style.stroke = "none";

      }

      // setting the legend
      const legendYscale = window.d3.scaleLinear()
        .domain([minTemp, maxTemp])
        .range([0, 350]);
      const legendAxis = window.d3.axisRight()
        .scale(legendYscale)
        .tickFormat(window.d3.format(".1f"))
        .tickValues(color.thresholds());

      legend.append("g")
        .call(legendAxis)
        .attr("transform", "translate(" + (w - 30) + ", 50)");

      const threshold = color.thresholds();
      threshold.unshift(minTemp)
      legend.append("g")
        .selectAll("rect")
        .data(threshold)
        .enter()
        .append("rect")
        .attr("width", (d, i) => {
          if (i === 0 || i === colors.length - 1) return 0;
          return 50;
        })
        .attr("height", 50)
        .style("fill", d => color(d))
        .attr("x", w - 80)
        .attr("y", d => legendYscale(d) + 50);
    }

    data && drawGraph();
  }, [data, svg, tooltip, avgTemp, legend])

  return (
    <main>
      <h2 id="title">Heatmap - Monthly Global Land-Surface Temperature</h2>
      <section>
        <p id="description">Base temperature {avgTemp}&#8451; between 1753 - 2015</p>
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
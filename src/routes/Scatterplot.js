import { useRef, useEffect, useState } from "react";

export default function Scatterplot() {
  const w = 800;
  const h = 400;
  const svgRef = useRef();
  const [data, setData] = useState(undefined)

  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"

  // fetch data
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
    }
    fetchData()
  }, [])

  const svg = window.d3.select(svgRef.current);
  const tooltip = window.d3.select("#tooltip");
  // setting up svg
  useEffect(() => {
    const drawGraph = () => {
      const xScale = window.d3.scaleTime()
        .domain([window.d3.min(data, (d) => new Date((d.Year - 1).toString())), window.d3.max(data, (d) => new Date((d.Year + 1).toString()))])
        .range([0, w]);
      const yScale = window.d3.scaleTime()
        .domain([window.d3.min(data, d => new Date((d.Seconds * 1000))), window.d3.max(data, d => new Date((d.Seconds * 1000)))])
        .range([0, h]);
      const xAxis = window.d3.axisBottom()
        .scale(xScale);
      const yAxis = window.d3.axisLeft()
        .scale(yScale)
        .tickFormat(window.d3.timeFormat("%M:%S"));

      // axes
      svg.select("#x-axis")
        .call(xAxis)
        .attr("transform", `translate(${60},${h + 50})`);

      svg.select("#y-axis")
        .call(yAxis)
        .attr("transform", `translate(${60},${50})`)


      svg.attr("width", w + 100)
        .attr("height", h + 100);

      // entering data
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => xScale(new Date(d.Year.toString())))
        .attr("cy", (d, i) => yScale(new Date(d.Seconds * 1000)))
        .attr("r", 5)
        .attr("transform", `translate(${60},${50})`)
        .attr("fill", (d) => d.Doping ? "rgb(247, 183, 51, 0.7)" : "lightblue")
        .attr("stroke", (d) => d.Doping ? "#FC4A1A" : "blue")
        .attr("stroke-width", 1)
        .attr("class", "dot")
        .attr("data-xvalue", (d, i) => d.Year)
        .attr("data-yvalue", (d, i) => new Date(d.Seconds * 1000))
        .attr("index", (d, i) => i)
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

      // selecting legend and appending legends
      svg.select("#legend")
        .attr("transform", `translate(850, 250)`)
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#F7B733")

      svg.select("#legend")
        .attr("transform", `translate(850, 250)`)
        .append("text")
        .text("Riders with doping allegations")
        .attr("x", -150)
        .attr("y", 15)
        .style("font-size", 12)

      svg.select("#legend")
        .attr("transform", `translate(850, 250)`)
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "lightblue")
        .attr("y", 30)

      svg.select("#legend")
        .attr("transform", `translate(850, 250)`)
        .append("text")
        .text("No doping allegations")
        .style("font-size", 12)
        .attr("x", -110)
        .attr("y", 45)

      function onMouseOver(e) {
        const x = e.pageX;
        const y = e.pageY;
        const index = e.target.getAttribute("index");
        const info = data[index];
        tooltip
          .style("top", y + "px")
          .style("left", x + "px")
          .html(
            info.Name + ", " + info.Nationality + "<br>" +
            "Time: " + info.Time + ", Year: " + info.Year + "<br>" +
            info.Doping)
          .style("opacity", "1")
          .attr("data-year", info.Year)
      }

      function onMouseOut() {
        tooltip.style("opacity", 0)
      }
    }

    data && drawGraph()

  }, [data, svg, tooltip])

  return (
    <main>
      <h2 >Scatter Plot</h2>
      <section>
        <p id="title" >35 Fastest times up Alpe d'Huez</p>
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
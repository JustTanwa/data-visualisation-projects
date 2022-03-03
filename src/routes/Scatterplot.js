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
  // setting up svg
  useEffect(() => {
    const drawGraph = () => {
      const xScale = window.d3.scaleTime()
                              .domain([window.d3.min(data, (d) => new Date((d.Year - 1).toString())), window.d3.max(data, (d) => new Date((d.Year + 1).toString()))])
                              .range([0, w]);
      const yScale = window.d3.scaleTime()
                              .domain([window.d3.min(data, d => new Date((d.Seconds * 1000))),window.d3.max(data, d => new Date((d.Seconds * 1000)))])
                              .range([0, h]);
      const xAxis = window.d3.axisBottom()
                             .scale(xScale);
      const yAxis = window.d3.axisLeft()
                             .scale(yScale)
                             .tickFormat(window.d3.timeFormat("%M:%S"));

      // axes
      svg.select("#x-axis")
         .call(xAxis)
         .attr("transform", `translate(${60},${h})`);

      svg.select("#y-axis")
         .call(yAxis)
         .attr("transform", `translate(${60},${0})`)


      svg.attr("width", w + 100)
        .attr("height", h + 100);

      // entering data
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d,i) => xScale(new Date(d.Year.toString())))
        .attr("cy", (d, i) => yScale(new Date(d.Seconds * 1000)))
        .attr("r", 6)
        .attr("transform", `translate(${60},0)`)
        .attr("fill", "rgb(247, 183, 51, 0.7)")
        .attr("stroke", "#FC4A1A")
        .attr("stroke-width", 1)
        .attr("class", "dot")
        .attr("data-xvalue", (d,i) => d.Year)
        .attr("data-yvalue", (d,i) => new Date(d.Seconds * 1000))
    }

    data && drawGraph()

  }, [data])

  return (
    <main style={{ padding: "1rem 0" }}>
      <h2 >Scatter Plot</h2>
      <section>
        <p id="title" >35 Fastest times up Alpe d'Huez</p>
        <div className="graph-container">
          <div id="tooltip"></div>
          <svg className="graph" ref={svgRef}>
            <g id="x-axis"></g>
            <g id="y-axis"></g>
            <text id="y-axis-label"></text>
          </svg>
        </div>
      </section>
    </main>
  );
}
import { useRef, useEffect, useState } from "react";

export default function Choroplethmap() {
  const w = 1000;
  const h = 600;
  const svgRef = useRef();
  const svg = window.d3.select(svgRef.current);
  const tooltip = window.d3.select("#tooltip");
  const legend = window.d3.select("#legend");
  const [educationData, setEducationData] = useState(null);
  const [geoJson, setGeoJson] = useState(null);

  const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
  const usaGeomap = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

  // fetch the data
  useEffect(() => {
    async function fetchAllData() {
      const response = await Promise.all([
        fetch(educationURL),
        fetch(usaGeomap)
      ]);
      const jsons = await Promise.all(response.map(res => res.json()));

      setEducationData(jsons[0]);
      setGeoJson(jsons[1])
    }

    fetchAllData().catch(err => console.log("This is the error: " + err));

  }, [])

  useEffect(() => {
    function drawGraph() {
      // use topojson to convert to geojson
      const topoJson = window.topojson.feature(geoJson, geoJson.objects.counties).features;

      const minPercent = window.d3.min(educationData, d => d.bachelorsOrHigher);
      const maxPercent = window.d3.max(educationData, d => d.bachelorsOrHigher);

      const colorScheme = window.d3.scaleSequential()
        .domain([minPercent, maxPercent])
        .interpolator(window.d3.interpolateOranges);

      svg.attr("width", w)
        .attr("height", h)
        .style("background-color", "white")
        .append("g")
        .attr("id", "map-counties")
        .selectAll("path")
        .data(topoJson)
        .enter()
        .append("path")
        .attr("d", window.d3.geoPath())
        .attr("class", "county")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationData.filter(county => county.fips === d.id)[0].bachelorsOrHigher)
        .attr("fill", d => colorScheme(educationData.filter(county => county.fips === d.id)[0].bachelorsOrHigher))
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

      // displaying tooltip on hover
      function onMouseOver(e) {
        const x = e.pageX;
        const y = e.pageY;
        const fips = e.target.getAttribute("data-fips");
        const info = educationData.filter(county => county.fips === Number(fips))[0];
        tooltip
          .style("top", y + "px")
          .style("left", x + "px")
          .html(
            info.area_name + ", " + info.state + "<br>" + info.bachelorsOrHigher + "%")
          .style("opacity", "0.8")
          .attr("data-education", info.bachelorsOrHigher)
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
      // setting up linear gradient
      const defs = svg.append("defs");
      const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
      linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScheme.range()[0]);
      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScheme.range()[1]);
      // setting up legend
      const legendXscale = window.d3.scaleLinear()
        .domain([minPercent, maxPercent])
        .range([0, 250]);
      const legendAxis = window.d3.axisBottom()
        .scale(legendXscale)
        .tickValues(window.d3.range(minPercent, maxPercent, (maxPercent - minPercent) / 8)
          .map(boundary => Math.round(boundary)))
        .tickFormat(d => d + "%")

      legend.call(legendAxis)
        .attr("transform", "translate(600, 30)")
        .append("rect")
        .attr("height", 10)
        .attr("width", 250)
        .style("fill", "url(#linear-gradient)")
        .attr("transform", "translate(0, -10)");
      //legend.

      console.log(window.d3.range(minPercent, maxPercent, (maxPercent - minPercent) / 8).map(boundary => Math.round(boundary)))
      console.log(colorScheme(50))
    }

    if (educationData && geoJson) drawGraph();
  }, [educationData, geoJson, legend, svg, tooltip])

  return (
    <main>
      <h2 id="title">Choroplethmap - USA Education Attainment</h2>
      <section>
        <p id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</p>
        <div className="graph-container">
          <div id="tooltip" style={{ padding: "0em 1em" }}></div>
          <svg className="graph" ref={svgRef}>
            <g id="legend"></g>
          </svg>
        </div>
      </section>
    </main>
  );
}
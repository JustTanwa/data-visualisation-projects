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

      const colors = ["#fce0a7", "#fad17d", "#f9c75f", "#f7b733", "#fa8629", "#fb6a23", "#fc4d1d"]

      const colorScheme = window.d3.scaleQuantize()
        .domain([minPercent, maxPercent])
        .range(colors);

      svg.attr("width", w)
        .attr("height", h)
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

      // setting up legend
      const legendWidth = 250;
      const legendXscale = window.d3.scaleLinear()
        .domain([minPercent, maxPercent])
        .range([0, legendWidth]);
      const legendAxis = window.d3.axisBottom()
        .scale(legendXscale)
        .tickValues(colorScheme.thresholds())
        .tickFormat(d => Math.round(d).toFixed(1) + "%")
        .tickSize(-10)
      const threshold = colorScheme.thresholds();
      threshold.unshift(minPercent)

      legend.attr("transform", "translate(600, 30)")
        .append("g")
        .selectAll("rect")
        .data(threshold)
        .enter()
        .append("rect")
        .attr("width", legendWidth / threshold.length)
        .attr("height", 10)
        .attr("x", (d, i) => i * (legendWidth / threshold.length))
        .attr("y", -10)
        .style("fill", d => colorScheme(d));
      legend.call(legendAxis);

      legend.select(".domain")
        .remove();
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
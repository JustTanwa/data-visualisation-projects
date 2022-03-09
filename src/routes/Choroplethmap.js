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
      const jsons = await Promise.all(response.map( res => res.json()));

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
        .attr("data-education", d => educationData.filter( county => county.fips === d.id)[0].bachelorsOrHigher)
    }

    if (educationData && geoJson) drawGraph();
  }, [educationData, geoJson])

  return (
    <main>
      <h2 id="title">Choroplethmap - USA Education Attainment</h2>
      <section>
        <p id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</p>
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
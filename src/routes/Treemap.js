import { useRef, useEffect, useState } from "react";

export default function Treemap() {
  const w = 800;
  const h = 450;
  const svgRef = useRef();
  const svg = window.d3.select(svgRef.current);

  const [gameSaleData, setGameSaleData] = useState(null);
  const [movieSaleData, setMovieSaleData] = useState(null);
  const [kickstarterData, setkickstarterData] = useState(null);
  const [categories, setCategories] = useState({})
  const [curCategories, setCurCategories] = useState([])

  const gameSalesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
  const movieSalesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
  const kickstarterURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

  const layoutStyle = {
    gridTemplateColumns: "1000px auto",
  }

  // fetch data 
  useEffect(() => {
    async function fetchAllData() {
      const responseData = await Promise.all(
        [gameSalesURL, movieSalesURL, kickstarterURL].map(url => fetch(url))
      );
      const jsons = await Promise.all(responseData.map(response => response.json()));

      setGameSaleData(jsons[0]);
      setMovieSaleData(jsons[1]);
      setkickstarterData(jsons[2]);

      setCategories({
        games: jsons[0].children.map(getCategories),
        movies: jsons[1].children.map(getCategories),
        kickstart: jsons[2].children.map(getCategories),
      });

      setCurCategories(jsons[0].children.map(getCategories));
    }

    function getCategories(dataObj) {
      return dataObj.name;
    }
    fetchAllData()
  }, [])

  // setting up treemap
  useEffect(() => {
    const tooltip = window.d3.select("#tooltip");
    const colors = [
      "#fcff63",
      "#ff875f",
      "#e4b639",
      "#d0ff5a",
      "#7fff5e",
      "#36fa3e",
      "#57ff91",
      "#8bffea",
      "#7397ff",
      "#8076ff",
      "#b179ff",
      "#e673ff",
      "#ff739f",
      "#ff2f54",
      "#ff6969",
      "#b3b3b3",
      "#dcd6d6",
      "#c68753",
    ]

    const colorScale = window.d3.scaleOrdinal()
      .domain(curCategories)
      .range(colors);

    function drawTreeMap() {
      console.log(curCategories);
      const root = window.d3.hierarchy(gameSaleData)
        .sum(child => child.value)
        .sort((a, b) => b.value - a.value);

      const treemap = window.d3.treemap()
        .size([w, h])
        .paddingInner(1)
        .paddingOuter(2);

      treemap(root);

      svg.attr("width", w)
        .attr("height", h)
        .style("background-color", "#fff");

      const group = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "grouping");
        
      group.append("rect")
        .attr("class", "tile")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale(d.data.category))
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => d.data.value)
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

      group.append("text")
        .attr("transform", d => `translate(${d.x0 + 5}, ${d.y0 + 10})`)
        .style("font-size", 10)
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
        .text(gameTitle => gameTitle)
        .attr("x", 0)
        .attr("y", (d, i) => i * 10)

      function onMouseOver(e) {
        const x = e.pageX;
        const y = e.pageY;
        const name = e.target.getAttribute("data-name");
        const category = e.target.getAttribute("data-category")
        const info = gameSaleData.children
          .filter(cat => cat.name === category)[0].children
          .filter(catItem => catItem.name === name)[0];
        tooltip
          .style("top", y + "px")
          .style("left", x + "px")
          .html(
            `Name: ${info.name} <br>
            Category: ${info.category} <br>
            Value: ${info.value}`)
          .style("opacity", "0.8")
          .attr("data-value", info.value)
          .style("background-color", "black")
          .style("color", "white")
          .style("border", "none");
      }

      function onMouseOut(e) {
        tooltip.style("opacity", 0);
      }

      // setting up legend
      const legendSVG = window.d3.select("#legend-svg")
        .attr("width", 200)
        .attr("height", h);
      const legendItemWidth = 20;
      const legendItem = legendSVG.select("#legend")
        .attr("x", 0)
        .attr("y", 0)
        .selectAll("g")
        .data(curCategories)
        .enter()
        .append("g")
        .attr("class", "legend-item-grouping")
        .attr("transform", `translate(10, 20)`);

      legendItem.append("rect")
        .attr("width", legendItemWidth)
        .attr("height", legendItemWidth)
        .attr("y", (d, i) => i * (legendItemWidth + 2))
        .attr("fill", d => colorScale(d))
        .attr("class", "legend-item");

      legendItem.append("text")
        .text(d => d)
        .attr("y", (d, i) => i * (legendItemWidth + 2))
        .attr("transform", "translate(30, 15)");

    }

    if (gameSaleData) {
      console.log("drawing" + Object.keys(gameSaleData).length)
      drawTreeMap()
    };

  }, [gameSaleData, categories, svg, curCategories])
  return (
    <main>
      <h2 id="title">Treemap - Video Game Sales</h2>
      <section>
        <p id="description">Top 100 Most Sold Video Games Grouped by Platform</p>
        <div className="graph-container" style={layoutStyle}>
          <div id="tooltip" style={{ padding: "0em 1em" }}></div>
          <svg className="graph" ref={svgRef}>
          </svg>
          <svg id="legend-svg" style={{justifySelf: "start"}}>
            <g id="legend"></g>
          </svg>
        </div>
        <div className="button-container">
          <button className="games-info"> Games </button>
        <button className="movies-info" onClick={() => console.log("change the dataset") }> Movies </button>
        <button className="kickstart-info"> Kick Starter Pledges </button>
        </div>
      </section>
    </main>
  );
}
import { useRef, useEffect, useState } from "react";

export default function Treemap() {
  const w = 800;
  const h = 450;
  const svgRef = useRef();
  const svg = window.d3.select(svgRef.current);

  const [gameSaleData, setGameSaleData] = useState(null);
  const [movieSaleData, setMovieSaleData] = useState(null);
  const [kickstarterData, setkickstarterData] = useState(null);
  const [categories, setCategories] = useState({});
  const [curData, setCurData] = useState(null);
  const [curCategories, setCurCategories] = useState([]);
  const [displayInfo, setDisplayInfo] = useState({
    title: "Video Game Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform"
  })

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
    function clearTreeMap() {
      svg.selectAll("g").remove();
      window.d3.selectAll(".legend-item-grouping").remove()
    }

    clearTreeMap();

    function drawTreeMap() {
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
      const root = window.d3.hierarchy(curData ? curData : gameSaleData)
        .sum(child => child.value)
        .sort((a, b) => b.value - a.value);

      const treemap = window.d3.treemap()
        .size([w, h])
        .paddingInner(1);

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
        .text(title => title)
        .attr("x", 0)
        .attr("y", (d, i) => i * 10)

      function onMouseOver(e) {
        const x = e.pageX;
        const y = e.pageY;
        const name = e.target.getAttribute("data-name");
        const category = e.target.getAttribute("data-category");
        const info = (curData ? curData.children : gameSaleData.children)
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

    if (gameSaleData && categories && curCategories.length > 0) drawTreeMap();

  }, [gameSaleData, categories, svg, curCategories, curData]);

  function changeDataSet(element) {
    setCurCategories(categories[element.target.id]);
    switch (element.target.id) {
      case "games":
        setCurData(gameSaleData);
        setDisplayInfo({
          title: "Video Game Sales",
          description: "Top 100 Most Sold Video Games Grouped by Platform"
        })
        break;
      case "movies":
        setCurData(movieSaleData);
        setDisplayInfo({
          title: "Movie Sales",
          description: "Top 100 Highest Grossing Movies Grouped By Genre"
        });
        break;
      case "kickstart":
        setCurData(kickstarterData);
        setDisplayInfo({
          title: "Kickstarter Pledges",
          description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category"
        });
        break;
      default:
        break;
    }

  }
  return (
    <main>
      <h2 id="title">Treemap - {displayInfo.title}</h2>
      <section>
        <p id="description" style={{marginBottom: "0.25em"}}>{displayInfo.description}</p>
        <div className="button-container">
          <button className="games-info" id="games" onClick={changeDataSet}> Video Games Data</button>
          <button className="movies-info" id="movies" onClick={changeDataSet}> Movies Sale Data</button>
          <button className="kickstart-info" id="kickstart" onClick={changeDataSet}> Kickstarter Pledges Data</button>
        </div>
        <div className="graph-container" style={layoutStyle}>
          <div id="tooltip" style={{ padding: "0em 1em" }}></div>
          <svg className="graph" ref={svgRef}>
          </svg>
          <svg id="legend-svg" style={{ justifySelf: "start" }}>
            <g id="legend"></g>
          </svg>
        </div>
        
      </section>
    </main>
  );
}
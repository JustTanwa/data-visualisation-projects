import { useEffect, useState } from "react";

export default function Barchart() {
    const w = 600;
    const h = 400;
    const barWidth = w/275;

    const [data, setData] = useState([])

    // fetching data
    useEffect(() => {
        async function fetchData() {
            const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json");
            const json = await response.json();
            setData(json.data);
        }
        fetchData();
    }, [])

    // using the d3 inside useEffect to paint the graph onto page
    useEffect(() => {
        const drawGraph = () => {
            const graph = window.d3.select(".graph")
                                .attr("width", w)
                                .attr("height", h)
                                .style("background", "gray");
    
            graph.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", (d, i) => i * barWidth)
                .attr("y", (d, i) => h - d[1])
                .attr("width", barWidth)
                .attr("height", (d) => d[1])
                .attr("fill", "#006400")
                .attr("class","bar");
        }
        drawGraph();
    }, [data])

    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Bar Chart</h2>
        <section>
            <p id="title">United States GDP</p>
            <div>
                <svg className="graph"></svg>
            </div>
        </section>
      </main>
    );
  }
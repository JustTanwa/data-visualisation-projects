import { useEffect, useState } from "react";

export default function Barchart() {
    const w = 800;
    const h = 400;
    const barWidth = w/275;

    const [data, setData] = useState([])

    // fetching data
    useEffect(() => {
        async function fetchData() {
            const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json");
            const json = await response.json();
            let tempData = json.data.map((item) => {
                let year = item[0].split("-")[0];
                let month = item[0].split("-")[1];
                let quarter;
                if (month === "01") {
                    quarter = "Q1";
                }
                else if (month === "04") {
                    quarter = "Q2";
                }
                else if (month === "07") {
                    quarter = "Q3";
                }
                else if (month === "10") {
                    quarter = "Q4";
                }
                
                return [year, item[1], quarter, item[0]];
            });
            setData(tempData);
        }
        fetchData();
    }, [])

    // using the d3 inside useEffect to paint the graph onto page
    useEffect(() => {
        const drawGraph = () => {
            const xScale = window.d3.scaleTime()
                                .domain([window.d3.min(data, (d) => new Date(d[0])), window.d3.max(data, (d) => new Date(d[0]))])
                                .range([0, w]);
            
            const yScale = window.d3.scaleLinear()
                                .domain([0, window.d3.max(data, (d) => d[1])])
                                .range([h, 0]);
            
            const scale = window.d3.scaleLinear()
                                .domain([0, window.d3.max(data, (d) => d[1])])
                                .range([0, h]);

            const xAxis = window.d3.axisBottom()
                            .scale(xScale);

            const yAxis = window.d3.axisLeft()
                            .scale(yScale);
            // setting the w, and h of the svg
            const graph = window.d3.select(".graph")
                                .attr("width", w + 100)
                                .attr("height", h + 60);
            // plotting the axises
            graph.append("g")
                 .call(xAxis)
                 .attr("id", "x-axis")
                 .attr("transform", `translate(${60}, ${h})`);
            graph.append("g")
                 .call(yAxis)
                 .attr("id", "y-axis")
                 .attr("transform", `translate(${60}, 0)`);
            // plotting each rect data on the graph
            
            graph.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", (d, i) => i * barWidth + 60)
                .attr("y", (d, i) => h - scale(d[1]))
                .attr("width", barWidth)
                .attr("height", (d) => scale(d[1]))
                .attr("fill", "#006400")
                .attr("class","bar")
                .attr("data-gdp", (d) => d[1])
                .attr("data-date", (d) => d[3]);
            
            // adding lable to show the values
            graph.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                .text((d) => (d[0] + "," + d[1]))
                .attr("x", (d, i) => i * barWidth + 10)
                .attr("y", (d, i) => h - (i * 5) - 5)
                .attr("id", "tooltip")
                .style("opacity", 0)
            
        }
        drawGraph();
    }, [data, barWidth])

    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Bar Chart</h2>
        <section>
            <p id="title">United States GDP</p>
            <div className="graph-container">
                <svg className="graph"></svg>
            </div>
        </section>
      </main>
    );
  }
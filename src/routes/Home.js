import { useEffect, useState } from "react";
import data from "../AAPL.csv";

export default function Home() {
    const [appleData, setAppleData] = useState(null);

    // fetching data and processing data
    useEffect(() => {
        window.d3.csv(data).then(resData => {
            const data = resData.map(dailyData => ({
                date: new Date(dailyData.Date),
                open: +dailyData.Open,
                high: +dailyData.High,
                low: +dailyData.Low,
                close: +dailyData.Close,
                volume: +dailyData.Volume
            }))

            setAppleData(data);
        })
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        function drawGraph() {

            const svg = window.d3.select(".graph");
            const width = 900;
            const height = 500;
            const padding = 50;

            const minDate = window.d3.min(appleData, d => d.date);
            const maxDate = window.d3.max(appleData, d => d.date);
            const minClose = window.d3.min(appleData, d => d.close);
            const maxClose = window.d3.max(appleData, d => d.close);

            // initialise svg 
            svg.attr("width", width)
                .attr("height", height)
                .style("background-color", "rgba(255, 255, 255, 0.65)");

            // setting up axis
            const xScale = window.d3.scaleTime()
                .domain([minDate, maxDate])
                .range([padding, width - padding]);
            const xAxis = window.d3.axisBottom()
                .scale(xScale);

            const yScale = window.d3.scaleLinear()
                .domain([minClose - 10, maxClose + 10])
                .range([height - padding, padding]);
            const yAxis = window.d3.axisRight()
                .scale(yScale);

            svg.append("g")
                .attr("id", "x-axis")
                .call(xAxis)
                .attr("transform", "translate(0, " + (height - padding) + ")");

            svg.append("g")
                .attr("id", "y-axis")
                .call(yAxis)
                .attr("transform", "translate(" + (width - padding) + ", 0)");

            // drawing price line with path
            svg.append("path")
                .datum(appleData)
                .attr("fill", "none")
                .attr("stroke", "navy")
                .attr("stroke-width", "1.5")
                .attr("d", window.d3.line()
                    .x(d => xScale(d.date))
                    .y(d => yScale(d.close))
                );

            const minVol = window.d3.min(appleData, d => d.volume);
            const maxVol = window.d3.max(appleData, d => d.volume);
            const volumeScale = window.d3.scaleLinear()
                .domain([minVol, maxVol])
                .range([height - padding, (height * 3 / 4) - padding]);
            // plotting volume chart
            svg.selectAll("rect")
                .data(appleData)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.date))
                .attr("y", d => volumeScale(d.volume))
                .attr("width", 1)
                .attr("height", d => (height - padding) - volumeScale(d.volume))
                .style("fill", (d, i) => {
                    if (i === 0) return "green";
                    return appleData[i].close < appleData[i - 1].close ? "red" : "green";
                });

            // setting up focus - credits to Micah Stubb for this focus implementation
            const focus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("line")
                .attr("class", "x");

            focus.append("line")
                .attr("class", "y");

            window.d3.selectAll(".focus line")
                .style("stroke", "black")
                .style("strok-width", 1.5)
                .style("stroke-dasharray", "2 2");

            svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width - (2 * padding))
                .attr("height", height - (2 * padding))
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr("transform", `translate(${padding}, ${padding})`)
                .on("mouseover", () => focus.style("display", null))
                .on("mouseout", () => {
                    focus.style("display", "none");
                    clearToolTip()
                })
                .on("mousemove", onMouseMove);

            function onMouseMove(event) {
                // use binary search to find index of the date
                const bisectDate = window.d3.bisector(d => d.date).right;
                // reversing xScale to find date base on mouse x coord.
                const x0 = xScale.invert(window.d3.pointer(event)[0] + padding);
                // find index
                const i = bisectDate(appleData, x0, 1);
                const d0 = appleData[i - 1];
                const d1 = appleData[i];
                const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                focus.attr('transform', `translate(${xScale(d.date)}, ${yScale(d.close)})`);
                focus
                    .select('line.x')
                    .attr('x1', padding - xScale(d.date))
                    .attr('x2', width - (padding) - xScale(d.date))
                    .attr('y1', 0)
                    .attr('y2', 0);
                focus
                    .select('line.y')
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', (padding) - yScale(d.close))
                    .attr('y2', height - (padding) - yScale(d.close));

                showToolTip(d);

            }

            // tooltip show more data on hover
            function showToolTip(curData) {
                clearToolTip()
                const extraInfo = ["Open", "High", "Low", "Close", "Volume", "Date"]
                const tooltip = svg.append("g")
                    .attr("class", "tooltip")
                    .attr("transform", `translate(${padding}, ${padding})`);

                tooltip.append("rect")
                    .attr("width", 100)
                    .attr("height", 120)
                    .style("fill", "white")
                    .attr("x", -2)
                    .attr("y", -10)

                tooltip.selectAll(".info-text")
                    .data(extraInfo)
                    .enter()
                    .append("text")
                    .attr("class", "info-text")
                    .text(d => {
                        switch (d) {
                            case "Open":
                                return `${d}: ${curData.open.toFixed(2)}`;
                            case "High":
                                return `${d}: ${curData.high.toFixed(2)}`;
                            case "Low":
                                return `${d}: ${curData.low.toFixed(2)}`;
                            case "Close":
                                return `${d}: ${curData.close.toFixed(2)}`;
                            case "Volume":
                                return `${d}: ${(curData.volume / 1.0e+6).toFixed(2)}M`;
                            case "Date":
                                return `${d}: ${curData.date.toLocaleDateString()}`;
                            default:
                                break;
                        }
                    })
                    .attr("y", (d, i) => i * 20)
                    .attr("font-size", "12")
            }

            function clearToolTip() {
                window.d3.select(".tooltip").remove();
            }
        }

        if (appleData) drawGraph();
    }, [appleData])
    return (
        <main className="landingpage">
            <h2>Things you can do with D3</h2>
            <p id="description" style={{ fontSize: "1em", textDecoration: "none" }}>Data-Driven Document (D3) offers are great deal of functionality that allow you to bring data to life.</p>
            <div className="graph-container">
                <button style={{ padding: "0.5em 1em", margin: "0.5em 0" }}>Show 50 point moving average</button>
                <svg className="graph"></svg>
            </div>
        </main>
    )
}
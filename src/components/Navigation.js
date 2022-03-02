import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/barchart">Bar Chart</Link>
                </li>
                <li>
                    <Link to="/scatterplot">Scatterplot Graph</Link>
                </li>
                <li>
                    <Link to="/heatmap">Heat Map</Link>
                </li>
                <li>
                    <Link to="/choroplethmap">Choropleth Map</Link>
                </li>
                <li>
                    <Link to="/treemap">Treemap Diagram</Link>
                </li>
            </ul>
        </nav>
    )
}
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
    return (
        <nav>
            <Link to="/barchart">Bar Chart</Link>
            <Link to="/scatterplot">Scatterplot Graph</Link>
            <Link to="/heatmap">Heat Map</Link>
            <Link to="/choroplethmap">Choropleth Map</Link>
            <Link to="/treemap">Treemap Diagram</Link>
        </nav>
    )
}
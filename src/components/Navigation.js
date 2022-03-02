import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navigation() {
    return (
        <nav>
            <ul>
                <li>
                    <NavLink to="/barchart">Bar Chart</NavLink>
                </li>
                <li>
                    <NavLink to="/scatterplot">Scatterplot Graph</NavLink>
                </li>
                <li>
                    <NavLink to="/heatmap">Heat Map</NavLink>
                </li>
                <li>
                    <NavLink to="/choroplethmap">Choropleth Map</NavLink>
                </li>
                <li>
                    <NavLink to="/treemap">Treemap Diagram</NavLink>
                </li>
            </ul>
        </nav>
    )
}
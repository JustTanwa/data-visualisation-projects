import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Barchart from './routes/Barchart';
import Scatterplot from './routes/Scatterplot';
import Heatmap from './routes/Heatmap';
import Choroplethmap from './routes/Choroplethmap';
import Treemap from './routes/Treemap';
import Home from './routes/Home';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} >
        <Route index element={<Home/>} />
        <Route path="/barchart" element={<Barchart/>} />
        <Route path="/scatterplot" element={<Scatterplot/>} />
        <Route path="/heatmap" element={<Heatmap/>} />
        <Route path="/choroplethmap" element={<Choroplethmap/>} />
        <Route path="/treemap" element={<Treemap/>} />
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);

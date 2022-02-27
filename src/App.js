import Navigation from "./components/Navigation";
import { Outlet } from "react-router-dom";

function App() {
  return (
      <header>
        <h1>Data Visualisation with D3</h1>
        <Navigation />
        <Outlet />
      </header>
  )
}

export default App;

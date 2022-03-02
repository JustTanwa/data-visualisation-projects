import Navigation from "./components/Navigation";
import Footer from "./components/Footer"
import { Outlet, Link } from "react-router-dom";

function App() {
  return (
    <>
      <header>
          <Link to="/"><h1>Data Visualisation with D3</h1></Link>
      </header>
      <Navigation />
      <Outlet /> 
      <Footer />
    </>
      
  )
}

export default App;

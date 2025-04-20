import "./App.css";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import NavBar from "@/ui/NavBar";
import { routes } from "@/routes/AppRoutes";

function AppRoutesWrapper() {
  const routing = useRoutes(routes);
  return routing;
}

function App() {
  return (
    <Router>
      <NavBar />
      <AppRoutesWrapper />
    </Router>
  );
}

export default App;

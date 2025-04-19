// src/App.tsx
import "./App.css";
import { useRoutes, BrowserRouter as Router } from "react-router-dom";
import NavBar from "@/ui/NavBar";
import { routes } from "@/routes/AppRoutes";

function App() {
  const routing = useRoutes(routes);

  return (
    <Router>
      <NavBar />
      {routing}
    </Router>
  );
}

export default App;

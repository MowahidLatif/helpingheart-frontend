import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import NavBar from "@/ui/NavBar";
import AuthenticatedNavBar from "@/ui/AuthenticatedNavBar";
import { routes } from "@/routes/AppRoutes";

function AppRoutesWrapper() {
  const routing = useRoutes(routes);
  return routing;
}

function App() {
  // const isAuthenticated = localStorage.getItem("token") !== null;
  const isAuthenticated = true;

  return (
    <Router>
      {isAuthenticated ? <AuthenticatedNavBar /> : <NavBar />}
      <AppRoutesWrapper />
    </Router>
  );
}

export default App;

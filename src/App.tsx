import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <>
      <LoginPage />
      <HomePage />
      <LandingPage />
    </>
  );
}

export default App;

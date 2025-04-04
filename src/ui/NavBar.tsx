import React from "react";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        background: "#ccc",
        borderRadius: "5px",
        padding: "1rem",
        display: "flex",
        gap: "1rem",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/how-it-works">How It Works</Link>
      <Link to="/pricing">Pricing</Link>
      <Link to="/about">About Us</Link>
      <Link to="/faq">FAQ</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/signup">Sign Up</Link>
    </div>
  );
};

export default NavBar;

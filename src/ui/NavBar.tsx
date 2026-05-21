import React from "react";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        HelpingHandsFund
      </Link>
      <div className="navbar-menu">
        <Link to="/" className="navbar-link">
          Home
        </Link>
        <Link to="/how-it-works" className="navbar-link">
          How It Works
        </Link>
        <Link to="/pricing" className="navbar-link">
          Pricing
        </Link>
        <Link to="/about" className="navbar-link">
          About
        </Link>
        <Link to="/faq" className="navbar-link">
          FAQ
        </Link>
        <Link to="/contact" className="navbar-link">
          Contact
        </Link>
        {/* <Link to="/signin" className="navbar-link">Sign In</Link> */}
        {/* <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link> */}
        <Link to="/waitlist" className="btn btn-primary btn-sm">
          Join the Waitlist
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="page-footer">
      <div className="container">
        <div className="d-flex" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div className="font-bold mb-sm">HelpingHandsFund</div>
            <p className="text-secondary text-sm m-0">
              Fundraising infrastructure for organizations that need results.
            </p>
          </div>
          <nav className="d-flex" style={{ gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/how-it-works" className="text-secondary text-sm">How It Works</Link>
            <Link to="/pricing" className="text-secondary text-sm">Pricing</Link>
            <Link to="/about" className="text-secondary text-sm">About</Link>
            <Link to="/faq" className="text-secondary text-sm">FAQ</Link>
            <Link to="/contact" className="text-secondary text-sm">Contact</Link>
          </nav>
        </div>
        <div className="text-secondary text-sm mt-lg" style={{ borderTop: "1px solid var(--color-border, #dee2e6)", paddingTop: "1rem" }}>
          &copy; {new Date().getFullYear()} HelpingHandsFund. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

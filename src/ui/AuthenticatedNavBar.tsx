import React from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/Button/LogoutButton";
import Button from "@/components/Button/Button";

const AuthenticatedNavBar = () => {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        background: "#222",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        gap: ".5rem",
      }}
    >
      <p>Company Name</p>
      <Button buttonName="Campaign" onClick={() => navigate("/dashboard")} />
      <Button buttonName="Settings" onClick={() => navigate("/settings")} />
      <LogoutButton />
    </nav>
  );
};

export default AuthenticatedNavBar;

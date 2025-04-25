import React, { useReducer } from "react";
import { useNavigate } from "react-router-dom";

type FormState = {
  email: string;
  password: string;
};

type FormAction =
  | { type: "SET_FIRST_NAME"; payload: string }
  | { type: "SET_LAST_NAME"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_COMPANY_NAME"; payload: string }
  | { type: "SET_COMPANY_WEBSITE"; payload: string }
  | { type: "SET_COMPANY_DESCRIPTION"; payload: string }
  | { type: "SET_PHONE"; payload: string };

const initialState: FormState = {
  email: "",
  password: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
    default:
      return state;
  }
}

export default function SignIn() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.email || !state.password) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Submitting SignIn Data:", state);
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={state.email}
          onChange={(e) =>
            dispatch({ type: "SET_EMAIL", payload: e.target.value })
          }
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={state.password}
          onChange={(e) =>
            dispatch({ type: "SET_PASSWORD", payload: e.target.value })
          }
          required
        />

        <button type="submit" onClick={() => navigate("/dashboard")}>
          Sign In
        </button>
        <button type="submit" onClick={() => navigate("/reset-credentials")}>
          Reset Password
        </button>
      </form>
    </div>
  );
}

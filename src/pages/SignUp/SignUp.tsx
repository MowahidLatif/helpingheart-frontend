import React, { useReducer } from "react";
import { useNavigate } from "react-router-dom";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  companyWebsite?: string;
  companyDescription?: string;
  phone?: string;
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
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  companyName: "",
  companyWebsite: "",
  companyDescription: "",
  phone: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIRST_NAME":
      return { ...state, firstName: action.payload };
    case "SET_LAST_NAME":
      return { ...state, lastName: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_COMPANY_NAME":
      return { ...state, companyName: action.payload };
    case "SET_COMPANY_WEBSITE":
      return { ...state, companyWebsite: action.payload };
    case "SET_COMPANY_DESCRIPTION":
      return { ...state, companyDescription: action.payload };
    case "SET_PHONE":
      return { ...state, phone: action.payload };
    default:
      return state;
  }
}

export default function SignUp() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !state.email ||
      !state.firstName ||
      !state.lastName ||
      !state.password ||
      !state.companyName
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Submitting Signup Data:", state);
    // TODO: Send this data to the backend API (e.g., using Axios)
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          value={state.firstName}
          onChange={(e) =>
            dispatch({ type: "SET_FIRST_NAME", payload: e.target.value })
          }
          required
        />

        <label>Last Name:</label>
        <input
          type="text"
          value={state.lastName}
          onChange={(e) =>
            dispatch({ type: "SET_LAST_NAME", payload: e.target.value })
          }
          required
        />

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

        <label>Company Name:</label>
        <input
          type="text"
          value={state.companyName}
          onChange={(e) =>
            dispatch({ type: "SET_COMPANY_NAME", payload: e.target.value })
          }
          required
        />

        <label>Company Website (optional):</label>
        <input
          type="text"
          value={state.companyWebsite}
          onChange={(e) =>
            dispatch({ type: "SET_COMPANY_WEBSITE", payload: e.target.value })
          }
        />

        <label>Company Description (optional):</label>
        <textarea
          value={state.companyDescription}
          onChange={(e) =>
            dispatch({
              type: "SET_COMPANY_DESCRIPTION",
              payload: e.target.value,
            })
          }
        />

        <label>Phone Number:</label>
        <input
          type="tel"
          value={state.phone}
          onChange={(e) =>
            dispatch({ type: "SET_PHONE", payload: e.target.value })
          }
        />
        <button
          type="button"
          onClick={() => navigate("/signin")}
          style={{
            marginTop: "1rem",
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Already have an account? Sign in
        </button>

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

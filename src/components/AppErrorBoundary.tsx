import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled app error:", error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="container" style={{ padding: "2rem 1rem" }}>
          <h1>Something went wrong</h1>
          <p>We hit an unexpected error while rendering this page.</p>
          <button type="button" onClick={this.handleReload}>
            Reload page
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

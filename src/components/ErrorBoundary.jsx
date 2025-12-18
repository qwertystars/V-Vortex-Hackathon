import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const fallback = this.props.fallback;
    if (typeof fallback === "function") {
      return fallback({ error: this.state.error, reset: this.handleReset });
    }
    if (fallback) return fallback;

    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>Something went wrong</h2>
        <p style={{ margin: "0 0 12px" }}>
          Please refresh the page or try again.
        </p>
        <button type="button" onClick={this.handleReset}>
          Try again
        </button>
      </div>
    );
  }
}


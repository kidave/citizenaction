import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("UI Error:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-muted-foreground">
          Something went wrong. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}

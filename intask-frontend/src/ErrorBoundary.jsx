import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <h1 className="text-red-600 p-4">Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

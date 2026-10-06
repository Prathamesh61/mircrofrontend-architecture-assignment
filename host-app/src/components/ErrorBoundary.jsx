import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      `[ErrorBoundary] Error loading ${this.props.remoteName || "microfrontend"}:`,
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const { remoteName = "This", customMessage } = this.props;

      return (
        <div className="error-box">
          <h3>Service Unavailable</h3>
          <p>
            {customMessage ||
              `${remoteName} service is currently unavailable. Please make sure the remote application is running.`}
          </p>
          <button className="btn-retry" onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

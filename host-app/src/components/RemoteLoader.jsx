import React, { Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";

const RemoteLoader = ({
  children,
  remoteName = "Microfrontend",
  fallbackText = "Loading...",
  customMessage,
}) => {
  return (
    <ErrorBoundary remoteName={remoteName} customMessage={customMessage}>
      <Suspense
        fallback={
          <div className="loading-state">
            <p>{fallbackText}</p>
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default RemoteLoader;

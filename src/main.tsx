import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "./lib/AuthContext";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL || "";
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function Root() {
  if (!convex) {
    return (
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConvexProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

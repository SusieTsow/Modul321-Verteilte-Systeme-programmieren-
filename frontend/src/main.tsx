import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./keycloak.ts";

createRoot(document.getElementById("root")!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{
      onLoad: "login-required",
      checkLoginIframe: false,
    }}
  >
    <StrictMode>
      <App />
    </StrictMode>
  </ReactKeycloakProvider>
);

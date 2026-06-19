import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { NegocioProvider } from "./context/NegocioContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NegocioProvider>
      <App />
    </NegocioProvider>
  </StrictMode>
);

import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "src/App.tsx";

const root = document.getElementById("root");
if (root === null) throw Error("Root element not found.");

createRoot(root).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);

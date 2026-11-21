import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import 'bulma/css/bulma.min.css';
import "./index.scss";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

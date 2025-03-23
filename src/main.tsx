import React from "react";
import "./index.css";
import App from "app/app";
import { insertCoin } from "playroomkit";
import { createRoot } from "react-dom/client";
const container = document.getElementById("root")!;
const root = createRoot(container); // createRoot(container!) if you use TypeScript
insertCoin().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

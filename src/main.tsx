import React from "react";
import "./index.css";
import App from "app/app";
import { insertCoin, isHost } from "playroomkit";
import { createRoot } from "react-dom/client";
import { GameEngineProvider } from "./hooks/useGameEngine";
import { Leva } from "leva";

const container = document.getElementById("root")!;
const root = createRoot(container); // createRoot(container!) if you use TypeScript
insertCoin().then(() => {
  root.render(
    <React.StrictMode>
      <GameEngineProvider>
        <Leva hidden={!isHost()}></Leva>
        <App />
      </GameEngineProvider>
    </React.StrictMode>
  );
});

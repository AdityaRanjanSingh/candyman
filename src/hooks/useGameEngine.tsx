import { useControls } from "leva";
import {
  getState,
  isHost,
  PlayerState,
  useMultiplayerState,
  usePlayersList,
} from "playroomkit";
import React, { useEffect, useRef } from "react";

export const Phases = [
  "ready",
  "role-description",
  "role",
  "wizard-description",
  "wizard",
  "keyholder-description",
  "keyholder",
  "discussion-description",
  "discussion",
  "stop-description",
  "stop",
  "result-description",
  "result",
  "treasure-description",
  "treasure",
  "ring-description",
  "ring",
  "choose-player",
  "choose-card",
  "end",
];

export const INTRODUCTION_TIME = 5;
export const DISCUSSION_TIME = 15;

export const Time = [15, 15, 15, 60, 15, 15, 15, -1];
const GameEngineContext = React.createContext<{ players: PlayerState[] }>({
  players: [],
});

export const NB_MISSIONS = 5;

export const GameEngineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // GAME STATE
  const [timer, setTimer] = useMultiplayerState("timer", 0);
  const [phase, setPhase] = useMultiplayerState("phase", "question");
  const [playerTurn, setPlayerTurn] = useMultiplayerState("playerTurn", 0);
  const [playerStart, setPlayerStart] = useMultiplayerState("playerStart", 0);

  const players = usePlayersList(true);

  players.sort((a, b) => a.id.localeCompare(b.id)); // we sort players by id to have a consistent order through all clients

  const gameState = {
    timer,
    phase,
    playerTurn,
    playerStart,
    players,
  };

  const startGame = () => {
    if (isHost()) {
      console.log("Start game");
      setPhase("question");
    }
  };

  const phaseEnd = () => {
    let newTime = 0;
    switch (phase) {
      case "start":
        newTime = INTRODUCTION_TIME;
        setPlayerStart(1);
        break;
      case "question":
        break;
      case "answer":
        setPhase("result");
        setNextPlayerTurn();
        break;
      case "players":
        break;
      default:
        break;
    }

    setTimer(newTime);
  };
  const { paused } = useControls({
    paused: false,
  });
  const timerInterval = useRef();

  useEffect(() => {
    startGame();
  }, []);
  const setNextPlayerTurn = () => {
    const newPlayerTurn = (getState("playerTurn") + 1) % players.length;
    setPlayerTurn(newPlayerTurn, true);
  };

  const runTimer = () => {
    timerInterval.current = setInterval(() => {
      if (paused) return;
      if (!isHost()) return;
      const time = getState("timer");
      let newTime = time - 1;
      console.log("Timer", newTime);

      if (newTime <= 0) {
        phaseEnd();
      } else {
        if (isNaN(newTime)) newTime = 0;
        setTimer(newTime, true);
      }
    }, 1000) as never;
  };

  useEffect(() => {
    runTimer();
    return clearTimer;
  }, [phase, paused]);

  const clearTimer = () => {
    clearInterval(timerInterval.current);
  };

  return (
    <GameEngineContext.Provider
      value={{
        ...gameState,
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
};

export const useGameEngine = () => {
  const context = React.useContext(GameEngineContext);
  if (context === undefined) {
    throw new Error("useGameEngine must be used within a GameEngineProvider");
  }
  return context;
};

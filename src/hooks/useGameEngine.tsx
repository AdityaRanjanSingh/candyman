import { useControls } from "leva";
import {
  getState,
  isHost,
  PlayerState,
  useMultiplayerState,
  usePlayersList,
} from "playroomkit";
import React, { useEffect, useRef } from "react";

export const ROLES = {
  CANDYMAN: "CANDYMAN",
  BUYER: "BUYER",
  COP: "COP",
};
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
const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};
export const Time = [15, 15, 15, 60, 15, 15, 15, -1];
const GameEngineContext = React.createContext<{
  players: PlayerState[];
  phase: string;
}>({
  players: [],
  phase: "start",
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
  const [bustedPlayer, setBustedPlayer] = useMultiplayerState(
    "bustedPlayer",
    -1
  );
  const [soldPlayer, setSoldPlayer] = useMultiplayerState("soldPlayer", -1);
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
      setBustedPlayer(-1, true);
      distributeRoles();
      resetPoints();
      resetBusted();
      resetSold();
    }
  };

  const distributeRoles = () => {
    const roles = [
      ...new Array(1).fill(0).map(() => ROLES.CANDYMAN),
      ...new Array(1).fill(0).map(() => ROLES.COP),
      ...new Array(players.length - 2).fill(0).map(() => ROLES.BUYER),
    ];
    const shuffledArray = roles.sort(() => 0.5 - Math.random());

    players.forEach((pl) => {
      const randomInt = getRandomInt(shuffledArray.length - 1);
      pl.setState("role", shuffledArray[randomInt], true);
      shuffledArray.splice(randomInt, 1);
    });
  };

  const resetPoints = () => {
    players.forEach((pl) => {
      pl.setState("points", 0, true);
    });
  };
  const resetBusted = () => {
    players.forEach((pl) => {
      pl.setState("busted", false, true);
    });
  };
  const resetSold = () => {
    players.forEach((pl) => {
      pl.setState("sold", false, true);
    });
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

  useEffect(() => {
    if (bustedPlayer === -1 || !isHost()) return;
    const bustedPl = players[bustedPlayer];
    const copPlayer = players.find((pl) => pl.getState("role") === ROLES.COP);
    const role = bustedPl.getState("role");
    const copPoints = copPlayer?.getState("points");

    if (role === ROLES.CANDYMAN) {
      copPlayer?.setState("points", copPoints + 2, true);
      bustedPl.setState("busted", true, false);
      setPhase("busted", true);
    } else {
      bustedPl.setState("busted", true, false);
      copPlayer?.setState("points", copPoints - 1, true);
    }
    setBustedPlayer(-1, true);
  }, [bustedPlayer]);

  useEffect(() => {
    if (soldPlayer === -1 || !isHost()) return;

    const player = players[soldPlayer];
    const playerPoints = player.getState("points");
    player.setState("points", playerPoints + 1, true);
    player.setState("sold", true, true);
    setSoldPlayer(-1, true);
  }, [soldPlayer]);
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

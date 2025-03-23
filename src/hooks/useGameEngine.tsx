import {
  isHost,
  PlayerState,
  useMultiplayerState,
  usePlayersList,
} from "playroomkit";
import React, { useEffect } from "react";

export const ROLES = {
  CANDYMAN: "CANDYMAN",
  BUYER: "BUYER",
  COP: "COP",
};
export const PHASES = {
  RESTART: "RESTART",
  WINNER: "WINNER",
  EXPOSED: "EXPOSED",
  PLAY: "PLAY",
  SHUFFLE: "SHUFFLE",
};

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
  phase: PHASES.PLAY,
});

export const NB_MISSIONS = 5;

export const GameEngineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // GAME STATE
  const [phase, setPhase] = useMultiplayerState("phase", PHASES.PLAY);
  const [exposedPlayer, setExposedPlayer] = useMultiplayerState(
    "exposedPlayer",
    -1
  );
  const [soldPlayer, setSoldPlayer] = useMultiplayerState("soldPlayer", -1);
  const [highestPoints, setHighestPoints] = useMultiplayerState(
    "highestPoints",
    0
  );
  const [winner, setWinner] = useMultiplayerState("winner", -1);
  const players = usePlayersList(true);

  players.sort((a, b) => a.id.localeCompare(b.id)); // we sort players by id to have a consistent order through all clients

  const gameState = {
    phase,
    players,
    winner,
  };

  const startGame = () => {
    if (isHost()) {
      console.log("Start game");
      setExposedPlayer(-1, true);
      distributeRoles();
      resetPoints();
      resetExposed();
      resetSold();
      setPhase(PHASES.PLAY);
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
  const resetExposed = () => {
    players.forEach((pl) => {
      pl.setState("exposed", false, true);
    });
  };
  const resetSold = () => {
    players.forEach((pl) => {
      pl.setState("sold", false, true);
    });
  };

  useEffect(() => {
    startGame();
  }, []);

  const incrementPoints = (index: number, decrement: boolean = false) => {
    const player = players[index];
    const existingPoints = player.getState("points");
    const newPoints = decrement ? existingPoints - 1 : existingPoints + 1;
    player.setState("points", newPoints, true);

    if (newPoints < highestPoints) return;
    if (newPoints >= 5) {
      setHighestPoints(newPoints, true);
      setWinner(index, true);
      setPhase(PHASES.WINNER, true);
    } else {
      setHighestPoints(newPoints, true);
    }
  };

  useEffect(() => {
    if (exposedPlayer === -1 || !isHost()) return;
    const exposedPl = players[exposedPlayer];
    const copPlayerIndex = players.findIndex(
      (pl) => pl.getState("role") === ROLES.COP
    );

    const role = exposedPl.getState("role");

    if (role === ROLES.CANDYMAN) {
      incrementPoints(copPlayerIndex);
      incrementPoints(copPlayerIndex);
      exposedPl.setState("exposed", true, false);
      setPhase(PHASES.EXPOSED, true);
    } else {
      exposedPl.setState("exposed", true, false);
      incrementPoints(copPlayerIndex, true);
    }
    setExposedPlayer(-1, true);
  }, [exposedPlayer]);

  useEffect(() => {
    if (soldPlayer === -1 || !isHost()) return;

    const player = players[soldPlayer];
    incrementPoints(soldPlayer);
    player.setState("sold", true, true);
    setSoldPlayer(-1, true);
  }, [soldPlayer]);

  useEffect(() => {
    if (!isHost()) return;
    if (phase === PHASES.SHUFFLE) {
      setExposedPlayer(-1, true);
      distributeRoles();
      resetExposed();
      resetSold();
      setPhase(PHASES.PLAY);
    }
    if (phase === PHASES.RESTART) {
      startGame();
      setPhase(PHASES.PLAY);
    }
  }, [phase]);

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

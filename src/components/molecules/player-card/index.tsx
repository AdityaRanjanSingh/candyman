import { ROLES, useGameEngine } from "hooks/useGameEngine";
import { isHost, myPlayer, setState } from "playroomkit";
import { useEffect, useState } from "react";

export const Player = ({ index }: { index: number }) => {
  const { players } = useGameEngine();
  const me = myPlayer();
  const myIndex = players.findIndex((pl) => pl.id === me.id);
  const player = players[index];
  const isCurrentPlayer = myIndex === index;
  const playerRole = player.getState("role");
  const [reveal, setReveal] = useState(false);

  const points = player.getState("points");
  const sold = player.getState("sold");
  const busted = player.getState("busted");

  useEffect(() => {
    if (sold || busted) setReveal(true);
  }, [sold, busted]);
  const onSold = () => {
    setState("soldPlayer", index, true);
  };

  const onBust = () => {
    setState("bustedPlayer", index, true);
  };
  return (
    <div className="shadow-sm p-2 flex items-center flex-col gap-1 rounded-2xl">
      <div className="badge badge-accent">{points}</div>
      <label className="swap swap-flip">
        {/* this hidden checkbox controls the state */}
        <input checked={reveal} type="checkbox" />

        <div className="swap-off justify-center flex">
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img src={player.getProfile().photo} />
            </div>
          </div>
        </div>
        <div className="swap-on flex flex-col justify-center items-center">
          <h1 className="badge badge-info badge-sm">
            {sold ? "Sold" : busted ? "Bursted" : ""}
          </h1>
          <h1 className="badge badge-info badge-sm">
            {player.getState("role")}
          </h1>
        </div>
      </label>

      <h1 className="text-center text-l font-bold">
        {player.getProfile().name}
      </h1>
      {/* {busted && (
        <h1 className="badge badge-info badge-sm">{player.getState("role")}</h1>
      )} */}
      {isHost() && (
        <button
          className="btn btn-error btn-xs btn-wide"
          onClick={() => player.kick()}
        >
          Remove
        </button>
      )}
      {isCurrentPlayer && playerRole === ROLES.BUYER && !sold && (
        <button className="btn btn-primary btn-xs btn-wide" onClick={onSold}>
          Sold
        </button>
      )}
      {!isCurrentPlayer && me.getState("role") === ROLES.COP && !busted && (
        <button className="btn btn-primary btn-xs btn-wide" onClick={onBust}>
          Bust
        </button>
      )}
    </div>
  );
};

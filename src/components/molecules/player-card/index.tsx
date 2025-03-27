import { PHASES, ROLES, useGameEngine } from "hooks/useGameEngine";
import { isHost, myPlayer, setState } from "playroomkit";
import { useEffect, useState } from "react";

export const Player = ({
  index,
  className = "",
}: {
  index: number;
  className: string;
}) => {
  const { players, phase } = useGameEngine();
  const me = myPlayer();
  const myIndex = players.findIndex((pl) => pl.id === me.id);
  const player = players[index];
  const isCurrentPlayer = myIndex === index;
  const playerRole = player.getState("role");
  const [reveal, setReveal] = useState(false);

  const points = player.getState("points");
  const sold = player.getState("sold");
  const exposed = player.getState("exposed");

  useEffect(() => {
    if (sold || exposed || phase === PHASES.EXPOSED) {
      setReveal(true);
    } else {
      setReveal(false);
    }
  }, [sold, exposed, phase]);
  const onSold = () => {
    setState("soldPlayer", index, true);
  };

  const onExpose = () => {
    setState("exposedPlayer", index, true);
  };
  return (
    <div
      className={
        "shadow-sm p-2 flex items-center flex-col gap-1 rounded-2xl " +
        className
      }
    >
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
        <div className="swap-on flex flex-col justify-center items-center gap-1">
          <h1 className="badge badge-neutral badge-sm">
            {sold ? "Sold" : exposed ? "Exposed" : "Exposed"}
          </h1>
          <h1 className="badge badge-info badge-sm">
            {player.getState("role")}
          </h1>
        </div>
      </label>

      <h1 className="text-center text-l font-bold">
        {player.getProfile().name}
      </h1>
      {/* {exposed && (
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
      {!isCurrentPlayer &&
        me.getState("role") === ROLES.COP &&
        !exposed &&
        !sold && (
          <button
            className="btn btn-primary btn-xs btn-wide"
            onClick={onExpose}
          >
            Expose
          </button>
        )}
    </div>
  );
};

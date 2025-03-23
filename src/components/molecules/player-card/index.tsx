import { useGameEngine } from "hooks/useGameEngine";
import { isHost, myPlayer } from "playroomkit";

export const Player = ({ index }: { index: number }) => {
  const { players } = useGameEngine();
  const me = myPlayer();
  const myIndex = players.findIndex((pl) => pl.id === me.id);
  const player = players[index];
  const isCurrentPlayer = myIndex === index;
  return (
    <div className="bg-base-100 shadow-sm p-2 flex items-center flex-col">
      <div className="avatar">
        <div className="w-16 rounded-full">
          <img src={player.getProfile().photo} />
        </div>
      </div>
      <h1 className="text-center text-l mt-1 font-bold">
        {player.getProfile().name}
      </h1>
      {isHost() && (
        <button
          className="btn btn-error btn-xs btn-wide"
          onClick={() => player.kick()}
        >
          Remove
        </button>
      )}
      {isCurrentPlayer && (
        <>
          {/* <p className="text-base-content text-md capitalize">{player.getState("role")}</p> */}
          {/* <p className="text-base-content text-sm">
            Lookout for a signal from candyman
          </p> */}
        </>
      )}
    </div>
  );
};

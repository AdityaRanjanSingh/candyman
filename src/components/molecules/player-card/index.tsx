import { PlayerState } from "playroomkit";

export const Player = ({ player }: { player: PlayerState }) => {
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
      <p className="text-base-content text-sm">You are a buyer</p>
    </div>
  );
};

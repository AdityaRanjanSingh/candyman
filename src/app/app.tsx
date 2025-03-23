import { Player } from "components/molecules/player-card";
import { useGameEngine } from "hooks/useGameEngine";
import { myPlayer } from "playroomkit";

function App() {
  const me = myPlayer();
  const { players } = useGameEngine();
  const myIndex = players.findIndex((pl) => pl.id === me.id);
  return (
    <main>
      <header className="pt-16 max-w-screen-sm mx-auto ">
        <h1 className="text-3xl text-center font-bold mb-2">You</h1>
        <div className="flex justify-center">
          <Player index={myIndex} />
        </div>
      </header>
      <section className="max-w-screen-sm mx-auto mt-5">
        <h1 className="text-3xl text-center font-bold mb-2">Others</h1>
        <div className="flex justify-center gap-1 flex-wrap">
          {players.map(
            (player, index) =>
              myIndex !== index && <Player key={player.id} index={index} />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;

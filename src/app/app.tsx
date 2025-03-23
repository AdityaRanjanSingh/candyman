import { Player } from "components/molecules/player-card";
import { useGameEngine } from "hooks/useGameEngine";
import { myPlayer } from "playroomkit";

function App() {
  const me = myPlayer();
  const { players } = useGameEngine();
  const myIndex = players.findIndex((pl) => pl.id === me.id);
  return (
    <main className="relative max-w-screen-sm mx-auto max-h-screen h-full">
      <header className="pt-16">
        <h1 className="text-3xl text-center font-bold mb-2">
          You are a {me.getState("role")}
        </h1>
        <div className="flex justify-center">
          <Player index={myIndex} />
        </div>
      </header>
      <section className="mt-5 flex-1">
        <h1 className="text-3xl text-center font-bold mb-2">Others</h1>
        <div className="flex justify-center gap-1 flex-wrap">
          {players.map(
            (player, index) =>
              myIndex !== index && <Player key={player.id} index={index} />
          )}
        </div>
      </section>
      <footer className="fixed bottom-10 right-0 left-0 self-center flex justify-center">
        <button className="btn btn-primary">I am sold</button>
      </footer>
    </main>
  );
}

export default App;

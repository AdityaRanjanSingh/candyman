import { Player } from "components/molecules/player-card";
import { PHASES, useGameEngine } from "hooks/useGameEngine";
import { isHost, myPlayer, setState } from "playroomkit";
import ReactConfetti from "react-confetti";

function App() {
  const me = myPlayer();
  const { players, phase } = useGameEngine();
  const myIndex = players.findIndex((pl) => pl.id === me.id);
  return (
    <main className="relative max-w-screen-sm mx-auto max-h-screen">
      <ReactConfetti
        gravity={0.1}
        initialVelocityX={2}
        initialVelocityY={2}
        numberOfPieces={200}
        opacity={1}
        run={phase === PHASES.WINNER}
        recycle={false}
        wind={0}
      />
      <header className="pt-16">
        <h1 className="text-3xl text-center font-bold mb-2">
          You are a {me.getState("role")}
        </h1>
        <div className="flex justify-center">
          <Player index={myIndex} />
        </div>
      </header>
      <section className="mt-5 flex-1  mb-14">
        <h1 className="text-3xl text-center font-bold mb-2">Others</h1>
        <div className="flex justify-center gap-1 flex-wrap">
          {players.map(
            (player, index) =>
              myIndex !== index && <Player key={player.id} index={index} />
          )}
        </div>
      </section>
      <footer className="fixed bottom-10 gap-1 flex justify-center w-full">
        {isHost() && (
          <button
            className="btn btn-primary"
            onClick={() => setState("phase", PHASES.SHUFFLE, true)}
          >
            Shuffle roles
          </button>
        )}
        {isHost() && (
          <button
            className="btn btn-secondary"
            onClick={() => setState("phase", PHASES.RESTART, true)}
          >
            Restart
          </button>
        )}
      </footer>
    </main>
  );
}

export default App;

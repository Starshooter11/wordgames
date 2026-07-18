import RaddleGame from './raddle_game';

function App() {
  return (
    <>
      <header className="w-full text-center py-3 bg-slate-950 border-b border-slate-800">
        <a
          href="https://starshooter11.github.io/"
          className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          ← Back to Starshooter11.github.io
        </a>
      </header>
      <RaddleGame />
    </>
  );
}

export default App;

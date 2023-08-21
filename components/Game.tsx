import Link from "next/link";

const Game: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col space-y-4">
        <Link href="/game/Hash">Hasher</Link>
        <Link href="/game/Play">Play</Link>
      </div>
    </div>
  );
};

export default Game;

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";

import { hashMove, getSigner, removeItems } from "../utils/connect";

import Options from "./Options";
import Link from "next/link";

export type MoveTypes = "Rock" | "Paper" | "Scissors" | "Lizard" | "Spock";

export const MOVE_MAPPING: Record<MoveTypes, number> = {
  Rock: 1,
  Paper: 2,
  Scissors: 3,
  Lizard: 4,
  Spock: 5,
};

const HashScreen = () => {
  const [move, setMove] = useState<number>(0);
  const [salt, setSalt] = useState<number>(0);
  const [c1Hash, setC1Hash] = useState<string>("");

  const account = useWallet();

  const handleGenerateSalt = () => {
    const saltValue = Math.floor(Math.random() * 1000000000);

    if (typeof window !== "undefined") {
      localStorage.setItem("salt", saltValue.toString());
    }

    setSalt(saltValue);
  };

  const handleHashMove = async () => {
    try {
      if (!move) {
        alert("Please select a move first.");
        return;
      }
      const signer = await getSigner();
      const hashedValue = await hashMove(move, salt, signer);

      if (typeof window !== "undefined") {
        localStorage.setItem("hash", hashedValue);
      }

      setC1Hash(hashedValue);
      alert("Move hashed successfully!");
    } catch (error) {
      console.error("Error hashing move:", error);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center border w-1/2 p-5 bg-gray-100 rounded-lg shadow-md text-black">
      <div className="absolute right-2 top-2">
        <button
          className="bg-pink-600 text-white p-2 mb-5 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-opacity-50"
          onClick={removeItems}
        >
          REFRESH
        </button>
      </div>
      <Options user={account} setMove={setMove} />

      <label className="block text-black">Salt</label>
      <small>
        This is a randomly generated string which will be used to hash your move
        and will be used to solve the game.
      </small>
      <input
        className="mb-4 p-2 border rounded w-full text-center"
        type="text"
        value={salt}
        readOnly
      />

      <div className="flex flex-col justify-center items-center w-full">
        <button
          className="mt-5 bg-blue-600 p-2 hover:scale-125 rounded-md text-white"
          onClick={handleGenerateSalt}
        >
          Generate Salt
        </button>
        <button
          className="mt-5 bg-blue-600 p-2 hover:scale-125 rounded-md text-white"
          onClick={handleHashMove}
        >
          Hash Move
        </button>
        <p className="mt-5">Your hashed value: {c1Hash}</p>
      </div>

      <Link
        href="/game/Play"
        className="mt-5 bg-green-600 p-2 hover:scale-125 rounded-md text-white"
      >
        Play
      </Link>
    </div>
  );
};

export default HashScreen;

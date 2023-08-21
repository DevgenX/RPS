import { useState, useEffect } from "react";

import {
  connectWallet,
  CheckIsWalletConnected,
  hashMove,
  getSigner,
} from "../utils/connect";

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
  const [salt, setSalt] = useState(Math.floor(Math.random() * 1000000000));
  const [user, setUser] = useState<string>("");
  const [c1Hash, setC1Hash] = useState<string>("");

  const handleHashMove = async () => {
    try {
      if (!move) {
        alert("Please select a move first.");
        return;
      }
      const signer = await getSigner();
      const hashedValue = await hashMove(move, salt, signer);
      setC1Hash(hashedValue);
      alert("Move hashed successfully!");
    } catch (error) {
      console.error("Error hashing move:", error);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const connectedUser = await CheckIsWalletConnected();
      setUser(connectedUser);
    };
    getUser();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center border w-1/2 p-5 bg-gray-100 rounded-lg shadow-md text-black">
      <Options user={user} setMove={setMove} />

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

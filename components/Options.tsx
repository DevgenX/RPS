import React, { FC, SetStateAction } from "react";
import { connectWallet } from "@/utils/connect";

interface OptionsProps {
  user: string;
  setMove: React.Dispatch<SetStateAction<number>>;
}

export type MoveTypes = "Rock" | "Paper" | "Scissors" | "Lizard" | "Spock";

export const MOVE_MAPPING: Record<MoveTypes, number> = {
  Rock: 1,
  Paper: 2,
  Scissors: 3,
  Lizard: 4,
  Spock: 5,
};

const Options: FC<OptionsProps> = ({ user, setMove }) => {
  return (
    <>
      <div className="flex flex-col items-center mb-3 p-3">
        <h1 className="text-2xl font-bold mb-4">
          Rock Paper Scissors Lizard Spock
        </h1>
        {!user && <small>Connect wallet to play</small>}
        <button
          className="bg-blue-600 text-white p-2 rounded-md w-1/2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
          onClick={() => connectWallet()}
        >
          {user ? user.slice(0, 5) + ".." : "Connect Wallet"}
        </button>
      </div>
      <label className="block text-black mb-2">Select a Move:</label>
      <select
        className="mb-4 p-2 border rounded"
        onChange={(e) => setMove(MOVE_MAPPING[e.target.value as MoveTypes])}
      >
        <option value="Select A Move">Select</option>
        <option value="Rock">Rock</option>
        <option value="Paper">Paper</option>
        <option value="Scissors">Scissors</option>
        <option value="Lizard">Lizard</option>
        <option value="Spock">Spock</option>
      </select>
    </>
  );
};
export default Options;

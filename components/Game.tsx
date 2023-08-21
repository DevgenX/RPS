import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  CheckIsWalletConnected,
  deployRPSContract,
  getRPSContract,
  hashMove,
  getSigner,
} from "../utils/connect";
import { hasherAddress } from "@/utils/constants";

const Game = () => {
  const [move, setMove] = useState<number>(0);
  const [salt, setSalt] = useState(Math.random().toString(36).substring(2, 15));
  const [opponentAddress, setOpponentAddress] = useState<string>("");
  const [stake, setStake] = useState<number>(0);
  const [user, setUser] = useState<string>("");
  const [c1Hash, setC1Hash] = useState<string>("");

  type MoveTypes = "Rock" | "Paper" | "Scissors" | "Lizard" | "Spock";

  const MOVE_MAPPING: Record<MoveTypes, number> = {
    Rock: 1,
    Paper: 2,
    Scissors: 3,
    Lizard: 4,
    Spock: 5,
  };

  const startGame = async () => {
    const accounts = await connectWallet();
    if (!accounts || accounts.length === 0) return;

    setUser(accounts);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const c1Hash = "YOUR_C1_HASH_HERE";
    const opponentAdd = opponentAddress;
    const stakeAmount = stake;
    const deployedContractAddress = await deployRPSContract(
      c1Hash,
      opponentAdd,
      stakeAmount.toString(),
      signer
    );

    const rpsContract = getRPSContract(deployedContractAddress, signer);
  };

  const handleHashMove = async () => {
    try {
      if (!move) {
        alert("Please select a move first.");
        return;
      }
      const signer = await getSigner();
      const saltInt = parseInt(salt);
      const hashedValue = await hashMove(move, saltInt, signer);
      console.log(hasherAddress);
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
        <option value="Rock">Rock</option>
        <option value="Paper">Paper</option>
        <option value="Scissors">Scissors</option>
        <option value="Lizard">Lizard</option>
        <option value="Spock">Spock</option>
      </select>

      <label className="block text-black">Salt:</label>
      <small>
        This is a randomly generated string which will be used to hash your move
      </small>
      <input
        className="mb-4 p-2 border rounded w-full"
        type="text"
        value={salt}
        readOnly
      />

      <label className="block text-black">Opponent Address:</label>
      <small>Provide the wallet address of your desired opponent</small>
      <input
        className="mb-4 p-2 border rounded w-full"
        type="text"
        placeholder="Input opponent address here .."
        onChange={(e) => setOpponentAddress(e.target.value)}
      />

      <label className="block text-black">Bet amount in (ETH):</label>
      <small>
        The amount you input in here will double or lose it all depending on the
        game result. Please bet responsibly
      </small>
      <input
        className="mb-4 p-2 border rounded w-full"
        type="number"
        placeholder="How much do you want to BET? (ETH)"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setStake(parseFloat(e.target.value))
        }
      />
      <div className="flex flex-col justify-center items-center w-full">
        <button
          className="mt-5 bg-blue-600 p-2 hover:scale-125 rounded-md text-white"
          onClick={handleHashMove}
        >
          Hash Move
        </button>
        <p>Your hashed value: {c1Hash}</p>
      </div>

      <div className="flex flex-col justify-center items-center m-5 w-full">
        <button
          className="bg-blue-600 text-white p-2 mb-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
          onClick={startGame}
        >
          Create Game
        </button>
      </div>
    </div>
  );
};

export default Game;

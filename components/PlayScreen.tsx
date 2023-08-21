import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  CheckIsWalletConnected,
  deployRPSContract,
  getRPSContract,
  getSigner,
  solveGame,
} from "../utils/connect";

import Link from "next/link";

import Options from "./Options";

const PlayScreen = () => {
  const [move, setMove] = useState<number>(0);
  const [opponentAddress, setOpponentAddress] = useState<string>("");
  const [salt, setSalt] = useState<number>(0);
  const [stake, setStake] = useState<number>(0);
  const [user, setUser] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>("");
  const [hashedValue, setHashedValue] = useState<string>("");
  const [role, setRole] = useState<"player1" | "player2" | null>(null);

  const startGame = async () => {
    const accounts = await connectWallet();
    if (!accounts || accounts.length === 0) return;
    setUser(accounts);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const c1Hash = hashedValue;
    const opponentAdd = opponentAddress;
    const stakeAmount = stake;
    const deployedContractAddress = await deployRPSContract(
      c1Hash,
      opponentAdd,
      stakeAmount.toString(),
      signer
    );

    setContractAddress(deployedContractAddress);

    // save the smart contract address to the local storage, make it persistent on refresh
    localStorage.setItem("contractAddress", deployedContractAddress);
  };

  const claimTimeout = async () => {
    try {
      const signer = await getSigner();

      if (!contractAddress) {
        return;
      }
      const rpsContract = getRPSContract(contractAddress, signer);

      if (role === "player1") {
        await rpsContract.j1Timeout();
      } else if (role === "player2") {
        await rpsContract.j2Timeout();
      } else {
        throw new Error("Current user is not a participant in the game.");
      }
      alert("Staked ETH claimed due to timeout!");
    } catch (error) {
      console.error("Error claiming timeout:", error);
    }
  };

  const determineRole = async () => {
    const signer = await getSigner();

    if (!contractAddress) {
      return;
    }
    const rpsContract = getRPSContract(contractAddress, signer);
    const player1Address = await rpsContract.j1();
    const player2Address = await rpsContract.j2();

    if (user.toLowerCase() === player1Address.toLowerCase()) {
      setRole("player1");
    } else if (user.toLowerCase() === player2Address.toLowerCase()) {
      setRole("player2");
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const connectedUser = await CheckIsWalletConnected();
      setUser(connectedUser);
    };

    const savedContractAddress = localStorage.getItem("contractAddress");
    if (savedContractAddress) {
      setContractAddress(savedContractAddress);
    }

    const getSaltValue = localStorage.getItem("salt");

    if (getSaltValue) {
      setSalt(parseInt(getSaltValue));
    }

    getUser();

    if (user) {
      determineRole();
    }
  }, [user, contractAddress]);

  return (
    <div className="flex flex-col justify-center items-center border w-1/2 p-5 bg-gray-100 rounded-lg shadow-md text-black">
      <Options
        user={user}
        setMove={setMove}
        contractAddress={contractAddress}
      />
      {contractAddress ? (
        <>
          <input
            className="mb-4 p-2 border rounded w-full text-center"
            type="number"
            value={salt}
            readOnly
          />

          <div className="flex flex-col justify-center items-center m-5 w-full">
            <button
              className="bg-blue-600 text-white p-2 mb-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
              onClick={() => solveGame(contractAddress, move, salt)}
            >
              Reveal Move
            </button>
            <button
              className="bg-red-600 text-white p-2 mb-5 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
              onClick={claimTimeout}
            >
              Claim Timeout
            </button>
          </div>
        </>
      ) : (
        <>
          <label className="block text-black">Hashed Value:</label>
          <small>Provide the Hashed Value you got from the hasher tool</small>
          <input
            className="mb-4 p-2 border rounded w-full"
            type="text"
            placeholder="Input hashed value here .."
            onChange={(e) => setHashedValue(e.target.value)}
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
            The amount you input in here will double or lose it all depending on
            the game result. Please bet responsibly.
          </small>
          <input
            className="mb-4 p-2 border rounded w-full"
            type="number"
            placeholder="How much do you want to BET? (ETH)"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStake(parseFloat(e.target.value))
            }
          />
          <div className="flex flex-col justify-center items-center m-5 w-full">
            <button
              className="bg-blue-600 text-white p-2 mb-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
              onClick={startGame}
            >
              Create Game
            </button>
          </div>
        </>
      )}
      {/* <div className="flex flex-col justify-center items-center m-5 w-full">
        <button
          className="bg-blue-600 text-white p-2 mb-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
          onClick={() => solveGame(contractAddress, move, salt)}
        >
          Reveal Move
        </button>
        <button
          className="bg-red-600 text-white p-2 mb-5 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
          onClick={claimTimeout}
        >
          Claim Timeout
        </button>
      </div> */}
      <Link
        href="/game/Hash"
        className="mt-5 bg-green-600 p-2 hover:scale-125 rounded-md text-white"
      >
        Back to Hash
      </Link>
    </div>
  );
};

export default PlayScreen;

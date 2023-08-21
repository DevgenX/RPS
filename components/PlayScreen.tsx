import { useState, useEffect } from "react";

import { useWallet } from "@/hooks/useWallet";
import { ethers } from "ethers";
import {
  deployRPSContract,
  getRPSContract,
  getSigner,
  solveGame,
  removeItems,
} from "../utils/connect";

import Link from "next/link";

import Options from "./Options";

const PlayScreen = () => {
  const [move, setMove] = useState<number>(0);
  const [opponentAddress, setOpponentAddress] = useState<string>("");
  const [salt, setSalt] = useState<number>(0);
  const [stake, setStake] = useState<number>(0);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [role, setRole] = useState<"player1" | "player2" | null>(null);
  const [hashedVal, setHashValue] = useState<string>("");

  const account = useWallet();

  const handleStartGame = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const c1Hash = hashedVal;
    const opponentAdd = opponentAddress;
    const stakeAmount = stake;
    const deployedContractAddress = await deployRPSContract(
      c1Hash,
      opponentAdd,
      stakeAmount.toString(),
      signer
    );

    setContractAddress(deployedContractAddress);

    localStorage.setItem("contractAddress", deployedContractAddress);
  };

  const handleGetOpponentAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opponent = e.target.value;

    // if (opponent.toLowerCase() === account?.toLowerCase()) {
    //   alert("You cannot play with yourself");
    //   setDisabledInput(true);
    // }

    localStorage.setItem("address", opponent);
    setOpponentAddress(opponent);
  };

  const handlePlayButton = async (move: number) => {
    try {
      const signer = await getSigner();

      if (!contractAddress) {
        return;
      }
      const rpsContract = getRPSContract(contractAddress, signer);
      if (rpsContract) {
        const stakeAmountInWei = ethers.utils.parseEther(stake.toString());
        await rpsContract.play(move, { value: stakeAmountInWei });
      }

      alert("Move played successfully!");
    } catch (error) {
      console.error("Error playing move:", error);
    }
  };

  const handleGetStakedAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    localStorage.setItem("amount", amount);
    setStake(parseFloat(amount));
  };

  const claimTimeout = async () => {
    try {
      const signer = await getSigner();

      if (!contractAddress) {
        return;
      }
      const rpsContract = getRPSContract(contractAddress, signer);

      if (role === "player1") {
        await rpsContract.j2Timeout();
      } else if (role === "player2") {
        await rpsContract.j1Timeout();
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

    if (account?.toLowerCase() === player1Address.toLowerCase()) {
      setRole("player1");
    } else if (account?.toLowerCase() === player2Address.toLowerCase()) {
      setRole("player2");
    }
  };

  useEffect(() => {
    const savedContractAddress = localStorage.getItem("contractAddress");
    if (savedContractAddress) {
      setContractAddress(savedContractAddress);
    }

    const getSaltValue = localStorage.getItem("salt");
    if (getSaltValue) {
      setSalt(parseInt(getSaltValue));
    }

    const getHashValue = localStorage.getItem("hash");
    if (getHashValue) {
      setHashValue(getHashValue);
    }

    const getOpponentAddress = localStorage.getItem("address");
    if (getOpponentAddress) {
      setOpponentAddress(getOpponentAddress);
    }

    const getStakedAmount = localStorage.getItem("amount");
    if (getStakedAmount) {
      setStake(parseInt(getStakedAmount));
    }

    if (account) {
      determineRole();
    }
  }, [account, contractAddress]);

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
      <Options
        user={account}
        setMove={setMove}
        contractAddress={contractAddress}
        role={role}
      />
      <>
        {role === "player1" ? (
          <input
            className="mb-4 p-2 border rounded w-full text-center"
            type="number"
            value={salt}
            readOnly
          />
        ) : (
          ""
        )}
      </>

      {!contractAddress || role === "player1" ? (
        <>
          <label className="block text-black">Hashed Value:</label>
          <small>Provide the Hashed Value you got from the hasher tool</small>
          <input
            className="mb-4 p-2 border rounded w-full text-center"
            type="text"
            value={hashedVal}
            placeholder="Input hashed value here .."
            readOnly
          />
          <label className="block text-black">Opponent Address:</label>
          <small>Provide the wallet address of your desired opponent</small>
          <input
            className="mb-4 p-2 border rounded w-full text-center"
            type="text"
            value={opponentAddress}
            placeholder="Input opponent address here .."
            onChange={(e) => handleGetOpponentAddress(e)}
          />
        </>
      ) : (
        ""
      )}
      {!contractAddress || role === "player2" ? (
        <>
          <label className="block text-black">Bet amount in (ETH):</label>
          <small>
            The amount you input in here will double or lose it all depending on
            the game result. Please bet responsibly.
          </small>
          <input
            className="mb-4 p-2 border rounded w-full text-center"
            type="number"
            placeholder="How much do you want to BET? (ETH)"
            onChange={(e) => handleGetStakedAmount(e)}
          />
        </>
      ) : (
        ""
      )}
      <div className="flex flex-col justify-center items-center m-5 w-full">
        {!contractAddress ? (
          <>
            <button
              className="bg-blue-600 text-white p-2 mb-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
              onClick={handleStartGame}
            >
              Create Game
            </button>
          </>
        ) : (
          ""
        )}

        {role === "player2" ? (
          <button
            className="bg-blue-600 text-white p-2 mb-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
            onClick={() => handlePlayButton(move)}
          >
            Play Game
          </button>
        ) : (
          ""
        )}

        {contractAddress ? (
          <>
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
          </>
        ) : (
          ""
        )}
      </div>

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

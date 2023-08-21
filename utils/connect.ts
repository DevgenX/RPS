import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { hasherABI, hasherAddress, contractAddress } from "./constants";
import RPS_ABI from "./rpsABI.json";
import RPS_BYTECODE from "./RPS_Bytecode";

// prompt metamask to a wallet connection
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      return;
    }
    await window.ethereum.enable();
    const walletAccounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const account = walletAccounts[0];
    return account;
  } catch (e) {
    console.log(e);
  }
};
// Check if the user has a connected wallet

// Connect to Hasher Contract using ethers
export const getHasherContract = (signer: ethers.Signer) => {
  return new ethers.Contract(hasherAddress, hasherABI, signer);
};

// function to get the RPS contract
export const getRPSContract = (
  contractAddress: string,
  signer: ethers.Signer
) => {
  return new ethers.Contract(contractAddress, RPS_ABI, signer);
};

// function to get the signer
export const getSigner = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }

    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider.getSigner();
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// Function to hash a move using the Hasher contract
export const hashMove = async (
  move: number,
  salt: number,
  signer: ethers.Signer
): Promise<string> => {
  const hasherContract = await getHasherContract(signer);
  return await hasherContract.hash(move, salt);
};

// Deploy RPS Contract dynamically based on user input
export const deployRPSContract = async (
  c1Hash: string,
  opponentAddress: string,
  stake: string,
  signer: ethers.Signer
) => {
  const RPSFactory = new ethers.ContractFactory(RPS_ABI, RPS_BYTECODE, signer);
  const contract = await RPSFactory.deploy(c1Hash, opponentAddress, {
    value: ethers.utils.parseEther(stake),
  });
  await contract.deployed();
  return contract.address;
};

// Function to connect to the smart contract after game creation
export const connectToSmartContract = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    // const contract = getRPSContract(signer);

    // return contract;
  } catch (e) {
    throw new Error("No ethereum object");
  }
};

export const solveGame = async (
  contractAddress: string,
  revealedMove: number,
  revealedSalt: number
) => {
  try {
    const signer = await getSigner();
    const rpsContract = getRPSContract(contractAddress, signer);
    await rpsContract.solve(revealedMove, revealedSalt);
    alert("Move revealed successfully!");
  } catch (error) {
    console.error("Error revealing move:", error);
  }
};

export const removeItems = () => {
  localStorage.removeItem("salt");
  localStorage.removeItem("contractAddress");
  localStorage.removeItem("hash");
  localStorage.removeItem("address");
};

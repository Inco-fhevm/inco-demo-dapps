import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstance, provider, getTokenSignature } from "../../utils/fhevm";
import { toHexString } from "../../utils/utils";
import { Contract } from "ethers";
import privateVotingABI from "../../abi/privateVoting/privateVotingABI";

let instance;
const CONTRACT_ADDRESS = "0x3E1722c57f5439b5279bA7Bd9Db37f667eAF2Bc9";

function PrivateVoting() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inFavorVoteCount, setInFavorVoteCount] = useState("hidden");
  const [againstVoteCount, setAgainstVoteCount] = useState("hidden");
  const [voteCount, setVoteCount] = useState(0);
  const [voteChoice, setVoteChoice] = useState("");
  const [decryptedChoice, setDecryptedChoice] = useState("hidden");
  const [decryptedCount, setDecryptedCount] = useState("hidden");
  const [loading, setLoading] = useState("");
  const [dialog, setDialog] = useState("");
  const [encryptedChoice, setEncryptedChoice] = useState("");
  const [encryptedAmount, setEncryptedAmount] = useState("");

  useEffect(() => {
    async function fetchInstance() {
      instance = await getInstance();
    }
    fetchInstance();
  }, []);

  const handleVoteCountChange = (e) => {
    if (e.target.value > 100) {
      return null;
    }
    setVoteCount(Number(e.target.value));
    console.log(instance);
    if (instance) {
      const encrypted = instance.encrypt32(Number(e.target.value));
      setEncryptedAmount(toHexString(encrypted));
    }
  };

  const handleVoteChoiceChange = (e) => {
    let choice = e.target.value;
    setVoteChoice(choice);
    if (instance) {
      if (choice === "In Favor") {
        choice = 1;
      } else {
        choice = 0;
      }
      const encrypted = instance.encrypt32(choice);
      setEncryptedChoice(toHexString(encrypted));
    }
  };

  const castVote = async (event) => {
    event.preventDefault();
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, privateVotingABI, signer);
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Sending transaction...");
      const transaction = await contract.castVote(
        "0x" + encryptedAmount,
        "0x" + encryptedChoice
      );
      setLoading("Waiting for transaction validation...");
      await provider.waitForTransaction(transaction.hash);
      setLoading("");
      setDialog("Your private vote has been counted!");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Transaction error!");
    }
  };

  const reencryptVoteCount = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, privateVotingABI, signer);
      setLoading("Decrypting Credit Score...");
      const { publicKey, signature } = await getTokenSignature(
        CONTRACT_ADDRESS,
        signer.address
      );
      const ciphertext = await contract.viewOwnVoteCount(publicKey, signature);
      console.log(ciphertext);
      const voteCountDecrypted = instance.decrypt(CONTRACT_ADDRESS, ciphertext);
      setDecryptedCount(voteCountDecrypted);
      setLoading("");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Error during reencrypt!");
    }
  };

  const reencryptVoteChoice = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, privateVotingABI, signer);
      setLoading("Decrypting Credit Score...");
      const { publicKey, signature } = await getTokenSignature(
        CONTRACT_ADDRESS,
        signer.address
      );
      const ciphertext = await contract.viewOwnVoteChoice(publicKey, signature);
      console.log(ciphertext);
      const voteChoiceDecrypted = instance.decrypt(
        CONTRACT_ADDRESS,
        ciphertext
      );
      if (voteChoiceDecrypted == 0) {
        setDecryptedChoice("Against");
      } else {
        setDecryptedChoice("In Favor");
      }

      setLoading("");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Error during reencrypt!");
    }
  };

  const revealResult = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, privateVotingABI, signer);
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Sending transaction...");
      console.log("signer", typeof signer.address);
      const result = await contract.revealResult();
      setLoading("Waiting for transaction validation...");
      setLoading("");
      setAgainstVoteCount(Number(result[1]));
      setInFavorVoteCount(Number(result[0]));
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Error!");
    }
  };

  return (
    <div className="mt-5">
      <Link to="/">Back to Main Page</Link>
      <div className="flex flex-col text-center justify-center items-center mb-10 mt-10">
        <img src={"/band.svg"} alt="Band" />
        <h1 className="my-10 text-2xl font-bold text-black">Private Voting</h1>
        <img src={"/band.svg"} alt="Band" />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col w-1/2 p-4">
          <div className="bg-black py-10 px-10 text-left mb-6">
            <div className="text-white">
              In Favor Vote Count:{" "}
              <span className="text-custom-green">{inFavorVoteCount}</span>
            </div>
            <div className="text-white">
              Against Vote Count:{" "}
              <span className="text-custom-green">{againstVoteCount}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={revealResult}
            >
              Reveal Result
            </button>
            <div className="text-white">
              My Vote Count{" "}
              <span className="text-custom-green">{decryptedCount}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={reencryptVoteCount}
            >
              Decrypt Count
            </button>
            <div className="text-white">
              My Vote Choice:{" "}
              <span className="text-custom-green">{decryptedChoice}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={reencryptVoteChoice}
            >
              Decrypt Choice
            </button>
          </div>
          {responseMessage && (
            <p className="mb-4 text-blue-500">{responseMessage}</p>
          )}
          {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
          <div>Enter the amount of votes:</div>
          <br></br>
          <form onSubmit={castVote}>
            <input
              type="number"
              placeholder="Enter amount of votes"
              value={voteCount}
              onChange={handleVoteCountChange}
              className="border rounded-md px-4 py-2 mb-4 bg-white"
            />
            <div className="mb-2">Select Vote Choice:</div>
            <select
              id="voteChoice"
              value={voteChoice}
              onChange={handleVoteChoiceChange}
              className="border rounded-md px-4 py-2 mb-1 bg-white"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="In Favor">In Favor</option>
              <option value="Against">Against</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
            >
              Cast My Vote Privately
            </button>
          </form>
          {encryptedChoice && (
            <div>
              <p>Ciphertext for Choice:</p>
              <div className="overflow-y-auto h-10 flex flex-col">
                <p>{"0x" + encryptedChoice.substring(0, 50) + "..."}</p>
              </div>
            </div>
          )}
          {encryptedAmount && (
            <div>
              <p>Ciphertext for Count:</p>
              <div className="overflow-y-auto h-10 flex flex-col">
                <p>{"0x" + encryptedAmount.substring(0, 50) + "..."}</p>
              </div>
            </div>
          )}
          {dialog && <div>{dialog}</div>}
          {loading && <div>{loading}</div>}
        </div>
        <div className="flex flex-col w-1/2 p-4 overflow-y-auto h-96 ">
          <div className="text-lg">Code Snippets:</div>
          <br></br>
          <div className="text-sm">
            User vote count and choice are stored on-chain in an encryted
            manner.
          </div>
          <img src={"/CodePrivateVoting1.svg"} alt="CodePrivateVoting1" />
          <div className="text-sm">
            Both "In Favor" and "Against" are incremented by the actual vote
            count or 0. But you can't tell!
          </div>
          <img src={"/CodePrivateVoting2.svg"} alt="CodePrivateVoting2" />
          <div className="text-sm">
            Users are able to view their own decrypted vote count and choice by
            signing an EIP-712 signature.
          </div>
          <img src={"/CodePrivateVoting3.svg"} alt="CodePrivateVoting3" />
          <div>
            Smart Contract Implementation:{" "}
            <a
              target="_blank"
              href="https://docs.inco.network/getting-started/example-dapps/private-voting"
            >
              Here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivateVoting;

import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstance, provider, getTokenSignature } from "../../utils/fhevm";
import { toHexString } from "../../utils/utils";
import { Contract } from "ethers";
import privateVotingABI from "../../abi/privateVoting/privateVotingABI";

let instance;
const CONTRACT_ADDRESS = "0xCA3302906A51eBeF589eaD6adca7A2eA0b2d2F06";

function PrivateVoting() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inFavorVoteCount, setInFavorVoteCount] = useState("hidden");
  const [againstVoteCount, setAgainstVoteCount] = useState("hidden");
  const [voteCount, setVoteCount] = useState(0);
  const [voteChoice, setVoteChoice] = useState("");
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
    setVoteCount(Number(e.target.value));
    console.log(instance);
    if (instance) {
      const encrypted = instance.encrypt32(Number(e.target.value));
      setEncryptedAmount(toHexString(encrypted));
    }
  };

  const handleVoteChoiceChange = (e) => {
    setVoteChoice(e.target.value);
    if (instance) {
      const encrypted = instance.encrypt32(Number(e.target.value));
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

  const reencryptVote = async () => {
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
      const userCreditScoreDecrypted = instance.decrypt(
        CONTRACT_ADDRESS,
        ciphertext
      );
      console.log(ciphertext, userCreditScoreDecrypted);
      setUserCreditScore(userCreditScoreDecrypted);
      setLoading("");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Error during reencrypt!");
    }
  };

  const reencryptChoice = async () => {
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
      const userCreditScoreDecrypted = instance.decrypt(
        CONTRACT_ADDRESS,
        ciphertext
      );
      console.log(ciphertext, userCreditScoreDecrypted);
      setUserCreditScore(userCreditScoreDecrypted);
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
      const result = await contract.isUserScoreAbove700(signer.address);
      setLoading("Waiting for transaction validation...");
      setLoading("");
      setIsAbove700(result.toString());
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("User score not set!");
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
              Againt Vote Count:{" "}
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
              <span className="text-custom-green">{againstVoteCount}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={revealResult}
            >
              Decrypt Count
            </button>
            <div className="text-white">
              My Choice:{" "}
              <span className="text-custom-green">{againstVoteCount}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={revealResult}
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
            The user credit score is stored on-chain in an encrypted manner by a
            trusted third party.
          </div>
          <img src={"/DIDCodeSvg1.svg"} alt="DIDCodeSvg1" />
          <div className="text-sm">
            TFHE.gt can compare the encrypted credit score with 700, which the
            answer is decrypted and returned as a view function.
          </div>
          <img src={"/DIDCodeSvg2.svg"} alt="DIDCodeSvg2" />
          <div className="text-sm">
            Users are able to view their own decrypted credit score by signing
            an EIP-712 signature.
          </div>
          <img src={"/DIDCodeSvg3.svg"} alt="DIDCodeSvg3" />
          <div>
            Smart Contract Implementation:{" "}
            <a
              target="_blank"
              href="https://docs.inco.network/getting-started/example-dapps/confidential-did"
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

import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstance, provider, getTokenSignature } from "../../utils/fhevm";
import { toHexString } from "../../utils/utils";
import { Contract } from "ethers";
import confidentialDIDABI from "../../abi/confidentialDID/confidentialDIDABI";

let instance;
const CONTRACT_ADDRESS = "0xCA3302906A51eBeF589eaD6adca7A2eA0b2d2F06";

function ConfidentialDID() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [creditScore, setCreditScore] = useState(0);
  const [isAbove700, setIsAbove700] = useState("?");
  const [loading, setLoading] = useState("");
  const [dialog, setDialog] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [userCreditScore, setUserCreditScore] = useState("hidden");

  useEffect(() => {
    async function fetchInstance() {
      instance = await getInstance();
    }
    fetchInstance();
  }, []);

  const handleCreditScoreChange = (e) => {
    setCreditScore(Number(e.target.value));
    console.log(instance);
    if (instance) {
      const encrypted = instance.encrypt16(Number(e.target.value));
      setEncryptedData(toHexString(encrypted));
    }
  };

  const storeCreditScore = async (event) => {
    event.preventDefault();
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        confidentialDIDABI,
        signer
      );
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Sending transaction...");
      const transaction = await contract.store(
        signer.address,
        "0x" + encryptedData
      );
      setLoading("Waiting for transaction validation...");
      await provider.waitForTransaction(transaction.hash);
      setLoading("");
      setDialog("Credit Score has been stored!");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Transaction error!");
    }
  };

  const reencrypt = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        confidentialDIDABI,
        signer
      );
      setLoading("Decrypting Credit Score...");
      const { publicKey, signature } = await getTokenSignature(
        CONTRACT_ADDRESS,
        signer.address
      );
      const ciphertext = await contract.viewOwnScore(publicKey, signature);
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

  const verifyCreditScore = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        confidentialDIDABI,
        signer
      );
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
        <h1 className="my-10 text-2xl font-bold text-black">
          Confidential DID
        </h1>
        <img src={"/band.svg"} alt="Band" />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col w-1/2 p-4">
          <div className="bg-black py-10 px-10 text-left mb-6">
            <div className="text-white">
              Your Credit Score:{" "}
              <span className="text-custom-green">{userCreditScore}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={reencrypt}
            >
              Decrypt Own Credit Score
            </button>
            <div className="text-white">
              Is your score above 700?:{" "}
              <span className="text-custom-green">{isAbove700}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={verifyCreditScore}
            >
              Verify without decrypting
            </button>
          </div>
          {responseMessage && (
            <p className="mb-4 text-blue-500">{responseMessage}</p>
          )}
          {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
          <div>
            Your credit score should be stored by a third trusted party, but you
            can set it yourself for the demo: Choose a number between 1 and 850:
          </div>
          <form onSubmit={storeCreditScore}>
            <input
              type="number"
              placeholder="Enter amount to mint"
              value={creditScore}
              onChange={handleCreditScoreChange}
              className="border rounded-md px-4 py-2 mb-1 bg-white"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
            >
              Set My Score
            </button>
          </form>
          {encryptedData && (
            <div>
              <p>Generated Ciphertext:</p>
              <div className="overflow-y-auto h-10 flex flex-col">
                <p>{"0x" + encryptedData.substring(0, 50) + "..."}</p>
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

export default ConfidentialDID;

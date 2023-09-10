import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstance, provider } from "../../utils/fhevm";
import { toHexString } from "../../utils/utils";
import { Contract } from "ethers";
import BandSvg from "../../band.svg";
import CodeSvg1 from "./codeSvg1.svg";
import CodeSvg2 from "./codeSvg2.svg";
import erc20ABI from "../../abi/erc20/erc20ABI";

let instance;
const CONTRACT_ADDRESS = "0xA838F2090b6F76e1c7f4048370254d46Ff858d71";

function ConfidentialERC20() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [amountMint, setAmountMint] = useState(0);
  const [loading, setLoading] = useState("");
  const [dialog, setDialog] = useState("");
  const [encryptedData, setEncryptedData] = useState("");

  useEffect(() => {
    async function fetchInstance() {
      instance = await getInstance();
    }
    fetchInstance();
  }, []);

  const handleAmountMintChange = (e) => {
    setAmountMint(Number(e.target.value));
    console.log(instance);
    if (instance) {
      const encrypted = instance.encrypt32(Number(e.target.value));
      setEncryptedData(toHexString(encrypted));
    }
  };

  const mint = async (event) => {
    event.preventDefault();
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, erc20ABI, signer);
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Sending transaction...");
      const transaction = await contract["mint(bytes)"]("0x" + encryptedData);
      setLoading("Waiting for transaction validation...");
      await provider.waitForTransaction(transaction.hash);
      setLoading("");
      setDialog("Tokens have been minted!");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Transaction error!");
    }
  };

  return (
    <div>
      <Link to="/">Back to Main Page</Link>
      <div className="flex flex-col text-center justify-center items-center mb-10">
        <img src={BandSvg} alt="Band" />
        <h1 className="my-10 text-2xl font-bold text-black">
          Confidential ERC20
        </h1>
        <img src={BandSvg} alt="Band" />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col w-1/2 p-4">
          <div className="bg-black py-10 px-10 text-left mb-6">
            <div className="text-white">
              Name:{" "}
              <span className="text-custom-green">Confidential ERC-20</span>
            </div>
            <div className="text-white">
              Symbol: <span className="text-custom-green">CUSD</span>
            </div>
            <div className="text-white">
              Address:{" "}
              <span className="text-custom-green">
                {CONTRACT_ADDRESS.substring(0, 5) +
                  "..." +
                  CONTRACT_ADDRESS.substring(
                    CONTRACT_ADDRESS.length - 5,
                    CONTRACT_ADDRESS.length
                  )}
              </span>
            </div>
            <div className="text-white">
              TotalSupply:{" "}
              <span className="text-custom-green">*************</span>
            </div>
            <div className="text-white">
              Your Balance:{" "}
              <span className="text-custom-green">*************</span>
            </div>
            <button>Decrypt own balance</button>
          </div>
          {responseMessage && (
            <p className="mb-4 text-blue-500">{responseMessage}</p>
          )}
          {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
          <form onSubmit={mint}>
            <input
              type="number"
              placeholder="Enter amount to mint"
              value={amountMint}
              onChange={handleAmountMintChange}
              className="border rounded-md px-4 py-2 mb-1"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
            >
              Mint
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
        <div className="flex flex-col w-1/2 p-4">
          <img src={CodeSvg1} alt="CodeSvg1" />
          <img src={CodeSvg2} alt="CodeSvg2" />
        </div>
      </div>
    </div>
  );
}

export default ConfidentialERC20;

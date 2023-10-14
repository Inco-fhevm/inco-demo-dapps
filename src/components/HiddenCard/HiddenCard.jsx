import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstance, provider, getTokenSignature } from "../../utils/fhevm";
import { toHexString } from "../../utils/utils";
import { Contract } from "ethers";
import HiddenCardABI from "../../abi/hiddenCard/hiddenCardABI";
import Card from "@heruka_urgyen/react-playing-cards";

let instance;
const CONTRACT_ADDRESS = "0x3E1722c57f5439b5279bA7Bd9Db37f667eAF2Bc9";

function HiddenCard() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState("");
  const [dialog, setDialog] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [card, setCard] = useState();
  const [isNewCard, setIsNewCard] = useState(false);

  const rank = [2, 3, 4, 5, 6, 7, 8, 9, "T", "J", "Q", "K", "A"];
  const suit = ["c", "d", "h", "s"];

  useEffect(() => {
    async function fetchInstance() {
      instance = await getInstance();
    }
    setCard(null);
    fetchInstance();
  }, []);

  const convertCard = (cardInput) => {
    const cardIndex = cardInput % 52;
    const cardRank = rank[cardIndex % 13];
    const cardSuit = suit[Math.floor(cardIndex / 13)];
    return cardRank + cardSuit;
  };

  const dealCard = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, HiddenCardABI, signer);
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Sending transaction...");
      const transaction = await contract.getCard();
      setLoading("Waiting for transaction validation...");
      await provider.waitForTransaction(transaction.hash);
      setIsNewCard(true);
      setLoading("");
      setDialog("Card has been dealt!");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Transaction error!");
    }
  };

  const reencrypt = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, HiddenCardABI, signer);
      setLoading("Decrypting hidden card...");
      const { publicKey, signature } = await getTokenSignature(
        CONTRACT_ADDRESS,
        signer.address
      );
      const ciphertext = await contract.viewCard(publicKey, signature);
      console.log(ciphertext);
      const decryptedCard = instance.decrypt(CONTRACT_ADDRESS, ciphertext);
      console.log(ciphertext, decryptedCard);
      setCard(decryptedCard);
      setIsNewCard(false);
      setLoading("");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Error during reencrypt!");
    }
  };

  console.log("card", card);

  return (
    <div className="mt-5">
      <Link to="/">Back to Main Page</Link>
      <div className="flex flex-col text-center justify-center items-center mb-10 mt-10">
        <img src={"/band.svg"} alt="Band" />
        <h1 className="my-10 text-2xl font-bold text-black">
          Hidden Random Card
        </h1>
        <img src={"/band.svg"} alt="Band" />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col w-1/2 p-4">
          <div className="flex flex-row p-4 bg-black py-10 px-10 text-left mb-6">
            <div className="w-1/2">
              <button
                className="bg-blue-500 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded"
                onClick={dealCard}
              >
                Deal Random Card
              </button>
              <div className="text-white mb-2 mt-12">
                Card Value: <span className="text-custom-green">{card}</span>
              </div>
              <button
                className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
                onClick={reencrypt}
              >
                Reveal Hidden Card
              </button>
            </div>
            <div className="w-1/2">
              <div className="flex border border-2 border-custom-green h-80 border-green-400 text-white justify-center items-center text-center">
                {!card && !isNewCard && (
                  <span className="text-custom-green">No Card</span>
                )}
                {isNewCard && (
                  <Card
                    deckType={"basic"}
                    height="200px"
                    back={true}
                    className=""
                  />
                )}
                {!isNewCard && card && (
                  <Card
                    card={convertCard(card)}
                    deckType={"basic"}
                    height="200px"
                    className=""
                  />
                )}
              </div>
            </div>
          </div>
          {responseMessage && (
            <p className="mb-4 text-blue-500">{responseMessage}</p>
          )}
          {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
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
            A random hidden uint8 is generated and stored for the user, which
            can be converted into a specific card.
          </div>
          <img src={"/randomCard1.svg"} alt="randomCard1" />
          <div className="text-sm">
            Users are able to view their own decrypted hidden card by signing an
            EIP-712 signature.
          </div>
          <img src={"/randomCard2.svg"} alt="randomCard2" />
          <div>
            Smart Contract Implementation:{" "}
            <a
              target="_blank"
              href="https://docs.inco.network/getting-started/example-dapps/hidden-random-card"
            >
              Here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HiddenCard;

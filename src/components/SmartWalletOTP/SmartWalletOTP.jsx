import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInstance, provider, getTokenSignature } from "../../utils/fhevm";
import { toHexString } from "../../utils/utils";
import { Contract } from "ethers";
import SmartWalletOTPABI from "../../abi/SmartWalletOTP/SmartWalletOTP";

let instance;
const CONTRACT_ADDRESS = "0x23c7991fF7359fE46D09A217d530eb09757903F7";
const SECRET_KEY = 1111;

function SmartWalletOTP() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState("");
  const [dialog, setDialog] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [timestamp, setTimestamp] = useState(0);
  const [secretKey, setSecretKey] = useState("hidden");
  const [TOTP, setTOTP] = useState(0);
  const [isValidTOTP, setIsValidTOTP] = useState("-");
  const [inputTOTP, setInputTOTP] = useState(0);

  useEffect(() => {
    async function fetchInstance() {
      instance = await getInstance();
    }
    fetchInstance();
  }, []);

  useEffect(() => {
    const regenerateTimestamp = () => {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const last5TimeStamp = currentTimestamp % 100000;
      setTimestamp(currentTimestamp);
      setTOTP(last5TimeStamp * SECRET_KEY);
    };
    const timer = setInterval(() => {
      if (seconds === 30) {
        regenerateTimestamp();
      }
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        clearInterval(timer);
        setSeconds(30);
      }
    }, 1000);

    return () => {
      clearInterval(timer); // Cleanup the timer when the component unmounts
    };
  }, [seconds]);

  const handleTOTPChange = (e) => {
    setInputTOTP(Number(e.target.value));
    if (instance) {
      const encrypted = instance.encrypt32(Number(e.target.value));
      setEncryptedData(toHexString(encrypted));
    }
  };

  const reencrypt = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        SmartWalletOTPABI,
        signer
      );
      setLoading("Decrypting Secret KEY...");
      const { publicKey, signature } = await getTokenSignature(
        CONTRACT_ADDRESS,
        signer.address
      );
      const ciphertext = await contract.viewSecretKey(publicKey, signature);
      console.log(ciphertext);
      const secretKeyDecrypted = instance.decrypt(CONTRACT_ADDRESS, ciphertext);
      console.log(ciphertext, secretKeyDecrypted);
      setSecretKey(secretKeyDecrypted);
      setLoading("");
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Error during reencrypt!");
    }
  };

  const validateOTP = async (e) => {
    e.preventDefault();
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        SmartWalletOTPABI,
        signer
      );
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Validating TOTP...");
      console.log("signer", typeof signer.address);
      const result = await contract.validateTOTP(
        "0x" + encryptedData,
        timestamp
      );
      setLoading("Waiting for transaction validation...");
      setLoading("");
      setIsValidTOTP(result.toString());
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("Error during validation!");
    }
  };

  return (
    <div className="mt-5">
      <Link to="/">Back to Main Page</Link>
      <div className="flex flex-col text-center justify-center items-center mb-10 mt-10">
        <img src={"/band.svg"} alt="Band" />
        <h1 className="my-10 text-2xl font-bold text-black">
          Smart Wallet OTP
        </h1>
        <img src={"/band.svg"} alt="Band" />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col w-1/2 p-4">
          <div className="bg-black py-10 px-10 text-left mb-6">
            <div className="text-white">
              Secret Key: <span className="text-custom-green">{secretKey}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={reencrypt}
            >
              Decrypt 2FA Secret Key
            </button>
            <div className="text-custom-green">
              <p className="text-white mb-2">
                Next TOTP Code in:{" "}
                <span className="text-custom-green">{seconds} seconds</span>
              </p>
            </div>
            <div className="flex items-center">
              <div className="text-white border border-white border-4 rounded p-6 text-center mb-2">
                <div className="text-2xl">{TOTP}</div>
              </div>
            </div>
            <div className="text-custom-green mb-1">Enter TOTP Code:</div>
            <form onSubmit={validateOTP}>
              <input
                type="number"
                placeholder="Enter amount to mint"
                value={inputTOTP}
                onChange={handleTOTPChange}
                className="border rounded-md px-4 py-2 mb-1 bg-white"
              />
              <div className="flex flex-row ">
                <div className=" flex-1">
                  {" "}
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
                  >
                    Validate
                  </button>
                </div>
                <div className="text-custom-green items-center flex justify-center flex-1">
                  <p className="text-white mb-2">
                    Is TOTP Valid?:{" "}
                    <span className="text-custom-green">{isValidTOTP}</span>
                  </p>
                </div>
              </div>
            </form>
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
            A 4-digit secret key is stored on-chain in an encrypted form.
          </div>
          <img src={"/OTP2.svg"} alt="OTP2" />
          <div className="text-sm">
            The user client, which also possesses the secret key, generates a
            Time-Based One-Time Password (TOTP) code that can be validated
            on-chain without the necessity of decrypting the secret key.
            Employing FHE, it becomes feasible to perform a multiplication
            operation between the secret key and the timestamp in an encrypted
            manner, subsequently comparing the product to the TOTP code for
            verification.
          </div>
          <img src={"/OTP1.svg"} alt="OTP1" />
          <div className="text-sm">
            Users are able to view their own decrypted secret key by signing an
            EIP-712 signature.
          </div>
          <img src={"/OTP3.svg"} alt="OTP3" />
          <div>
            Smart Contract Implementation:{" "}
            <a
              target="_blank"
              href="https://docs.inco.network/getting-started/example-dapps/smart-wallet-totp"
            >
              Here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartWalletOTP;

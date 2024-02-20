import "./App.css";
import { useState, useEffect } from "react";
import { init, getInstance } from "./utils/fhevm";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Connect } from "./Connect";
import ConfidentialERC20 from "./components/erc20/ConfidentialERC20";
import ConfidentialDID from "./components/ConfidentialDID/ConfidentialDID";
import PrivateVoting from "./components/PrivateVoting/PrivateVoting";
import SmartWalletOTP from "./components/SmartWalletOTP/SmartWalletOTP";
import HiddenCard from "./components/HiddenCard/HiddenCard";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    init()
      .then(() => {
        setIsInitialized(true);
      })
      .catch(() => setIsInitialized(false));
  }, []);

  if (!isInitialized) return null;

  return (
    <Router>
      <div className="App flex flex-col justify-center font-press-start text-black">
        <div>
          <Connect>
            {(account, provider) => (
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route
                  exact
                  path="/confidential-erc20"
                  element={<ConfidentialERC20 />}
                />
                <Route
                  exact
                  path="/confidential-DID"
                  element={<ConfidentialDID />}
                />
                <Route
                  exact
                  path="/private-voting"
                  element={<PrivateVoting />}
                />
                <Route
                  exact
                  path="/smart-wallet-otp"
                  element={<SmartWalletOTP />}
                />
                <Route exact path="/hidden-card" element={<HiddenCard />} />
              </Routes>
            )}
          </Connect>
        </div>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="backdrop">
    <div className="mt-5 text-gray-500">
      <img src={"/band.svg"} alt="Band" />
      <h1 className="my-10 text-3xl font-bold">Demo dApps</h1>
      <img className="mb-5" src={"/band.svg"} alt="Band" />
      <div className="flex flex-col mb-5">
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="/confidential-erc20"
        >
          Confidential ERC-20
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="/hidden-card"
        >
          Hidden Random Card
        </Link>
        <Link
          className="hover:text-blue-500 text-gray-800 transition duration-300 my-2 disabled-link"
          to="/private-voting"
        >
          Private Voting (coming soon)
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="/smart-wallet-otp"
        >
          Smart Wallet OTP
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="/confidential-did"
        >
          Confidential DID
        </Link>
      </div>
      <br></br>
      <h1 className="text-3xl font-bold underline mb-5">Tools:</h1>
      <div className="flex flex-col">
        <Link
          className="´´hover:text-blue-500 transition duration-300 my-2"
          to="https://docs.inco.org/getting-started/connect-metamask"
          target="_blank"
        >
          Add Inco Gentry to Wallet
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="https://faucet.inco.org/"
          target="_blank"
        >
          Faucet
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="https://utils.inco.org/"
          target="_blank"
        >
          Ciphertext Generator
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="https://explorer.testnet.inco.org/"
          target="_blank"
        >
          Block Explorer
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="https://docs.inco.org/getting-started/example-dapps"
          target="_blank"
        >
          Sample Codes
        </Link>
        <Link
          className="hover:text-blue-500 transition duration-300 my-2"
          to="https://docs.inco.org/"
          target="_blank"
        >
          Documentation
        </Link>
      </div>
    </div>
    </div>
  );
}

export default App;

import "./App.css";
import { useState, useEffect } from "react";
import { init, getInstance } from "./utils/fhevm";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Connect } from "./Connect";
import ConfidentialERC20 from "./components/erc20/ConfidentialERC20";
import ConfidentialDID from "./components/ConfidentialDID/ConfidentialDID";
import PrivateVoting from "./components/PrivateVoting/PrivateVoting";

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
    <div className="mt-5">
      <img src={"/band.svg"} alt="Band" />
      <h1 className="my-10 text-3xl font-bold text-black">Demo dApps</h1>
      <img className="mb-5" src={"/band.svg"} alt="Band" />
      <div className="flex flex-col mb-5">
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="/confidential-erc20"
        >
          Confidential ERC-20
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="/hidden-card"
        >
          Hidden Card
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="/private-voting"
        >
          Private Voting
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="/smart-wallet-otp"
        >
          Smart Wallet OTP
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="/confidential-did"
        >
          Confidential DID
        </Link>
      </div>
      <br></br>
      <h1 className="text-3xl font-bold underline mb-5">Tools:</h1>
      <div className="flex flex-col">
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="https://docs.inco.network/getting-started/connect-metamask"
          target="_blank"
        >
          Add Inco Network to Wallet
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="https://faucetdev.inco.network/"
          target="_blank"
        >
          Faucet
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="https://utils.inco.network/"
          target="_blank"
        >
          Ciphertext Generator
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="https://explorer.inco.network/"
          target="_blank"
        >
          Block Explorer
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="https://docs.inco.network/getting-started/example-dapps"
          target="_blank"
        >
          Sample Codes
        </Link>
        <Link
          className="text-black hover:text-blue-500 transition duration-300 my-2"
          to="https://docs.inco.network/"
          target="_blank"
        >
          Documentation
        </Link>
      </div>
    </div>
  );
}

export default App;

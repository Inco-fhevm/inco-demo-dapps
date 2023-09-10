import "./App.css";
import { useState, useEffect } from "react";
import { init, getInstance } from "./utils/fhevm";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Connect } from "./Connect";
import ConfidentialERC20 from "./components/erc20/ConfidentialERC20"; // Import the component

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
      <div className="App flex flex-col justify-center h-screen font-press-start text-black">
        <div className="menu">
          <Connect>
            {(account, provider) => (
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route
                  exact
                  path="/confidential-erc20"
                  element={<ConfidentialERC20 />}
                />
                {/* Add more routes for other pages here */}
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
    <div>
      <h1 className="text-3xl font-bold underline">dApps List:</h1>
      <div className="flex flex-col">
        <Link to="/confidential-erc20">Confidential ERC-20</Link>
        <Link to="/hidden-card">Hidden Card</Link>
        <Link to="/private-voting">Private Voting</Link>
        <Link to="/smart-wallet-otp">Smart Wallet OTP</Link>
        <Link to="/confidential-did">Confidential DID</Link>
      </div>
      <br></br>
      <h1 className="text-3xl font-bold underline">Tools:</h1>
      <div className="flex flex-col">
        <Link to="/faucet">Faucet</Link>
        <Link to="/ciphertext-generator">Ciphertext Generator</Link>
        <Link to="/sample-codes">Sample Codes</Link>
        <Link to="/documentation">Documentation</Link>
      </div>
    </div>
  );
}

export default App;

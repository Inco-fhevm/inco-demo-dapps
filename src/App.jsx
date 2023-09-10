import './App.css'
import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { init, getInstance } from "./utils/fhevm";
import { toHexString } from "./utils/utils";
import { Connect } from "./Connect";

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
    <div className='App'>
      <div className="menu">
        <Connect>{(account, provider) => <Example />}</Connect>
      </div>
    </div>
  )
}

function Example() {

  return (
    <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
  )
}

export default App

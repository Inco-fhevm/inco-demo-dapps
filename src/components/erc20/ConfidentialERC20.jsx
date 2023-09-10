import React from "react";
import { Link } from "react-router-dom";
import BandSvg from "../../band.svg";
import CodeSvg1 from "./codeSvg1.svg";
import CodeSvg2 from "./codeSvg2.svg";

function ConfidentialERC20() {
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
          <div>Confidential ERC-20</div>
          <div>
            The token is deployed on the following address:
            0x1234567890123456789012345678901234567890
          </div>
          <div>
            In this contract, you can mint yourself any amount of tokens
          </div>
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

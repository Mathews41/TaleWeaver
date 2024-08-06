import React, { useState } from "react";
import { ethers } from "ethers";



const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setConnected(true);
        setWalletAddress(address);
      } catch (error) {
        setErrorMessage("Failed to connect wallet");
      }
    } else {
      setErrorMessage("Please install MetaMask!");
    }
  };

  return (
    <div className='wallet-connect'>
      <button onClick={connectWallet}>
        {connected ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      {connected && (
        <div>
          <h3>Address</h3>
          <h4>{walletAddress}</h4>
        </div>
      )}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default WalletConnect;

"use client";
import React, { useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner(); // Await the getSigner() method
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
      <button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={connectWallet}>
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

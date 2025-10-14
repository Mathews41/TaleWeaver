import { ethers } from "ethers";

export interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  traits: string[];
  collection: string;
  tokenId?: string;
  contractAddress?: string;
  description?: string;
}

declare global {
  interface Window {
    ethereum?:
      | (ethers.Eip1193Provider & {
          providers?: ethers.Eip1193Provider[];
          isMetaMask?: boolean;
        })
      | undefined;
  }
}

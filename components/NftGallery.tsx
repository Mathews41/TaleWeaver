import React from "react";
import { NFT } from "../types";
import NftCard from "./NftCard";

interface NftGalleryProps {
  nfts: NFT[];
  selectedNfts: NFT[];
  onToggleNft: (nft: NFT) => void;
  onViewDetails?: (nft: NFT) => void;
  onRemoveNft?: (nft: NFT) => void;
}

const NftGallery: React.FC<NftGalleryProps> = ({
  nfts,
  selectedNfts,
  onToggleNft,
  onViewDetails,
  onRemoveNft,
}) => {
  return (
    <div className='pixel-grid max-h-[70vh] overflow-auto pr-1'>
      {nfts.map((nft) => (
        <NftCard
          key={nft.id}
          nft={nft}
          isSelected={selectedNfts.some((item) => item.id === nft.id)}
          onToggle={onToggleNft}
          onViewDetails={onViewDetails}
          onRemove={onRemoveNft}
        />
      ))}
    </div>
  );
};

export default NftGallery;

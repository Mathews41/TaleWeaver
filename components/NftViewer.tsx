import React from "react";
import { NFT } from "../types";

interface NftViewerProps {
  nft: NFT | null;
  isOpen: boolean;
  onClose: () => void;
}

const NftViewer: React.FC<NftViewerProps> = ({ nft, isOpen, onClose }) => {
  if (!isOpen || !nft) return null;

  const formatTraitValue = (value: string | number): string => {
    if (typeof value === "number") {
      return value.toString();
    }
    return value;
  };

  const getRarityColor = (trait: string): string => {
    // Simple rarity scoring based on trait length and common words
    const commonWords = ["common", "basic", "normal", "standard"];
    const rareWords = ["rare", "epic", "legendary", "unique", "special"];

    const lowerTrait = trait.toLowerCase();

    if (rareWords.some((word) => lowerTrait.includes(word))) {
      return "var(--pixel-green-light)";
    }
    if (commonWords.some((word) => lowerTrait.includes(word))) {
      return "var(--pixel-stone-medium)";
    }

    // Default to medium rarity
    return "var(--pixel-green-medium)";
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
      <div className='pixel-modal w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='pixel-modal-header flex items-center justify-between'>
          <div>
            <h2 className='pixel-title'>NFT Details</h2>
            <p className='pixel-text mt-1'>{nft.name}</p>
          </div>
          <button
            onClick={onClose}
            className='pixel-button pixel-button-secondary text-2xl'>
            ×
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Image Section */}
            <div className='space-y-4'>
              <div className='pixel-card p-4'>
                <h3 className='pixel-subtitle mb-3'>Image</h3>
                {nft.imageUrl ? (
                  <div className='relative'>
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className='w-full h-auto max-h-96 object-contain pixel-card'
                      style={{ imageRendering: "pixelated" }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (
                          target.src !==
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTAwJyBoZWlnaHQ9JzMwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCBmaWxsPSIjMTkzMjQxIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PHRleHQgeD0iNTAiIHk9IjE1MCIgZmlsbD0iI2JiY2JjYiIgc3R5bGU9ImZvbnQtc2l6ZTogMjBweDsiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
                        ) {
                          target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTAwJyBoZWlnaHQ9JzMwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCBmaWxsPSIjMTkzMjQxIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PHRleHQgeD0iNTAiIHk9IjE1MCIgZmlsbD0iI2JiY2JjYiIgc3R5bGU9ImZvbnQtc2l6ZTogMjBweDsiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className='w-full h-48 pixel-card flex items-center justify-center'>
                    <span className='pixel-text'>No Image Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className='space-y-4'>
              {/* Basic Info */}
              <div className='pixel-card p-4'>
                <h3 className='pixel-subtitle mb-3'>Basic Information</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='pixel-text'>Name:</span>
                    <span
                      className='pixel-text'
                      style={{ color: "var(--pixel-text-light)" }}>
                      {nft.name}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='pixel-text'>Collection:</span>
                    <span
                      className='pixel-text'
                      style={{ color: "var(--pixel-green-medium)" }}>
                      {nft.collection}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='pixel-text'>Token ID:</span>
                    <span
                      className='pixel-text'
                      style={{ color: "var(--pixel-text-gray)" }}>
                      {nft.tokenId}
                    </span>
                  </div>
                  {nft.contractAddress && (
                    <div className='flex justify-between items-center'>
                      <span className='pixel-text'>Contract:</span>
                      <span
                        className='pixel-text'
                        style={{
                          color: "var(--pixel-text-gray)",
                          fontSize: "6px",
                        }}>
                        {`${nft.contractAddress.slice(
                          0,
                          6
                        )}...${nft.contractAddress.slice(-4)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Traits */}
              <div className='pixel-card p-4'>
                <h3 className='pixel-subtitle mb-3'>
                  Traits ({nft.traits.length})
                </h3>
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  {nft.traits.length > 0 ? (
                    nft.traits.map((trait, index) => (
                      <div
                        key={index}
                        className='pixel-card p-3'
                        style={{
                          backgroundColor: "var(--pixel-stone-darker)",
                          borderColor: getRarityColor(trait),
                        }}>
                        <div className='flex justify-between items-center'>
                          <span
                            className='pixel-text'
                            style={{
                              color: getRarityColor(trait),
                              fontSize: "7px",
                            }}>
                            {trait}
                          </span>
                          <div
                            className='w-2 h-2'
                            style={{
                              backgroundColor: getRarityColor(trait),
                              imageRendering: "pixelated",
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='pixel-text text-center py-4'>
                      No traits available
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Metadata */}
              {nft.description && (
                <div className='pixel-card p-4'>
                  <h3 className='pixel-subtitle mb-3'>Description</h3>
                  <p className='pixel-text leading-relaxed'>
                    {nft.description}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className='pixel-card p-4'>
                <h3 className='pixel-subtitle mb-3'>Links</h3>
                <div className='flex flex-wrap gap-2'>
                  {nft.contractAddress && (
                    <a
                      href={`https://etherscan.io/token/${nft.contractAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='pixel-button pixel-button-secondary'
                      style={{ fontSize: "8px", padding: "4px 8px" }}>
                      View on Etherscan
                    </a>
                  )}
                  <a
                    href={`https://opensea.io/assets/ethereum/${nft.contractAddress}/${nft.tokenId}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='pixel-button'
                    style={{ fontSize: "8px", padding: "4px 8px" }}>
                    View on OpenSea
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='pixel-card flex items-center justify-end p-4'>
          <button
            onClick={onClose}
            className='pixel-button pixel-button-secondary'>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NftViewer;








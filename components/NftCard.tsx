import React from "react";
import { NFT } from "../types";

interface NftCardProps {
  nft: NFT;
  isSelected: boolean;
  onToggle: (nft: NFT) => void;
  onViewDetails?: (nft: NFT) => void;
  onRemove?: (nft: NFT) => void;
}

const NftCard: React.FC<NftCardProps> = ({
  nft,
  isSelected,
  onToggle,
  onViewDetails,
  onRemove,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewDetails) {
      onViewDetails(nft);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(nft);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(nft);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(nft);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`nft-pixel-card ${isSelected ? "selected" : ""}`}>
      {nft.imageUrl ? (
        <img
          src={nft.imageUrl}
          alt={nft.name}
          className='w-full h-40 md:h-48 object-cover'
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
      ) : (
        <div className='w-full h-40 md:h-48 pixel-card flex items-center justify-center pixel-text'>
          No image
        </div>
      )}
      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h3
            className='pixel-text font-bold truncate flex-1'
            style={{ fontSize: "10px", color: "var(--pixel-text-light)" }}>
            {nft.name}
          </h3>
          <div className='flex gap-1 ml-2'>
            {onViewDetails && (
              <button
                onClick={handleDetailsClick}
                className='pixel-button'
                style={{
                  fontSize: "6px",
                  padding: "2px 4px",
                  minHeight: "auto",
                }}
                title='View Details'>
                👁
              </button>
            )}
            {onRemove && (
              <button
                onClick={handleRemoveClick}
                className='pixel-button pixel-button-secondary'
                style={{
                  fontSize: "6px",
                  padding: "2px 4px",
                  minHeight: "auto",
                }}
                title='Remove NFT'>
                🗑
              </button>
            )}
          </div>
        </div>
        <p className='pixel-text mb-2' style={{ fontSize: "8px" }}>
          {nft.collection}
        </p>
        <div className='flex flex-wrap gap-1'>
          {nft.traits.slice(0, 3).map((trait) => (
            <span
              key={trait}
              className='pixel-card pixel-text px-2 py-0.5'
              style={{
                fontSize: "7px",
                backgroundColor: "var(--pixel-green-dark)",
                color: "var(--pixel-green-light)",
              }}>
              {trait}
            </span>
          ))}
          {nft.traits.length > 3 && (
            <span
              className='pixel-text'
              style={{ fontSize: "6px", color: "var(--pixel-text-gray)" }}>
              +{nft.traits.length - 3} more
            </span>
          )}
        </div>
        {/* Selection toggle for modal view */}
        {!onRemove && (
          <div
            className='mt-3 pt-2'
            style={{ borderTop: "1px solid var(--pixel-stone-medium)" }}>
            <button
              onClick={handleToggleClick}
              className={`pixel-button w-full ${
                isSelected ? "pixel-button-secondary" : ""
              }`}
              style={{ fontSize: "8px", padding: "4px 8px" }}>
              {isSelected ? "✓ Selected" : "Select NFT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NftCard;

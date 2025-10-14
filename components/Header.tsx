import React from "react";

interface HeaderProps {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({
  walletAddress,
  onConnect,
  onDisconnect,
}) => {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header
      className='vine-border sticky top-0 z-10'
      style={{ backgroundColor: "var(--pixel-stone-darker)" }}>
      <div className='container mx-auto px-4 py-1 flex justify-between items-center'>
        <div className='logo-container'>
          {/* TALE WEAVER Logo */}
          <img
            src='/images/TaleWeaverLogo.png'
            alt='TALE WEAVER'
            className='logo-image'
            style={{
              height: "120px",
              width: "auto",
              imageRendering: "crisp-edges",
            }}
          />
        </div>

        <div>
          {walletAddress ? (
            <div className='flex items-center gap-4'>
              <div
                className='pixel-card'
                style={{ fontSize: "8px", padding: "8px 12px" }}>
                {truncateAddress(walletAddress)}
              </div>
              <button
                onClick={onDisconnect}
                className='pixel-button pixel-button-secondary'>
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={onConnect} className='pixel-button'>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

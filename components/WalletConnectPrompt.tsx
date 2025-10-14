import React from "react";

interface WalletConnectPromptProps {
  onConnect: () => void;
  error: string | null;
}

const WalletConnectPrompt: React.FC<WalletConnectPromptProps> = ({
  onConnect,
  error,
}) => {
  return (
    <div className='flex flex-col items-center justify-center text-center mt-16'>
      <div className='pixel-card p-8 md:p-12 max-w-lg mx-auto'>
        <h2 className='pixel-title mb-4'>Welcome to TALE WEAVER</h2>
        <p className='pixel-text mb-8'>
          Connect your Ethereum wallet to begin creating unique stories with
          your digital collectibles.
        </p>
        <button
          onClick={onConnect}
          className='pixel-button w-full max-w-xs mx-auto'>
          Connect Wallet
        </button>
        {error && (
          <div
            className='mt-6 pixel-card'
            style={{ borderColor: "#ff4444", backgroundColor: "#330000" }}
            role='alert'>
            <strong className='pixel-text' style={{ color: "#ff6666" }}>
              Error:{" "}
            </strong>
            {error.includes("No Ethereum wallet detected") ? (
              <span
                className='pixel-text block sm:inline'
                style={{ color: "#ff6666" }}>
                {`No Ethereum wallet detected. Please install a wallet like `}
                <a
                  href='https://metamask.io/download/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='pixel-text underline'
                  style={{ color: "#66ff66" }}>
                  MetaMask
                </a>
                {` to continue.`}
              </span>
            ) : (
              <span
                className='pixel-text block sm:inline'
                style={{ color: "#ff6666" }}>
                {error}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectPrompt;

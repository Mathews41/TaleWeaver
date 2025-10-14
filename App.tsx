import React, { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { NFT } from "./types";
// Removed mock NFTs; we load from wallet instead
import { fetchUserNfts } from "./services/nftService";
import { generateStory } from "./services/storyService";

import Header from "./components/Header";
import NftGallery from "./components/NftGallery";
import StoryForm from "./components/StoryForm";
import GeneratedStory from "./components/GeneratedStory";
import WalletConnectPrompt from "./components/WalletConnectPrompt";
import NftSelectionModal from "./components/NftSelectionModal";
import NftViewer from "./components/NftViewer";

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedNfts, setSelectedNfts] = useState<NFT[]>([]);
  const [availableNfts, setAvailableNfts] = useState<NFT[]>([]);
  const [nftLoading, setNftLoading] = useState<boolean>(false);
  const [includeSpam, setIncludeSpam] = useState<boolean>(false);
  const [story, setStory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewingNft, setViewingNft] = useState<NFT | null>(null);
  const providerRef = useRef<ethers.BrowserProvider | null>(null);

  const pickInjectedProvider = (): ethers.Eip1193Provider | null => {
    const eth = window.ethereum as
      | (ethers.Eip1193Provider & {
          providers?: ethers.Eip1193Provider[];
          isMetaMask?: boolean;
        })
      | undefined;
    if (!eth) {
      console.warn("[wallet] No injected provider found");
      return null;
    }
    if (
      Array.isArray((eth as any).providers) &&
      (eth as any).providers.length > 0
    ) {
      const providers = (eth as any).providers as ethers.Eip1193Provider[];
      const metamask = providers.find((p: any) => p?.isMetaMask);
      console.log(
        "[wallet] Multiple providers detected. Using:",
        metamask ? "MetaMask" : "First provider"
      );
      return (metamask || providers[0]) as ethers.Eip1193Provider;
    }
    console.log("[wallet] Single provider detected");
    return eth as ethers.Eip1193Provider;
  };

  const handleRefreshNfts = useCallback(async () => {
    if (!walletAddress) return;
    const injected = pickInjectedProvider() as any;
    setNftLoading(true);
    console.log("[nfts] Refresh start for address", walletAddress);
    try {
      let chain: "eth-mainnet" | "base-mainnet" | "polygon-mainnet" =
        "eth-mainnet";
      try {
        const chainId: string = await injected?.request?.({
          method: "eth_chainId",
        });
        console.log("[nfts] eth_chainId:", chainId);
        const id = chainId?.toLowerCase();
        if (id === "0x89") chain = "polygon-mainnet";
        if (id === "0x2105") chain = "base-mainnet";
      } catch (e) {
        console.warn("[nfts] Failed to read chainId:", e);
      }
      const chainsToQuery: Array<"eth-mainnet" | "base-mainnet"> = [
        "eth-mainnet",
        "base-mainnet",
      ];

      const results = await Promise.all(
        chainsToQuery.map((c) => fetchUserNfts(walletAddress, c, includeSpam))
      );
      const combined = results.flat();
      console.log(
        "[nfts] Received by chain:",
        results.map((arr, i) => ({
          chain: chainsToQuery[i],
          count: arr.length,
        }))
      );
      console.log("[nfts] Combined total:", combined.length);
      setAvailableNfts(combined.length > 0 ? combined : []);
      setError(null);
    } catch (e: any) {
      console.error("[nfts] Refresh error:", e);
      setAvailableNfts([]);
      setError(
        e instanceof Error ? e.message : "Failed to load NFTs for this wallet."
      );
    } finally {
      setNftLoading(false);
      console.log("[nfts] Refresh end");
    }
  }, [walletAddress, includeSpam]);

  const handleConnectWallet = useCallback(async () => {
    const injected = pickInjectedProvider();
    if (!injected) {
      setError(
        "No Ethereum wallet detected. Please install a compatible wallet like MetaMask."
      );
      console.error("No Ethereum wallet detected.");
      return;
    }

    try {
      const accounts = await (injected as any).request?.({
        method: "eth_requestAccounts",
      });
      console.log("[wallet] eth_requestAccounts returned:", accounts);
      if (!accounts || accounts.length === 0) {
        setError("No account returned from wallet.");
        return;
      }
      providerRef.current = new ethers.BrowserProvider(injected);
      const address = accounts[0];
      console.log("[wallet] Connected address:", address);
      setWalletAddress(address);
      setError(null);
      await handleRefreshNfts();
    } catch (err: any) {
      if (err?.code === 4001) {
        setError("You must connect your wallet to continue.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to connect wallet."
        );
      }
      console.error("Wallet connection error:", err);
    }
  }, [handleRefreshNfts]);

  const handleDisconnectWallet = useCallback(async () => {
    const injected = pickInjectedProvider() as any;
    try {
      await injected?.request?.({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      console.log("[wallet] Requested revoke permissions");
    } catch (e) {
      console.warn(
        "[wallet] wallet_revokePermissions not supported or failed:",
        e
      );
    }
    setWalletAddress(null);
    setSelectedNfts([]);
    setStory("");
    setError(null);
    setAvailableNfts([]);
    providerRef.current = null;
  }, []);

  const handleToggleNft = useCallback((nft: NFT) => {
    setSelectedNfts((prevSelected) => {
      const isSelected = prevSelected.some((item) => item.id === nft.id);
      if (isSelected) {
        return prevSelected.filter((item) => item.id !== nft.id);
      } else {
        return [...prevSelected, nft];
      }
    });
  }, []);

  const handleRemoveNft = useCallback((nft: NFT) => {
    setSelectedNfts((prev) => prev.filter((item) => item.id !== nft.id));
  }, []);

  const handleModalConfirm = useCallback((nfts: NFT[]) => {
    setSelectedNfts(nfts);
    setIsModalOpen(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleGenerateStory = useCallback(
    async (prompt: string) => {
      if (selectedNfts.length === 0 || !prompt) {
        setError("Please select at least one NFT and provide a story prompt.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setStory("");

      try {
        const storyResult = await generateStory(prompt, selectedNfts);
        setStory(storyResult);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedNfts]
  );

  useEffect(() => {
    const eth = pickInjectedProvider() as any;
    if (!eth?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[wallet] accountsChanged:", accounts);
      if (!accounts || accounts.length === 0) {
        setWalletAddress(null);
        return;
      }
      const address = accounts[0];
      setWalletAddress(address);
      (async () => {
        await handleRefreshNfts();
      })();
    };

    const handleChainChanged = async () => {
      try {
        const chainId: string = await (eth as any).request?.({
          method: "eth_chainId",
        });
        console.log("[wallet] chainChanged to:", chainId);
      } catch {}
      if (walletAddress) {
        await handleRefreshNfts();
      } else {
        window.location.reload();
      }
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [walletAddress, handleRefreshNfts]);

  return (
    <div className='min-h-screen pixel-bg-pattern'>
      <Header
        walletAddress={walletAddress}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />
      <main className='container mx-auto px-4 py-8'>
        {!walletAddress ? (
          <WalletConnectPrompt onConnect={handleConnectWallet} error={error} />
        ) : (
          <div className='max-w-4xl mx-auto'>
            <section id='nft-selection' className='mb-12'>
              <h2 className='pixel-title'>1. Select Your Characters</h2>
              <p className='pixel-text mb-6'>
                Choose the NFTs you want to feature in your story. Their traits
                will help shape the narrative.
              </p>

              {/* Selected NFTs Display */}
              {selectedNfts.length > 0 ? (
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='pixel-subtitle'>
                      Selected Characters ({selectedNfts.length})
                    </h3>
                    <button onClick={handleOpenModal} className='pixel-button'>
                      Add More NFTs
                    </button>
                  </div>
                  <NftGallery
                    nfts={selectedNfts}
                    selectedNfts={selectedNfts}
                    onToggleNft={handleToggleNft}
                    onViewDetails={setViewingNft}
                    onRemoveNft={handleRemoveNft}
                  />
                </div>
              ) : (
                <div className='pixel-card text-center py-12'>
                  <div className='mb-4'>
                    <div className='text-6xl mb-4'>🎭</div>
                    <h3 className='pixel-subtitle mb-2'>
                      No Characters Selected
                    </h3>
                    <p className='pixel-text mb-6'>
                      Choose NFTs from your wallet to start crafting your story
                    </p>
                    <button onClick={handleOpenModal} className='pixel-button'>
                      Add NFTs
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section id='story-prompt' className='mb-12'>
              <h2 className='pixel-title'>2. Write Your Prompt</h2>
              <p className='pixel-text mb-6'>
                Describe the scene, the plot, or the adventure you envision for
                your characters.
              </p>
              <StoryForm
                onSubmit={handleGenerateStory}
                isLoading={isLoading}
                selectedNftCount={selectedNfts.length}
              />
            </section>

            <section id='generated-story'>
              <h2 className='pixel-title'>3. Your Story</h2>
              <GeneratedStory
                story={story}
                isLoading={isLoading}
                error={error}
              />
            </section>
          </div>
        )}
      </main>

      {/* Floating Status Indicator */}
      <div className='fixed bottom-4 right-4 z-20'>
        <div
          className='pixel-card flex items-center gap-2 px-3 py-2'
          style={{ fontSize: "6px" }}>
          <div className='w-2 h-2 bg-green-400 rounded-sm'></div>
          <span className='pixel-text'>TALE WEAVER</span>
        </div>
      </div>

      {/* NFT Selection Modal */}
      <NftSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleModalConfirm}
        selectedNfts={selectedNfts}
        walletAddress={walletAddress || ""}
      />

      {/* NFT Viewer Modal */}
      <NftViewer
        nft={viewingNft}
        isOpen={!!viewingNft}
        onClose={() => setViewingNft(null)}
      />
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from "react";
import { NFT } from "../types";
import { fetchUserNftsPaginated } from "../services/nftService";
import NftViewer from "./NftViewer";
import NftCard from "./NftCard";

interface NftSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedNfts: NFT[]) => void;
  selectedNfts: NFT[];
  walletAddress: string;
}

interface NetworkFilter {
  id: string;
  name: string;
  enabled: boolean;
}

const NftSelectionModal: React.FC<NftSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedNfts,
  walletAddress,
}) => {
  const [localSelected, setLocalSelected] = useState<NFT[]>([]);
  const [availableNfts, setAvailableNfts] = useState<NFT[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeSpam, setIncludeSpam] = useState(false);
  const [nftLoading, setNftLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageKeys, setPageKeys] = useState<{
    [chain: string]: string | undefined;
  }>({});
  const [networkFilters, setNetworkFilters] = useState<NetworkFilter[]>([
    { id: "eth", name: "Ethereum", enabled: true },
    { id: "base", name: "Base", enabled: true },
  ]);
  const [viewingNft, setViewingNft] = useState<NFT | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize local selection with current selected NFTs
  useEffect(() => {
    setLocalSelected([...selectedNfts]);
  }, [selectedNfts, isOpen]);

  // Auto-load NFTs when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialNfts();
    }
  }, [isOpen]);

  const loadInitialNfts = useCallback(async () => {
    setNftLoading(true);
    setAvailableNfts([]);
    setPageKeys({});
    setHasMore(true);

    try {
      const chainsToQuery = networkFilters
        .filter((f) => f.enabled)
        .map((f) => (f.id === "eth" ? "eth-mainnet" : "base-mainnet"));

      const results = await Promise.all(
        chainsToQuery.map((chain) =>
          fetchUserNftsPaginated(walletAddress, chain as any, includeSpam, 20)
        )
      );

      const allNfts = results.flatMap((r) => r.nfts);
      const newPageKeys: { [chain: string]: string | undefined } = {};

      results.forEach((result, index) => {
        const chain = chainsToQuery[index];
        newPageKeys[chain] = result.pageKey;
      });

      setAvailableNfts(allNfts);
      setPageKeys(newPageKeys);
      setHasMore(results.some((r) => r.hasMore));
    } catch (error) {
      console.error("Failed to load NFTs:", error);
    } finally {
      setNftLoading(false);
    }
  }, [walletAddress, includeSpam, networkFilters]);

  const loadMoreNfts = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const chainsToQuery = networkFilters
        .filter((f) => f.enabled)
        .map((f) => (f.id === "eth" ? "eth-mainnet" : "base-mainnet"));

      const results = await Promise.all(
        chainsToQuery.map((chain) => {
          const pageKey = pageKeys[chain];
          if (!pageKey)
            return Promise.resolve({
              nfts: [],
              pageKey: undefined,
              hasMore: false,
            });
          return fetchUserNftsPaginated(
            walletAddress,
            chain as any,
            includeSpam,
            20,
            pageKey
          );
        })
      );

      const newNfts = results.flatMap((r) => r.nfts);
      const newPageKeys = { ...pageKeys };
      let hasMoreData = false;

      results.forEach((result, index) => {
        const chain = chainsToQuery[index];
        newPageKeys[chain] = result.pageKey;
        if (result.hasMore) hasMoreData = true;
      });

      setAvailableNfts((prev) => [...prev, ...newNfts]);
      setPageKeys(newPageKeys);
      setHasMore(hasMoreData);
    } catch (error) {
      console.error("Failed to load more NFTs:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    walletAddress,
    includeSpam,
    networkFilters,
    pageKeys,
    loadingMore,
    hasMore,
  ]);

  const handleToggleNft = useCallback((nft: NFT) => {
    setLocalSelected((prev) => {
      const isSelected = prev.some((item) => item.id === nft.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== nft.id);
      } else {
        return [...prev, nft];
      }
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(localSelected);
    onClose();
  }, [localSelected, onConfirm, onClose]);

  // Reload NFTs when spam filter changes
  useEffect(() => {
    if (isOpen) {
      loadInitialNfts();
    }
  }, [includeSpam, loadInitialNfts, isOpen]);

  // Scroll detection for pagination
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMoreNfts();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMoreNfts]);

  const toggleNetworkFilter = useCallback((networkId: string) => {
    setNetworkFilters((prev) =>
      prev.map((filter) =>
        filter.id === networkId
          ? { ...filter, enabled: !filter.enabled }
          : filter
      )
    );
  }, []);

  // Filter NFTs based on search term and network filters
  const filteredNfts = availableNfts.filter((nft) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchTerm.toLowerCase());

    // Network filter (based on collection name patterns or other indicators)
    const matchesNetwork = networkFilters.some((filter) => {
      if (!filter.enabled) return false;

      // Simple heuristic: check if collection name contains network indicators
      const collectionLower = nft.collection.toLowerCase();
      switch (filter.id) {
        case "eth":
          return !collectionLower.includes("base");
        case "base":
          return collectionLower.includes("base");
        default:
          return true;
      }
    });

    return matchesSearch && matchesNetwork;
  });

  const selectedCount = localSelected.length;
  const totalCount = filteredNfts.length;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4'>
      <div className='pixel-modal w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='pixel-modal-header flex items-center justify-between'>
          <div>
            <h2 className='pixel-title'>Select NFTs</h2>
            <p className='pixel-text mt-1'>
              {selectedCount} selected • {totalCount} available
            </p>
          </div>
          <button
            onClick={onClose}
            className='pixel-button pixel-button-secondary text-2xl'>
            ×
          </button>
        </div>

        {/* Filters */}
        <div className='p-3 md:p-6 pixel-card space-y-3 md:space-y-4'>
          <div className='flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center'>
            {/* Search */}
            <div className='flex-1 min-w-0'>
              <input
                type='text'
                placeholder='Search NFTs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pixel-input w-full'
              />
            </div>

            {/* Network Filters */}
            <div className='flex gap-2 flex-wrap'>
              {networkFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleNetworkFilter(filter.id)}
                  className={`pixel-button flex-1 md:flex-none ${
                    !filter.enabled ? "pixel-button-secondary" : ""
                  }`}>
                  {filter.name}
                </button>
              ))}
            </div>

            {/* Spam Filter */}
            <label className='flex items-center gap-2 pixel-text whitespace-nowrap'>
              <input
                type='checkbox'
                checked={includeSpam}
                onChange={(e) => setIncludeSpam(e.target.checked)}
                className='pixel-input'
                style={{ width: "16px", height: "16px" }}
              />
              Include spam
            </label>
          </div>
        </div>

        {/* NFT Grid */}
        <div ref={scrollContainerRef} className='flex-1 overflow-auto p-6'>
          {nftLoading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='pixel-spinner'></div>
              <div className='pixel-text ml-4'>Loading NFTs...</div>
            </div>
          ) : filteredNfts.length === 0 ? (
            <div className='flex items-center justify-center h-64'>
              <div className='pixel-text text-center'>
                <div className='pixel-subtitle mb-2'>No NFTs found</div>
                <div className='pixel-text'>
                  Try adjusting your filters or refresh the list
                </div>
              </div>
            </div>
          ) : (
            <div className='pixel-grid'>
              {filteredNfts.map((nft) => (
                <NftCard
                  key={nft.id}
                  nft={nft}
                  isSelected={localSelected.some((item) => item.id === nft.id)}
                  onToggle={handleToggleNft}
                  onViewDetails={setViewingNft}
                />
              ))}
            </div>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className='flex items-center justify-center py-8'>
              <div className='pixel-spinner'></div>
              <div className='pixel-text ml-4'>Loading more NFTs...</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='pixel-card flex items-center justify-between p-6'>
          <div className='pixel-text'>
            {selectedCount} NFT{selectedCount !== 1 ? "s" : ""} selected
          </div>
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='pixel-button pixel-button-secondary'>
              Cancel
            </button>
            <button onClick={handleConfirm} className='pixel-button'>
              Confirm Selection
            </button>
          </div>
        </div>
      </div>

      {/* NFT Viewer Modal */}
      <NftViewer
        nft={viewingNft}
        isOpen={!!viewingNft}
        onClose={() => setViewingNft(null)}
      />
    </div>
  );
};

export default NftSelectionModal;

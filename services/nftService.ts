import { NFT } from "../types";

type AlchemyNft = {
  contract: {
    address: string;
    name?: string;
    openSea?: { collectionName?: string };
    isSpam?: boolean;
  };
  tokenId: string;
  title?: string;
  media?: Array<{ raw?: string; thumbnail?: string; gateway?: string }>;
  rawMetadata?: {
    image?: string;
    description?: string;
    attributes?: Array<{ trait_type?: string; value?: string | number }>;
  };
  // Alchemy v3 flattened fields
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
    originalUrl?: string;
    contentType?: string;
  };
  tokenUri?: string;
  raw?: {
    metadata?: {
      description?: string;
    };
  };
};

type AlchemyResponse = {
  ownedNfts?: AlchemyNft[];
  nfts?: AlchemyNft[]; // v3 uses `nfts`
  pageKey?: string; // pagination token
};

const toHttpFromIpfs = (uri?: string): string | undefined => {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    // Support ipfs://<cid> or ipfs://ipfs/<cid> formats
    const path = uri.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
    return `https://ipfs.io/ipfs/${path}`;
  }
  return uri;
};

const resolveImage = (nft: AlchemyNft): string => {
  // Prefer Alchemy-processed URLs first
  const processed =
    nft.image?.cachedUrl ||
    nft.image?.pngUrl ||
    nft.image?.thumbnailUrl ||
    nft.image?.originalUrl;
  const media = nft.media?.[0];
  const mediaPick = media?.gateway || media?.thumbnail || media?.raw;
  const rawImage = nft.rawMetadata?.image;
  const tokenUri = nft.tokenUri;

  const candidate = processed || mediaPick || rawImage || tokenUri || "";
  const normalized = toHttpFromIpfs(candidate) || "";

  return normalized;
};

const resolveTraits = (nft: AlchemyNft): string[] => {
  const attrs = nft.rawMetadata?.attributes || [];
  return attrs
    .map((a) => {
      if (!a) return null;
      if (a.trait_type && a.value !== undefined && a.value !== null) {
        return `${a.trait_type}: ${String(a.value)}`;
      }
      return null;
    })
    .filter((x): x is string => Boolean(x));
};

export async function fetchUserNftsPaginated(
  ownerAddress: string,
  chain: "eth-mainnet" | "polygon-mainnet" | "base-mainnet" = "eth-mainnet",
  includeSpam: boolean = false,
  pageSize: number = 20,
  pageKey?: string
): Promise<{ nfts: NFT[]; pageKey?: string; hasMore: boolean }> {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    console.error("ALCHEMY_API_KEY is not set. Unable to fetch NFTs.");
    throw new Error("ALCHEMY_API_KEY is not set");
  }

  console.log(
    "[nftService] Fetching NFTs (paginated)",
    JSON.stringify({ chain, ownerAddress, pageSize, pageKey }, null, 2)
  );

  const base = `https://${chain}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`;
  const params = new URLSearchParams({
    owner: ownerAddress,
    withMetadata: "true",
    pageSize: pageSize.toString(),
  });
  if (pageKey) params.set("pageKey", pageKey);
  const url = `${base}?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error("[nftService] Network error calling Alchemy:", e);
    throw e;
  }

  console.log("[nftService] Alchemy response status:", res.status);
  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable>");
    console.error("[nftService] Alchemy error body:", body);
    throw new Error(`Failed to fetch NFTs: ${res.status}`);
  }

  const data: AlchemyResponse = await res.json();
  const chunk = data.nfts || data.ownedNfts || [];
  console.log("[nftService] Page items:", chunk.length);

  // More lenient spam filtering
  const isSpamNft = (nft: AlchemyNft): boolean => {
    // Only use Alchemy's spam flag as primary indicator
    if (nft.contract?.isSpam) return true;

    const name = nft.title?.toLowerCase() || "";
    const collection = nft.contract?.name?.toLowerCase() || "";
    const description = nft.raw?.metadata?.description?.toLowerCase() || "";

    // Only filter obvious spam keywords (more specific)
    const spamKeywords = [
      "claim rewards",
      "visit ",
      "free nft",
      "airdrop",
      "mint now",
      "limited time",
      "exclusive offer",
      "congratulations",
      "you won",
      "claim your",
      "get your",
      "don't miss",
      "hurry up",
      "act now",
      "special offer",
    ];

    // Check for spam keywords in name, collection, or description
    const hasSpamKeywords = spamKeywords.some(
      (keyword) =>
        name.includes(keyword) ||
        collection.includes(keyword) ||
        description.includes(keyword)
    );

    // Check for known malicious patterns only
    const hasSuspiciousPatterns =
      name.includes("protocol.org") ||
      name.includes("eventpepe.net") ||
      collection.includes("protocol.org") ||
      collection.includes("eventpepe.net") ||
      name.includes("stethprotocol") ||
      collection.includes("stethprotocol");

    // Only filter completely empty or extremely generic names
    const hasGenericName =
      name.length === 0 ||
      (name === "nft" && collection.length < 5) ||
      (name === "token" && collection.length < 5);

    return hasSpamKeywords || hasSuspiciousPatterns || hasGenericName;
  };

  const filteredNfts = includeSpam ? chunk : chunk.filter((n) => !isSpamNft(n));

  console.log(
    "[nftService] Filtered NFTs (after spam check):",
    filteredNfts.length
  );

  const mapped: NFT[] = filteredNfts.map((nft, idx) => {
    const collection =
      nft.contract.openSea?.collectionName ||
      nft.contract.name ||
      "Unknown Collection";
    const img = resolveImage(nft);
    const name =
      nft.title || `${collection} #${parseInt(nft.tokenId, 16) || nft.tokenId}`;
    return {
      id: `${chain}-${nft.contract.address}-${nft.tokenId}-${idx}`,
      name,
      imageUrl: img,
      collection,
      traits: resolveTraits(nft),
      tokenId: nft.tokenId,
      contractAddress: nft.contract.address,
      description:
        nft.rawMetadata?.description || nft.raw?.metadata?.description,
    };
  });

  console.log("[nftService] Mapped NFT items:", mapped.length);
  return {
    nfts: mapped,
    pageKey: data.pageKey,
    hasMore: !!data.pageKey,
  };
}

export async function fetchUserNfts(
  ownerAddress: string,
  chain: "eth-mainnet" | "polygon-mainnet" | "base-mainnet" = "eth-mainnet",
  includeSpam: boolean = true
): Promise<NFT[]> {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    console.error("ALCHEMY_API_KEY is not set. Unable to fetch NFTs.");
    throw new Error("ALCHEMY_API_KEY is not set");
  }

  console.log(
    "[nftService] Fetching NFTs",
    JSON.stringify({ chain, ownerAddress }, null, 2)
  );

  const base = `https://${chain}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`;
  const allNfts: AlchemyNft[] = [];
  let pageKey: string | undefined = undefined;
  let pageCount = 0;
  do {
    const params = new URLSearchParams({
      owner: ownerAddress,
      withMetadata: "true",
      pageSize: "100",
      excludeFilters: "SPAM",
    });
    if (pageKey) params.set("pageKey", pageKey);
    const url = `${base}?${params.toString()}`;

    let res: Response;
    try {
      res = await fetch(url);
    } catch (e) {
      console.error("[nftService] Network error calling Alchemy:", e);
      throw e;
    }

    console.log(
      "[nftService] Alchemy response status:",
      res.status,
      "page",
      pageCount + 1
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable>");
      console.error("[nftService] Alchemy error body:", body);
      throw new Error(`Failed to fetch NFTs: ${res.status}`);
    }

    const data: AlchemyResponse = await res.json();
    const chunk = data.nfts || data.ownedNfts || [];
    console.log("[nftService] Page items:", chunk.length);
    allNfts.push(...chunk);
    pageKey = data.pageKey;
    pageCount += 1;
  } while (pageKey && pageCount < 10);

  console.log("[nftService] Total NFTs returned:", allNfts.length);

  const spamCount = allNfts.filter((n) => n.contract?.isSpam).length;
  if (spamCount > 0) {
    console.log("[nftService] Items flagged as spam (included):", spamCount);
  }

  // More lenient spam filtering
  const isSpamNft = (nft: AlchemyNft): boolean => {
    // Only use Alchemy's spam flag as primary indicator
    if (nft.contract?.isSpam) return true;

    const name = nft.title?.toLowerCase() || "";
    const collection = nft.contract?.name?.toLowerCase() || "";
    const description = nft.raw?.metadata?.description?.toLowerCase() || "";

    // Only filter obvious spam keywords (more specific)
    const spamKeywords = [
      "claim rewards",
      "visit ",
      "free nft",
      "airdrop",
      "mint now",
      "limited time",
      "exclusive offer",
      "congratulations",
      "you won",
      "claim your",
      "get your",
      "don't miss",
      "hurry up",
      "act now",
      "special offer",
    ];

    // Check for spam keywords in name, collection, or description
    const hasSpamKeywords = spamKeywords.some(
      (keyword) =>
        name.includes(keyword) ||
        collection.includes(keyword) ||
        description.includes(keyword)
    );

    // Check for known malicious patterns only
    const hasSuspiciousPatterns =
      name.includes("protocol.org") ||
      name.includes("eventpepe.net") ||
      collection.includes("protocol.org") ||
      collection.includes("eventpepe.net") ||
      name.includes("stethprotocol") ||
      collection.includes("stethprotocol");

    // Only filter completely empty or extremely generic names
    const hasGenericName =
      name.length === 0 ||
      (name === "nft" && collection.length < 5) ||
      (name === "token" && collection.length < 5);

    return hasSpamKeywords || hasSuspiciousPatterns || hasGenericName;
  };

  const mapped: NFT[] = allNfts
    .filter((n) => (includeSpam ? true : !isSpamNft(n)))
    .map((nft, idx) => {
      const collection =
        nft.contract.openSea?.collectionName ||
        nft.contract.name ||
        "Unknown Collection";
      const img = resolveImage(nft);
      const name =
        nft.title ||
        `${collection} #${parseInt(nft.tokenId, 16) || nft.tokenId}`;
      return {
        id: `${nft.contract.address}-${nft.tokenId}-${idx}`,
        name,
        imageUrl: img,
        collection,
        traits: resolveTraits(nft),
      };
    });

  console.log("[nftService] Mapped NFT items:", mapped.length);
  return mapped;
}

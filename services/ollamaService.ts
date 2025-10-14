import { NFT } from "../types";

const buildPrompt = (userPrompt: string, nfts: NFT[]): string => {
  const characterAnalysis = nfts
    .map((nft, index) => {
      const traits = nft.traits || [];
      const characterName = generateCharacterName(
        nft.name,
        nft.collection,
        traits
      );

      return `**${characterName}** (${nft.collection})
- **Traits**: ${traits.join(", ")}`;
    })
    .join("\n\n");

  return `You are a bestselling fiction author known for compelling narratives and vivid storytelling. Create an engaging story that brings these NFT characters to life in a cohesive, dramatic narrative.

**CHARACTERS:**
${characterAnalysis}

**USER'S PROMPT:**
"${userPrompt}"

**WRITING STYLE:**
- Write like a bestselling author: engaging, fast-paced, with strong narrative drive
- Focus on action, dialogue, and emotional moments rather than excessive description
- Use the character traits to inform personality and behavior naturally
- Create tension, conflict, or mystery that keeps readers engaged
- Show character through actions and dialogue, not lengthy descriptions
- Build to a satisfying climax or resolution
- Keep descriptions vivid but concise - paint pictures with words, don't catalog details
- Aim for 400-600 words of compelling fiction

**STORY:**
`;
};

// Helper function to generate character names using LLM
const generateCharacterName = async (
  nftName: string,
  collection: string,
  traits: string[]
): Promise<string> => {
  // Check if NFT name is unique (no numbers, not generic)
  const isUniqueName = (name: string): boolean => {
    const cleanName = name.toLowerCase().trim();

    // Skip if it contains numbers
    if (/\d/.test(cleanName)) return false;

    // Skip generic names
    const genericNames = [
      "nft",
      "token",
      "item",
      "character",
      "avatar",
      "collectible",
      "digital",
      "art",
      "piece",
      "work",
      "creation",
      "asset",
      "unknown",
      "unnamed",
      "untitled",
      "default",
      "placeholder",
    ];

    if (genericNames.some((generic) => cleanName.includes(generic)))
      return false;

    // Skip very short names
    if (cleanName.length < 3) return false;

    // Skip names that are just collection names
    if (cleanName === collection.toLowerCase()) return false;

    return true;
  };

  // If NFT name is unique, use it
  if (isUniqueName(nftName)) {
    return nftName;
  }

  // Use LLM to generate a character name based on traits
  try {
    const namePrompt = `Generate a unique, memorable character name for an NFT character with these traits: ${traits.join(
      ", "
    )}. 
The character is from the collection "${collection}". 
Return only the name, nothing else. Make it sound like a real character name that fits the traits.`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt: namePrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.8,
          num_predict: 20,
          stop: ["\n", ".", ",", " "],
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const generatedName = data.response?.trim();
      if (generatedName && generatedName.length > 2) {
        return generatedName;
      }
    }
  } catch (error) {
    console.warn("Failed to generate character name with LLM:", error);
  }

  // Fallback to simple generated name
  const fallbackNames = [
    "Aria",
    "Kai",
    "Luna",
    "Phoenix",
    "Sage",
    "River",
    "Storm",
    "Echo",
    "Nova",
    "Zara",
  ];
  return fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
};

export const generateStory = async (
  userPrompt: string,
  nfts: NFT[]
): Promise<string> => {
  // Generate character names first
  const nftsWithNames = await Promise.all(
    nfts.map(async (nft) => ({
      ...nft,
      characterName: await generateCharacterName(
        nft.name,
        nft.collection,
        nft.traits || []
      ),
    }))
  );

  const characterAnalysis = nftsWithNames
    .map((nft) => {
      const traits = nft.traits || [];
      return `**${nft.characterName}** (${nft.collection})
- **Traits**: ${traits.join(", ")}`;
    })
    .join("\n\n");

  const fullPrompt = `You are a bestselling fiction author known for compelling narratives and vivid storytelling. Create an engaging story that brings these NFT characters to life in a cohesive, dramatic narrative.

**CHARACTERS:**
${characterAnalysis}

**USER'S PROMPT:**
"${userPrompt}"

**WRITING STYLE:**
- Write like a bestselling author: engaging, fast-paced, with strong narrative drive
- Focus on action, dialogue, and emotional moments rather than excessive description
- Use the character traits to inform personality and behavior naturally
- Create tension, conflict, or mystery that keeps readers engaged
- Show character through actions and dialogue, not lengthy descriptions
- Build to a satisfying climax or resolution
- Keep descriptions vivid but concise - paint pictures with words, don't catalog details
- Aim for 400-600 words of compelling fiction

**STORY:**
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          top_k: 50,
          repeat_penalty: 1.15,
          num_ctx: 4096,
          num_predict: 1000,
          stop: [
            "**Generated Story:**",
            "**Story:**",
            "Here is your story:",
            "Here's your story:",
            "The end.",
            "---",
          ],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.response?.trim() || "No story generated.";
  } catch (error) {
    console.error("Error calling Ollama API:", error);

    // Check if Ollama is not running
    if (error instanceof Error && error.message.includes("fetch")) {
      throw new Error(
        "Ollama is not running. Please install and start Ollama:\n\n" +
          "1. Install: https://ollama.ai/\n" +
          "2. Run: ollama pull llama3.1:8b\n" +
          "3. Start: ollama serve\n" +
          "4. Refresh this page"
      );
    }

    throw new Error(
      "Failed to generate story. Please check if Ollama is running."
    );
  }
};

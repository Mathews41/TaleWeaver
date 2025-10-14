import { NFT } from "../types";

const OPENAI_API_KEY = (import.meta as any).env.OPENAI_API_KEY || "";

export const generateStory = async (
  userPrompt: string,
  nfts: NFT[]
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables."
    );
  }

  const characterAnalysis = nfts
    .map((nft) => {
      const traits = nft.traits || [];
      return `**${nft.name}** (${nft.collection})
- Traits: ${traits.join(", ")}
${nft.description ? `- Description: ${nft.description}` : ""}`;
    })
    .join("\n\n");

  const systemPrompt = `You are a bestselling fiction author known for compelling narratives and vivid storytelling. Create an engaging story that brings NFT characters to life in a cohesive, dramatic narrative.

WRITING STYLE:
- Write like a bestselling author: engaging, fast-paced, with strong narrative drive
- Focus on action, dialogue, and emotional moments rather than excessive description
- Use the character traits to inform personality and behavior naturally
- Create tension, conflict, or mystery that keeps readers engaged
- Show character through actions and dialogue, not lengthy descriptions
- Build to a satisfying climax or resolution
- Keep descriptions vivid but concise - paint pictures with words
- Aim for 400-600 words of compelling fiction`;

  const userMessage = `CHARACTERS:
${characterAnalysis}

USER'S PROMPT:
"${userPrompt}"

Write a captivating story featuring these characters:`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content?.trim();

    if (!story) {
      throw new Error("No story generated from OpenAI API");
    }

    return story;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);

    if (error instanceof Error) {
      if (error.message.includes("401")) {
        throw new Error(
          "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable."
        );
      }
      if (error.message.includes("429")) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again later."
        );
      }
      if (error.message.includes("fetch")) {
        throw new Error("Network error. Please check your internet connection.");
      }
      throw error;
    }

    throw new Error("Failed to generate story. Please try again.");
  }
};


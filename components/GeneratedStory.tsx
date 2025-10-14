import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";

interface GeneratedStoryProps {
  story: string;
  isLoading: boolean;
  error: string | null;
}

const GeneratedStory: React.FC<GeneratedStoryProps> = ({
  story,
  isLoading,
  error,
}) => {
  const [displayedStory, setDisplayedStory] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  // Enhanced typewriter effect with realistic pauses and formatting
  useEffect(() => {
    if (!story || isLoading) {
      setDisplayedStory("");
      setShowCursor(false);
      return;
    }

    setDisplayedStory("");
    setShowCursor(true);
    let currentIndex = 0;
    const baseTypingSpeed = 18; // milliseconds per character (even faster)

    const getTypingSpeed = (char: string, nextChar: string): number => {
      // Much longer, exaggerated pauses for punctuation
      if (char === "." || char === "!" || char === "?") return 1200;
      if (char === "," || char === ";" || char === ":") return 600;
      if (char === "\n") return 800;

      // Shorter pause after spaces
      if (char === " ") return 100;

      // Variable speed for natural feel (reduced variation for faster typing)
      const randomVariation = Math.random() * 10 - 5; // -5 to +5ms
      return baseTypingSpeed + randomVariation;
    };

    const typeNextCharacter = () => {
      if (currentIndex < story.length) {
        const currentChar = story[currentIndex];
        const nextChar =
          currentIndex + 1 < story.length ? story[currentIndex + 1] : "";

        setDisplayedStory(story.substring(0, currentIndex + 1));
        currentIndex++;

        const speed = getTypingSpeed(currentChar, nextChar);
        setTimeout(typeNextCharacter, speed);
      } else {
        // Hide cursor after typing is complete
        setTimeout(() => setShowCursor(false), 2000);
      }
    };

    const startTyping = setTimeout(typeNextCharacter, 800); // Longer delay for anticipation

    return () => {
      clearTimeout(startTyping);
    };
  }, [story, isLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='story-loading-container'>
          <div className='weaving-animation'>
            <div className='weaving-loom'></div>
            {/* Warp threads (vertical) */}
            <div className='warp-thread'></div>
            <div className='warp-thread'></div>
            <div className='warp-thread'></div>
            <div className='warp-thread'></div>
            <div className='warp-thread'></div>
            <div className='warp-thread'></div>
            <div className='warp-thread'></div>
            <div className='warp-thread'></div>
            {/* Weft threads (horizontal weaving) */}
            <div className='weft-thread'></div>
            <div className='weft-thread'></div>
            <div className='weft-thread'></div>
            <div className='weft-thread'></div>
            <div className='weft-thread'></div>
            {/* Stitching needles */}
            <div className='stitch-needle'></div>
            <div className='stitch-needle'></div>
            <div className='stitch-needle'></div>
          </div>
          <div className='weaving-text'>STITCHING YOUR TALE...</div>
          <div className='weaving-subtext'>
            Threads of destiny weave your narrative...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className='pixel-card'
          style={{ borderColor: "#ff4444", backgroundColor: "#330000" }}
          role='alert'>
          <strong className='pixel-text' style={{ color: "#ff6666" }}>
            An error occurred:{" "}
          </strong>
          <span
            className='pixel-text block sm:inline'
            style={{ color: "#ff6666" }}>
            {error}
          </span>
        </div>
      );
    }

    if (story) {
      return (
        <div className='typewriter-container'>
          {displayedStory}
          {showCursor && <span className='typewriter-cursor'></span>}
        </div>
      );
    }

    return (
      <div className='text-center pixel-text p-8'>
        Your generated story will appear here.
      </div>
    );
  };

  return <div className='pixel-card p-6 min-h-[200px]'>{renderContent()}</div>;
};

export default GeneratedStory;

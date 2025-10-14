import React, { useState } from "react";

interface StoryFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  selectedNftCount: number;
}

const StoryForm: React.FC<StoryFormProps> = ({
  onSubmit,
  isLoading,
  selectedNftCount,
}) => {
  const [prompt, setPrompt] = useState<string>("");

  const canSubmit =
    !isLoading && prompt.trim().length > 0 && selectedNftCount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='e.g., A thrilling chase through a neon-drenched city...'
        className='pixel-textarea w-full h-32'
        disabled={isLoading}
      />
      <button
        type='submit'
        disabled={!canSubmit}
        className='pixel-button w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed'>
        {isLoading ? "Weaving your tale..." : "Generate Story"}
      </button>
    </form>
  );
};

export default StoryForm;

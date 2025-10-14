<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NFT Story Weaver 🎨✨

An AI-powered application that weaves creative stories from your NFT collection.

View your app in AI Studio: https://ai.studio/apps/drive/1hAlj8qA0Flht8yM6rdz7JEt0yKwpY8j4

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file with your API keys:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mathews41/TaleWeaver)

### Manual Deployment

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `ALCHEMY_API_KEY` - Your Alchemy API key

### Environment Variables

The following environment variables are required:

- **OPENAI_API_KEY**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **ALCHEMY_API_KEY**: Get your API key from [Alchemy Dashboard](https://dashboard.alchemy.com/)

## Features

- 🔗 Connect your Web3 wallet
- 🖼️ Browse your NFT collection across multiple chains (Ethereum, Polygon, Base)
- 🎭 Select NFTs to generate stories
- ✍️ AI-powered creative storytelling
- 🌈 Beautiful, modern UI

# Ollama Setup Guide

This app uses **Ollama** for story generation! Completely free and runs locally.

## 🚀 **Install Ollama:**

1. Go to https://ollama.ai/
2. Download and install for your OS
3. Open terminal and run:
   ```bash
   ollama pull llama3.1:8b
   ollama serve
   ```
4. Keep the terminal open and refresh this app

**Benefits:**

- ✅ 100% free forever
- ✅ Runs locally (privacy-friendly)
- ✅ No internet required after setup
- ✅ No API limits

---

## 🛠️ **Troubleshooting**

**"Ollama is not running" error:**

- Make sure you ran `ollama serve` in terminal
- Check if Ollama is installed: `ollama --version`

**Story quality not good enough:**

- Try a larger model: `ollama pull llama3.1:70b`
- Update the model in `services/ollamaService.ts`

---

## 💡 **Tips**

- **Best quality**: Use `llama3.1:70b` (requires more RAM)
- **Fastest**: Use `llama3.1:8b` (current default)
- **Privacy**: Ollama keeps everything local
- **Offline**: Ollama works without internet after setup








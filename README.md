# Health News Summarizer

A modern frontend web application that provides AI-powered health news summarization and analysis.

## Features

- **Health News Feed**: Get the latest health news from NewsAPI
- **AI-Powered Summaries**: Click on any article to get AI-generated summaries and key takeaways
- **Simplified Content**: AI-rewritten articles in accessible language
- **Smart Categorization**: Articles are automatically categorized by health topics
- **On-Demand Processing**: AI processing only happens when you click on an article to save API quota

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
   - Copy `env.example` to `.env`
   - Add your API keys:
     ```
     VITE_NEWS_API_KEY=your_news_api_key_here
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

3. **Get API Keys**:
   - **NewsAPI**: Get your free API key from [newsapi.org](https://newsapi.org/)
   - **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the application**:
```bash
npm run dev
```

## How It Works

- Articles are fetched from NewsAPI using the simple `category=health` filter
- No AI processing happens until you click on a specific article
- When you click an article, it gets AI-processed with:
  - Executive summary (TL;DR)
  - Key takeaways
  - Simplified content for better readability
- This approach saves your API quota by only processing articles you're interested in

## Architecture

This is now a **frontend-only** application that:
- Fetches health news directly from NewsAPI
- Uses Google Gemini AI for on-demand article processing
- No backend server required - everything runs in the browser
- Simple and efficient - perfect for personal use or small deployments

## API Usage

The app uses two external APIs:
- **NewsAPI**: For fetching health news articles
- **Google Gemini**: For AI-powered summarization and content simplification

Both APIs are called directly from the frontend, making the application lightweight and easy to deploy.
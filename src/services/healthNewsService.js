import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API Configuration
const NEWS_API_KEY = 'a67cd1c83bf8427c8a6408352e8002a4';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const GEMINI_API_KEY = 'AIzaSyBP8WHdlnBsz2BYSwUVKe8L1lQ0uCVkL08';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Cache for articles
let articlesCache = [];
let lastFetchTime = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Simple categorization based on basic health keywords
const categorizeArticle = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  
  // Basic health categorization
  if (text.includes('mental health') || text.includes('psychology') || text.includes('depression') || text.includes('anxiety') || text.includes('brain') || text.includes('mental')) {
    return 'Mental Health';
  } else if (text.includes('cancer') || text.includes('disease') || text.includes('covid') || text.includes('virus') || text.includes('infection') || text.includes('diabetes') || text.includes('heart')) {
    return 'Diseases & Treatment';
  } else if (text.includes('research') || text.includes('study') || text.includes('clinical') || text.includes('trial')) {
    return 'Medical Research';
  } else if (text.includes('nutrition') || text.includes('diet') || text.includes('fitness') || text.includes('exercise') || text.includes('wellness')) {
    return 'Nutrition & Wellness';
  } else {
    return 'General Health';
  }
};

const calculateReadTime = (content) => {
  if (!content) return '1 min read';
  
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  
  return `${readTime} min read`;
};

// Main service functions
export const healthNewsService = {
  async fetchHealthNews() {
    try {
      const queryParams = new URLSearchParams({
        country: 'us',
        category: 'health',
        apiKey: NEWS_API_KEY
      });

      const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines?${queryParams}`);
      
      if (response.data.status === 'ok') {
        console.log(`Fetched ${response.data.articles.length} health articles`);
        
        let articleId = 1;
        const articles = response.data.articles
          .map((article) => ({
            id: articleId++,
            title: article.title || 'No title available',
            content: article.content || article.description || 'No content available',
            source: article.source?.name || 'Unknown source',
            publishedAt: article.publishedAt || new Date().toISOString(),
            category: categorizeArticle(article.title, article.content),
            readTime: calculateReadTime(article.content || article.description),
            url: article.url,
            urlToImage: article.urlToImage,
            author: article.author,
            uniqueKey: article.title?.toLowerCase().trim(),
            // Initialize without AI processing
            tldr: null,
            keyTakeaways: null,
            isSummarized: false
          }));
        
        console.log(`Total health articles: ${articles.length}`);
        return articles;
      } else {
        throw new Error(`NewsAPI error: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching health news:', error);
      throw error;
    }
  },

  async getArticles(page = 1) {
    try {
      const pageSize = 5;
      
      // Check cache first
      if (articlesCache.length > 0 && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedArticles = articlesCache.slice(startIndex, endIndex);
        
        return {
          success: true,
          articles: paginatedArticles,
          cached: true,
          page: page,
          hasMore: endIndex < articlesCache.length,
          totalArticles: articlesCache.length
        };
      }

      // Fetch new articles (already includes basic structure without AI processing)
      const articles = await this.fetchHealthNews();
      
      articlesCache = articles;
      lastFetchTime = Date.now();
      
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = articles.slice(startIndex, endIndex);
      
      return {
        success: true,
        articles: paginatedArticles,
        cached: false,
        page: page,
        hasMore: endIndex < articles.length,
        totalArticles: articles.length
      };
    } catch (error) {
      console.error('Error getting articles:', error);
      
      // Return cached articles if available
      if (articlesCache.length > 0) {
        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedArticles = articlesCache.slice(startIndex, endIndex);
        
        return {
          success: true,
          articles: paginatedArticles,
          cached: true,
          warning: 'Using cached articles due to fetch error',
          page: page,
          hasMore: endIndex < articlesCache.length,
          totalArticles: articlesCache.length
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch health news articles'
      };
    }
  },

  async summarizeArticle(article) {
    try {
      const prompt = `
        Analyze this health news article and create a crisp, professional medical summary.
        
        Article Title: ${article.title}
        Article Content: ${article.content}
        
        Create a concise summary with:
        1. A crisp 1-2 sentence TL;DR that captures the core medical finding or health implication
        2. Three sharp, bullet-point key takeaways that highlight the most important medical insights
        
        Requirements:
        - Keep TL;DR to 1-2 sentences maximum
        - Make key takeaways concise but informative (1-2 lines each)
        - Use precise medical terminology
        - Focus on the most critical medical information
        - Avoid filler words and generic statements
        - Be direct and actionable
        - Maintain professional medical tone
        
        Format as JSON:
        {
          "tldr": "Crisp 1-2 sentence summary of the core medical finding or health implication",
          "keyTakeaways": [
            "Concise medical insight or finding",
            "Key health implication or recommendation", 
            "Important medical fact or research conclusion"
          ]
        }
      `;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
      }
      
      return {
        tldr: "AI processing in progress. Summary will be available shortly.",
        keyTakeaways: [
          "Content analysis underway",
          "Medical insights being extracted",
          "Summary generation pending"
        ]
      };
    } catch (error) {
      console.error('Error summarizing article:', error);
      return {
        tldr: "Summary unavailable. Manual review required.",
        keyTakeaways: [
          "Content requires manual review",
          "Technical processing limited",
          "Consult healthcare professionals"
        ]
      };
    }
  },

  async simplifyArticle(article) {
    try {
      const prompt = `
        Please rewrite this health news article in a professional, accessible tone for a general audience. 
        
        Article Title: ${article.title}
        Article Content: ${article.content}
        
        Requirements:
        - Use professional medical news writing style
        - Explain complex medical terms in clear, accessible language
        - Maintain factual accuracy and medical credibility
        - Avoid casual language, emojis, or overly conversational tone
        - Structure content with clear paragraphs and logical flow
        - Focus on medical facts, implications, and evidence-based information
        - Keep the tone informative and authoritative but accessible
        
        Return the rewritten article as plain text.
      `;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error simplifying article:', error);
      return `We're having trouble processing this article right now. Please try again later. The original article content is: ${article.content}`;
    }
  },

  async processArticleWithAI(articleId) {
    try {
      const article = articlesCache.find(a => a.id === articleId);
      
      if (!article) {
        throw new Error('Article not found');
      }
      
      if (article.isSummarized) {
        return {
          success: true,
          article: article,
          message: 'Article already processed'
        };
      }
      
      console.log(`Processing article ${articleId} with AI: ${article.title}`);
      
      let summary, simplifiedContent;
      
      try {
        summary = await this.summarizeArticle(article);
        simplifiedContent = await this.simplifyArticle(article);
      } catch (aiError) {
        console.error('AI processing failed due to quota limits, using fallback content');
        summary = {
          tldr: `Health news: ${article.title}. This article discusses important health-related information that requires professional medical interpretation.`,
          keyTakeaways: [
            'This article contains health information that should be evaluated by qualified medical professionals',
            'The findings and implications discussed may have relevance to public health awareness',
            'Readers are advised to consult healthcare providers for personalized medical guidance'
          ]
        };
        simplifiedContent = `We're experiencing high demand for AI processing right now. Here's the original article content:\n\n${article.content}\n\nFor the best experience, please try again later when AI processing is available.`;
      }
      
      // Ensure we always have content even if AI processing fails
      if (!summary || !summary.tldr) {
        summary = {
          tldr: `Health news: ${article.title}. This article discusses important health-related information that requires professional medical interpretation.`,
          keyTakeaways: [
            'This article contains health information that should be evaluated by qualified medical professionals',
            'The findings and implications discussed may have relevance to public health awareness',
            'Readers are advised to consult healthcare providers for personalized medical guidance'
          ]
        };
      }
      
      if (!simplifiedContent) {
        simplifiedContent = `We're experiencing high demand for AI processing right now. Here's the original article content:\n\n${article.content}\n\nFor the best experience, please try again later when AI processing is available.`;
      }
      
      const updatedArticle = {
        ...article,
        tldr: summary.tldr,
        keyTakeaways: summary.keyTakeaways,
        simplifiedContent: simplifiedContent,
        isSummarized: true
      };
      
      const articleIndex = articlesCache.findIndex(a => a.id === articleId);
      if (articleIndex !== -1) {
        articlesCache[articleIndex] = updatedArticle;
      }
      
      return {
        success: true,
        article: updatedArticle
      };
    } catch (error) {
      console.error('Error processing article with AI:', error);
      return {
        success: false,
        error: 'Failed to process article with AI'
      };
    }
  },

  async getSimplifiedArticle(articleId) {
    try {
      const article = articlesCache.find(a => a.id === articleId);
      
      if (!article) {
        throw new Error('Article not found');
      }
      
      const simplifiedContent = await this.simplifyArticle(article);
      
      return {
        success: true,
        simplifiedContent: simplifiedContent
      };
    } catch (error) {
      console.error('Error simplifying article:', error);
      return {
        success: false,
        error: 'Failed to simplify article'
      };
    }
  },

  async refreshArticles() {
    try {
      // Clear cache
      articlesCache = [];
      lastFetchTime = null;
      
      // Fetch new articles (already includes basic structure without AI processing)
      const articles = await this.fetchHealthNews();
      
      articlesCache = articles;
      lastFetchTime = Date.now();
      
      return {
        success: true,
        articles: articles,
        message: 'Articles refreshed successfully'
      };
    } catch (error) {
      console.error('Error refreshing articles:', error);
      return {
        success: false,
        error: 'Failed to refresh articles'
      };
    }
  },

  async healthCheck() {
    return {
      success: true,
      message: 'Health News Service is running',
      timestamp: new Date().toISOString()
    };
  }
};

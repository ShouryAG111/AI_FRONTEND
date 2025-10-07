import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBvQZZnlgm8-ViEZvTcyKAXkrtJEeLg1o2YDkLwKb0QpRdASZqUZKZqBdZx1WSEbuXT3BlbkFJxfyZLoenH5_SvHwaNRK-K4uT3KbBWZQd-zPB6H-5hODurV5wYlJrzWPjHlAzulGvUkA1SBMwMA');

const testGeminiConnection = async () => {
  try {
    console.log('Testing Gemini connection...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('Test');
    const response = await result.response;
    const text = response.text();
    console.log('SUCCESS: Connected to Gemini 2.0 Flash');
    return 'gemini-2.0-flash-exp';
  } catch (error) {
    console.log(`FAILED: Gemini connection failed: ${error.message}`);
    return null;
  }
};

let workingModel = null;
testGeminiConnection().then(model => {
  workingModel = model;
  if (model) {
    console.log(`Using Gemini model: ${model}`);
  }
});

const NEWS_API_KEY = process.env.NEWS_API_KEY || 'a67cd1c83bf8427c8a6408352e8002a4';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

let articlesCache = [];
let lastFetchTime = null;
const CACHE_DURATION = 30 * 60 * 1000;
let isProcessingAI = false;

const categorizeArticle = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  
  // More lenient health keywords - broader coverage
  const healthKeywords = [
    // Core health terms
    'health', 'medical', 'medicine', 'healthcare', 'health care', 'doctor', 'physician', 'nurse', 'patient', 'hospital', 'clinic', 'medical center',
    'disease', 'illness', 'symptom', 'diagnosis', 'treatment', 'therapy', 'cure', 'medication', 'drug', 'pharmaceutical', 'prescription',
    'cancer', 'tumor', 'oncology', 'covid', 'coronavirus', 'virus', 'infection', 'bacterial', 'viral', 'chronic', 'acute', 'syndrome', 'disorder', 'condition', 'injury',
    'surgery', 'operation', 'procedure', 'vaccine', 'immunization', 'prevention', 'screening', 'medical test', 'scan', 'x-ray', 'mri', 'ct scan',
    'mental health', 'psychology', 'psychiatric', 'depression', 'anxiety', 'cognitive', 'brain', 'neurological', 'neurology', 'psychiatry',
    'nutrition', 'diet', 'vitamin', 'supplement', 'fitness', 'exercise', 'wellness', 'wellbeing', 'lifestyle', 'health lifestyle',
    'aging', 'longevity', 'recovery', 'healing', 'rehabilitation', 'physical therapy', 'occupational therapy', 'medical rehabilitation',
    'cardiovascular', 'heart', 'cardiac', 'lung', 'respiratory', 'blood', 'immune', 'immune system', 'allergy', 'asthma', 'diabetes', 'hypertension',
    'obesity', 'weight loss', 'weight management', 'sleep', 'insomnia', 'stress', 'mental stress', 'medical research', 'clinical trial', 'medical study',
    // Additional broader health terms
    'body', 'organ', 'cell', 'tissue', 'muscle', 'bone', 'skin', 'eye', 'ear', 'nose', 'mouth', 'teeth', 'gum', 'throat', 'chest', 'back', 'spine',
    'pain', 'ache', 'hurt', 'sore', 'swelling', 'inflammation', 'fever', 'temperature', 'blood pressure', 'pulse', 'breathing', 'breath',
    'healthy', 'unhealthy', 'sick', 'sickness', 'heal', 'healing', 'recover', 'recovery', 'cure', 'treat', 'treating', 'care', 'caring',
    'research', 'study', 'studies', 'trial', 'trials', 'experiment', 'finding', 'findings', 'discovery', 'discoveries', 'breakthrough',
    'safety', 'risk', 'risks', 'side effect', 'side effects', 'adverse', 'complication', 'complications', 'outcome', 'outcomes',
    'patient', 'patients', 'people', 'person', 'individual', 'individuals', 'adult', 'adults', 'child', 'children', 'baby', 'babies', 'elderly',
    'prevent', 'prevention', 'preventive', 'protect', 'protection', 'protective', 'reduce', 'reduction', 'improve', 'improvement', 'enhance', 'enhancement'
  ];
  
  // Check if article contains health-related terms
  const isHealthRelated = healthKeywords.some(keyword => text.includes(keyword));
  
  if (!isHealthRelated) {
    return 'Non-Health';
  }
  
  // More lenient non-health filtering - only exclude if clearly not health-related
  const strongNonHealthIndicators = [
    'sports score', 'football game', 'basketball game', 'baseball game', 'tennis match', 'golf tournament', 'cricket match', 'rugby match', 'hockey game',
    'election results', 'political campaign', 'government policy', 'presidential', 'ministerial', 'parliamentary', 'congressional',
    'stock market', 'investment advice', 'banking news', 'financial report', 'economic forecast',
    'software update', 'app release', 'computer virus', 'social media platform', 'digital marketing',
    'movie review', 'film premiere', 'music album', 'celebrity gossip', 'actor interview', 'singer concert',
    'travel guide', 'hotel booking', 'restaurant review', 'cooking show', 'recipe book',
    'fashion show', 'clothing line', 'beauty product', 'cosmetic brand', 'makeup tutorial',
    'car review', 'vehicle launch', 'airline booking', 'flight schedule',
    'real estate listing', 'property sale', 'housing market', 'construction project',
    'school curriculum', 'university admission', 'student loan', 'academic paper',
    'criminal case', 'police report', 'court ruling', 'legal advice',
    'weather forecast', 'climate change', 'environmental policy', 'wildlife conservation', 'pet care'
  ];
  
  // Only exclude if it has strong non-health indicators AND lacks health context
  const hasStrongNonHealthIndicators = strongNonHealthIndicators.some(indicator => text.includes(indicator));
  const hasHealthContext = healthKeywords.filter(keyword => text.includes(keyword)).length >= 2;
  
  if (hasStrongNonHealthIndicators && !hasHealthContext) {
    return 'Non-Health';
  }
  
  // More specific categorization
  if (text.includes('mental health') || text.includes('psychology') || text.includes('psychiatric') || text.includes('depression') || text.includes('anxiety') || text.includes('cognitive') || text.includes('brain') || text.includes('neurological') || text.includes('neurology') || text.includes('psychiatry') || text.includes('mental stress') || text.includes('insomnia')) {
    return 'Mental Health';
  } else if (text.includes('disease') || text.includes('cancer') || text.includes('tumor') || text.includes('oncology') || text.includes('covid') || text.includes('coronavirus') || text.includes('virus') || text.includes('infection') || text.includes('bacterial') || text.includes('viral') || text.includes('illness') || text.includes('chronic') || text.includes('acute') || text.includes('syndrome') || text.includes('disorder') || text.includes('condition') || text.includes('injury') || text.includes('diabetes') || text.includes('hypertension') || text.includes('asthma') || text.includes('allergy') || text.includes('cardiovascular') || text.includes('cardiac')) {
    return 'Diseases & Treatment';
  } else if (text.includes('medical research') || text.includes('clinical trial') || text.includes('medical study') || text.includes('research') || text.includes('study') || text.includes('scientific') || text.includes('clinical') || text.includes('screening') || text.includes('medical test') || text.includes('scan') || text.includes('x-ray') || text.includes('mri') || text.includes('ct scan')) {
    return 'Medical Research';
  } else if (text.includes('nutrition') || text.includes('diet') || text.includes('vitamin') || text.includes('supplement') || text.includes('fitness') || text.includes('exercise') || text.includes('weight loss') || text.includes('weight management') || text.includes('obesity') || text.includes('lifestyle') || text.includes('health lifestyle') || text.includes('wellness') || text.includes('wellbeing') || text.includes('physical therapy') || text.includes('occupational therapy') || text.includes('medical rehabilitation')) {
    return 'Nutrition & Wellness';
  } else {
    return 'Non-Health'; // Default to non-health if not clearly categorized
  }
};

const calculateReadTime = (content) => {
  if (!content) return '1 min read';
  
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  
  return `${readTime} min read`;
};


const fetchHealthNews = async () => {
  try {
    // Use top-headlines endpoint with health category
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
          uniqueKey: article.title?.toLowerCase().trim()
        }))
        .filter(article => {
          // Filter out non-health articles (additional safety check)
          return article.category !== 'Non-Health';
        });
      
      console.log(`Total health-related articles: ${articles.length}`);
      return articles;
    } else {
      throw new Error(`NewsAPI error: ${response.data.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Error fetching health news:', error);
    throw error;
  }
};


const summarizeArticle = async (article) => {
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

    
    const model = genAI.getGenerativeModel({ model: workingModel || 'gemini-2.0-flash-exp' });
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
};


const simplifyArticle = async (article) => {
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

    const model = genAI.getGenerativeModel({ model: workingModel || 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error simplifying article:', error);
    return `We're having trouble processing this article right now. Please try again later. The original article content is: ${article.content}`;
  }
};


const processArticlesWithAI = async (articles) => {
  const processedArticles = [];
  
  console.log('Waiting 10 seconds before starting AI processing to avoid rate limits...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`Processing article ${i + 1}/${articles.length}: ${article.title}`);
    
    try {
      const summary = await summarizeArticle(article);
      
      const processedArticle = {
        ...article,
        tldr: summary.tldr,
        keyTakeaways: summary.keyTakeaways,
        isSummarized: true
      };
      
      processedArticles.push(processedArticle);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Error processing article ${article.title}:`, error);
      
      if (error.message && error.message.includes('429 Too Many Requests')) {
        console.log('Rate limit exceeded, stopping AI processing and using fallback summaries...');
        const remainingArticles = articles.slice(i);
        for (const remainingArticle of remainingArticles) {
          const processedArticle = {
            ...remainingArticle,
            tldr: "AI processing temporarily unavailable due to rate limits. Content available for manual review.",
            keyTakeaways: [
              "Medical content requires professional interpretation",
              "AI processing will resume when rate limits reset",
              "Consult healthcare professionals for guidance"
            ],
            isSummarized: false
          };
          processedArticles.push(processedArticle);
        }
        break;
      }
      
      const processedArticle = {
        ...article,
        tldr: "AI processing encountered technical limitations for this article. The content is available for manual review and analysis.",
        keyTakeaways: [
          "This health article contains information that requires manual review due to processing limitations",
          "The medical content should be evaluated by qualified healthcare professionals",
          "Technical processing will be retried automatically during the next update cycle"
        ],
        isSummarized: false
      };
      
      processedArticles.push(processedArticle);
    }
  }
  
  return processedArticles;
};




app.get('/api/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    
    if (articlesCache.length > 0 && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = articlesCache.slice(startIndex, endIndex);
      
      return res.json({
        success: true,
        articles: paginatedArticles,
        cached: true,
        page: page,
        hasMore: endIndex < articlesCache.length,
        totalArticles: articlesCache.length
      });
    }

    
    const articles = await fetchHealthNews();
    
    const basicArticles = articles.map(article => ({
      ...article,
      tldr: null,
      keyTakeaways: null,
      isSummarized: false
    }));
    
    articlesCache = basicArticles;
    lastFetchTime = Date.now();
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArticles = basicArticles.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      articles: paginatedArticles,
      cached: false,
      page: page,
      hasMore: endIndex < basicArticles.length,
      totalArticles: basicArticles.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    
    
    if (articlesCache.length > 0) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = articlesCache.slice(startIndex, endIndex);
      
      return res.json({
        success: true,
        articles: paginatedArticles,
        cached: true,
        warning: 'Using cached articles due to fetch error',
        page: page,
        hasMore: endIndex < articlesCache.length,
        totalArticles: articlesCache.length
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health news articles'
    });
  }
});


app.post('/api/articles/process-ai', async (req, res) => {
  try {
    if (isProcessingAI) {
      return res.status(429).json({
        success: false,
        error: 'AI processing already in progress'
      });
    }

    isProcessingAI = true;
    console.log('Starting AI processing for cached articles...');

    try {
      const processedArticles = await processArticlesWithAI(articlesCache);
      articlesCache = processedArticles;
      lastFetchTime = Date.now();
      
      res.json({
        success: true,
        articles: processedArticles,
        message: 'Articles processed with AI successfully'
      });
    } catch (aiError) {
      console.error('AI processing failed:', aiError);
      res.status(500).json({
        success: false,
        error: 'AI processing failed',
        details: aiError.message
      });
    } finally {
      isProcessingAI = false;
    }
  } catch (error) {
    isProcessingAI = false;
    console.error('Error in AI processing endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process articles with AI'
    });
  }
});


app.post('/api/articles/:id/process-ai', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const article = articlesCache.find(a => a.id === articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    if (article.isSummarized) {
      return res.json({
        success: true,
        article: article,
        message: 'Article already processed'
      });
    }
    
    console.log(`Processing article ${articleId} with AI: ${article.title}`);
    
    let summary, simplifiedContent;
    
    try {
      summary = await summarizeArticle(article);
      simplifiedContent = await simplifyArticle(article);
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
    
    res.json({
      success: true,
      article: updatedArticle
    });
  } catch (error) {
    console.error('Error processing article with AI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process article with AI'
    });
  }
});

app.post('/api/articles/:id/simplify', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const article = articlesCache.find(a => a.id === articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    const simplifiedContent = await simplifyArticle(article);
    
    res.json({
      success: true,
      simplifiedContent: simplifiedContent
    });
  } catch (error) {
    console.error('Error simplifying article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simplify article'
    });
  }
});


app.post('/api/articles/refresh', async (req, res) => {
  try {
    
    articlesCache = [];
    lastFetchTime = null;
    
    
    const articles = await fetchHealthNews();
    
    // Return basic articles without AI processing - AI processing happens on-demand when viewing articles
    const basicArticles = articles.map(article => ({
      ...article,
      tldr: null,
      keyTakeaways: null,
      isSummarized: false
    }));
    
    articlesCache = basicArticles;
    lastFetchTime = Date.now();
    
    res.json({
      success: true,
      articles: basicArticles,
      message: 'Articles refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh articles'
    });
  }
});


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health News API is running',
    timestamp: new Date().toISOString()
  });
});


app.get('/api/verify-newsapi', async (req, res) => {
  try {
    console.log('Verifying NewsAPI connection...');
    const queryParams = new URLSearchParams({
      category: 'health',
      language: 'en',
      country: 'us',
      pageSize: '15',
      apiKey: NEWS_API_KEY
    });

    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines?${queryParams}`);
    
    if (response.data.status === 'ok') {
      res.json({
        success: true,
        message: 'NewsAPI is working correctly',
        articlesCount: response.data.articles.length,
        sampleTitles: response.data.articles.slice(0, 3).map(a => a.title),
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'NewsAPI returned error status',
        error: response.data
      });
    }
  } catch (error) {
    console.error('NewsAPI verification failed:', error);
    res.status(500).json({
      success: false,
      message: 'NewsAPI verification failed',
      error: error.message
    });
  }
});





cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled article refresh...');
  try {
    const articles = await fetchHealthNews();
    
    // Return basic articles without AI processing - AI processing happens on-demand when viewing articles
    const basicArticles = articles.map(article => ({
      ...article,
      tldr: null,
      keyTakeaways: null,
      isSummarized: false
    }));
    
    articlesCache = basicArticles;
    lastFetchTime = Date.now();
    
    console.log('Articles refreshed successfully');
  } catch (error) {
    console.error('Error in scheduled refresh:', error);
  }
});


const server = app.listen(PORT, () => {
  console.log(`Health News API server running on port ${PORT}`);
  console.log(`Fetching health news from NewsAPI...`);
  console.log(`AI summarization powered by Gemini`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    const newPort = PORT + 1;
    const newServer = app.listen(newPort, () => {
      console.log(`Health News API server running on port ${newPort}`);
      console.log(`Fetching health news from NewsAPI...`);
      console.log(`AI summarization powered by Gemini`);
    });
  } else {
    console.error('Server error:', err);
  }
});

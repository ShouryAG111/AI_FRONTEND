import { healthNewsService } from './healthNewsService';

export const apiService = {
  async getArticles(page = 1) {
    try {
      return await healthNewsService.getArticles(page);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch articles');
    }
  },

  async processArticleWithAI(articleId) {
    try {
      return await healthNewsService.processArticleWithAI(articleId);
    } catch (error) {
      throw new Error(error.message || 'Failed to process article with AI');
    }
  },

  async getSimplifiedArticle(articleId) {
    try {
      return await healthNewsService.getSimplifiedArticle(articleId);
    } catch (error) {
      throw new Error(error.message || 'Failed to simplify article');
    }
  },

  async refreshArticles() {
    try {
      return await healthNewsService.refreshArticles();
    } catch (error) {
      throw new Error(error.message || 'Failed to refresh articles');
    }
  },

  async healthCheck() {
    try {
      return await healthNewsService.healthCheck();
    } catch (error) {
      throw new Error('Service is not responding');
    }
  }
};
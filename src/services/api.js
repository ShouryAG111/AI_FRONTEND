import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  async getArticles(page = 1) {
    try {
      const response = await apiClient.get(`/articles?page=${page}`);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - server is taking too long to respond');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch articles');
    }
  },

  async processArticleWithAI(articleId) {
    try {
      const response = await apiClient.post(`/articles/${articleId}/process-ai`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to process article with AI');
    }
  },

  async getSimplifiedArticle(articleId) {
    try {
      const response = await apiClient.post(`/articles/${articleId}/simplify`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to simplify article');
    }
  },

  async refreshArticles() {
    try {
      const response = await apiClient.post('/articles/refresh');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to refresh articles');
    }
  },

  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('API server is not responding');
    }
  }
};

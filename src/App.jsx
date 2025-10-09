import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from './services/api';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import FeedScreen from './components/FeedScreen';
import ExpandedArticleScreen from './components/ExpandedArticleScreen';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading articles...');
      const response = await apiService.getArticles(1);
      console.log('API Response:', response);
      
      if (response.success && response.articles) {
        console.log('Setting articles:', response.articles.length);
        setArticles(response.articles);
      } else {
        console.error('Failed to load articles - no articles in response');
        setArticles([]);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
      setArticles([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await apiService.refreshArticles();
      
      if (response.success) {
        setArticles(response.articles);
        setSelectedArticle(null);
        setIsExpanded(false);
      } else {
        throw new Error('Failed to refresh articles');
      }
    } catch (err) {
      console.error('Error refreshing articles:', err);
      setError(null);
    } finally {
      setRefreshing(false);
    }
  };

  const handleArticlesUpdate = (updatedArticles) => {
    setArticles(updatedArticles);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsExpanded(true);
  };

  const handleBack = () => {
    setSelectedArticle(null);
    setIsExpanded(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Header 
            onRefresh={handleRefresh} 
            refreshing={refreshing}
          />
          
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
            <AnimatePresence>
              {loading && <LoadingScreen />}

              {!loading && !isExpanded && (
                <FeedScreen 
                  articles={articles}
                  onArticleClick={handleArticleClick}
                  onArticlesUpdate={handleArticlesUpdate}
                />
              )}

              {isExpanded && selectedArticle && (
                <ExpandedArticleScreen
                  article={selectedArticle}
                  onBack={handleBack}
                />
              )}
            </AnimatePresence>
            </div>
          </main>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
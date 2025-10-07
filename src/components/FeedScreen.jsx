import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Calendar, User, Loader2 } from 'lucide-react';
import ArticleCard from './ArticleCard';
import { apiService } from '../services/api';

const FeedScreen = ({ articles, onArticleClick, onArticlesUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allArticles, setAllArticles] = useState(articles || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [processingArticles, setProcessingArticles] = useState(new Set());

  // Function to deduplicate articles by title
  const deduplicateArticles = (articles) => {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.title?.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  useEffect(() => {
    const deduplicatedArticles = deduplicateArticles(articles || []);
    setAllArticles(deduplicatedArticles);
  }, [articles]);

  const handleArticleClick = async (article) => {
    if (article.isSummarized) {
      onArticleClick(article);
      return;
    }

    setProcessingArticles(prev => new Set([...prev, article.id]));
    
    try {
      const response = await apiService.processArticleWithAI(article.id);
      if (response.success) {
        const updatedArticle = response.article;
        setAllArticles(prev => 
          prev.map(a => a.id === article.id ? updatedArticle : a)
        );
        if (onArticlesUpdate) {
          const updatedArticles = allArticles.map(a => a.id === article.id ? updatedArticle : a);
          onArticlesUpdate(updatedArticles);
        }
        onArticleClick(updatedArticle);
      }
    } catch (error) {
      console.error('Error processing article with AI:', error);
      onArticleClick(article);
    } finally {
      setProcessingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(article.id);
        return newSet;
      });
    }
  };

  const loadMoreArticles = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      const response = await apiService.getArticles(nextPage);
      
      if (response.success && response.articles.length > 0) {
        // Combine existing and new articles, then deduplicate
        const combinedArticles = [...allArticles, ...response.articles];
        const deduplicatedArticles = deduplicateArticles(combinedArticles);
        
        setAllArticles(deduplicatedArticles);
        setCurrentPage(nextPage);
        setHasMore(response.hasMore);
        
        if (onArticlesUpdate) {
          onArticlesUpdate(deduplicatedArticles);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more articles:', err);
      // Suppress error display in UI
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  if (allArticles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-gray-500 text-lg">No articles available</div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto px-6 py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            Live Updates
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Health Intelligence
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Curated health news with AI-powered insights and simplified explanations
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {allArticles.map((article, index) => {
            const cleanTitle = article.title?.replace(/[^a-zA-Z0-9]/g, '')?.slice(0, 20) || 'untitled';
            const uniqueKey = `article-${article.id}-${cleanTitle}-${index}-${article.source?.replace(/[^a-zA-Z0-9]/g, '') || 'unknown'}`;
            return (
              <motion.div
                key={uniqueKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05, 
                  duration: 0.3, 
                  ease: "easeOut" 
                }}
              >
                <ArticleCard
                  article={article}
                  onClick={() => handleArticleClick(article)}
                  isProcessing={processingArticles.has(article.id)}
                />
              </motion.div>
            );
          })}
        </div>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <button
              onClick={loadMoreArticles}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Load More Articles
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Error display suppressed - errors are handled silently */}

        {!hasMore && allArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <div className="text-gray-500 text-lg">
              You've reached the end of available articles
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FeedScreen;
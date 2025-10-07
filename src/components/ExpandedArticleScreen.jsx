import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Loader2, Calendar, User, Clock } from 'lucide-react';
import { apiService } from '../services/api';

const ExpandedArticleScreen = ({ article, onBack }) => {
  const [simplifiedContent, setSimplifiedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  useEffect(() => {
    if (article) {
      if (article.simplifiedContent) {
        setSimplifiedContent(article.simplifiedContent);
        setLoading(false);
        setError(null);
      } else {
        setSimplifiedContent(article.content);
        setLoading(false);
        setError('AI processing is temporarily unavailable. Showing original content.');
      }
    }
  }, [article]);

  const loadSimplifiedContent = async () => {
    if (!article) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getSimplifiedArticle(article.id);
      
      if (response.success) {
        setSimplifiedContent(response.simplifiedContent);
      } else {
        throw new Error('Failed to get simplified content');
      }
    } catch (err) {
      console.error('Error loading simplified content:', err);
      setError('AI processing is temporarily unavailable due to quota limits. Showing original content.');
      setSimplifiedContent(article.content);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setSimplifiedContent('');
    setError(null);
    loadSimplifiedContent();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-4xl mx-auto"
    >
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Feed</span>
      </motion.button>

      {/* Article Header */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
      >
        <header className="p-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
              {article.category}
            </span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {article.readTime}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span className="font-medium">{article.source}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">{formatDate(article.publishedAt)}</span>
            </div>
          </div>

          {/* TL;DR Section */}
          {article.tldr && (
            <div className="p-6 bg-red-50/50 rounded-lg border border-red-100 mb-8">
              <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">
                Executive Summary
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{article.tldr}</p>
            </div>
          )}

          {/* Key Takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="mb-8">
              <div className="text-lg font-semibold text-gray-900 mb-4">Key Insights</div>
              <ul className="space-y-3">
                {article.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2.5 mr-4 flex-shrink-0"></span>
                    <span className="text-gray-700 text-base leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* Simplified Content */}
        <div className="px-8 pb-8">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">AI is rewriting this article in simpler language...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl mb-8">
              <p className="text-red-800 mb-4 text-lg">{error}</p>
              <button
                onClick={handleRegenerate}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {simplifiedContent && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: simplifiedContent
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
              }}
            />
          )}

          {/* Regenerate Button */}
          {simplifiedContent && !loading && (
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 mx-auto font-medium border border-gray-200 hover:border-red-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Regenerate</span>
              </button>
            </div>
          )}
        </div>
      </motion.article>
    </motion.div>
  );
};

export default ExpandedArticleScreen;

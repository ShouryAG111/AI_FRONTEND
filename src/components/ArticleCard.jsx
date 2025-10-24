import { motion } from 'framer-motion';
import { Clock, Calendar, User, ExternalLink, Loader2 } from 'lucide-react';

const ArticleCard = ({ article, onClick, isProcessing = false }) => {
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

  const getCategoryColor = (category) => {
    const colors = {
      'Mental Health': 'bg-purple-100 text-purple-800',
      'Diseases & Treatment': 'bg-red-100 text-red-800',
      'Medical Research': 'bg-orange-100 text-orange-800',
      'Nutrition & Wellness': 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg cursor-pointer group transition-all duration-300 border border-gray-200/50 overflow-hidden hover:border-red-200"
    >
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {article.readTime}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors duration-200 leading-snug">
          {article.title}
        </h3>

        {isProcessing && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <div className="flex items-center text-blue-700">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-sm font-semibold">AI is analyzing this article...</span>
            </div>
          </div>
        )}

        {article.tldr && (
          <div className="mb-4 p-4 bg-red-50/50 rounded-lg border border-red-100">
            <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
              Quick Summary
            </div>
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {article.tldr}
            </p>
          </div>
        )}

        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-800 mb-3">Key Points</div>
            <ul className="space-y-2.5">
              {article.keyTakeaways.slice(0, 3).map((takeaway, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="line-clamp-1">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-gray-500">
            <div className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5" />
              <span className="truncate max-w-[120px] font-medium">{article.source}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              <span className="font-medium">{formatDate(article.publishedAt)}</span>
            </div>
          </div>
          <div className="flex items-center text-red-600 group-hover:text-red-700 transition-colors duration-200 font-medium">
            <span className="text-sm">Read</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;

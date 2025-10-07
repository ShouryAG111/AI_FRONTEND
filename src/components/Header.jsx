import { motion } from 'framer-motion';
import { RefreshCw, Activity, TrendingUp } from 'lucide-react';

const Header = ({ onRefresh, refreshing }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border-b border-gray-200/60 shadow-sm backdrop-blur-sm"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="flex items-center space-x-4"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                HealthPulse
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Intelligent health news curation
              </p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={onRefresh}
            disabled={refreshing}
            className="group flex items-center space-x-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-gray-200 hover:border-red-200"
          >
            <RefreshCw 
              className={`w-4 h-4 transition-transform ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} 
            />
            <span className="text-sm">{refreshing ? 'Updating...' : 'Refresh'}</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

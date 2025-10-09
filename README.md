# Health News Intelligence Platform

A modern React-based web application that provides AI-powered health news summarization and analysis. The platform fetches health news from NewsAPI and uses Google Gemini AI to generate intelligent summaries, key insights, and simplified content for better readability.

## Project Overview

This application serves as a comprehensive health news intelligence platform that:

- **Aggregates** health news from NewsAPI using category-based filtering
- **Processes** articles with AI-powered summarization and analysis on-demand
- **Presents** curated health information in a modern, responsive interface
- **Optimizes** performance through intelligent caching and on-demand processing

## Key Features

### News Aggregation
- Real-time health news from NewsAPI
- Simple category-based filtering (health category)
- Intelligent article categorization
- Pagination support for large datasets

### AI-Powered Processing
- Google Gemini 2.5 Flash Lite for article summarization
- On-demand AI processing to conserve API quotas
- Executive summaries (TL;DR) for quick understanding
- Key insights extraction with bullet points
- Content simplification for better readability

### User Experience
- Modern, responsive interface built with React and Tailwind CSS
- Smooth animations and transitions using Framer Motion
- Real-time loading states and error handling
- Mobile-first responsive design
- Professional medical news presentation

### Technical Excellence
- Frontend-only architecture (no backend required)
- Efficient API quota management
- Intelligent caching system
- Error resilience and fallback mechanisms
- Clean, maintainable codebase

## Technology Stack

### Frontend
- **React 19.1.1** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Icon system

### External APIs
- **NewsAPI** - Health news aggregation
- **Google Gemini AI** - Content summarization and analysis

## Architecture

The application follows a modern frontend architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐
│   NewsAPI       │    │   Frontend      │
│   (External)    │───▶│   (React)       │
│                 │    │   Port 3000     │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Gemini AI     │
                       │   (Processing)  │
                       └─────────────────┘
```

### Data Flow
1. **NewsAPI** provides health news articles
2. **Frontend** fetches and caches articles
3. **Gemini AI** processes articles on-demand when clicked
4. **UI** displays processed content to users

## Installation and Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- NewsAPI key (free tier: 1000 requests/day)
- Google Gemini API key (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Health
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API keys**
The application is pre-configured with API keys for immediate use. For production deployment, replace the hardcoded keys in `src/services/healthNewsService.js`:

```javascript
const NEWS_API_KEY = 'your_news_api_key_here';
const GEMINI_API_KEY = 'your_gemini_api_key_here';
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Basic Workflow
1. **View Articles**: Browse the health news feed on the main page
2. **Click Article**: Click on any article to trigger AI processing
3. **Read Summary**: View AI-generated executive summary and key insights
4. **Read Simplified Content**: Access AI-rewritten content for better understanding
5. **Load More**: Use pagination to load additional articles

### AI Processing
- AI processing only occurs when you click on a specific article
- This approach conserves API quotas and improves performance
- Each article is processed once and cached for future viewing
- Fallback content is provided if AI processing fails

## API Integration

### NewsAPI Integration
- Uses the `top-headlines` endpoint with `category=health`
- Fetches articles from US sources
- Implements intelligent caching to reduce API calls
- Handles rate limiting and error scenarios gracefully

### Gemini AI Integration
- Uses Gemini 2.5 Flash Lite model for optimal performance
- Generates executive summaries and key insights
- Simplifies complex medical content for general audience
- Implements fallback mechanisms for quota limits

## Performance Characteristics

### Caching Strategy
- 30-minute cache duration for fetched articles
- In-memory article storage with pagination
- On-demand AI processing to minimize API usage
- Efficient deduplication system

### API Efficiency
- NewsAPI: Uses simple category filtering (1 API call per refresh)
- Gemini AI: Only processes articles when clicked by user
- Intelligent error handling and fallback mechanisms
- Optimized for free tier API limits

## File Structure

```
src/
├── components/
│   ├── ArticleCard.jsx          # Article display component
│   ├── ErrorBoundary.jsx        # Error handling component
│   ├── ExpandedArticleScreen.jsx # Full article view
│   ├── FeedScreen.jsx           # Main article feed
│   ├── Header.jsx               # Application header
│   └── LoadingScreen.jsx        # Loading states
├── services/
│   ├── api.js                   # API service layer
│   └── healthNewsService.js     # Core business logic
├── App.jsx                      # Main application component
├── main.jsx                     # Application entry point
└── index.css                    # Global styles
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- Clean, comment-free codebase
- Consistent naming conventions
- Modern React patterns and hooks
- Responsive design principles
- Error boundary implementation

## Deployment

### Production Build
```bash
npm run build
```

### Static Hosting
The application can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables
For production deployment, ensure API keys are properly configured in the service files.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Project Status

**Current Version**: 1.0.0

**System Status**: Fully operational
- Frontend: React application running on port 3000
- NewsAPI: Health news aggregation working
- Gemini AI: On-demand processing functional
- Performance: Optimized for API quota conservation

## Conclusion

This Health News Intelligence Platform demonstrates modern web development practices with a focus on user experience, performance optimization, and efficient API usage. The application successfully combines external data sources with AI processing to deliver a professional health news consumption experience.

**Key Achievements:**
- Efficient frontend-only architecture
- On-demand AI processing for quota conservation
- Professional medical news presentation
- Responsive design for all devices
- Clean, maintainable codebase
- Comprehensive error handling

The platform is production-ready and showcases best practices in React development, API integration, and user experience design.
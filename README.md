# Health News Reader

A React web application that displays health news articles with AI-generated summaries. The app fetches health news from NewsAPI and uses Google Gemini AI to provide article summaries when requested.

## Overview

This application provides a clean interface for browsing health-related news articles. Users can view article headlines, descriptions, and request AI-generated summaries for detailed articles. The app is designed to be lightweight and efficient, processing articles on-demand to optimize API usage.

## Features

- Health news aggregation from NewsAPI
- AI-powered article summarization using Google Gemini
- Responsive web interface built with Tailwind CSS
- Article pagination for browsing multiple articles
- Loading states and comprehensive error handling
- Smooth animations and transitions
- Mobile-first responsive design
- Intelligent caching to reduce API calls

## Technology Stack

### Frontend Technologies
- **React 19.1.1** - Modern UI framework with hooks and functional components
- **Vite** - Fast build tool and development server with HMR
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Framer Motion** - Animation library for smooth transitions and interactions

### Data Management
- **TanStack Query** - Data fetching, caching, and synchronization
- **Lucide React** - Consistent icon system

### External Services
- **NewsAPI** - Health news aggregation service
- **Google Gemini AI** - Content summarization and analysis

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- NewsAPI key (free tier available)
- Google Gemini API key (free tier available)

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd Health
```

2. Install dependencies
```bash
npm install
```

3. Configure API keys in `src/services/healthNewsService.js`:
```javascript
const NEWS_API_KEY = 'your_news_api_key_here';
const GEMINI_API_KEY = 'your_gemini_api_key_here';
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### API Key Setup

#### NewsAPI
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Replace the placeholder in the service file

#### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Replace the placeholder in the service file

## Usage

### Basic Workflow
1. **Browse Articles**: View health news headlines and descriptions on the main page
2. **Select Article**: Click on any article to expand and view full details
3. **AI Summary**: Click "Get AI Summary" to generate an intelligent summary
4. **Pagination**: Use the "Load More" button to fetch additional articles
5. **Navigation**: Use the back button to return to the article feed

### User Interface
- **Main Feed**: Displays article cards with headlines, descriptions, and publication info
- **Article Detail**: Shows full article content with source information
- **Loading States**: Visual feedback during data fetching and AI processing
- **Error Handling**: Graceful error messages and fallback content

## How It Works

### Data Flow
1. **News Fetching**: Application fetches health news from NewsAPI on startup
2. **Article Display**: Articles are displayed in a paginated feed format
3. **On-Demand Processing**: AI summarization only occurs when user clicks "Get AI Summary"
4. **Caching**: Processed summaries are cached to avoid redundant API calls
5. **Fallback**: Original article content is shown if AI processing fails

### Performance Optimization
- Articles are fetched once and stored in memory
- AI processing is triggered only when needed
- Caching reduces API quota usage
- Pagination prevents overwhelming the interface

## File Structure

```
src/
├── components/
│   ├── ArticleCard.jsx          # Individual article display component
│   ├── ErrorBoundary.jsx        # Error handling and fallback UI
│   ├── ExpandedArticleScreen.jsx # Full article view with AI summary
│   ├── FeedScreen.jsx           # Main article feed and pagination
│   ├── Header.jsx               # Application header and navigation
│   └── LoadingScreen.jsx        # Loading states and spinners
├── services/
│   ├── api.js                   # Generic API service utilities
│   └── healthNewsService.js     # News API and AI integration logic
├── App.jsx                      # Main application component and routing
├── main.jsx                     # Application entry point and providers
└── index.css                    # Global styles and Tailwind imports
```

### Key Components

- **FeedScreen**: Manages the article feed, pagination, and initial data loading
- **ExpandedArticleScreen**: Handles individual article display and AI summary generation
- **ArticleCard**: Reusable component for displaying article previews
- **ErrorBoundary**: Catches and handles application errors gracefully
- **healthNewsService**: Core service handling NewsAPI and Gemini AI integration

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally

### Development Guidelines

- Use functional components with React hooks
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)
- Implement proper error boundaries for component error handling
- Use Tailwind CSS classes for styling
- Maintain responsive design principles

### Code Structure

- Components are organized by functionality
- Services handle external API interactions
- Error handling is implemented at component and service levels
- State management uses React's built-in hooks and context

## API Configuration

### NewsAPI Integration
- Uses the `top-headlines` endpoint
- Filters for health category articles
- Implements request caching to optimize API usage
- Handles rate limiting and error responses

### Google Gemini AI Integration
- Uses Gemini 2.5 Flash Lite model
- Generates executive summaries and key insights
- Implements retry logic for failed requests
- Provides fallback content when AI processing fails

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Options

The application can be deployed to any static hosting service:

- **Vercel**: Recommended for easy deployment with automatic builds
- **Netlify**: Good for continuous deployment from Git repositories
- **GitHub Pages**: Free hosting for public repositories
- **AWS S3 + CloudFront**: Enterprise-grade static hosting

### Environment Configuration

For production deployment, ensure:
- API keys are properly configured
- CORS settings allow your domain
- HTTPS is enabled for secure API communication

## Troubleshooting

### Common Issues

1. **API Key Errors**: Verify API keys are correctly set in `healthNewsService.js`
2. **CORS Issues**: Ensure your domain is whitelisted in API settings
3. **Rate Limiting**: Check API quota limits and implement appropriate delays
4. **Build Failures**: Ensure all dependencies are installed and Node.js version is compatible

### Performance Tips

- Monitor API usage to stay within free tier limits
- Implement proper caching strategies
- Optimize images and assets for faster loading
- Use browser dev tools to identify performance bottlenecks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
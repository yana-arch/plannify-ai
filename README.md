<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PlannifyAI: Intelligent Project Planning

**Version 2.0.0 - Optimized & Production Ready**

An AI-powered web platform that transforms project ideas into comprehensive, actionable plans. Users input project details through a guided wizard, and Gemini AI generates a detailed blueprint including summaries, feature specifications, technology stack recommendations, and development milestones.

## ✨ Key Features

- 🚀 **AI-Powered Project Planning** - Generate comprehensive project plans using Gemini AI
- 🎯 **Smart Caching** - Cache API responses for improved performance
- 🔄 **Retry Logic** - Automatic retry for failed API calls with exponential backoff
- 🛡️ **Error Boundaries** - Graceful error handling with recovery options
- 🎨 **Modern UI** - Beautiful, responsive design with loading states
- 🧪 **Comprehensive Testing** - Full test coverage with Jest and React Testing Library
- 🔧 **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **AI**: Google Gemini AI 2.5 Flash
- **Testing**: Jest, React Testing Library, jsdom
- **CI/CD**: GitHub Actions
- **Build Tool**: Vite with code splitting and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Gemini API key from Google AI Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yana-arch/plannify-ai.git
   cd plannify-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your Gemini API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests for CI environment

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── services/           # Business logic and API services
│   ├── __tests__/      # Service tests
│   ├── cacheService.ts # Caching layer
│   ├── retryService.ts # Retry logic
│   └── geminiService.ts # AI integration
├── contexts/           # React contexts
├── types/             # TypeScript type definitions
└── setupTests.ts      # Test configuration
```

## 🔧 Development

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting (when available)
- **Prettier** for code formatting (when available)

### Testing
- **Jest** with **React Testing Library** for unit and integration tests
- **jsdom** for DOM environment in tests
- **Test coverage** reports generated automatically

### Performance Optimizations
- **Code splitting** with React.lazy()
- **Caching** for AI API responses
- **Retry logic** with exponential backoff
- **Error boundaries** for graceful error handling

## 🚢 Deployment

The project includes a complete CI/CD pipeline that:

1. **Runs tests** on multiple Node.js versions
2. **Generates coverage reports**
3. **Builds for production**
4. **Deploys to production** (main branch only)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent project planning
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first styling
- **Vite** for the fast build tool

---

**View your app in AI Studio:** https://ai.studio/apps/drive/13FL3Nm8TYu-BYpJZq27tjG_awqokXMCK

**Made with ❤️ by the PlannifyAI Team**

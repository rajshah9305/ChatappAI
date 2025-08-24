# ChatappAI - Modern AI Chat Platform

ChatappAI is a production-ready AI chat platform that enables seamless interactions with multiple AI providers through a unified, modern interface. Built with TypeScript, React, and Node.js, it offers a sophisticated yet user-friendly experience for AI-powered conversations.

![ChatappAI Interface](./docs/images/chat-interface.png)

## ✨ Features

- 🤖 Multi-Provider AI Support (OpenAI, Anthropic, Google AI)
- 🎨 Modern, responsive UI with dark/light mode
- 📁 File and image upload support
- 💾 Persistent conversation history
- 🔐 Secure API key management
- ⚡ Real-time message streaming
- 📱 Mobile-friendly design
- 🔍 Conversation search and filtering
- 🎭 Custom chat templates
- 📊 Usage analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- NPM or Yarn
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/rajshah9305/ChatappAI.git
cd ChatappAI
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in project root:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chatappai"

# API Keys (optional - can be set per user)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""

# Security
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-encryption-key"

# Server
PORT=5000
NODE_ENV="development"
```

4. Initialize database:
```bash
npm run db:migrate
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Production Build

Build the application:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with secure session management
- **State Management**: TanStack Query
- **UI Components**: Radix UI + Shadcn/UI
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel

### Project Structure

```
chatappai/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript definitions
├── server/                # Backend Express application
│   ├── api/              # API routes
│   ├── config/           # Configuration
│   ├── db/               # Database migrations and schema
│   ├── services/         # Business logic
│   └── types/            # TypeScript definitions
├── shared/               # Shared types and utilities
└── docs/                 # Documentation
```

## 🚢 Deployment

### Vercel Deployment

1. Fork this repository
2. Create a new project on Vercel
3. Connect your forked repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Start the server:
```bash
npm start
```

## 📝 API Documentation

API documentation is available at `/api/docs` when running the server. It includes:
- Authentication endpoints
- Conversation management
- Message operations
- File upload handling
- User preferences

## 🔒 Security Features

- JWT-based authentication
- API key encryption at rest
- Rate limiting
- Input sanitization
- CORS protection
- XSS prevention
- SQL injection protection

## 🧪 Testing

Run tests:
```bash
npm test           # Run all tests
npm run test:e2e   # Run E2E tests
npm run test:unit  # Run unit tests
```

## 📈 Performance Optimization

- Code splitting
- Image optimization
- Response caching
- Database indexing
- Lazy loading
- Asset compression

## 📦 Dependencies

- See `package.json` for complete list
- All dependencies are production-ready and actively maintained

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push branch (`git push origin feature/name`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

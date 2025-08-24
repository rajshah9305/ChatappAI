# Overview

This is ChatNova, a modern AI chatbot application built as a full-stack web platform. The application enables users to interact with multiple AI service providers (OpenAI, Anthropic, and Google) through a unified interface. Users can create conversations, manage API keys, and switch between different AI models seamlessly. The system features a clean, responsive design with support for image uploads and comprehensive conversation management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for fast development and building
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with CSS custom properties for theming support

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for conversations, messages, API keys, and provider management
- **Development**: Hot reload with Vite integration in development mode
- **Session Management**: Express session middleware with PostgreSQL session store

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Well-structured tables for users, conversations, messages, and API keys
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon Database serverless PostgreSQL for scalability

## AI Provider Integration
- **Multi-Provider Support**: Unified service layer supporting OpenAI, Anthropic, and Google AI
- **Model Configuration**: Default models (GPT-4o, Claude Sonnet 4, Gemini 2.5 Flash) with dynamic model selection
- **API Key Management**: Secure storage and retrieval of user API keys per provider
- **Request Routing**: Dynamic routing based on user's provider selection and model preferences

## Authentication & Security
- **Mock Authentication**: Currently uses a mock user system for development
- **API Key Storage**: Encrypted storage of user API keys in the database
- **Input Validation**: Zod schemas for request validation and type safety
- **Error Handling**: Comprehensive error handling with user-friendly messages

## File Upload & Media
- **Image Support**: Base64 encoding for image uploads with drag-and-drop functionality
- **File Types**: Support for common image formats with client-side validation
- **Preview**: Real-time image preview before sending messages

# External Dependencies

## AI Service Providers
- **OpenAI SDK**: For GPT model interactions and API communication
- **Anthropic SDK**: For Claude model conversations and responses
- **Google GenAI**: For Gemini model integration and text generation

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management
- **PostgreSQL Session Store**: For persistent session management

## UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets including brand icons

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **React Hook Form**: Form management with validation

## Third-party Libraries
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing for React applications
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities
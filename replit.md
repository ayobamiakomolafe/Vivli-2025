# Overview

This is a medical RAG (Retrieval-Augmented Generation) application called "Empirical Antibiotic Advisor". The system helps healthcare professionals determine the most appropriate empirical antibiotic treatments for patients by combining AI-powered language models with a specialized medical knowledge base. The application takes clinical questions or patient scenarios as input and provides ranked antibiotic recommendations with detailed rationales based on organism likelihood and resistance patterns.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a traditional web architecture with Flask serving HTML templates and static assets. The frontend consists of:
- **Template Engine**: Jinja2 templates for server-side rendering
- **Styling**: Bootstrap 5 for responsive design with custom CSS variables for consistent theming
- **JavaScript**: Vanilla JavaScript for form handling and asynchronous API communication
- **User Interface**: Single-page application with real-time loading states and error handling
- **Layout**: Centered container layout optimized for desktop viewing with pre-filled example queries
- **Database Attribution**: Header section displaying contributing medical databases (GSK, Pfizer ATLAS, Johnson & Johnson, Paratek, Shionogi, Venatorx, Innoviva, Venus Remedies)

## Backend Architecture
The backend is built on Flask with a focus on AI-powered medical recommendations:
- **Web Framework**: Flask with RESTful API endpoints
- **AI Integration**: LangChain framework orchestrating the RAG pipeline
- **Language Model**: OpenAI's GPT-4o for generating medical recommendations
- **Retrieval System**: FAISS vector database for similarity search across medical documents
- **Document Processing**: Stuff documents chain for combining retrieved context with user queries

## Data Storage Solutions
- **Vector Database**: FAISS (Facebook AI Similarity Search) for storing and retrieving medical document embeddings
- **Embeddings**: OpenAI's text-embedding-3-small model for document vectorization
- **Knowledge Base**: Pre-processed medical database stored locally in ./database folder
- **Session Management**: Flask sessions with configurable secret key

## Authentication and Authorization
Currently implements basic session management through Flask's built-in session handling. The application uses environment-based configuration for the session secret key.

## AI Pipeline Design
The system implements a sophisticated RAG architecture:
- **Retrieval Chain**: Combines document retrieval with answer generation
- **Context Window**: Retrieves top 50 most relevant documents (k=50) for comprehensive context
- **Temperature Setting**: Uses temperature=0 for deterministic, consistent medical recommendations
- **Prompt Engineering**: Specialized system prompt for medical antibiotic advisory with structured output requirements

# External Dependencies

## AI and Machine Learning Services
- **OpenAI API**: GPT-4o language model and text-embedding-3-small for embeddings
- **LangChain Framework**: Orchestrates the RAG pipeline with retrieval chains and document processing
- **FAISS**: Vector similarity search for document retrieval

## Web Framework and UI
- **Flask**: Python web framework for backend API and template serving
- **Bootstrap 5**: Frontend CSS framework for responsive design
- **Font Awesome**: Icon library for user interface elements

## Development and Deployment
- **Python Runtime**: Core application runtime
- **Environment Variables**: OpenAI API key and session secret configuration
- **Local File System**: FAISS database storage and static asset serving

## Key Integrations
The application integrates OpenAI's API for both embeddings generation and text completion, using LangChain as the orchestration layer to combine retrieval and generation capabilities for medical decision support.
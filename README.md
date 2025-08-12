
# SPARS - Surveillance-Powered Antimicrobial Recommendation System

An Empirical antibiotics recommendation system that helps healthcare professionals determine the most appropriate empirical antibiotic treatments for patients using RAG (Retrieval-Augmented Generation) technology.

## Overview

SPARS combines AI-powered language models with a specialized medical knowledge base to provide ranked antibiotic recommendations with detailed rationales based on organism likelihood and resistance patterns.

## Prerequisites

- Python 3.11 or higher
- Node.js 20 or higher
- OpenAI API key

## Local Setup

### 1. Clone or Download the Project

If you're working with this project locally, ensure you have all the files in your working directory.

### 2. Install Python Dependencies

The project uses Python dependencies managed through pyproject.toml. Install them using:

```bash
pip install -e .
```

Or install individual packages:

```bash
pip install flask langchain langchain-openai langchain-community faiss-cpu openai gunicorn
```

### 3. Install Node.js Dependencies

Install the required frontend dependencies:

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory or set environment variables:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
export SESSION_SECRET="your-session-secret-key"
```

**Important:** You must have a valid OpenAI API key to run this application.

### 5. Prepare the Medical Database

Ensure the `database` folder contains the required FAISS vector database files:
- `index.faiss`
- `index.pkl`

These files contain the pre-processed medical knowledge base used for retrieving relevant information.

### 6. Run the Application

#### Development Mode

Start the Flask development server:

```bash
python main.py
```

The application will be available at `http://0.0.0.0:5000`

#### Production Mode

For production deployment, use Gunicorn:

```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

## Usage

1. Open your web browser and navigate to `http://0.0.0.0:5000`
2. Enter a clinical question or patient scenario in the text area
3. Click "Get Antibiotic Recommendation" to receive AI-powered recommendations
4. View the ranked antibiotic suggestions with rationales including:
   - Most likely organisms and their percentages
   - Resistance rate summaries for key antibiotics
   - Source references from medical databases

## Example Query

```
What is the best antibiotic for a 45-year-old with community-acquired pneumonia in South Africa?
```

## Technical Architecture

- **Backend**: Flask with LangChain RAG pipeline
- **AI Model**: OpenAI GPT-4o for recommendations
- **Vector Database**: FAISS for similarity search
- **Frontend**: React with Bootstrap 5
- **Embeddings**: OpenAI text-embedding-3-small

## Medical Data Sources

The system integrates surveillance data from:
- GSK
- Pfizer ATLAS
- Johnson & Johnson
- Paratek
- Shionogi
- Venatorx
- Innoviva
- Venus Remedies

## Health Check

The application includes a health check endpoint at `/health` to verify system status.

## Troubleshooting

### Common Issues

1. **Missing OpenAI API Key**: Ensure your API key is properly set in environment variables
2. **Database Loading Errors**: Verify the `database` folder contains the required FAISS files
3. **Port Conflicts**: Change the port in `main.py` if 5000 is already in use
4. **Dependency Issues**: Ensure all Python and Node.js dependencies are installed

### Logs

Check the console output for detailed error messages and system status information.

## Security Note

This application is designed for healthcare professional use and should be deployed in secure environments with proper access controls when used in production.

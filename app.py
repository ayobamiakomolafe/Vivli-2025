import os
import logging
from flask import Flask, render_template, request, jsonify
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "medical-rag-secret-key")

# Global variables for LangChain components
retriever = None
llm_1 = None

def load_resources():
    """Load and initialize LangChain resources"""
    global retriever, llm_1
    
    try:
        # Get OpenAI API key from environment
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        os.environ["OPENAI_API_KEY"] = openai_api_key
        
        # Initialize embeddings
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        
        # Load FAISS database from database folder
        db = FAISS.load_local("./database", embeddings, allow_dangerous_deserialization=True)
        retriever = db.as_retriever(search_kwargs={"k": 50})
        
        # Initialize ChatOpenAI with GPT-4o
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        llm_1 = ChatOpenAI(model_name="gpt-4o", temperature=0, max_tokens=None)
        
        app.logger.info("Successfully loaded LangChain resources")
        return True
        
    except Exception as e:
        app.logger.error(f"Failed to load resources: {e}")
        return False

# System prompt for medical antibiotic advisor
system_prompt = (
    """You are a highly knowledgeable medical assistant specializing in the prediction of
    empirical antibiotics for patients. Utilize the following patient information and using only the provided context to determine the
    most appropriate empirical antibiotic(s) treatment. List the antibiotics in order of preference. Also generate a brief and concise rationale for each recommendation based on the provided context.
    The rationale should include:

        Organisms: 80% E. coli, 10% Klebsiella. etc.

        Resistance Rate Summary
        Description: Summarizes resistance (S/I/R) for key antibiotics,like the following 

        Ciprofloxacin: 80% S, 10% I, 10% R
        Nitrofurantoin: 75% S, 15% I, 10% R
        Ceftriaxone: 60% S, 20% I, 20% R

    
    """
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

def response_generate(query):
    """Generate response using RAG chain"""
    try:
        question_answer_chain = create_stuff_documents_chain(llm_1, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        result = rag_chain.invoke({"input": query})
        result_answer = result['answer']
        
        formatted_response = f"{result_answer}\n\nRelevant Sources:\n"

        # Add source information
        for i in range(min(5, len(result['context']))):
            src = result['context'][i].metadata['source'].strip("/content/")

            if src == "antibiotics.csv":
                src = "Atlas Dataset"
            else:
                src = src.strip(".csv") + " Dataset"

            row = result['context'][i].metadata['row']
            row = str(row)
            src = src.title()
            formatted_response += f"- Source: {src}, Row: {row}\n"
            
        return formatted_response
        
    except Exception as e:
        app.logger.error(f"Error generating response: {e}")
        raise e

@app.route('/')
def index():
    """Main page route"""
    return render_template('index.html')

@app.route('/get_recommendation', methods=['POST'])
def get_recommendation():
    """API endpoint for getting antibiotic recommendations"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Please enter a clinical question or scenario to get a recommendation.'
            }), 400
        
        # Check if resources are loaded
        if retriever is None or llm_1 is None:
            success = load_resources()
            if not success:
                return jsonify({
                    'success': False,
                    'error': 'Failed to load medical knowledge base. Please try again later.'
                }), 500
        
        # Generate response
        answer = response_generate(query)
        
        return jsonify({
            'success': True,
            'answer': answer
        })
        
    except Exception as e:
        app.logger.error(f"Error in get_recommendation: {e}")
        return jsonify({
            'success': False,
            'error': f'An error occurred while processing your request: {str(e)}'
        }), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

# Initialize resources on startup
with app.app_context():
    load_resources()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

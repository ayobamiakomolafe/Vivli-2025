import streamlit as st
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings
import os

# --- Setup ---
st.set_page_config(page_title="Empirical Antibiotic Advisor", page_icon="🧬", layout="centered")
st.markdown(
    """
    <style>
    .main {background-color: #f7f9fa;}
    .stTextInput>div>div>input {font-size: 1.1rem;}
    .stButton>button {background-color: #2e7bcf; color: white; font-weight: bold;}
    .answer-box {background: #e3f2fd; border-radius: 8px; padding: 1.2em; margin-top: 1em; font-size: 1.15rem;}
    </style>
    """, unsafe_allow_html=True
)

st.title("🧬 Empirical Antibiotic Advisor")
st.markdown(
    "This assistant predicts the most appropriate empirical antibiotics for patients, using only the provided medical context. "
    "Enter a clinical question or patient scenario below."
)

# --- LangChain Setup with Caching ---
@st.cache_resource(show_spinner="Loading models and database...")
def load_resources():
    os.environ["OPENAI_API_KEY"] = ""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    db = FAISS.load_local("C:/Users/USER/Desktop/PDF Audit/database", embeddings, allow_dangerous_deserialization=True)
    retriever = db.as_retriever(search_kwargs={"k": 50})
    llm_1 = ChatOpenAI(model_name="gpt-4o", temperature=0, max_tokens=None)
    return retriever, llm_1

retriever, llm_1 = load_resources()

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
    question_answer_chain = create_stuff_documents_chain(llm_1, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    result = rag_chain.invoke({"input": query})
    result_answer = result['answer']
    
    formatted_response = f"{result_answer}\n\nRelevant Sources:\n"

    for i in range(5):
        
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






# --- Streamlit UI ---
with st.form("antibiotic_form"):
    user_query = st.text_area(
        "Enter your clinical question or patient scenario:",
        placeholder="e.g. What is the best antibiotic for a 45-year-old with community-acquired pneumonia in South Africa?",
        height=180
    )
    submitted = st.form_submit_button("Get Antibiotic Recommendation")

if submitted and user_query.strip():
    with st.spinner("Consulting medical knowledge base..."):
        try:
            answer = response_generate(user_query)
            st.markdown(f'<div class="answer-box"><b>Recommendation:</b><br>{answer}</div>', unsafe_allow_html=True)
        except Exception as e:
            st.error(f"An error occurred: {e}")
elif submitted:
    st.warning("Please enter a clinical question or scenario to get a recommendation.")

st.markdown("---")
st.caption("Powered by GPT-4o, LangChain, and your custom medical knowledge base.")
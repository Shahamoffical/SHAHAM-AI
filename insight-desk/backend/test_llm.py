from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3.2", temperature=0)
response = llm.invoke("Reply in one sentence: what is a vector database?")
print(response.content)

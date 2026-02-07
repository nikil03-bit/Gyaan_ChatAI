def build_prompt(context_chunks: list[str], question: str) -> str:
    context = "\n\n".join(context_chunks)

    return f"""
You are a professional customer support assistant for this website.

Rules:
- Answer ONLY using the context below
- Be clear, concise, and professional
- Do not guess or add extra information
- If the answer is not in the context, reply:
  "I couldn’t find this information in the provided documents."

Context:
{context}

Question:
{question}

Answer:
""".strip()

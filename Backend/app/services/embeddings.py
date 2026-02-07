from sentence_transformers import SentenceTransformer

_model = SentenceTransformer("BAAI/bge-small-en")

def embed_texts(texts: list[str]):
    return _model.encode(texts, convert_to_numpy=True).tolist()

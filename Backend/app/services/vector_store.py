import chromadb
from chromadb.config import Settings

_client = chromadb.Client(
    Settings(persist_directory="./chroma", anonymized_telemetry=False)
)

def get_collection(tenant_id: str):
    return _client.get_or_create_collection(name=tenant_id)

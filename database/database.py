from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Cria o arquivo do banco de dados na raiz do projeto
SQLALCHEMY_DATABASE_URL = "sqlite:///./frota.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Ferramenta para abrir e fechar a conexão rapido em cada requisição
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
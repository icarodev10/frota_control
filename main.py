from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import models
from database.database import engine

from routes import veiculos, motoristas, viagens, infracoes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Simulador-Gestao_Frota API", version="1.0")

# Libera a tela (frontend) para bater nessa API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(veiculos.router)

app.include_router(motoristas.router)

app.include_router(viagens.router)

app.include_router(infracoes.router)

@app.get("/")
def read_root():
    return {"status": "Sistema de Frota Operante! 🚦"}
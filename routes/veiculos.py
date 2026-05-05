from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import models
from database.database import get_db
from schemas import schemas

# Cria um "mini-aplicativo" de rotas só para os veículos
router = APIRouter(prefix="/veiculos", tags=["Veículos"])

# Rota para CADASTRAR um carro novo
@router.post("/", response_model=schemas.VeiculoResponse)
def criar_veiculo(veiculo: schemas.VeiculoCreate, db: Session = Depends(get_db)):
    # Pega os dados validados e joga no modelo do Banco de Dados
    novo_veiculo = models.Veiculo(**veiculo.model_dump())
    db.add(novo_veiculo)
    db.commit()
    db.refresh(novo_veiculo)
    return novo_veiculo

# Rota para LISTAR todos os carros
@router.get("/", response_model=list[schemas.VeiculoResponse])
def listar_veiculos(db: Session = Depends(get_db)):
    return db.query(models.Veiculo).all()
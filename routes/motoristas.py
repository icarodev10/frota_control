from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models
from database.database import get_db
from schemas import schemas

router = APIRouter(prefix="/motoristas", tags=["Motoristas"])

# Rota para CADASTRAR um motorista
@router.post("/", response_model=schemas.MotoristaResponse)
def criar_motorista(motorista: schemas.MotoristaCreate, db: Session = Depends(get_db)):
    # Verifica se a CNH já existe no banco pra não ter duplicidade
    db_motorista = db.query(models.Motorista).filter(models.Motorista.cnh == motorista.cnh).first()
    if db_motorista:
        raise HTTPException(status_code=400, detail="CNH já cadastrada no sistema.")
    
    novo_motorista = models.Motorista(**motorista.model_dump())
    db.add(novo_motorista)
    db.commit()
    db.refresh(novo_motorista)
    return novo_motorista

# Rota para LISTAR os motoristas
@router.get("/", response_model=list[schemas.MotoristaResponse])
def listar_motoristas(db: Session = Depends(get_db)):
    return db.query(models.Motorista).all()
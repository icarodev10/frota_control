from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models
from database.database import get_db
from schemas import schemas

router = APIRouter(prefix="/viagens", tags=["Viagens"])

@router.post("/", response_model=schemas.ViagemResponse)
def registrar_viagem(viagem: schemas.ViagemCreate, db: Session = Depends(get_db)):
    carro = db.query(models.Veiculo).filter(models.Veiculo.id == viagem.veiculo_id).first()
    
    # Se a viagem não tem KM Final, o carro está saindo agora
    if viagem.km_final == 0 or viagem.km_final is None:
        carro.status = "Em Uso"
    else:
        # Se já mandou o KM Final, ele está voltando agora
        carro.status = "Livre"
        carro.km_atual = viagem.km_final

    nova_viagem = models.Viagem(**viagem.model_dump())
    db.add(nova_viagem)
    db.commit()
    db.refresh(nova_viagem)
    return nova_viagem

# Rota para listar todas as viagens
@router.get("/", response_model=list[schemas.ViagemResponse])
def listar_viagens(db: Session = Depends(get_db)):
    return db.query(models.Viagem).all()
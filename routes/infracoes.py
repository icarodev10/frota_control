from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models
from database.database import get_db
from schemas import schemas

router = APIRouter(prefix="/infracoes", tags=["Infrações"])

@router.post("/", response_model=schemas.InfracaoResponse)
def registrar_multa(multa: schemas.InfracaoCreate, db: Session = Depends(get_db)):
    # 1. O Detetive: Busca a última viagem registrada desse carro no banco
    ultima_viagem = db.query(models.Viagem).filter(
        models.Viagem.veiculo_id == multa.veiculo_id
    ).order_by(models.Viagem.id.desc()).first()

    if not ultima_viagem:
        raise HTTPException(status_code=404, detail="Nenhuma viagem encontrada para este veículo. Carro clonado?")

    # 2. Acha o coitado que estava dirigindo
    motorista = db.query(models.Motorista).filter(
        models.Motorista.id == ultima_viagem.motorista_id
    ).first()

    # 3. A Regra de Negócio Implacável
    mensagem_alerta = "Multa registrada. Descontar do salário." 
    
    if motorista.status_cnh == "Provisória":
        mensagem_alerta = f"🚨 ALERTA VERMELHO: O motorista {motorista.nome} está na PPD! Suspensão imediata sugerida no sistema."

    # 4. Grava a sentença no banco
    nova_infracao = models.Infracao( 
        veiculo_id=multa.veiculo_id,
        pontos=multa.pontos,
        motorista_culpado_id=motorista.id,
        alerta_gerado=mensagem_alerta
    )
    
    db.add(nova_infracao)
    db.commit()
    db.refresh(nova_infracao)
    
    return nova_infracao

# Rota para listar todas as infrações
@router.get("/", response_model=list[schemas.InfracaoResponse])
def listar_infracoes(db: Session = Depends(get_db)):
    return db.query(models.Infracao).all()
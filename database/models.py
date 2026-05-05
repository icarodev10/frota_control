from sqlalchemy import Column, Integer, String, Float, ForeignKey
from .database import Base

class Veiculo(Base):
    __tablename__ = "veiculos"

    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String, unique=True, index=True)
    modelo = Column(String)
    km_atual = Column(Float, default=0.0)
    status = Column(String, default="Livre") # Livre, Em Uso, Oficina

class Motorista(Base):
    __tablename__ = "motoristas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    cnh = Column(String, unique=True, index=True)
    status_cnh = Column(String) # Definitiva, Provisória, Suspensa

class Viagem(Base):
    __tablename__ = "viagens"

    id = Column(Integer, primary_key=True, index=True)
    veiculo_id = Column(Integer, ForeignKey("veiculos.id"))
    motorista_id = Column(Integer, ForeignKey("motoristas.id"))
    km_inicial = Column(Float)
    km_final = Column(Float)

class Infracao(Base):
    __tablename__ = "infracoes"

    id = Column(Integer, primary_key=True, index=True)
    veiculo_id = Column(Integer, ForeignKey("veiculos.id"))
    pontos = Column(Integer)
    
    # O sistema preenche isso aqui sozinho após investigar
    motorista_culpado_id = Column(Integer, ForeignKey("motoristas.id"))
    alerta_gerado = Column(String)
from pydantic import BaseModel, field_validator

# O esqueleto básico do que é um veículo no nosso sistema
class VeiculoBase(BaseModel):
    placa: str
    modelo: str
    km_atual: float = 0.0
    status: str = "Livre"

# Usado para quando o usuário ENVIA dados pra criar um carro
class VeiculoCreate(VeiculoBase):
    pass

# Usado para quando o nosso sistema DEVOLVE os dados do carro (incluindo o ID que o banco gerou)
class VeiculoResponse(VeiculoBase):
    id: int

    class Config:
        from_attributes = True # Converte os dados do SQLAlchemy pro formato JSON do FastAPI

# --- SCHEMAS DE MOTORISTAS ---

class MotoristaBase(BaseModel):
    nome: str
    cnh: str
    status_cnh: str = "Definitiva" # Pode ser "Definitiva" ou "Provisória"

class MotoristaCreate(MotoristaBase):
# Validando apenas na hora de CRIAR o motorista
    @field_validator('nome')
    def validar_nome(cls, v):
        if not v.replace(" ", "").isalpha():
            raise ValueError('O nome deve conter apenas letras.')
        if len(v) < 3:
            raise ValueError('O nome deve ter no mínimo 3 letras.')
        return v.title()

class MotoristaResponse(MotoristaBase):
    id: int

    class Config:
        from_attributes = True

# --- SCHEMAS DE VIAGENS ---

class ViagemBase(BaseModel):
    veiculo_id: int
    motorista_id: int
    km_inicial: float
    km_final: float

class ViagemCreate(ViagemBase):
    pass

class ViagemResponse(ViagemBase):
    id: int

    class Config:
        from_attributes = True

# --- SCHEMAS DE INFRAÇÕES ---

class InfracaoBase(BaseModel):
    veiculo_id: int
    pontos: int

class InfracaoCreate(InfracaoBase):
    pass

class InfracaoResponse(InfracaoBase):
    id: int
    motorista_culpado_id: int
    alerta_gerado: str | None = None

    class Config:
        from_attributes = True
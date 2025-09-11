from pydantic import BaseModel
from typing import List

# --- Schemas para Questões ---
class QuestaoBase(BaseModel):
    pergunta: str
    alternativas: List[str]
    conjunto_a: List[int]
    conjunto_b: List[int]
    operacao: str
    resposta_correta: List[int]

class QuestaoCreate(QuestaoBase):
    pass

class Questao(QuestaoBase):
    id: int
    class Config:
        orm_mode = True

# --- Schemas para Usuários ---
class UsuarioBase(BaseModel):
    username: str

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: int
    is_active: bool
    class Config:
        orm_mode = True
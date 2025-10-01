from pydantic import BaseModel
from typing import List


class QuestaoBase(BaseModel):
    pergunta: str
    alternativas: List[str]
    resposta_correta: int
    nivel: int

class QuestaoCreate(QuestaoBase):
    pass

class Questao(QuestaoBase):
    id: int
    class Config:
        orm_mode = True


class UsuarioBase(BaseModel):
    username: str

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: int
    is_active: bool
    class Config:
        orm_mode = True
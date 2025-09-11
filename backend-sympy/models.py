from sqlalchemy import Column, Integer, String, Boolean, JSON
from .database import Base

# Modelo da tabela de Usuários
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)


# Modelo da tabela de Questões
class Questao(Base):
    __tablename__ = "questoes"

    id = Column(Integer, primary_key=True, index=True)
    pergunta = Column(String, index=True)
    alternativas = Column(JSON)
    conjunto_a = Column(JSON)
    conjunto_b = Column(JSON)
    operacao = Column(String)
    resposta_correta = Column(JSON)
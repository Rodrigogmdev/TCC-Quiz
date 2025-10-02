from sqlalchemy import Column, Integer, String, JSON, Boolean
from .database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)


class Questao(Base):
    __tablename__ = "questoes"

    id = Column(Integer, primary_key=True, index=True)
    pergunta = Column(String, index=True)
    alternativas = Column(JSON)
    resposta_correta = Column(String) 
    nivel = Column(Integer, index=True)
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
from .database import SessionLocal, engine
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.sql import func
from typing import List 
import time

dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

# --- Bloco de configuração do JWT ---
SECRET_KEY = os.getenv("SECRET_KEY")
if SECRET_KEY is None:
    raise ValueError("A variável de ambiente SECRET_KEY não foi definida.")
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
# Esquema para o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# cria as tabelas no banco de dados (se elas não existirem)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Bloco de configuração do banco de dados ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---  funções para Autenticação ---
def criar_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt




# --- Endpoints para Usuários ---

@app.post("/usuarios/", response_model=schemas.Usuario)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="Usuário já registrado")
    
    hashed_password = pwd_context.hash(usuario.password)
    novo_usuario = models.Usuario(username=usuario.username, hashed_password=hashed_password)
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

# ---  ENDPOINT DE LOGIN ---
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Busca o usuário no banco
    usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()

    # 2. Verifica se o usuário existe e se a senha está correta
    if not usuario or not pwd_context.verify(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Cria o token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = criar_access_token(
        data={"sub": usuario.username}, expires_delta=access_token_expires
    )

    # 4. Retorna o token
    return {"access_token": access_token, "token_type": "bearer"}

# --- Endpoints para Questões ---
@app.post("/questoes/", response_model=schemas.Questao)
def criar_questao(questao: schemas.QuestaoCreate, db: Session = Depends(get_db)):
    nova_questao = models.Questao(**questao.dict())
    db.add(nova_questao)
    db.commit()
    db.refresh(nova_questao)
    return nova_questao

@app.get("/questoes/", response_model=List[schemas.Questao])
def ler_questoes_por_nivel(nivel: int, limit: int, db: Session = Depends(get_db)):
    questoes = db.query(models.Questao)\
        .filter(models.Questao.nivel == nivel)\
        .order_by(func.random())\
        .limit(limit)\
        .all()
    if not questoes:
        raise HTTPException(status_code=404, detail="Nenhuma questão encontrada para este nível.")
    for questao in questoes:
        if isinstance(questao.alternativas, str):
            questao.alternativas = json.loads(questao.alternativas)
    return questoes


class VerificacaoPayload(schemas.BaseModel):
    questao_id: int
    resposta_aluno: str

@app.post("/verificar")
def verificar_resposta(payload: VerificacaoPayload, db: Session = Depends(get_db)):
    
    db_questao = db.query(models.Questao).filter(models.Questao.id == payload.questao_id).first()

    if db_questao is None:
        raise HTTPException(status_code=404, detail="Questão não encontrada")

    is_correta = (db_questao.resposta_correta == payload.resposta_aluno)
    
    return {"correta": is_correta}


class ExplicacaoPayload(schemas.BaseModel):
    questao_id: int

@app.post("/gerar-explicacao")
def gerar_explicacao(payload: ExplicacaoPayload, db: Session = Depends(get_db)):
    """
    Este endpoint gera uma explicação para uma questão.
    Aqui você pode adicionar a lógica para chamar um modelo de IA.
    """
    db_questao = db.query(models.Questao).filter(models.Questao.id == payload.questao_id).first()

    if db_questao is None:
        raise HTTPException(status_code=404, detail="Questão não encontrada")

    # Simulação de chamada de IA com um delay
    time.sleep(1) 

    # Exemplo de explicação estática. Substituir pela chamada da  IA.
    explicacao = f"Para resolver a questão '{db_questao.pergunta}', você precisa seguir estes passos:\n\n1. **Entenda o problema:** Analise os conjuntos e a operação solicitada (união, intersecção, etc.).\n2. **Aplique a teoria:** Lembre-se das definições de cada operação de conjunto.\n3. **Calcule o resultado:** Com base na teoria, identifique os elementos que compõem a resposta correta, que é: **{db_questao.resposta_correta}**."
    
    return {"explicacao": explicacao}
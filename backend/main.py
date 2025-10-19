import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models, schemas
from database import SessionLocal, engine
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.sql import func
from typing import List 
import time
import google.generativeai as genai

load_dotenv()

# --- Bloco de configuração do JWT ---
SECRET_KEY = os.getenv("SECRET_KEY")
if SECRET_KEY is None:
    raise ValueError("A variável de ambiente SECRET_KEY não foi definida.")
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Bloco de configuração do Gemini ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("A variável de ambiente GEMINI_API_KEY não foi definida.")
genai.configure(api_key=GEMINI_API_KEY)

# cria as tabelas no banco de dados (se elas não existirem)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")

origins = [
    CORS_ORIGIN,
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

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.Usuario).filter(models.Usuario.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(current_user: models.Usuario = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return current_user

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

@app.get("/users/me", response_model=schemas.Usuario)
def read_users_me(current_user: models.Usuario = Depends(get_current_user)):
    return current_user

# ---  ENDPOINT DE LOGIN ---
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    #  Busca o usuário no banco
    usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()

    # Verifica se o usuário existe e se a senha está correta
    if not usuario or not pwd_context.verify(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )


    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = criar_access_token(
        data={"sub": usuario.username}, expires_delta=access_token_expires
    )


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
    db_questao = db.query(models.Questao).filter(models.Questao.id == payload.questao_id).first()

    if db_questao is None:
        raise HTTPException(status_code=404, detail="Questão não encontrada")

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        Explique passo a passo como resolver a seguinte questão de Teoria dos Conjuntos, sem simplesmente dar a resposta final de cara.
        A resposta correta é: {db_questao.resposta_correta}.

        Questão:
        Pergunta: {db_questao.pergunta}
        Alternativas: {db_questao.alternativas}

        Seja didático e guie o raciocínio.
        """
        
        response = model.generate_content(prompt)
        
        return {"explicacao": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao gerar a explicação com a IA.")
    
@app.post("/questoes/batch/", response_model=List[schemas.Questao])
def criar_questoes_em_lote(
    questoes: List[schemas.QuestaoCreate],
    db: Session = Depends(get_db),
   
    current_admin: models.Usuario = Depends(get_current_admin_user)
):
    novas_questoes = []
    for questao_data in questoes:
        nova_questao = models.Questao(**questao_data.dict())
        db.add(nova_questao)
        novas_questoes.append(nova_questao)
    db.commit()
    for questao in novas_questoes:
        db.refresh(questao)
    return novas_questoes

class ChatPayload(schemas.BaseModel):
    questao_id: int
    pergunta_usuario: str

@app.post("/chatbot")
def chatbot_ajuda(payload: ChatPayload, db: Session = Depends(get_db)):
    db_questao = db.query(models.Questao).filter(models.Questao.id == payload.questao_id).first()

    if db_questao is None:
        raise HTTPException(status_code=404, detail="Questão não encontrada")

    try:
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        Você é um tutor de matemática especializado em Teoria dos Conjuntos. Um aluno está resolvendo a seguinte questão e pediu ajuda:

        Questão:
        Pergunta: "{db_questao.pergunta}"
        Alternativas: {db_questao.alternativas}

        A pergunta do aluno é: "{payload.pergunta_usuario}"

        Sua tarefa é ajudar o aluno a pensar na solução, mas **NUNCA** dê a resposta final. A resposta correta é "{db_questao.resposta_correta}". Use essa informação apenas para guiar sua explicação.
        Dê dicas, explique conceitos relevantes, mas não resolva o problema para ele.
        """
        
        response = model.generate_content(prompt, safety_settings=safety_settings)
        
     
        # verificar o motivo do bloqueio
        if not response.parts:
            block_reason = response.prompt_feedback.block_reason
            raise HTTPException(status_code=400, detail=f"A requisição foi bloqueada pela API. Motivo: {block_reason}")


        return {"resposta_chatbot": response.text}

    except Exception as e:
        print(f"!!!!!!!!!! OCORREU UM ERRO NA API {e} !!!!!!!!!!") 
        

        raise HTTPException(status_code=500, detail=f"Erro na API do Gemini: {str(e)}")
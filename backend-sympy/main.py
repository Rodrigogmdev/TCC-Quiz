from sympy import FiniteSet
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
from .database import SessionLocal, engine

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
# Configura o hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependência: fornece uma sessão do banco de dados para a rota e a fecha depois
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# --- Fim do bloco de configuração do BD ---


# --- Endpoints para Usuários e Questões ---

@app.post("/usuarios/", response_model=schemas.Usuario)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Verifica se o usuário já existe
    db_usuario = db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="Usuário já registrado")
    
    # Cria o hash da senha e o novo usuário
    hashed_password = pwd_context.hash(usuario.password)
    novo_usuario = models.Usuario(username=usuario.username, hashed_password=hashed_password)
    
    # Adiciona, commita e atualiza o banco
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@app.post("/questoes/", response_model=schemas.Questao)
def criar_questao(questao: schemas.QuestaoCreate, db: Session = Depends(get_db)):
    nova_questao = models.Questao(**questao.dict())
    db.add(nova_questao)
    db.commit()
    db.refresh(nova_questao)
    return nova_questao

@app.get("/questoes/{questao_id}", response_model=schemas.Questao)
def ler_questao(questao_id: int, db: Session = Depends(get_db)):
    db_questao = db.query(models.Questao).filter(models.Questao.id == questao_id).first()
    if db_questao is None:
        raise HTTPException(status_code=404, detail="Questão não encontrada")
    return db_questao

class VerificacaoPayload(schemas.BaseModel):
    resposta_aluno: list[int]
    conjunto_a: list[int]
    conjunto_b: list[int]
    operacao: str

@app.post("/verificar")
def verificar_resposta(payload: VerificacaoPayload):
   
    print(f"PAYLOAD RECEBIDO: {payload.dict()}")
    
    A = FiniteSet(*payload.conjunto_a)
    B = FiniteSet(*payload.conjunto_b)
    R = FiniteSet(*payload.resposta_aluno)

    if payload.operacao == 'uniao':
        correta = A.union(B)
    elif payload.operacao == 'interseccao':
        correta = A.intersect(B)
    elif payload.operacao == 'diferenca':
        correta = A - B
    else:
        return {"erro": "Operação desconhecida"}
    
    resultado = {"correta": R == correta}
    print(f"RESULTADO ENVIADO: {resultado}")
    
    return resultado

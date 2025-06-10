from fastapi import FastAPI, Body
from pydantic import BaseModel
from sympy import FiniteSet
from fastapi.middleware.cors import CORSMiddleware

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



class Verificacao(BaseModel):
    resposta_aluno: list[int]
    conjunto_a: list[int]
    conjunto_b: list[int]
    operacao: str

@app.post("/verificar")
def verificar_resposta(payload: Verificacao):
    # Para depuração, você pode imprimir o que o backend recebe
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
    # Para depuração, imprima o que o backend vai retornar
    print(f"RESULTADO ENVIADO: {resultado}")
    
    return resultado
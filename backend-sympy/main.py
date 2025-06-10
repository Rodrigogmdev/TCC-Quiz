from fastapi import FastAPI, Body
from pydantic import BaseModel
from sympy import FiniteSet

app = FastAPI()

# Exemplo: A = {1, 2, 3}, B = {3, 4, 5}, operação = união

class Verificacao(BaseModel):
    resposta_aluno: list[int]
    conjunto_a: list[int]
    conjunto_b: list[int]
    operacao: str  # 'uniao', 'interseccao', 'diferenca'

@app.post("/verificar")
def verificar_resposta(payload: Verificacao):
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

    return {"correta": R == correta}

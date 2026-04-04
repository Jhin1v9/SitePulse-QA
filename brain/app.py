from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List

app = FastAPI(title="SitePulse Brain")


class Action(BaseModel):
    id: str
    label: str
    payload: Dict[str, Any] = {}


class ChatRequest(BaseModel):
    message: str
    desktopContext: Dict[str, Any]


class ChatResponse(BaseModel):
    answer: str
    actions: List[Action] = []


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """Minimal brain stub.

    - Usa o desktopContext apenas para exemplo.
    - Depois vamos plugar modelo grande + embeddings aqui.
    """
    msg = (req.message or "").strip()
    ctx = req.desktopContext or {}

    workspace = ctx.get("workspace") or {}
    url = workspace.get("targetUrl") or "este site"

    report = (ctx.get("issues") or {}).get("report") or {}
    total_issues = int(report.get("summary", {}).get("totalIssues", 0))

    answer = (
        f"Olhei o contexto atual deste desktop para {url}. "
        f"(Aqui entra o raciocínio do modelo grande para a sua pergunta: '{msg}')."
    )

    actions: List[Action] = []
    if total_issues > 0:
        actions.append(
            Action(
                id="switch-findings",
                label="Abrir Findings com as issues atuais",
                payload={"view": "findings"},
            )
        )
    if url and url != "este site":
        actions.append(
            Action(
                id="run-audit",
                label="Rodar auditoria rápida de SEO",
                payload={"baseUrl": url, "depth": "signal", "scope": "seo"},
            )
        )

    return ChatResponse(answer=answer, actions=actions)

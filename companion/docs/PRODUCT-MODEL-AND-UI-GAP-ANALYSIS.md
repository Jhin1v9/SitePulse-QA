# Análise: Modelo do Produto e Gap da Interface

Documento de análise profunda do modelo do produto e do porquê de a UI atual não refletir as capacidades do sistema. **Nenhum código é alterado neste documento.**

---

## 0. Posicionamento: AI Assisted QA Operating System

**SitePulse Studio** não é um dashboard. É um **AI Assisted QA Operating System**.

O modelo mental correto é **OPERATIONS WORKSTATION**. O utilizador:

- executa auditorias
- analisa issues
- consulta memória operacional
- gera prompts de correção
- executa healing attempts
- analisa impacto
- observa tendências
- recebe recomendações da IA

A interface deve parecer uma **ferramenta profissional**, não uma página. Workstation implica: painéis, listas, inspectores, estado dos motores; não “landing”, “dashboard” nem “app de uma página”.

---

## 1. Propósito do sistema

O sistema existe para **transformar auditorias técnicas em inteligência operacional**.

- **Entrada:** auditoria técnica (run sobre um alvo → report com issues, evidência, métricas).
- **Saída:** inteligência operacional — priorização, tendências, memória validada, correção assistida, próximas ações, coerência de sinais, oportunidades estruturais.

A interface deve tornar **visível e acionável** essa transformação. Hoje ela não o faz de forma estruturada.

---

## 2. As dez camadas e o que cada uma produz

| # | Camada | O que faz | O que produz (inteligência) |
|---|--------|-----------|-----------------------------|
| 1 | **QA Runtime Learning** | Persiste aprendizagem entre runs; valida/falha/parcial; promove resoluções; rastreia origem (curated, auto_promoted, manual_override). | **Memória operacional:** o que costuma funcionar, o que falhou, o que é hipótese, confiança, rastreabilidade. |
| 2 | **Electron Bridge** | Expõe IPC seguro; chama runtime (getLearningMemory, getHealingSnapshot, prepareHealingAttempt, applyLearningManualOverride). | **Acesso controlado** ao runtime; a UI não “fala” diretamente com o motor. |
| 3 | **Renderer State** | Normaliza o report; constrói contexto comparável (histórico por alvo); mantém um **derived intelligence snapshot** único por report (evita drift entre vistas). | **Estado consolidado** por report: uma única “fonte de verdade” para todas as superfícies (Overview, Findings, Prompts, Assistant). |
| 4 | **Assistant Reasoning** | Interpreta intenções; escolhe modo cognitivo (operator, audit_analyst, prompt_engineer, product_guide, strategy_advisor); produz respostas e ações a partir do estado real. | **Respostas operacionais e ações seguras** — não chat genérico; usa report, memory, healing, impact, trends. |
| 5 | **Self-Healing Engine** | Classifica elegibilidade (eligible, assist_only, manual_only, blocked, unsafe); escolhe modo (suggest_only, prompt_assisted, orchestrated); gera prompts de correção; persiste tentativas; revalida no próximo run. | **Fila de correção assistida:** o que pode ser curado, com que confiança, prompt pronto, tentativas pendentes. |
| 6 | **Impact Engine** | Calcula impacto por issue; classifica P0–P4; gera rationale; executive summary da run. | **Priorização operacional:** por que algo é prioritário, ordem recomendada, resumo executivo. |
| 7 | **Continuous Intelligence** | Compara report atual com baseline/histórico; detecta regressões, melhorias, persistentes, recorrentes; tendências SEO / Runtime / UX. | **Tendências e drift:** o que piorou, o que melhorou, o que se repete, símbolos de tendência. |
| 8 | **Data Intelligence** | Consolida runs, issues, impact, predictive, healing, memory, quality num **modelo normalizado** (SITE_STATE, QUALITY_STATE, RISK_STATE, TREND_STATE, ISSUE_STATE, ISSUE_MAP). | **Contexto único por issue:** cada finding enriquecido com impacto, prioridade, tendência, risco preditivo, confiança de healing, histórico. |
| 9 | **Optimization Engine** | Agrupa issues em clusters estruturais; produz topImprovements, structuralRecommendations, opportunityGroups. | **Oportunidades estruturais:** não só “lista de issues”, mas “o que corrigir em bloco” (template, schema, layout). |
| 10 | **Quality Control Engine** | Detecta possíveis falsos positivos; sinaliza incoerências entre impact, priority e predictive risk; aplica regras de validação. | **Coerência de sinais:** topWarnings, confiança na classificação, alertas de inconsistência. |

Em conjunto: uma **auditoria** (dados técnicos) passa por Learning, Impact, Continuous, Data Intelligence, Healing, Optimization e QC e vira **inteligência operacional** — prioridade, tendência, memória, correção assistida, próximas ações, coerência e oportunidades estruturais.

---

## 3. Modelo mental do produto (Operations Workstation)

O utilizador não está “a ver um dashboard” nem “uma página”. Está numa **estação de trabalho**. Está a:

1. **Disparar** uma auditoria (mission).
2. **Obter evidência** (report, timeline, stage).
3. **Consumir inteligência** derivada das 10 camadas sobre essa evidência (findings enriquecidos, compare, memória, healing, tendências, oportunidades, avisos).
4. **Agir** com base nessa inteligência (prompts, healing attempt, compare, override de memória, export).

A hierarquia informacional é:

- **Nível 0 — Entrada:** target, run (config e execução).
- **Nível 1 — Evidência bruta:** report, timeline, stage board.
- **Nível 2 — Inteligência derivada:** saídas das camadas 1, 5, 6, 7, 8, 9, 10 sobre o mesmo report (memória, healing, impact, continuous, data, optimization, QC).
- **Nível 3 — Ação:** prompts, healing attempt, compare, memória (override), reports (cofre).

A interface deve **deixar claro** que há um centro (report + snapshot) e que várias “lentes” (Findings, Compare, Memory, Healing, Assistant, etc.) são **vistas sobre esse mesmo centro**, não ecrãs soltos.

---

## 4. Por que a UI atual ainda parece um dashboard SaaS

### 4.1 Estrutura

- **Navegação por “grupos” genéricos** (Mission, Evidence, Actions, System) ajuda, mas **não explicita as 10 camadas**. O utilizador não vê “Learning”, “Impact”, “Continuous”, “Data Intelligence”, “Optimization”, “QC” como capacidades distintas; vê “Findings”, “Prompts”, “Settings”.
- **Não há hierarquia visual clara** entre “evidência” (report) e “inteligência derivada” (tudo o que os motores produzem). Tudo parece “outra página”.
- **O mesmo report** é a entrada para Learning, Impact, Continuous, Data Intelligence, Healing, Optimization e QC, mas a UI não comunica esse fluxo único (uma run → um snapshot → múltiplas dimensões).

### 4.2 Densidade e clareza operacional

- **Overview** pode parecer “painel de resumo” em vez de **mission control** que mostra estado da run e entrada para a auditoria.
- **Findings** lista issues, mas a **origem** dos dados (Impact, Data Intelligence, Healing, QC) não está explícita na estrutura da vista; está “dentro” dos cards.
- **Memory** está “dentro” de Settings; **Healing** está “dentro” de Prompts. São camadas de topo no modelo, mas na UI são subsecções.
- **Optimization** e **Quality Control** não têm superfície dedicada; aparecem como dados no snapshot e no Assistant. O utilizador não “vê” que existem como motores.

### 4.3 Linguagem visual

- Se predominam **cards**, **métricas soltas** e **grids de resumo** sem relação explícita com “uma run → um snapshot → N motores”, a sensação é de **dashboard** (muitos widgets) em vez de **workspace operacional** (um centro de evidência + lentes de inteligência + ações).
- Falta uma **âncora visual** do “centro” (ex.: “Report atual” ou “Run atual” com indicador de que dali derivam Memory, Healing, Impact, etc.) e da **cadeia** evidência → inteligência → ação.

### 4.4 Resumo do gap

| Aspeto | Modelo do produto | UI atual |
|--------|-------------------|----------|
| Centro | Um report + um derived snapshot alimentam todas as camadas. | Não há um “centro” claramente designado; parece várias páginas. |
| Camadas | 10 camadas com responsabilidades distintas. | Só algumas são nomeadas (Findings, Prompts, Settings); Memory e Healing são subsecções; Impact, Continuous, Data, Optimization, QC não são “superfícies” visíveis como motores. |
| Fluxo | Auditoria → Evidência → Inteligência (N motores) → Ação. | Navegação por grupos; fluxo não é óbvio. |
| Densidade | Priorização, tendências, memória, healing, oportunidades, avisos devem ser consultáveis de forma operacional. | Parte da informação existe mas não está organizada por “motor” nem por nível (evidência vs. inteligência vs. ação). |

Por isso a UI **ainda parece um dashboard SaaS**: muitos elementos de resumo e navegação, pouca **estrutura que reflita a transformação** “auditoria → inteligência operacional” e as **dez camadas** que a realizam.

---

## 5. O que “a interface deve refletir essas capacidades” implica (princípios)

Sem propor ainda mudanças concretas de código, a interface deveria:

1. **Tornar o centro explícito**  
   Deixar claro que existe **uma evidência atual** (report/run) e que Findings, Compare, Memory, Healing, Assistant, etc. são **vistas sobre essa evidência** (e sobre o snapshot derivado).

2. **Tornar as camadas reconhecíveis**  
   O utilizador deve poder identificar, na estrutura ou na narrativa da UI, que existem: Learning (memória), Healing (fila de correção), Impact (prioridade P0–P4), Continuous (tendências), Data Intelligence (contexto consolidado), Optimization (oportunidades estruturais), QC (avisos e coerência). Não é obrigatório que cada uma seja “um ecrã”; pode ser uma secção, um bloco, um indicador ou uma linha de resumo — mas **nomeadas e ligadas ao modelo**.

3. **Ordenar por fluxo**  
   A ordem e o agrupamento devem seguir: **entrada (mission)** → **evidência (report, operations)** → **inteligência (surfaces que mostram saída dos motores)** → **ação (prompts, healing, compare, memory override, reports)**.

4. **Priorizar densidade operacional**  
   Menos “cards de marketing” e mais **list/detail**, **split**, **inspector**, **filtros por estado do motor** (validated, failed, eligible, P0–P4, etc.), para que o operador responda a perguntas como “o que costuma funcionar?”, “o que está pronto para healing?”, “qual a prioridade?” e “quais avisos de QC?”.

5. **Ferramenta profissional, não página**  
   A UI deve parecer **workstation**: painéis, listas, inspectores, estado dos motores. Evitar estética de landing, dashboard ou “app de uma página”.

6. **Evitar a sensação de dashboard**  
   Reduzir a impressão de “muitos widgets soltos”; reforçar a de **um sistema com um centro (evidência) e várias lentes (motores)**, com ações explícitas e estado do sistema visível.

---

## 6. Conclusão da análise

- O **modelo do produto** é claro: 10 camadas que transformam auditorias técnicas em inteligência operacional (memória, healing, impact, tendências, contexto consolidado, oportunidades, coerência, mais o Bridge e o Renderer State que orquestram e o Assistant que expõe).
- A **UI atual** não reflete esse modelo de forma estruturada: o centro (report + snapshot) não é a âncora visual; as camadas não são todas reconhecíveis; o fluxo evidência → inteligência → ação não domina a narrativa; a densidade operacional e a distinção em relação a um “dashboard SaaS” são insuficientes.
- **Refletir essas capacidades** implica: centro explícito, camadas reconhecíveis, fluxo claro, densidade operacional, linguagem de **Operations Workstation** (ferramenta profissional) em vez de dashboard ou página.

Este documento serve de base para decisões de reestruturação da interface **antes de modificar qualquer código**.

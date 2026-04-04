# SitePulse Studio v3.0

Plataforma completa de QA (Quality Assurance) e Seguranca Cibernetica com 10 motores de IA especializados.

## 🚀 Visao Geral

O SitePulse Studio v3.0 integra 10 motores de IA que trabalham em conjunto para fornecer:

- 🧠 **Compreensao de Intencoes** - NLP avancado com analise emocional
- 🔍 **Consciencia Situacional** - Auto-descoberta e monitoramento em tempo real
- 🎯 **Decisoes Inteligentes** - Otimizacao multi-objetivo e teoria dos jogos
- ⚡ **Execucao Segura** - Circuit breaker, checkpoints e rollback
- 🔮 **Predicao Proativa** - Forecasting e deteccao de anomalias
- 🤖 **Testes Autonomos** - Geracao e cura automatica de testes
- 🔒 **Seguranca Completa** - Red Team, Blue Team e Compliance

## 📋 Os 10 Motores de IA

| Motor | Funcao Principal |
|-------|-----------------|
| **Intent Engine** | Compreender comandos do usuario |
| **Context Engine** | Manter consciencia do ambiente |
| **Evidence Engine** | Coletar e analisar evidencias |
| **Memory Engine** | Aprender com experiencias |
| **Learning Engine** | Melhorar continuamente |
| **Decision Engine** | Tomar decisoes otimas |
| **Action Engine** | Executar com seguranca |
| **Predictive Engine** | Prever problemas futuros |
| **Autonomous QA Engine** | Automacao de testes |
| **CyberSenior Engine** | Seguranca ofensiva/defensiva |

## 🛠️ Instalacao

```bash
# Clone o repositorio
git clone <repo-url>
cd companion

# Instalar dependencias
npm install

# Executar testes
npm test

# Compilar TypeScript
npm run build
```

## 📖 Documentacao

- **[Tutorial Completo](docs/TUTORIAL_COMPLETO.md)** - Guia detalhado de uso
- **[Exemplos](examples/)** - Codigo de demonstracao
- **[Arquitetura](docs/ARCHITECTURE-ASSISTANT-IA.md)** - Documentacao tecnica

## 🎯 Exemplo Rapido

```typescript
import { supremeOrchestrator } from './src/bridge/engine-orchestrator';

// Inicializar
await supremeOrchestrator.initialize(config);

// Processar entrada do usuario
const result = await supremeOrchestrator.processUserInput({
  content: "Quero fazer um scan de seguranca",
  type: 'text',
  source: 'chat',
});

// Construir contexto
const context = await supremeOrchestrator.buildContext({
  target: { url: 'https://meusite.com' },
});

// Tomar decisao
const decision = await supremeOrchestrator.decide({
  options: ['quick_scan', 'full_scan', 'pentest'],
  context,
});

// Executar
const actions = await supremeOrchestrator.execute({
  decision,
  context,
});
```

## 🧪 Executando Exemplos

```bash
# Demo completo de todos os motores
npx ts-node examples/demo-completo.ts

# Testes especificos
npm test -- --testPathPattern=cybersenior
npm test -- --testPathPattern=decision
npm test -- --testPathPattern=predictive
```

## 📊 Testes

```bash
# Todos os testes
npm test

# Com cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch
```

Status atual: **108 testes passando** em 8 suites.

## 🏗️ Estrutura do Projeto

```
src/
├── ai/                    # Motores de IA
│   ├── intent/           # Motor de Intencao
│   ├── context/          # Motor de Contexto
│   ├── evidence/         # Motor de Evidencias
│   ├── memory/           # Motor de Memoria
│   ├── learning/         # Motor de Aprendizado
│   ├── decision/         # Motor de Decisao
│   ├── action/           # Motor de Acao
│   ├── predictive/       # Motor Preditivo
│   ├── autonomous/       # Motor Autonomo
│   └── security/         # Motor de Seguranca
├── bridge/               # Orquestrador
├── shared/               # Tipos e utilidades
└── core/                 # Nucleo do sistema

examples/                 # Exemplos de uso
docs/                     # Documentacao
```

## 🔧 Configuracao

Edite `tsconfig.json` para ajustar opcoes de compilacao:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true
  }
}
```

## 📝 Licenca

[Adicione sua licenca aqui]

## 🤝 Contribuicao

[Adicione guias de contribuicao aqui]

## 📞 Suporte

[Adicione informacoes de contato aqui]

---

**Desenvolvido com ❤️ para a comunidade de QA e Seguranca**

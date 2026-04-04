# Exemplos SitePulse Studio v3.0

Esta pasta contem exemplos praticos de uso dos 10 motores de IA.

## Arquivos

- `demo-completo.ts` - Demonstracao completa de todos os motores

## Como Executar

```bash
# Instalar dependencias
npm install

# Executar demo completo
npx ts-node examples/demo-completo.ts

# Ou compile primeiro
npx tsc
node dist/examples/demo-completo.js
```

## O que o Demo Mostra

1. **Intent Engine** - Analise de intencoes e emocoes do usuario
2. **Context Engine** - Descoberta automatica de sistemas
3. **Decision Engine** - Otimizacao multi-objetivo e teoria dos jogos
4. **Action Engine** - Circuit breaker e execucao segura
5. **Predictive Engine** - Forecasting e deteccao de anomalias
6. **Autonomous QA Engine** - Geracao e cura automatica de testes
7. **CyberSenior Engine** - Analise de seguranca e compliance

## Estrutura do Demo

Cada secao do demo:
- Inicializa o motor especifico
- Executa operacoes tipicas
- Mostra resultados no console
- Demonstra capacidades principais

## Personalizacao

Edite as constantes no inicio do arquivo:

```typescript
const TARGET_URL = 'https://seu-site.com';
```

## Proximos Passos

Apos executar o demo:

1. Leia o tutorial completo em `docs/TUTORIAL_COMPLETO.md`
2. Explore os testes em `src/ai/**/__tests__/`
3. Integre ao seu projeto usando o orquestrador

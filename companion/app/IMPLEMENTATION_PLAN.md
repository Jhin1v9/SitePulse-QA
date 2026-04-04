# 🚀 PLANO DE IMPLEMENTAÇÃO - SITEPULSE OS

## Objetivo
Transformar o SitePulse OS (pasta `/app`) em uma aplicação desktop completa, integrada com os 10 motores de IA do backend, mantendo a estética de Sistema Operacional.

## Fase 1: Infraestrutura de Comunicação (IPC)
- [ ] Criar preload script para expor API segura ao frontend
- [ ] Configurar handlers no main.cjs para comunicação com motores
- [ ] Criar bridge de eventos entre Zustand stores e Electron IPC
- [ ] Testar: ping/pong entre renderer e main

## Fase 2: Integração dos 10 Motores
- [ ] Conectar engineStore com backend real
- [ ] Implementar ativação/desativação de motores
- [ ] Streaming de métricas em tempo real
- [ ] Testar: cada motor respondendo via IPC

## Fase 3: Sistema de Arquivos (Virtual)
- [ ] Criar FileSystemStore (virtual, persistido em SQLite)
- [ ] Implementar Finder funcional (pastas, arquivos)
- [ ] Sistema de projetos/sessões de audit
- [ ] Testar: criar, mover, deletar arquivos

## Fase 4: Scanner Funcional
- [ ] Tela de New Audit com configurações
- [ ] Seleção de motores e scope
- [ ] Progresso em tempo real com logs
- [ ] Testar: scan completo de exemplo.com

## Fase 5: Findings & Evidências
- [ ] Tela de Findings com filtros avançados
- [ ] Visualização de evidências (screenshots, logs)
- [ ] Triage (marcar como falso positivo, etc)
- [ ] Testar: findings aparecendo após scan

## Fase 6: Reports & Exportação
- [ ] Geração de relatórios (PDF, HTML, JSON)
- [ ] Preview de relatórios
- [ ] Sistema de templates
- [ ] Testar: exportar relatório completo

## Fase 7: Polish & Otimização
- [ ] Animações suaves (Framer Motion)
- [ ] Estados de loading e erro
- [ ] Notificações (Toast system)
- [ ] Testar: fluxo completo end-to-end

## Critérios de Qualidade
- Cada funcionalidade deve ser testada antes de prosseguir
- Código revisado e documentado
- Sem simplificações - manter a visão OS
- Performance: 60fps nas animações
- Zero bugs críticos

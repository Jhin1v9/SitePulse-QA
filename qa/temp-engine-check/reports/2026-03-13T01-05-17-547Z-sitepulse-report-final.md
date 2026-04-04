# SitePulse QA Report

- Projeto: sitepulse-default-desktop-audit
- Inicio: 2026-03-13T01:01:56.070Z
- Fim: 2026-03-13T01:05:17.546Z
- Base URL: https://site-pulse-qa.vercel.app/es
- Viewport: 1536x864
- Execucao pausada: nao
- Retomado de checkpoint: nao

## Resumo

- Rotas verificadas: 6
- Falhas de carga de rota: 0
- Botoes verificados: 129
- Acoes mapeadas (detalhadas): 129
- Acoes com efeito: 105
- Acoes sem efeito detectado: 7
- Acoes com erro de clique: 0
- Acoes em modo analise (sem clique): 0
- Botoes sem efeito: 7
- Erros HTTP 4xx: 0
- Erros HTTP 5xx: 0
- Erros de rede: 0
- Erros JS runtime: 0
- Console errors: 0
- Ordem visual invalida: 0
- Secao obrigatoria ausente/invisivel: 0
- SEO score: 93/100
- SEO paginas analisadas: 6
- SEO issues criticas: 0
- SEO issues totais: 2
- Total issues: 15

## Guia Rapido Para Assistente

- Status: issues_found
- Replay command: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\sitepulse-es-full.json" --fresh --live-log --human-log --scope "full" --no-server
- Passo: Corrigir primeiro erros high (runtime/5xx/ordem visual).
- Passo: Depois tratar medium (clicks falhos/rede/secoes ausentes).
- Passo: Finalizar com low e ruido de console.
- Passo: Atacar checklist SEO pendente antes da revalidacao final.
- Passo: Reexecutar auditoria completa e confirmar totalIssues=0.
- Rotas prioritarias:
  - /faq: total=4 high=0 medium=1 low=3
  - /downloads: total=4 high=0 medium=1 low=3
  - /demo: total=3 high=0 medium=1 low=2
  - /contact: total=3 high=0 medium=1 low=2
  - /pricing: total=1 high=0 medium=0 low=1

## Explicacao Para Leigos

- [VISUAL_CLUSTER_COLLISION] 3 ocorrencia(s)
  - O que isso significa: Cards ou blocos lado a lado ficaram grudados demais, como se a grade estivesse apertada ou sem espaco para respirar.
  - O que fazer: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
- [BTN_NO_EFFECT] 7 ocorrencia(s)
  - O que isso significa: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - O que fazer: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
- [VISUAL_TIGHT_SPACING] 1 ocorrencia(s)
  - O que isso significa: Partes grandes da tela ficaram grudadas demais, como se faltasse respiro entre os blocos.
  - O que fazer: Aumentar espacamento vertical entre secoes/cards principais, revisar margins e garantir uma hierarquia visual com respiracao consistente.
- [VISUAL_HIERARCHY_COLLAPSE] 3 ocorrencia(s)
  - O que isso significa: O titulo e o texto ficaram parecidos demais. Isso enfraquece a leitura e dificulta entender o que e principal.
  - O que fazer: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
- [VISUAL_GAP_INCONSISTENCY] 1 ocorrencia(s)
  - O que isso significa: A distancia entre partes parecidas da tela muda demais e a pagina fica visualmente sem padrao.
  - O que fazer: Padronizar a escala de espacamento entre secoes equivalentes e remover gaps isolados que deixam a composicao irregular.

## Inteligencia De Erros

- [generic] BTN_NO_EFFECT -> 7 ocorrencia(s)
- [generic] VISUAL_CLUSTER_COLLISION -> 3 ocorrencia(s)
- [generic] VISUAL_HIERARCHY_COLLAPSE -> 3 ocorrencia(s)
- [generic] VISUAL_GAP_INCONSISTENCY -> 1 ocorrencia(s)
- [generic] VISUAL_TIGHT_SPACING -> 1 ocorrencia(s)

## Progresso

- Proxima rota indice: 6
- Proximo botao indice: 0
- Segmentos executados: 1

## Mapa De Acoes (Botoes/Menu/Links)

- [clicked_effect] / -> SPSitePulse Studio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es.
  - Destino/href: /es#top
- [clicked_effect] / -> Precios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/pricing.
  - Destino/href: /es/pricing
- [clicked_effect] / -> FAQ (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/faq.
  - Destino/href: /es/faq
- [clicked_effect] / -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es para /es/contact.
  - Destino/href: /es/contact
- [skipped_already_active] / -> Idioma: Espanol (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento ja estava no estado ativo.
  - Detalhe: Motivo: button_already_active
- [clicked_effect] / -> Idioma: Catala (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es para /ca.
- [clicked_effect] / -> Idioma: English (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es para /en.
- [clicked_effect] / -> Modo oscuro (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, estado visual mudou.
- [clicked_effect] / -> Ver demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] / -> Descargar (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] / -> Analizar mi sitio (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou, houve requisicao de rede.
- [skipped_not_visible] / -> Operacion en vivoPanel de operacionesMonitorea progreso de auditoria, etapas, logs y riesgo de release en una sola superficie. (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [skipped_not_visible] / -> Evidencia tecnicaReporte de evidenciaAgrupa hallazgos por severidad, causa, impacto y recomendacion para decidir el release. (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [skipped_not_visible] / -> Base SEOSEO tecnico integradoValida indexacion, metadatos y senales SEO tecnicas antes de publicar para reducir regresiones. (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [clicked_effect] / -> Descargar instalador (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] / -> Hablar con ventas (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es para /es/contact.
  - Destino/href: /es/contact
- [clicked_effect] / -> Iniciar auditoria (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou, houve requisicao de rede.
- [clicked_effect] / -> Ver instaladores (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] / -> Inicio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es.
  - Destino/href: /es#top
- [clicked_effect] / -> Demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] / -> Instaladores (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] / -> Documentacion (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/faq.
  - Destino/href: /es/faq#docs
- [clicked_effect] / -> Seguridad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/faq.
  - Destino/href: /es/faq#security
- [clicked_effect] / -> Privacidad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/faq.
  - Destino/href: /es/faq#privacy
- [clicked_effect] / -> Estado (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es para /es/downloads.
  - Destino/href: /es/downloads#status
- [clicked_effect] /demo -> SPSitePulse Studio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es.
  - Destino/href: /es#top
- [clicked_effect] /demo -> Precios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/pricing.
  - Destino/href: /es/pricing
- [clicked_effect] /demo -> FAQ (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/faq.
  - Destino/href: /es/faq
- [clicked_effect] /demo -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/demo para /es/contact.
  - Destino/href: /es/contact
- [skipped_already_active] /demo -> Idioma: Espanol (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento ja estava no estado ativo.
  - Detalhe: Motivo: button_already_active
- [clicked_effect] /demo -> Idioma: Catala (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/demo para /ca/demo.
- [clicked_effect] /demo -> Idioma: English (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/demo para /en/demo.
- [clicked_effect] /demo -> Modo claro (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, estado visual mudou.
- [clicked_no_effect] /demo -> Ver demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Clique ocorreu, mas sem efeito observavel.
  - Destino/href: /es/demo
- [clicked_effect] /demo -> Descargar (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /demo -> Descargar instalador (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /demo -> Hablar con ventas (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/demo para /es/contact.
  - Destino/href: /es/contact
- [skipped_not_visible] /demo -> Operacion en vivoPanel de operacionesMonitorea progreso de auditoria, etapas, logs y riesgo de release en una sola superficie. (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [skipped_not_visible] /demo -> Evidencia tecnicaReporte de evidenciaAgrupa hallazgos por severidad, causa, impacto y recomendacion para decidir el release. (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [skipped_not_visible] /demo -> Base SEOSEO tecnico integradoValida indexacion, metadatos y senales SEO tecnicas antes de publicar para reducir regresiones. (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [clicked_effect] /demo -> Inicio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es.
  - Destino/href: /es#top
- [clicked_no_effect] /demo -> Demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Clique ocorreu, mas sem efeito observavel.
  - Destino/href: /es/demo
- [clicked_effect] /demo -> Instaladores (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /demo -> Documentacion (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/faq.
  - Destino/href: /es/faq#docs
- [clicked_effect] /demo -> Seguridad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/faq.
  - Destino/href: /es/faq#security
- [clicked_effect] /demo -> Privacidad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/faq.
  - Destino/href: /es/faq#privacy
- [clicked_effect] /demo -> Estado (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/demo para /es/downloads.
  - Destino/href: /es/downloads#status
- [clicked_effect] /downloads -> SPSitePulse Studio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es.
  - Destino/href: /es#top
- [clicked_effect] /downloads -> Precios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/pricing.
  - Destino/href: /es/pricing
- [clicked_effect] /downloads -> FAQ (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/faq.
  - Destino/href: /es/faq
- [clicked_effect] /downloads -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact.
  - Destino/href: /es/contact
- [skipped_already_active] /downloads -> Idioma: Espanol (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento ja estava no estado ativo.
  - Detalhe: Motivo: button_already_active
- [clicked_effect] /downloads -> Idioma: Catala (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/downloads para /ca/downloads.
- [clicked_effect] /downloads -> Idioma: English (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/downloads para /en/downloads.
- [clicked_effect] /downloads -> Modo oscuro (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, estado visual mudou.
- [clicked_effect] /downloads -> Ver demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/demo.
  - Destino/href: /es/demo
- [clicked_no_effect] /downloads -> Descargar (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Clique ocorreu, mas sem efeito observavel.
  - Destino/href: /es/downloads
- [clicked_effect] /downloads -> Solicitar enlace (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact?topic=download&package=win-full-setup.
  - Destino/href: /es/contact?topic=download&package=win-full-setup
- [clicked_effect] /downloads -> Notas de release (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact?topic=release-notes&package=win-full-setup.
  - Destino/href: /es/contact?topic=release-notes&package=win-full-setup
- [clicked_effect] /downloads -> Soporte comercial (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact.
  - Destino/href: /es/contact
- [clicked_effect] /downloads -> Solicitar enlace (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact?topic=download&package=win-bootstrap-setup.
  - Destino/href: /es/contact?topic=download&package=win-bootstrap-setup
- [clicked_effect] /downloads -> Notas de release (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact?topic=release-notes&package=win-bootstrap-setup.
  - Destino/href: /es/contact?topic=release-notes&package=win-bootstrap-setup
- [clicked_effect] /downloads -> Solicitar enlace (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact?topic=download&package=win-portable-zip.
  - Destino/href: /es/contact?topic=download&package=win-portable-zip
- [clicked_effect] /downloads -> Notas de release (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/downloads para /es/contact?topic=release-notes&package=win-portable-zip.
  - Destino/href: /es/contact?topic=release-notes&package=win-portable-zip
- [clicked_effect] /downloads -> Inicio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es.
  - Destino/href: /es#top
- [clicked_effect] /downloads -> Demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/demo.
  - Destino/href: /es/demo
- [clicked_no_effect] /downloads -> Instaladores (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Clique ocorreu, mas sem efeito observavel.
  - Destino/href: /es/downloads
- [clicked_effect] /downloads -> Documentacion (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/faq.
  - Destino/href: /es/faq#docs
- [clicked_effect] /downloads -> Seguridad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/faq.
  - Destino/href: /es/faq#security
- [clicked_effect] /downloads -> Privacidad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/faq.
  - Destino/href: /es/faq#privacy
- [clicked_effect] /downloads -> Estado (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/downloads para /es/downloads.
  - Destino/href: /es/downloads#status
- [clicked_effect] /pricing -> SPSitePulse Studio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es.
  - Destino/href: /es#top
- [clicked_no_effect] /pricing -> Precios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Clique ocorreu, mas sem efeito observavel.
  - Destino/href: /es/pricing
- [clicked_effect] /pricing -> FAQ (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/faq.
  - Destino/href: /es/faq
- [clicked_effect] /pricing -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/pricing para /es/contact.
  - Destino/href: /es/contact
- [skipped_already_active] /pricing -> Idioma: Espanol (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento ja estava no estado ativo.
  - Detalhe: Motivo: button_already_active
- [clicked_effect] /pricing -> Idioma: Catala (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/pricing para /ca/pricing.
- [clicked_effect] /pricing -> Idioma: English (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/pricing para /en/pricing.
- [clicked_effect] /pricing -> Modo claro (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, estado visual mudou.
- [clicked_effect] /pricing -> Ver demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] /pricing -> Descargar (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /pricing -> Descargar instalador (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /pricing -> Hablar con ventas (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/pricing para /es/contact.
  - Destino/href: /es/contact
- [clicked_effect] /pricing -> Inicio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es.
  - Destino/href: /es#top
- [clicked_effect] /pricing -> Demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] /pricing -> Instaladores (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /pricing -> Documentacion (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/faq.
  - Destino/href: /es/faq#docs
- [clicked_effect] /pricing -> Seguridad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/faq.
  - Destino/href: /es/faq#security
- [clicked_effect] /pricing -> Privacidad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/faq.
  - Destino/href: /es/faq#privacy
- [clicked_effect] /pricing -> Estado (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/pricing para /es/downloads.
  - Destino/href: /es/downloads#status
- [clicked_effect] /faq -> SPSitePulse Studio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es.
  - Destino/href: /es#top
- [clicked_effect] /faq -> Precios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/pricing.
  - Destino/href: /es/pricing
- [clicked_no_effect] /faq -> FAQ (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Clique ocorreu, mas sem efeito observavel.
  - Destino/href: /es/faq
- [clicked_effect] /faq -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /es/faq para /es/contact.
  - Destino/href: /es/contact
- [skipped_already_active] /faq -> Idioma: Espanol (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento ja estava no estado ativo.
  - Detalhe: Motivo: button_already_active
- [clicked_effect] /faq -> Idioma: Catala (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/faq para /ca/faq.
- [clicked_effect] /faq -> Idioma: English (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/faq para /en/faq.
- [clicked_effect] /faq -> Modo oscuro (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, estado visual mudou.
- [clicked_effect] /faq -> Ver demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] /faq -> Descargar (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/downloads.
  - Destino/href: /es/downloads
- [skipped_not_visible] /faq -> Es software desktop o cloud?- (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [skipped_not_visible] /faq -> Cuanto tarda una auditoria?+ (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [skipped_not_visible] /faq -> Como se actualizan los instaladores?+ (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [skipped_not_visible] /faq -> Sirve para agencias con varios clientes?+ (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento nao estava visivel para clique.
  - Detalhe: Motivo: button_not_visible
- [clicked_effect] /faq -> Inicio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es.
  - Destino/href: /es#top
- [clicked_effect] /faq -> Demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] /faq -> Instaladores (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /faq -> Documentacion (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/faq.
  - Destino/href: /es/faq#docs
- [clicked_effect] /faq -> Seguridad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/faq.
  - Destino/href: /es/faq#security
- [clicked_effect] /faq -> Privacidad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/faq.
  - Destino/href: /es/faq#privacy
- [clicked_effect] /faq -> Estado (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/faq para /es/downloads.
  - Destino/href: /es/downloads#status
- [clicked_effect] /contact -> SPSitePulse Studio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es.
  - Destino/href: /es#top
- [clicked_effect] /contact -> Precios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/pricing.
  - Destino/href: /es/pricing
- [clicked_effect] /contact -> FAQ (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/faq.
  - Destino/href: /es/faq
- [clicked_no_effect] /contact -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Clique ocorreu, mas sem efeito observavel.
  - Destino/href: /es/contact
- [skipped_already_active] /contact -> Idioma: Espanol (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento ja estava no estado ativo.
  - Detalhe: Motivo: button_already_active
- [clicked_effect] /contact -> Idioma: Catala (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/contact para /ca/contact.
- [clicked_effect] /contact -> Idioma: English (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Navegou de /es/contact para /en/contact.
- [clicked_effect] /contact -> Modo claro (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, estado visual mudou.
- [clicked_effect] /contact -> Ver demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] /contact -> Descargar (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/downloads.
  - Destino/href: /es/downloads
- [skipped_disabled] /contact -> Enviar solicitud (button)
  - Funcao esperada: Executar acao interativa
  - Explicacao para leigo: Deve reagir ao clique com resultado visivel para o usuario.
  - Funcao executada: Elemento estava desabilitado.
  - Detalhe: Motivo: button_disabled
- [clicked_effect] /contact -> Inicio (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es.
  - Destino/href: /es#top
- [clicked_effect] /contact -> Demo (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/demo.
  - Destino/href: /es/demo
- [clicked_effect] /contact -> Instaladores (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/downloads.
  - Destino/href: /es/downloads
- [clicked_effect] /contact -> Documentacion (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/faq.
  - Destino/href: /es/faq#docs
- [clicked_effect] /contact -> Seguridad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/faq.
  - Destino/href: /es/faq#security
- [clicked_effect] /contact -> Privacidad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/faq.
  - Destino/href: /es/faq#privacy
- [clicked_effect] /contact -> Estado (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /es/contact para /es/downloads.
  - Destino/href: /es/downloads#status

## Analise SEO

- SEO score geral: 93/100
- Paginas analisadas: 6
- Score por categoria: tecnico=97, conteudo=96, acessibilidade=100
- Principais pontos SEO:
  - [medium] SEO_META_DESCRIPTION_LENGTH (5x): Meta description com 56 caracteres (ideal: 70-170). | recomendacao: Ajuste o tamanho da meta description para evitar corte no resultado de busca.
  - [low] SEO_STRUCTURED_DATA_MISSING (5x): Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.
- Checklist SEO base:
  - [ok] Title unico e com tamanho ideal (30-65) | E o texto principal que aparece no Google.
  - [missing] Meta description clara (70-170) | Ajuda a pessoa entender a pagina antes de clicar.
  - [ok] Estrutura de headings com 1 H1 | Organiza o tema principal da pagina para Google e usuarios.
  - [ok] HTML com lang e viewport mobile | Melhora indexacao correta por idioma e experiencia em celular.
  - [ok] Canonical definido | Evita conteudo duplicado em URLs diferentes.
  - [ok] Pagina indexavel (sem noindex indevido) | Sem isso o Google pode ignorar paginas importantes.
  - [ok] Imagens com alt descritivo | Ajuda SEO de imagem e acessibilidade.
  - [missing] Schema JSON-LD (LocalBusiness/Service/FAQ) | Aumenta chance de rich results no Google.
  - [ok] Conteudo util e suficiente | Paginas rasas tendem a ranquear pior.
  - [ok] Links internos entre paginas | Ajuda rastreamento e distribuicao de autoridade.
  - [ok] Meta social (Open Graph + Twitter Card) | Melhora compartilhamento e CTR em redes sociais.
  - [ok] Meta robots presente e coerente | Define como bots devem indexar/seguir links.
- Prompt recomendado para corrigir SEO:
```
Atue como especialista SEO senior com foco em causa raiz e impacto real no ranking.
Site auditado: https://site-pulse-qa.vercel.app/es
Score SEO atual: 93/100.
Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.

Checklist SEO pendente (explicacao para leigos + acao):
1. Meta description clara (70-170) | por que importa: Ajuda a pessoa entender a pagina antes de clicar. | o que fazer: Crie descricao objetiva com beneficio real e chamada para acao.
2. Schema JSON-LD (LocalBusiness/Service/FAQ) | por que importa: Aumenta chance de rich results no Google. | o que fazer: Adicione dados estruturados validos por pagina.

Issues SEO detectadas:
1. [SEO_META_DESCRIPTION_LENGTH] (medium) Meta description com 56 caracteres (ideal: 70-170). | recomendacao: Ajuste o tamanho da meta description para evitar corte no resultado de busca.
2. [SEO_STRUCTURED_DATA_MISSING] (low) Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.

Entrega obrigatoria:
- listar arquivos alterados e motivo de cada alteracao
- mostrar antes/depois dos metadados principais
- validar novamente e comprovar melhoria de score
```

## Issues

- [VISUAL_CLUSTER_COLLISION] (medium) /demo -> visual_quality:cluster_collision: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-02-33-786Z-demo-visual-cluster-collision-article-panel-min-w-0-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-02-33-786Z-demo-visual-cluster-collision-article-panel-min-w-0-fullpage.png
  - Classificacao: VISUAL_CLUSTER_COLLISION [generic]
  - Tecnico: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
  - Leigo: Cards ou blocos lado a lado ficaram grudados demais, como se a grade estivesse apertada ou sem espaco para respirar.
  - Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap horizontal real entre cards/blocos na mesma linha. | Ajustar grid/flex gap e min-width para impedir colunas grudadas ou espremidas. | Validar a composicao nos viewports mobile e desktop sem permitir clusters se tocando.
  - Comandos sugeridos: rg -n "grid-template-columns|gap:|column-gap|flex-wrap|justify-content|min-width|max-width|grid-cols|gap-x-" src || rg -n "card|panel|tile|cluster|grid|columns|stack" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_CLUSTER_COLLISION] (medium)
Rota: /demo
Acao: visual_quality:cluster_collision
URL: https://site-pulse-qa.vercel.app/es/demo
Detalhe observado: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
Explicacao tecnica: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
Classificacao inteligente: VISUAL_CLUSTER_COLLISION (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-02-33-786Z-demo-visual-cluster-collision-article-panel-min-w-0-context.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-02-33-786Z-demo-visual-cluster-collision-article-panel-min-w-0-fullpage.png
- [BTN_NO_EFFECT] (low) /demo -> Ver demo: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
  - Classificacao: BTN_NO_EFFECT [generic]
  - Tecnico: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
  - Leigo: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
  - Prioridade de ataque: P1
  - Checks iniciais: Checar se o clique altera URL, estado, modal, scroll ou request. | Garantir feedback visual e tratamento de sucesso/erro. | Confirmar que callbacks nao estao vazios ou condicionados indevidamente.
  - Comandos sugeridos: rg -n "onClick|scrollToSection|router\.push|setState|set[A-Z]" src/components src/lib || rg -n "TODO|placeholder|noop|return;" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /demo
Acao: Ver demo
URL: https://site-pulse-qa.vercel.app/es/demo
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
- [BTN_NO_EFFECT] (low) /demo -> Demo: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
  - Classificacao: BTN_NO_EFFECT [generic]
  - Tecnico: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
  - Leigo: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
  - Prioridade de ataque: P1
  - Checks iniciais: Checar se o clique altera URL, estado, modal, scroll ou request. | Garantir feedback visual e tratamento de sucesso/erro. | Confirmar que callbacks nao estao vazios ou condicionados indevidamente.
  - Comandos sugeridos: rg -n "onClick|scrollToSection|router\.push|setState|set[A-Z]" src/components src/lib || rg -n "TODO|placeholder|noop|return;" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /demo
Acao: Demo
URL: https://site-pulse-qa.vercel.app/es/demo
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
- [VISUAL_TIGHT_SPACING] (medium) /downloads -> visual_quality:tight_spacing: Espacamento apertado em 2 transicao(oes) na rota /downloads (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=miolo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-fullpage.png
  - Classificacao: VISUAL_TIGHT_SPACING [generic]
  - Tecnico: Blocos relevantes ficaram com espacamento vertical apertado demais, sugerindo colisoes proximas, respiracao insuficiente ou composicao comprimida.
  - Leigo: Partes grandes da tela ficaram grudadas demais, como se faltasse respiro entre os blocos.
  - Resolucao recomendada: Aumentar espacamento vertical entre secoes/cards principais, revisar margins e garantir uma hierarquia visual com respiracao consistente.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir gaps verticais entre blocos consecutivos da composicao principal. | Revisar margins/paddings de cards, seções e wrappers que ficaram visualmente colados. | Garantir respiro suficiente antes de CTA, FAQ, listas e grids longos.
  - Comandos sugeridos: rg -n "gap:|row-gap|margin-top|margin-bottom|padding-top|padding-bottom|-mt-|-mb-|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /downloads
Acao: visual_quality:tight_spacing
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Espacamento apertado em 2 transicao(oes) na rota /downloads (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=miolo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
Explicacao tecnica: Blocos relevantes ficaram com espacamento vertical apertado demais, sugerindo colisoes proximas, respiracao insuficiente ou composicao comprimida.
Resolucao recomendada: Aumentar espacamento vertical entre secoes/cards principais, revisar margins e garantir uma hierarquia visual com respiracao consistente.
Classificacao inteligente: VISUAL_TIGHT_SPACING (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-context.png
- article.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-focus.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-fullpage.png
- [VISUAL_HIERARCHY_COLLAPSE] (low) /downloads -> visual_quality:hierarchy_collapse: Detectado colapso de hierarquia visual em 1 bloco(s). | article.panel.mt-5 (heading=20px, body=14px, ratio=1.43x, gap=6px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-fullpage.png
  - Classificacao: VISUAL_HIERARCHY_COLLAPSE [generic]
  - Tecnico: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
  - Leigo: O titulo e o texto ficaram parecidos demais. Isso enfraquece a leitura e dificulta entender o que e principal.
  - Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar contraste visual entre heading principal e corpo dentro do mesmo bloco. | Reforcar escala tipografica, peso e espacamento entre titulo, subtitulo e texto de apoio. | Validar se a hierarquia continua clara em desktop e nos viewports mobile auditados.
  - Comandos sugeridos: rg -n "font-size|font-weight|line-height|letter-spacing|heading|title|subtitle|eyebrow" src || rg -n "h1|h2|h3|role=\"heading\"|text-xl|text-2xl|text-3xl|text-sm|text-base" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /downloads
Acao: visual_quality:hierarchy_collapse
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | article.panel.mt-5 (heading=20px, body=14px, ratio=1.43x, gap=6px)
Explicacao tecnica: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
Classificacao inteligente: VISUAL_HIERARCHY_COLLAPSE (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.mt-5 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-context.png
- article.panel.mt-5 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-focus.png
- article.panel.mt-5 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-fullpage.png
- [BTN_NO_EFFECT] (low) /downloads -> Descargar: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
  - Classificacao: BTN_NO_EFFECT [generic]
  - Tecnico: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
  - Leigo: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
  - Prioridade de ataque: P1
  - Checks iniciais: Checar se o clique altera URL, estado, modal, scroll ou request. | Garantir feedback visual e tratamento de sucesso/erro. | Confirmar que callbacks nao estao vazios ou condicionados indevidamente.
  - Comandos sugeridos: rg -n "onClick|scrollToSection|router\.push|setState|set[A-Z]" src/components src/lib || rg -n "TODO|placeholder|noop|return;" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /downloads
Acao: Descargar
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
- [BTN_NO_EFFECT] (low) /downloads -> Instaladores: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
  - Classificacao: BTN_NO_EFFECT [generic]
  - Tecnico: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
  - Leigo: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
  - Prioridade de ataque: P1
  - Checks iniciais: Checar se o clique altera URL, estado, modal, scroll ou request. | Garantir feedback visual e tratamento de sucesso/erro. | Confirmar que callbacks nao estao vazios ou condicionados indevidamente.
  - Comandos sugeridos: rg -n "onClick|scrollToSection|router\.push|setState|set[A-Z]" src/components src/lib || rg -n "TODO|placeholder|noop|return;" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /downloads
Acao: Instaladores
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
- [BTN_NO_EFFECT] (low) /pricing -> Precios: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
  - Classificacao: BTN_NO_EFFECT [generic]
  - Tecnico: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
  - Leigo: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
  - Prioridade de ataque: P1
  - Checks iniciais: Checar se o clique altera URL, estado, modal, scroll ou request. | Garantir feedback visual e tratamento de sucesso/erro. | Confirmar que callbacks nao estao vazios ou condicionados indevidamente.
  - Comandos sugeridos: rg -n "onClick|scrollToSection|router\.push|setState|set[A-Z]" src/components src/lib || rg -n "TODO|placeholder|noop|return;" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /pricing
Acao: Precios
URL: https://site-pulse-qa.vercel.app/es/pricing
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
- [VISUAL_GAP_INCONSISTENCY] (low) /faq -> visual_quality:gap_inconsistency: Detectada inconsistencia de espacamento em 1 transicao(oes) visuais. | section.space-y-3 -> section (gap=32px, baseline=266px, drift=234px, too_tight)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-fullpage.png
  - Classificacao: VISUAL_GAP_INCONSISTENCY [generic]
  - Tecnico: A malha vertical perdeu consistencia: gaps equivalentes entre blocos variam demais e quebram o ritmo do layout.
  - Leigo: A distancia entre partes parecidas da tela muda demais e a pagina fica visualmente sem padrao.
  - Resolucao recomendada: Padronizar a escala de espacamento entre secoes equivalentes e remover gaps isolados que deixam a composicao irregular.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a escala de espacamento entre blocos equivalentes na mesma pagina. | Unificar tokens/gutters de spacing entre secoes irmas. | Remover overrides isolados que aumentam ou reduzem gaps sem criterio.
  - Comandos sugeridos: rg -n "gap:|row-gap|margin-top|margin-bottom|padding-top|padding-bottom|space-y-|space-x-" src || rg -n "token|spacing|gutter|container|max-width|section" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_GAP_INCONSISTENCY] (low)
Rota: /faq
Acao: visual_quality:gap_inconsistency
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Detectada inconsistencia de espacamento em 1 transicao(oes) visuais. | section.space-y-3 -> section (gap=32px, baseline=266px, drift=234px, too_tight)
Explicacao tecnica: A malha vertical perdeu consistencia: gaps equivalentes entre blocos variam demais e quebram o ritmo do layout.
Resolucao recomendada: Padronizar a escala de espacamento entre secoes equivalentes e remover gaps isolados que deixam a composicao irregular.
Classificacao inteligente: VISUAL_GAP_INCONSISTENCY (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- section.space-y-3 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-context.png
- section.space-y-3 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-focus.png
- section.space-y-3 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-fullpage.png
- [VISUAL_HIERARCHY_COLLAPSE] (low) /faq -> visual_quality:hierarchy_collapse: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-fullpage.png
  - Classificacao: VISUAL_HIERARCHY_COLLAPSE [generic]
  - Tecnico: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
  - Leigo: O titulo e o texto ficaram parecidos demais. Isso enfraquece a leitura e dificulta entender o que e principal.
  - Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar contraste visual entre heading principal e corpo dentro do mesmo bloco. | Reforcar escala tipografica, peso e espacamento entre titulo, subtitulo e texto de apoio. | Validar se a hierarquia continua clara em desktop e nos viewports mobile auditados.
  - Comandos sugeridos: rg -n "font-size|font-weight|line-height|letter-spacing|heading|title|subtitle|eyebrow" src || rg -n "h1|h2|h3|role=\"heading\"|text-xl|text-2xl|text-3xl|text-sm|text-base" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /faq
Acao: visual_quality:hierarchy_collapse
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
Explicacao tecnica: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
Classificacao inteligente: VISUAL_HIERARCHY_COLLAPSE (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- section.grid.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-context.png
- section.grid.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-focus.png
- section.grid.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-fullpage.png
- [VISUAL_CLUSTER_COLLISION] (medium) /faq -> visual_quality:cluster_collision: Detectada colisao entre clusters laterais em 2 par(es) de blocos. | article#docs.panel.min-w-0 x article#security.panel.min-w-0 (gap=16px, overlap=1) ; article#security.panel.min-w-0 x article#privacy.panel.min-w-0 (gap=16px, overlap=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-fullpage.png
  - Classificacao: VISUAL_CLUSTER_COLLISION [generic]
  - Tecnico: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
  - Leigo: Cards ou blocos lado a lado ficaram grudados demais, como se a grade estivesse apertada ou sem espaco para respirar.
  - Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap horizontal real entre cards/blocos na mesma linha. | Ajustar grid/flex gap e min-width para impedir colunas grudadas ou espremidas. | Validar a composicao nos viewports mobile e desktop sem permitir clusters se tocando.
  - Comandos sugeridos: rg -n "grid-template-columns|gap:|column-gap|flex-wrap|justify-content|min-width|max-width|grid-cols|gap-x-" src || rg -n "card|panel|tile|cluster|grid|columns|stack" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_CLUSTER_COLLISION] (medium)
Rota: /faq
Acao: visual_quality:cluster_collision
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Detectada colisao entre clusters laterais em 2 par(es) de blocos. | article#docs.panel.min-w-0 x article#security.panel.min-w-0 (gap=16px, overlap=1) ; article#security.panel.min-w-0 x article#privacy.panel.min-w-0 (gap=16px, overlap=1)
Explicacao tecnica: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
Classificacao inteligente: VISUAL_CLUSTER_COLLISION (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article#docs.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-context.png
- article#docs.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-focus.png
- article#docs.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-fullpage.png
- [BTN_NO_EFFECT] (low) /faq -> FAQ: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
  - Classificacao: BTN_NO_EFFECT [generic]
  - Tecnico: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
  - Leigo: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
  - Prioridade de ataque: P1
  - Checks iniciais: Checar se o clique altera URL, estado, modal, scroll ou request. | Garantir feedback visual e tratamento de sucesso/erro. | Confirmar que callbacks nao estao vazios ou condicionados indevidamente.
  - Comandos sugeridos: rg -n "onClick|scrollToSection|router\.push|setState|set[A-Z]" src/components src/lib || rg -n "TODO|placeholder|noop|return;" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /faq
Acao: FAQ
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
- [VISUAL_HIERARCHY_COLLAPSE] (low) /contact -> visual_quality:hierarchy_collapse: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-fullpage.png
  - Classificacao: VISUAL_HIERARCHY_COLLAPSE [generic]
  - Tecnico: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
  - Leigo: O titulo e o texto ficaram parecidos demais. Isso enfraquece a leitura e dificulta entender o que e principal.
  - Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar contraste visual entre heading principal e corpo dentro do mesmo bloco. | Reforcar escala tipografica, peso e espacamento entre titulo, subtitulo e texto de apoio. | Validar se a hierarquia continua clara em desktop e nos viewports mobile auditados.
  - Comandos sugeridos: rg -n "font-size|font-weight|line-height|letter-spacing|heading|title|subtitle|eyebrow" src || rg -n "h1|h2|h3|role=\"heading\"|text-xl|text-2xl|text-3xl|text-sm|text-base" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /contact
Acao: visual_quality:hierarchy_collapse
URL: https://site-pulse-qa.vercel.app/es/contact
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
Explicacao tecnica: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
Classificacao inteligente: VISUAL_HIERARCHY_COLLAPSE (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- section.grid.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-context.png
- section.grid.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-focus.png
- section.grid.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-fullpage.png
- [VISUAL_CLUSTER_COLLISION] (medium) /contact -> visual_quality:cluster_collision: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-fullpage.png
  - Classificacao: VISUAL_CLUSTER_COLLISION [generic]
  - Tecnico: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
  - Leigo: Cards ou blocos lado a lado ficaram grudados demais, como se a grade estivesse apertada ou sem espaco para respirar.
  - Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap horizontal real entre cards/blocos na mesma linha. | Ajustar grid/flex gap e min-width para impedir colunas grudadas ou espremidas. | Validar a composicao nos viewports mobile e desktop sem permitir clusters se tocando.
  - Comandos sugeridos: rg -n "grid-template-columns|gap:|column-gap|flex-wrap|justify-content|min-width|max-width|grid-cols|gap-x-" src || rg -n "card|panel|tile|cluster|grid|columns|stack" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_CLUSTER_COLLISION] (medium)
Rota: /contact
Acao: visual_quality:cluster_collision
URL: https://site-pulse-qa.vercel.app/es/contact
Detalhe observado: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
Explicacao tecnica: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
Classificacao inteligente: VISUAL_CLUSTER_COLLISION (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-context.png
- article.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-focus.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-fullpage.png
- [BTN_NO_EFFECT] (low) /contact -> Contacto: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
  - Classificacao: BTN_NO_EFFECT [generic]
  - Tecnico: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
  - Leigo: O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.
  - Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
  - Prioridade de ataque: P1
  - Checks iniciais: Checar se o clique altera URL, estado, modal, scroll ou request. | Garantir feedback visual e tratamento de sucesso/erro. | Confirmar que callbacks nao estao vazios ou condicionados indevidamente.
  - Comandos sugeridos: rg -n "onClick|scrollToSection|router\.push|setState|set[A-Z]" src/components src/lib || rg -n "TODO|placeholder|noop|return;" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /contact
Acao: Contacto
URL: https://site-pulse-qa.vercel.app/es/contact
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

## Prompts De Correcao Por Issue

### 132ed603a50d | VISUAL_CLUSTER_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_CLUSTER_COLLISION] (medium)
Rota: /demo
Acao: visual_quality:cluster_collision
URL: https://site-pulse-qa.vercel.app/es/demo
Detalhe observado: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
Explicacao tecnica: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
Classificacao inteligente: VISUAL_CLUSTER_COLLISION (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-02-33-786Z-demo-visual-cluster-collision-article-panel-min-w-0-context.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-02-33-786Z-demo-visual-cluster-collision-article-panel-min-w-0-fullpage.png
```

### 310bcc5b1dda | BTN_NO_EFFECT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /demo
Acao: Ver demo
URL: https://site-pulse-qa.vercel.app/es/demo
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
```

### 94c55defe0ce | BTN_NO_EFFECT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /demo
Acao: Demo
URL: https://site-pulse-qa.vercel.app/es/demo
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
```

### b04de557766a | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /downloads
Acao: visual_quality:tight_spacing
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Espacamento apertado em 2 transicao(oes) na rota /downloads (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=miolo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
Explicacao tecnica: Blocos relevantes ficaram com espacamento vertical apertado demais, sugerindo colisoes proximas, respiracao insuficiente ou composicao comprimida.
Resolucao recomendada: Aumentar espacamento vertical entre secoes/cards principais, revisar margins e garantir uma hierarquia visual com respiracao consistente.
Classificacao inteligente: VISUAL_TIGHT_SPACING (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-context.png
- article.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-focus.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-08-123Z-downloads-visual-tight-spacing-article-panel-min-w-0-fullpage.png
```

### 8c01f0800c21 | VISUAL_HIERARCHY_COLLAPSE

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /downloads
Acao: visual_quality:hierarchy_collapse
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | article.panel.mt-5 (heading=20px, body=14px, ratio=1.43x, gap=6px)
Explicacao tecnica: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
Classificacao inteligente: VISUAL_HIERARCHY_COLLAPSE (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.mt-5 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-context.png
- article.panel.mt-5 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-focus.png
- article.panel.mt-5 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-03-09-506Z-downloads-visual-hierarchy-collapse-article-panel-mt-5-fullpage.png
```

### b584ecdd3762 | BTN_NO_EFFECT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /downloads
Acao: Descargar
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
```

### 9ecc459cd283 | BTN_NO_EFFECT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /downloads
Acao: Instaladores
URL: https://site-pulse-qa.vercel.app/es/downloads
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
```

### b088d75c745c | BTN_NO_EFFECT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /pricing
Acao: Precios
URL: https://site-pulse-qa.vercel.app/es/pricing
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
```

### 254369f30349 | VISUAL_GAP_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_GAP_INCONSISTENCY] (low)
Rota: /faq
Acao: visual_quality:gap_inconsistency
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Detectada inconsistencia de espacamento em 1 transicao(oes) visuais. | section.space-y-3 -> section (gap=32px, baseline=266px, drift=234px, too_tight)
Explicacao tecnica: A malha vertical perdeu consistencia: gaps equivalentes entre blocos variam demais e quebram o ritmo do layout.
Resolucao recomendada: Padronizar a escala de espacamento entre secoes equivalentes e remover gaps isolados que deixam a composicao irregular.
Classificacao inteligente: VISUAL_GAP_INCONSISTENCY (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- section.space-y-3 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-context.png
- section.space-y-3 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-focus.png
- section.space-y-3 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-14-303Z-faq-visual-gap-inconsistency-section-space-y-3-fullpage.png
```

### 4df194e79828 | VISUAL_HIERARCHY_COLLAPSE

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /faq
Acao: visual_quality:hierarchy_collapse
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
Explicacao tecnica: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
Classificacao inteligente: VISUAL_HIERARCHY_COLLAPSE (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- section.grid.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-context.png
- section.grid.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-focus.png
- section.grid.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-16-226Z-faq-visual-hierarchy-collapse-section-grid-min-w-0-fullpage.png
```

### 4b6ff2335824 | VISUAL_CLUSTER_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_CLUSTER_COLLISION] (medium)
Rota: /faq
Acao: visual_quality:cluster_collision
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Detectada colisao entre clusters laterais em 2 par(es) de blocos. | article#docs.panel.min-w-0 x article#security.panel.min-w-0 (gap=16px, overlap=1) ; article#security.panel.min-w-0 x article#privacy.panel.min-w-0 (gap=16px, overlap=1)
Explicacao tecnica: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
Classificacao inteligente: VISUAL_CLUSTER_COLLISION (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article#docs.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-context.png
- article#docs.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-focus.png
- article#docs.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-17-634Z-faq-visual-cluster-collision-article-docs-panel-min-w-0-fullpage.png
```

### 9680fbb331c7 | BTN_NO_EFFECT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /faq
Acao: FAQ
URL: https://site-pulse-qa.vercel.app/es/faq
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
```

### 3bc80822c49d | VISUAL_HIERARCHY_COLLAPSE

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /contact
Acao: visual_quality:hierarchy_collapse
URL: https://site-pulse-qa.vercel.app/es/contact
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
Explicacao tecnica: Um bloco estrutural perdeu contraste de hierarquia entre titulo e conteudo, deixando o heading visualmente proximo demais do texto de apoio.
Resolucao recomendada: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
Classificacao inteligente: VISUAL_HIERARCHY_COLLAPSE (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- section.grid.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-context.png
- section.grid.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-focus.png
- section.grid.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-46-403Z-contact-visual-hierarchy-collapse-section-grid-min-w-0-fullpage.png
```

### f95eadcf5937 | VISUAL_CLUSTER_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_CLUSTER_COLLISION] (medium)
Rota: /contact
Acao: visual_quality:cluster_collision
URL: https://site-pulse-qa.vercel.app/es/contact
Detalhe observado: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
Explicacao tecnica: Blocos laterais da mesma linha ficaram proximos demais, sugerindo colisoes de cluster, grid comprimido ou gutters insuficientes.
Resolucao recomendada: Revisar gutters horizontais, grid-template, gaps e min-width dos cards para manter separacao clara entre blocos da mesma linha.
Classificacao inteligente: VISUAL_CLUSTER_COLLISION (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido

Evidencias capturadas:
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-context.png
- article.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-focus.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T01-04-48-478Z-contact-visual-cluster-collision-article-panel-min-w-0-fullpage.png
```

### 1c29e4deba8f | BTN_NO_EFFECT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [BTN_NO_EFFECT] (low)
Rota: /contact
Acao: Contacto
URL: https://site-pulse-qa.vercel.app/es/contact
Detalhe observado: Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
Explicacao tecnica: Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.
Resolucao recomendada: Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.
Classificacao inteligente: BTN_NO_EFFECT (generic)

Requisitos obrigatorios:
1. Reproduzir o problema localmente antes da mudanca.
2. Identificar causa raiz real no codigo (nao apenas sintoma).
3. Implementar correcao robusta e minima.
4. Preservar UX, acessibilidade e comportamento mobile/desktop.
5. Revalidar com auditoria automatizada apos o fix.

Entregue:
- mudancas de codigo
- resumo da causa raiz
- como validar que foi resolvido
```


## Prompt Master

```text
Atue como engenheiro de software senior e corrija todas as issues listadas abaixo com foco em causa raiz.

Nao aplique correcoes cosmeticas. Garanta comportamento funcional correto em desktop e mobile.

Exigencias minimas: sem botao sem efeito, sem callback solto, sem erro fetch sem feedback, sem 4xx/5xx inesperado no fluxo principal e sem ordem de secoes quebrada.

Workflow obrigatorio: reproduzir, identificar causa raiz, corrigir com menor impacto, validar novamente via auditor.

Entregue ao final: codigo corrigido, resumo da causa raiz por categoria e evidencias de revalidacao.

Corrija todos os botoes sem efeito observavel.
Cada clique deve gerar mudanca de estado visual, navegacao, request ou mensagem de status.
Itens detectados:
- /demo -> "Ver demo"
- /demo -> "Demo"
- /downloads -> "Descargar"
- /downloads -> "Instaladores"
- /pricing -> "Precios"
- /faq -> "FAQ"
- /contact -> "Contacto"

Corrija as inconsistencias de composicao visual da interface.
O objetivo e padronizar respiro, alinhamento, camadas e ritmo visual entre blocos importantes.
Ocorrencias:
- /downloads -> VISUAL_TIGHT_SPACING: Espacamento apertado em 2 transicao(oes) na rota /downloads (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=miolo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
- /faq -> VISUAL_GAP_INCONSISTENCY: Detectada inconsistencia de espacamento em 1 transicao(oes) visuais. | section.space-y-3 -> section (gap=32px, baseline=266px, drift=234px, too_tight)
- /downloads -> VISUAL_HIERARCHY_COLLAPSE: Detectado colapso de hierarquia visual em 1 bloco(s). | article.panel.mt-5 (heading=20px, body=14px, ratio=1.43x, gap=6px)
- /faq -> VISUAL_HIERARCHY_COLLAPSE: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
- /contact -> VISUAL_HIERARCHY_COLLAPSE: Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
- /demo -> VISUAL_CLUSTER_COLLISION: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
- /faq -> VISUAL_CLUSTER_COLLISION: Detectada colisao entre clusters laterais em 2 par(es) de blocos. | article#docs.panel.min-w-0 x article#security.panel.min-w-0 (gap=16px, overlap=1) ; article#security.panel.min-w-0 x article#privacy.panel.min-w-0 (gap=16px, overlap=1)
- /contact -> VISUAL_CLUSTER_COLLISION: Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)

Use a classificacao inteligente para atacar causa raiz de fetch/network/http/runtime.
Para cada item: confirmar causa, aplicar fix robusto e validar com replay da auditoria.
Diagnosticos capturados:
- /demo -> visual_quality:cluster_collision | VISUAL_CLUSTER_COLLISION [generic] | Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
- /demo -> Ver demo | BTN_NO_EFFECT [generic] | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
- /demo -> Demo | BTN_NO_EFFECT [generic] | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
- /downloads -> visual_quality:tight_spacing | VISUAL_TIGHT_SPACING [generic] | Espacamento apertado em 2 transicao(oes) na rota /downloads (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=miolo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
- /downloads -> visual_quality:hierarchy_collapse | VISUAL_HIERARCHY_COLLAPSE [generic] | Detectado colapso de hierarquia visual em 1 bloco(s). | article.panel.mt-5 (heading=20px, body=14px, ratio=1.43x, gap=6px)
- /downloads -> Descargar | BTN_NO_EFFECT [generic] | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
- /downloads -> Instaladores | BTN_NO_EFFECT [generic] | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
- /pricing -> Precios | BTN_NO_EFFECT [generic] | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
- /faq -> visual_quality:gap_inconsistency | VISUAL_GAP_INCONSISTENCY [generic] | Detectada inconsistencia de espacamento em 1 transicao(oes) visuais. | section.space-y-3 -> section (gap=32px, baseline=266px, drift=234px, too_tight)
- /faq -> visual_quality:hierarchy_collapse | VISUAL_HIERARCHY_COLLAPSE [generic] | Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
- /faq -> visual_quality:cluster_collision | VISUAL_CLUSTER_COLLISION [generic] | Detectada colisao entre clusters laterais em 2 par(es) de blocos. | article#docs.panel.min-w-0 x article#security.panel.min-w-0 (gap=16px, overlap=1) ; article#security.panel.min-w-0 x article#privacy.panel.min-w-0 (gap=16px, overlap=1)
- /faq -> FAQ | BTN_NO_EFFECT [generic] | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
- /contact -> visual_quality:hierarchy_collapse | VISUAL_HIERARCHY_COLLAPSE [generic] | Detectado colapso de hierarquia visual em 1 bloco(s). | section.grid.min-w-0 (heading=20px, body=14px, ratio=1.43x, gap=6px)
- /contact -> visual_quality:cluster_collision | VISUAL_CLUSTER_COLLISION [generic] | Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
- /contact -> Contacto | BTN_NO_EFFECT [generic] | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
```

## Prompt Rapido Do Assistente

```text
Atue como engenheiro de software senior com foco em execucao rapida e causa raiz.
Total de issues: 15.
Ordem de ataque: high -> medium -> low.
Nao aceitar fix cosmetico: cada problema precisa de evidencia de resolucao.

Top issues para iniciar:
1. [VISUAL_CLUSTER_COLLISION] (medium) /demo -> visual_quality:cluster_collision | Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
2. [VISUAL_CLUSTER_COLLISION] (medium) /faq -> visual_quality:cluster_collision | Detectada colisao entre clusters laterais em 2 par(es) de blocos. | article#docs.panel.min-w-0 x article#security.panel.min-w-0 (gap=16px, overlap=1) ; article#security.panel.min-w-0 x article#privacy.panel.min-w-0 (gap=16px, overlap=1)
3. [VISUAL_CLUSTER_COLLISION] (medium) /contact -> visual_quality:cluster_collision | Detectada colisao entre clusters laterais em 1 par(es) de blocos. | article.panel.min-w-0 x article.panel.min-w-0 (gap=16px, overlap=1)
4. [VISUAL_TIGHT_SPACING] (medium) /downloads -> visual_quality:tight_spacing | Espacamento apertado em 2 transicao(oes) na rota /downloads (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=miolo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
5. [BTN_NO_EFFECT] (low) /demo -> Ver demo | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
6. [BTN_NO_EFFECT] (low) /demo -> Demo | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
7. [BTN_NO_EFFECT] (low) /downloads -> Descargar | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).
8. [BTN_NO_EFFECT] (low) /downloads -> Instaladores | Clique sem efeito observavel (URL, DOM, request, dialog, scroll).

SEO (obrigatorio):
Atue como especialista SEO senior com foco em causa raiz e impacto real no ranking.
Site auditado: https://site-pulse-qa.vercel.app/es
Score SEO atual: 93/100.
Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.

Checklist SEO pendente (explicacao para leigos + acao):
1. Meta description clara (70-170) | por que importa: Ajuda a pessoa entender a pagina antes de clicar. | o que fazer: Crie descricao objetiva com beneficio real e chamada para acao.
2. Schema JSON-LD (LocalBusiness/Service/FAQ) | por que importa: Aumenta chance de rich results no Google. | o que fazer: Adicione dados estruturados validos por pagina.

Issues SEO detectadas:
1. [SEO_META_DESCRIPTION_LENGTH] (medium) Meta description com 56 caracteres (ideal: 70-170). | recomendacao: Ajuste o tamanho da meta description para evitar corte no resultado de busca.
2. [SEO_STRUCTURED_DATA_MISSING] (low) Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.

Entrega obrigatoria:
- listar arquivos alterados e motivo de cada alteracao
- mostrar antes/depois dos metadados principais
- validar novamente e comprovar melhoria de score

Comando de revalidacao: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\sitepulse-es-full.json" --fresh --live-log --human-log --scope "full" --no-server
```
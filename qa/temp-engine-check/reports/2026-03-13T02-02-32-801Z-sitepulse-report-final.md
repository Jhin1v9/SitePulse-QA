# SitePulse QA Report

- Projeto: sitepulse-default-desktop-audit
- Inicio: 2026-03-13T01:59:54.779Z
- Fim: 2026-03-13T02:02:32.800Z
- Base URL: http://127.0.0.1:3110
- Viewport: 1536x864
- Execucao pausada: nao
- Retomado de checkpoint: nao

## Resumo

- Rotas verificadas: 6
- Falhas de carga de rota: 0
- Botoes verificados: 121
- Acoes mapeadas (detalhadas): 121
- Acoes com efeito: 104
- Acoes sem efeito detectado: 0
- Acoes com erro de clique: 0
- Acoes em modo analise (sem clique): 0
- Botoes sem efeito: 0
- Erros HTTP 4xx: 0
- Erros HTTP 5xx: 0
- Erros de rede: 0
- Erros JS runtime: 0
- Console errors: 0
- Ordem visual invalida: 0
- Secao obrigatoria ausente/invisivel: 0
- SEO score: 100/100
- SEO paginas analisadas: 6
- SEO issues criticas: 0
- SEO issues totais: 0
- Total issues: 1

## Guia Rapido Para Assistente

- Status: issues_found
- Replay command: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\sitepulse-local-es-full.json" --fresh --live-log --human-log --scope "full" --no-server
- Passo: Corrigir primeiro erros high (runtime/5xx/ordem visual).
- Passo: Depois tratar medium (clicks falhos/rede/secoes ausentes).
- Passo: Finalizar com low e ruido de console.
- Passo: Atacar checklist SEO pendente antes da revalidacao final.
- Passo: Reexecutar auditoria completa e confirmar totalIssues=0.
- Rotas prioritarias:
  - /faq: total=1 high=0 medium=1 low=0

## Explicacao Para Leigos

- [VISUAL_TIGHT_SPACING] 1 ocorrencia(s)
  - O que isso significa: Partes grandes da tela ficaram grudadas demais, como se faltasse respiro entre os blocos.
  - O que fazer: Aumentar espacamento vertical entre secoes/cards principais, revisar margins e garantir uma hierarquia visual com respiracao consistente.

## Inteligencia De Erros

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

- SEO score geral: 100/100
- Paginas analisadas: 6
- Score por categoria: tecnico=100, conteudo=100, acessibilidade=100
- Sem issues SEO relevantes nesta rodada.
- Checklist SEO base:
  - [ok] Title unico e com tamanho ideal (30-65) | E o texto principal que aparece no Google.
  - [ok] Meta description clara (70-170) | Ajuda a pessoa entender a pagina antes de clicar.
  - [ok] Estrutura de headings com 1 H1 | Organiza o tema principal da pagina para Google e usuarios.
  - [ok] HTML com lang e viewport mobile | Melhora indexacao correta por idioma e experiencia em celular.
  - [ok] Canonical definido | Evita conteudo duplicado em URLs diferentes.
  - [ok] Pagina indexavel (sem noindex indevido) | Sem isso o Google pode ignorar paginas importantes.
  - [ok] Imagens com alt descritivo | Ajuda SEO de imagem e acessibilidade.
  - [ok] Schema JSON-LD (LocalBusiness/Service/FAQ) | Aumenta chance de rich results no Google.
  - [ok] Conteudo util e suficiente | Paginas rasas tendem a ranquear pior.
  - [ok] Links internos entre paginas | Ajuda rastreamento e distribuicao de autoridade.
  - [ok] Meta social (Open Graph + Twitter Card) | Melhora compartilhamento e CTR em redes sociais.
  - [ok] Meta robots presente e coerente | Define como bots devem indexar/seguir links.
- Prompt recomendado para corrigir SEO:
```
Atue como especialista SEO tecnico e de conteudo.
Site auditado: http://127.0.0.1:3110
Score atual: 100/100.
Nao ha gaps SEO relevantes nesta rodada.
Objetivo: manter baseline, evitar regressao e monitorar periodicamente.
```

## Issues

- [VISUAL_TIGHT_SPACING] (medium) /faq -> visual_quality:tight_spacing: Espacamento apertado em 3 transicao(oes) na rota /faq (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 3. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-fullpage.png
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
Rota: /faq
Acao: visual_quality:tight_spacing
URL: http://localhost:3110/es/faq
Detalhe observado: Espacamento apertado em 3 transicao(oes) na rota /faq (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 3. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
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
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-context.png
- article.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-focus.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-fullpage.png

## Prompts De Correcao Por Issue

### 794015b44289 | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /faq
Acao: visual_quality:tight_spacing
URL: http://localhost:3110/es/faq
Detalhe observado: Espacamento apertado em 3 transicao(oes) na rota /faq (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 3. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
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
- article.panel.min-w-0 context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-context.png
- article.panel.min-w-0 focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-focus.png
- article.panel.min-w-0 full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\reports\visual-evidence\2026-03-13T02-01-46-558Z-faq-visual-tight-spacing-article-panel-min-w-0-fullpage.png
```


## Prompt Master

```text
Atue como engenheiro de software senior e corrija todas as issues listadas abaixo com foco em causa raiz.

Nao aplique correcoes cosmeticas. Garanta comportamento funcional correto em desktop e mobile.

Exigencias minimas: sem botao sem efeito, sem callback solto, sem erro fetch sem feedback, sem 4xx/5xx inesperado no fluxo principal e sem ordem de secoes quebrada.

Workflow obrigatorio: reproduzir, identificar causa raiz, corrigir com menor impacto, validar novamente via auditor.

Entregue ao final: codigo corrigido, resumo da causa raiz por categoria e evidencias de revalidacao.

Corrija as inconsistencias de composicao visual da interface.
O objetivo e padronizar respiro, alinhamento, camadas e ritmo visual entre blocos importantes.
Ocorrencias:
- /faq -> VISUAL_TIGHT_SPACING: Espacamento apertado em 3 transicao(oes) na rota /faq (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 3. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.

Use a classificacao inteligente para atacar causa raiz de fetch/network/http/runtime.
Para cada item: confirmar causa, aplicar fix robusto e validar com replay da auditoria.
Diagnosticos capturados:
- /faq -> visual_quality:tight_spacing | VISUAL_TIGHT_SPACING [generic] | Espacamento apertado em 3 transicao(oes) na rota /faq (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 3. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.
```

## Prompt Rapido Do Assistente

```text
Atue como engenheiro de software senior com foco em execucao rapida e causa raiz.
Total de issues: 1.
Ordem de ataque: high -> medium -> low.
Nao aceitar fix cosmetico: cada problema precisa de evidencia de resolucao.

Top issues para iniciar:
1. [VISUAL_TIGHT_SPACING] (medium) /faq -> visual_quality:tight_spacing | Espacamento apertado em 3 transicao(oes) na rota /faq (viewport 1536x864). | 1. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 2. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). ; 3. bloco "min w 0" ficou muito perto de bloco "min w 0" (distancia=16px, largura compartilhada=100%, regiao=topo da pagina). | Leitura humana: os blocos quase se grudam, o olho nao encontra respiracao e a pagina parece comprimida.

SEO (obrigatorio):
Atue como especialista SEO tecnico e de conteudo.
Site auditado: http://127.0.0.1:3110
Score atual: 100/100.
Nao ha gaps SEO relevantes nesta rodada.
Objetivo: manter baseline, evitar regressao e monitorar periodicamente.

Comando de revalidacao: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\sitepulse-local-es-full.json" --fresh --live-log --human-log --scope "full" --no-server
```
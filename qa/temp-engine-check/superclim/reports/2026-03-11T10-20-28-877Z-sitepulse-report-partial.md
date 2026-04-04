# SitePulse QA Report

- Projeto: sitepulse-default-desktop-audit
- Inicio: 2026-03-11T10:17:28.487Z
- Fim: 2026-03-11T10:20:28.877Z
- Base URL: https://superclim.es
- Viewport: 1536x864
- Execucao pausada: sim
- Retomado de checkpoint: nao

## Resumo

- Rotas verificadas: 7
- Falhas de carga de rota: 0
- Botoes verificados: 105
- Acoes mapeadas (detalhadas): 94
- Acoes com efeito: 94
- Acoes sem efeito detectado: 0
- Acoes com erro de clique: 0
- Acoes em modo analise (sem clique): 0
- Botoes sem efeito: 0
- Erros HTTP 4xx: 0
- Erros HTTP 5xx: 0
- Erros de rede: 0
- Erros JS runtime: 19
- Console errors: 2
- Ordem visual invalida: 0
- Secao obrigatoria ausente/invisivel: 0
- SEO score: 82/100
- SEO paginas analisadas: 7
- SEO issues criticas: 0
- SEO issues totais: 7
- Total issues: 55

## Guia Rapido Para Assistente

- Status: issues_found
- Replay command: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim.json" --fresh --live-log --human-log --scope "full" --no-server
- Passo: Corrigir primeiro erros high (runtime/5xx/ordem visual).
- Passo: Depois tratar medium (clicks falhos/rede/secoes ausentes).
- Passo: Finalizar com low e ruido de console.
- Passo: Atacar checklist SEO pendente antes da revalidacao final.
- Passo: Reexecutar auditoria completa e confirmar totalIssues=0.
- Rotas prioritarias:
  - /: total=13 high=6 medium=3 low=4
  - /servicios: total=11 high=5 medium=2 low=4
  - /servicios/limpieza-de-sofas-barcelona: total=7 high=2 medium=2 low=3
  - /servicios/limpieza-de-sofa-sabadell: total=7 high=2 medium=2 low=3
  - /servicios/limpieza-de-sofas-terrassa: total=7 high=2 medium=2 low=3
  - /servicios/limpieza-de-sofa-cerdanyola: total=6 high=2 medium=2 low=2
  - /servicios/limpieza-de-sofas-sant-cugat: total=4 high=0 medium=2 low=2

## Explicacao Para Leigos

- [VISUAL_LAYOUT_OVERFLOW] 1 ocorrencia(s)
  - O que isso significa: Parte da interface esta saindo para fora da tela ou ficando espremida de um jeito errado.
  - O que fazer: Revisar widths/min-widths, containers, imagens e widgets fixos para impedir overflow horizontal e manter o layout dentro do viewport.
- [VISUAL_ALIGNMENT_DRIFT] 7 ocorrencia(s)
  - O que isso significa: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - O que fazer: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
- [VISUAL_TIGHT_SPACING] 7 ocorrencia(s)
  - O que isso significa: Partes grandes da tela ficaram grudadas demais, como se faltasse respiro entre os blocos.
  - O que fazer: Aumentar espacamento vertical entre secoes/cards principais, revisar margins e garantir uma hierarquia visual com respiracao consistente.
- [VISUAL_GAP_INCONSISTENCY] 1 ocorrencia(s)
  - O que isso significa: A distancia entre partes parecidas da tela muda demais e a pagina fica visualmente sem padrao.
  - O que fazer: Padronizar a escala de espacamento entre secoes equivalentes e remover gaps isolados que deixam a composicao irregular.
- [VISUAL_WIDTH_INCONSISTENCY] 7 ocorrencia(s)
  - O que isso significa: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - O que fazer: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
- [VISUAL_BOUNDARY_COLLISION] 7 ocorrencia(s)
  - O que isso significa: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - O que fazer: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
- [VISUAL_HIERARCHY_COLLAPSE] 4 ocorrencia(s)
  - O que isso significa: O titulo e o texto ficaram parecidos demais. Isso enfraquece a leitura e dificulta entender o que e principal.
  - O que fazer: Aumentar contraste entre heading e corpo: revisar font-size, font-weight, line-height e espacamento para reforcar a hierarquia visual.
- [JS_RUNTIME_ERROR] 19 ocorrencia(s)
  - O que isso significa: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - O que fazer: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
- [CONSOLE_ERROR] 2 ocorrencia(s)
  - O que isso significa: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - O que fazer: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.

## Inteligencia De Erros

- [runtime_null_undefined_access] Acesso invalido a null/undefined -> 19 ocorrencia(s)
- [generic] VISUAL_ALIGNMENT_DRIFT -> 7 ocorrencia(s)
- [generic] VISUAL_BOUNDARY_COLLISION -> 7 ocorrencia(s)
- [generic] VISUAL_TIGHT_SPACING -> 7 ocorrencia(s)
- [generic] VISUAL_WIDTH_INCONSISTENCY -> 7 ocorrencia(s)
- [generic] VISUAL_HIERARCHY_COLLAPSE -> 4 ocorrencia(s)
- [runtime_unknown] Erro no console do navegador -> 2 ocorrencia(s)
- [generic] VISUAL_GAP_INCONSISTENCY -> 1 ocorrencia(s)
- [generic] VISUAL_LAYOUT_OVERFLOW -> 1 ocorrencia(s)

## Progresso

- Proxima rota indice: 6
- Proximo botao indice: 3
- Segmentos executados: 1

## Mapa De Acoes (Botoes/Menu/Links)

- [clicked_effect] / -> Home (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, houve requisicao de rede.
  - Destino/href: https://superclim.es
- [clicked_effect] / -> Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /servicios/.
  - Destino/href: /servicios.html
- [clicked_effect] / -> Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /limpieza-de-sofas/.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] / -> Más Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /mas-servicios/.
  - Destino/href: /mas-servicios.html
- [clicked_effect] / -> Limpieza de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /limpieza-de-alfombras/.
  - Destino/href: /limpieza-de-alfombras.html
- [clicked_effect] / -> Impermeabilización de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] / -> Ver Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /.
  - Destino/href: #servicios
- [clicked_effect] / -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /limpieza-de-sofas/.
  - Destino/href: https://superclim.es/limpieza-de-sofas/
- [clicked_effect] / -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /limpieza-de-alfombras/.
  - Destino/href: https://superclim.es/limpieza-de-alfombras/
- [clicked_effect] / -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /impermeabilizacion-de-sofas.
  - Destino/href: https://superclim.es/impermeabilizacion-de-sofas
- [clicked_effect] / -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /limpieza-de-sofas/limpieza-de-sofas-a-domicilio.
  - Destino/href: https://superclim.es/limpieza-de-sofas/limpieza-de-sofas-a-domicilio
- [clicked_effect] / -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /limpieza-de-sofas/limpieza-de-sillones.
  - Destino/href: https://superclim.es/limpieza-de-sofas/limpieza-de-sillones
- [clicked_effect] / -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /mas-servicios/.
  - Destino/href: https://superclim.es/mas-servicios/
- [clicked_effect] / -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /quienes-somos.
  - Destino/href: /quienes-somos.html
- [clicked_effect] / -> Anterior (button)
  - Funcao esperada: Navegacao entre secoes/etapas
  - Explicacao para leigo: Permite avancar ou voltar no fluxo de leitura.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
- [clicked_effect] / -> Próximo (button)
  - Funcao esperada: Navegacao entre secoes/etapas
  - Explicacao para leigo: Permite avancar ou voltar no fluxo de leitura.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
- [clicked_effect] / -> Quienes Somos (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /quienes-somos.
  - Destino/href: /quienes-somos.html
- [clicked_effect] / -> Limpieza de colchones (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /mas-servicios/.
  - Destino/href: /mas-servicios.html
- [clicked_effect] / -> Restauración de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /restauracion-de-alfombras.
  - Destino/href: /restauracion-de-alfombras.html
- [clicked_effect] / -> Blindage de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] / -> Limpieza de Muebles en Cuero (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /restauracion-de-alfombras.
  - Destino/href: /restauracion-de-alfombras.html
- [clicked_effect] / -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de / para /contacto.
  - Destino/href: /contacto.html
- [clicked_effect] / -> Política de Privacidad (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de / para /.
  - Destino/href: #
- [clicked_effect] /servicios -> Home (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /.
  - Destino/href: https://superclim.es
- [clicked_effect] /servicios -> Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, houve requisicao de rede.
  - Destino/href: /servicios.html
- [clicked_effect] /servicios -> Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /limpieza-de-sofas/.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios -> Más Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /mas-servicios/.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios -> Limpieza de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /limpieza-de-alfombras/.
  - Destino/href: /limpieza-de-alfombras.html
- [clicked_effect] /servicios -> Impermeabilización de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /limpieza-de-sofas/.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /limpieza-de-alfombras/.
  - Destino/href: /limpieza-de-alfombras.html
- [clicked_effect] /servicios -> Saber Más (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /mas-servicios/.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios -> Quienes Somos (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /quienes-somos.
  - Destino/href: /quienes-somos.html
- [clicked_effect] /servicios -> Limpieza de colchones (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /mas-servicios/.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios -> Restauración de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /restauracion-de-alfombras.
  - Destino/href: /restauracion-de-alfombras.html
- [clicked_effect] /servicios -> Blindage de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios -> Limpieza de Muebles en Cuero (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/ para /limpieza-de-muebles-en-cuero.
  - Destino/href: /limpieza-de-muebles-en-cuero.html
- [clicked_effect] /servicios -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /servicios/ para /contacto.
  - Destino/href: /contacto.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Home (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /.
  - Destino/href: https://superclim.es
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /servicios/.
  - Destino/href: /servicios.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Más Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Limpieza de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /limpieza-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Impermeabilización de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Volver a Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /contacto.
  - Destino/href: /contacto.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Quienes Somos (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /quienes-somos.
  - Destino/href: /quienes-somos.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Limpieza de colchones (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Restauración de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /restauracion-de-alfombras.
  - Destino/href: /restauracion-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Blindage de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-barcelona -> Limpieza de Muebles en Cuero (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-barcelona para /limpieza-de-muebles-en-cuero.
  - Destino/href: /limpieza-de-muebles-en-cuero.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Home (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /.
  - Destino/href: https://superclim.es
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /servicios/.
  - Destino/href: /servicios.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Más Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Limpieza de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /limpieza-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Impermeabilización de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Volver a Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /contacto.
  - Destino/href: /contacto.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Quienes Somos (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /quienes-somos.
  - Destino/href: /quienes-somos.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Limpieza de colchones (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Restauración de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /restauracion-de-alfombras.
  - Destino/href: /restauracion-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Blindage de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-sabadell -> Limpieza de Muebles en Cuero (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-sabadell para /limpieza-de-muebles-en-cuero.
  - Destino/href: /limpieza-de-muebles-en-cuero.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /servicios/.
  - Destino/href: /servicios.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Más Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Limpieza de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /limpieza-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Impermeabilización de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Volver a Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /contacto.
  - Destino/href: /contacto.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Home (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /.
  - Destino/href: https://superclim.es
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Quienes Somos (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /quienes-somos.
  - Destino/href: /quienes-somos.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Limpieza de colchones (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Restauración de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /restauracion-de-alfombras.
  - Destino/href: /restauracion-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Blindage de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofa-cerdanyola -> Limpieza de Muebles en Cuero (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofa-cerdanyola para /limpieza-de-muebles-en-cuero.
  - Destino/href: /limpieza-de-muebles-en-cuero.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Home (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /.
  - Destino/href: https://superclim.es
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /servicios/.
  - Destino/href: /servicios.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Más Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Limpieza de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou.
  - Destino/href: /limpieza-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Impermeabilización de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Volver a Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /limpieza-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Contacto (link)
  - Funcao esperada: Levar para canal de contato
  - Explicacao para leigo: Conduz o visitante para falar com a empresa.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /contacto.
  - Destino/href: /contacto.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Quienes Somos (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /quienes-somos.
  - Destino/href: /quienes-somos.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Limpieza de colchones (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Acao executada na mesma pagina com efeito: conteudo da pagina mudou, rolagem mudou.
  - Destino/href: /mas-servicios.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Restauración de Alfombras (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /restauracion-de-alfombras.
  - Destino/href: /restauracion-de-alfombras.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Blindage de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /impermeabilizacion-de-sofas.
  - Destino/href: /impermeabilizacion-de-sofas.html
- [clicked_effect] /servicios/limpieza-de-sofas-terrassa -> Limpieza de Muebles en Cuero (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-terrassa para /limpieza-de-muebles-en-cuero.
  - Destino/href: /limpieza-de-muebles-en-cuero.html
- [clicked_effect] /servicios/limpieza-de-sofas-sant-cugat -> Home (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-sant-cugat para /.
  - Destino/href: https://superclim.es
- [clicked_effect] /servicios/limpieza-de-sofas-sant-cugat -> Servicios (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-sant-cugat para /servicios/.
  - Destino/href: /servicios.html
- [clicked_effect] /servicios/limpieza-de-sofas-sant-cugat -> Limpieza de Sofás (link)
  - Funcao esperada: Navegar para outra pagina
  - Explicacao para leigo: Leva o visitante para outra parte do site.
  - Funcao executada: Navegou de /servicios/limpieza-de-sofas-sant-cugat para /limpieza-de-sofas/.
  - Destino/href: /limpieza-de-sofas.html

## Analise SEO

- SEO score geral: 82/100
- Paginas analisadas: 7
- Score por categoria: tecnico=95, conteudo=87, acessibilidade=100
- Principais pontos SEO:
  - [medium] SEO_OPEN_GRAPH_INCOMPLETE (6x): Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
  - [medium] SEO_META_DESCRIPTION_LENGTH (3x): Meta description com 188 caracteres (ideal: 70-170). | recomendacao: Ajuste o tamanho da meta description para evitar corte no resultado de busca.
  - [medium] SEO_TITLE_LENGTH (2x): Title com 100 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
  - [medium] SEO_H1_MULTIPLE (1x): 3 H1 encontrados (ideal: 1). | recomendacao: Mantenha um unico H1 para reforcar hierarquia semantica.
  - [low] SEO_TWITTER_CARD_MISSING (7x): Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.
  - [low] SEO_META_ROBOTS_MISSING (5x): Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
  - [low] SEO_STRUCTURED_DATA_MISSING (5x): Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.
- Checklist SEO base:
  - [missing] Title unico e com tamanho ideal (30-65) | E o texto principal que aparece no Google.
  - [missing] Meta description clara (70-170) | Ajuda a pessoa entender a pagina antes de clicar.
  - [missing] Estrutura de headings com 1 H1 | Organiza o tema principal da pagina para Google e usuarios.
  - [ok] HTML com lang e viewport mobile | Melhora indexacao correta por idioma e experiencia em celular.
  - [ok] Canonical definido | Evita conteudo duplicado em URLs diferentes.
  - [ok] Pagina indexavel (sem noindex indevido) | Sem isso o Google pode ignorar paginas importantes.
  - [ok] Imagens com alt descritivo | Ajuda SEO de imagem e acessibilidade.
  - [missing] Schema JSON-LD (LocalBusiness/Service/FAQ) | Aumenta chance de rich results no Google.
  - [ok] Conteudo util e suficiente | Paginas rasas tendem a ranquear pior.
  - [ok] Links internos entre paginas | Ajuda rastreamento e distribuicao de autoridade.
  - [missing] Meta social (Open Graph + Twitter Card) | Melhora compartilhamento e CTR em redes sociais.
  - [missing] Meta robots presente e coerente | Define como bots devem indexar/seguir links.
- Prompt recomendado para corrigir SEO:
```
Atue como especialista SEO senior com foco em causa raiz e impacto real no ranking.
Site auditado: https://superclim.es
Score SEO atual: 82/100.
Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.

Checklist SEO pendente (explicacao para leigos + acao):
1. Title unico e com tamanho ideal (30-65) | por que importa: E o texto principal que aparece no Google. | o que fazer: Defina um title unico por pagina com foco na intencao do usuario.
2. Meta description clara (70-170) | por que importa: Ajuda a pessoa entender a pagina antes de clicar. | o que fazer: Crie descricao objetiva com beneficio real e chamada para acao.
3. Estrutura de headings com 1 H1 | por que importa: Organiza o tema principal da pagina para Google e usuarios. | o que fazer: Mantenha apenas um H1 claro e use H2/H3 para secoes.
4. Schema JSON-LD (LocalBusiness/Service/FAQ) | por que importa: Aumenta chance de rich results no Google. | o que fazer: Adicione dados estruturados validos por pagina.
5. Meta social (Open Graph + Twitter Card) | por que importa: Melhora compartilhamento e CTR em redes sociais. | o que fazer: Complete og:title, og:description, og:image, og:type e twitter:card.
6. Meta robots presente e coerente | por que importa: Define como bots devem indexar/seguir links. | o que fazer: Defina meta robots adequada para cada tipo de pagina.

Issues SEO detectadas:
1. [SEO_OPEN_GRAPH_INCOMPLETE] (medium) Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
2. [SEO_META_DESCRIPTION_LENGTH] (medium) Meta description com 188 caracteres (ideal: 70-170). | recomendacao: Ajuste o tamanho da meta description para evitar corte no resultado de busca.
3. [SEO_TITLE_LENGTH] (medium) Title com 100 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
4. [SEO_H1_MULTIPLE] (medium) 3 H1 encontrados (ideal: 1). | recomendacao: Mantenha um unico H1 para reforcar hierarquia semantica.
5. [SEO_TWITTER_CARD_MISSING] (low) Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.
6. [SEO_META_ROBOTS_MISSING] (low) Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
7. [SEO_STRUCTURED_DATA_MISSING] (low) Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.

Entrega obrigatoria:
- listar arquivos alterados e motivo de cada alteracao
- mostrar antes/depois dos metadados principais
- validar novamente e comprovar melhoria de score
```

## Issues

- [VISUAL_LAYOUT_OVERFLOW] (medium) / -> visual_quality:overflow: Detectado overflow visual em 6 bloco(s). | div.swiper-slide.swiper-slide-next (right, delta=292px, rect=1128-1828) ; img (right, delta=92px, rect=1328-1628) ; div.swiper-slide (right, delta=1002px, rect=1838-2538)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-31-546Z-home-visual-layout-overflow-div-swiper-slide-swiper-slide-next-fullpage.png
  - Classificacao: VISUAL_LAYOUT_OVERFLOW [generic]
  - Tecnico: Um bloco visual excedeu a largura util do viewport e esta vazando horizontalmente ou cortando a composicao.
  - Leigo: Parte da interface esta saindo para fora da tela ou ficando espremida de um jeito errado.
  - Resolucao recomendada: Revisar widths/min-widths, containers, imagens e widgets fixos para impedir overflow horizontal e manter o layout dentro do viewport.
  - Prioridade de ataque: P1
  - Checks iniciais: Identificar qual bloco esta ultrapassando o viewport horizontal ou verticalmente. | Revisar widths fixos, translateX, negative margins e wrappers sem max-width. | Confirmar que containers com carrossel ou grid tratam overflow sem empurrar o layout.
  - Comandos sugeridos: rg -n "overflow|max-width|min-width|translateX|margin-left|margin-right|100vw|calc\(" src || rg -n "carousel|slider|marquee|grid-cols|flex-nowrap|whitespace-nowrap" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_LAYOUT_OVERFLOW] (medium)
Rota: /
Acao: visual_quality:overflow
URL: https://superclim.es/
Detalhe observado: Detectado overflow visual em 6 bloco(s). | div.swiper-slide.swiper-slide-next (right, delta=292px, rect=1128-1828) ; img (right, delta=92px, rect=1328-1628) ; div.swiper-slide (right, delta=1002px, rect=1838-2538)
Explicacao tecnica: Um bloco visual excedeu a largura util do viewport e esta vazando horizontalmente ou cortando a composicao.
Resolucao recomendada: Revisar widths/min-widths, containers, imagens e widgets fixos para impedir overflow horizontal e manter o layout dentro do viewport.
Classificacao inteligente: VISUAL_LAYOUT_OVERFLOW (generic)

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
- div.swiper-slide.swiper-slide-next full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-31-546Z-home-visual-layout-overflow-div-swiper-slide-swiper-slide-next-fullpage.png
- [VISUAL_ALIGNMENT_DRIFT] (low) / -> visual_quality:alignment: Detectado drift de alinhamento em 3 bloco(s) principais. | Baseline left=0px. | header (left=198px, drift=198px) ; section.hero (left=198px, drift=198px) ; section.masterhead (left=198px, drift=198px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-fullpage.png
  - Classificacao: VISUAL_ALIGNMENT_DRIFT [generic]
  - Tecnico: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
  - Leigo: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar alinhamento horizontal dos blocos principais ao longo da pagina. | Padronizar container, gutters e max-width entre secoes equivalentes. | Remover deslocamentos isolados que quebram a coluna principal.
  - Comandos sugeridos: rg -n "container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:" src || rg -n "section|wrapper|content|shell|layout" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /
Acao: visual_quality:alignment
URL: https://superclim.es/
Detalhe observado: Detectado drift de alinhamento em 3 bloco(s) principais. | Baseline left=0px. | header (left=198px, drift=198px) ; section.hero (left=198px, drift=198px) ; section.masterhead (left=198px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-fullpage.png
- [VISUAL_TIGHT_SPACING] (medium) / -> visual_quality:tight_spacing: Detectado espacamento apertado em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px) ; section#servicios.services -> section#more-services.services (gap=0px) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-37-495Z-home-visual-tight-spacing-section-masterhead-fullpage.png
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
Rota: /
Acao: visual_quality:tight_spacing
URL: https://superclim.es/
Detalhe observado: Detectado espacamento apertado em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px) ; section#servicios.services -> section#more-services.services (gap=0px) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px)
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
- section.masterhead full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-37-495Z-home-visual-tight-spacing-section-masterhead-fullpage.png
- [VISUAL_GAP_INCONSISTENCY] (low) / -> visual_quality:gap_inconsistency: Detectada inconsistencia de espacamento em 6 transicao(oes) visuais. | header -> section.hero (gap=640px, baseline=78px, drift=562px, too_loose) ; section.gallery-custom -> section.masterhead (gap=30px, baseline=78px, drift=48px, too_tight) ; section.masterhead -> section#servicios.services (gap=0px, baseline=78px, drift=78px, too_tight)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-fullpage.png
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
Rota: /
Acao: visual_quality:gap_inconsistency
URL: https://superclim.es/
Detalhe observado: Detectada inconsistencia de espacamento em 6 transicao(oes) visuais. | header -> section.hero (gap=640px, baseline=78px, drift=562px, too_loose) ; section.gallery-custom -> section.masterhead (gap=30px, baseline=78px, drift=48px, too_tight) ; section.masterhead -> section#servicios.services (gap=0px, baseline=78px, drift=78px, too_tight)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-fullpage.png
- [VISUAL_WIDTH_INCONSISTENCY] (low) / -> visual_quality:width_inconsistency: Detectada largura inconsistente em 6 bloco(s) principais. | section.gallery-custom (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#servicios.services (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#more-services.services (width=1536px, baseline=1140px, drift=396px, too_wide)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-42-336Z-home-visual-width-inconsistency-section-gallery-custom-fullpage.png
  - Classificacao: VISUAL_WIDTH_INCONSISTENCY [generic]
  - Tecnico: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
  - Leigo: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural. | Padronizar max-width e largura util entre sections irmas. | Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.
  - Comandos sugeridos: rg -n "max-width|min-width|width:|w-\[|w-full|container|content|max-w-" src || rg -n "section|panel|card|wrapper|content|shell" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/
Detalhe observado: Detectada largura inconsistente em 6 bloco(s) principais. | section.gallery-custom (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#servicios.services (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#more-services.services (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- section.gallery-custom full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-42-336Z-home-visual-width-inconsistency-section-gallery-custom-fullpage.png
- [VISUAL_BOUNDARY_COLLISION] (medium) / -> visual_quality:boundary_collision: Detectada colisao de borda em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px, shared=1) ; section#servicios.services -> section#more-services.services (gap=0px, shared=1) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px, shared=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-44-010Z-home-visual-boundary-collision-section-masterhead-fullpage.png
  - Classificacao: VISUAL_BOUNDARY_COLLISION [generic]
  - Tecnico: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
  - Leigo: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual. | Revisar bordas, dividers, margins e paddings que deixam blocos encostados. | Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.
  - Comandos sugeridos: rg -n "border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /
Acao: visual_quality:boundary_collision
URL: https://superclim.es/
Detalhe observado: Detectada colisao de borda em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px, shared=1) ; section#servicios.services -> section#more-services.services (gap=0px, shared=1) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- section.masterhead full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-44-010Z-home-visual-boundary-collision-section-masterhead-fullpage.png
- [VISUAL_HIERARCHY_COLLAPSE] (low) / -> visual_quality:hierarchy_collapse: Detectado colapso de hierarquia visual em 1 bloco(s). | section.masterhead (heading=22px, body=16px, ratio=1.38x, gap=6px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-45-716Z-home-visual-hierarchy-collapse-section-masterhead-fullpage.png
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
Rota: /
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.masterhead (heading=22px, body=16px, ratio=1.38x, gap=6px)
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
- section.masterhead full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-45-716Z-home-visual-hierarchy-collapse-section-masterhead-fullpage.png
- [JS_RUNTIME_ERROR] (high) / -> Más Servicios: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Más Servicios
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) / -> Saber Más: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Saber Más
URL: https://superclim.es/limpieza-de-sofas/limpieza-de-sofas-a-domicilio
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) / -> Quienes Somos: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) / -> Limpieza de colchones: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Limpieza de colchones
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) / -> Restauración de Alfombras: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) / -> Limpieza de Muebles en Cuero: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Limpieza de Muebles en Cuero
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [VISUAL_ALIGNMENT_DRIFT] (low) /servicios -> visual_quality:alignment: Detectado drift de alinhamento em 2 bloco(s) principais. | Baseline left=198px. | section#introduccion-servicios.intro-services (left=0px, drift=198px) ; footer.footer (left=0px, drift=198px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-fullpage.png
  - Classificacao: VISUAL_ALIGNMENT_DRIFT [generic]
  - Tecnico: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
  - Leigo: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar alinhamento horizontal dos blocos principais ao longo da pagina. | Padronizar container, gutters e max-width entre secoes equivalentes. | Remover deslocamentos isolados que quebram a coluna principal.
  - Comandos sugeridos: rg -n "container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:" src || rg -n "section|wrapper|content|shell|layout" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/
Detalhe observado: Detectado drift de alinhamento em 2 bloco(s) principais. | Baseline left=198px. | section#introduccion-servicios.intro-services (left=0px, drift=198px) ; footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- section#introduccion-servicios.intro-services context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-context.png
- section#introduccion-servicios.intro-services focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-focus.png
- section#introduccion-servicios.intro-services full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-fullpage.png
- [VISUAL_TIGHT_SPACING] (medium) /servicios -> visual_quality:tight_spacing: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-fullpage.png
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
Rota: /servicios
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-fullpage.png
- [VISUAL_WIDTH_INCONSISTENCY] (low) /servicios -> visual_quality:width_inconsistency: Detectada largura inconsistente em 2 bloco(s) principais. | section#introduccion-servicios.intro-services (width=1536px, baseline=1140px, drift=396px, too_wide) ; footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-fullpage.png
  - Classificacao: VISUAL_WIDTH_INCONSISTENCY [generic]
  - Tecnico: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
  - Leigo: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural. | Padronizar max-width e largura util entre sections irmas. | Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.
  - Comandos sugeridos: rg -n "max-width|min-width|width:|w-\[|w-full|container|content|max-w-" src || rg -n "section|panel|card|wrapper|content|shell" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/
Detalhe observado: Detectada largura inconsistente em 2 bloco(s) principais. | section#introduccion-servicios.intro-services (width=1536px, baseline=1140px, drift=396px, too_wide) ; footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- section#introduccion-servicios.intro-services context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-context.png
- section#introduccion-servicios.intro-services focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-focus.png
- section#introduccion-servicios.intro-services full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-fullpage.png
- [VISUAL_BOUNDARY_COLLISION] (medium) /servicios -> visual_quality:boundary_collision: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px, shared=1) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px, shared=1) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px, shared=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-fullpage.png
  - Classificacao: VISUAL_BOUNDARY_COLLISION [generic]
  - Tecnico: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
  - Leigo: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual. | Revisar bordas, dividers, margins e paddings que deixam blocos encostados. | Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.
  - Comandos sugeridos: rg -n "border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px, shared=1) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px, shared=1) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-fullpage.png
- [JS_RUNTIME_ERROR] (high) /servicios -> Más Servicios: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Más Servicios
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [CONSOLE_ERROR] (low) /servicios -> Saber Más: Loading the image 'https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=1&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&frm=0&rtg=98061810&slo=0&hlo=1&lst=3&bt=0&ct=3&z=0' violates the following Content Security Policy directive: "img-src 'self' https://www.superclim.es https://superclim.es data:". The action has been blocked.
  - Classificacao: Erro no console do navegador [runtime_unknown]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Erro de runtime/console sem assinatura especifica. | Excecao nao tratada em render ou evento. | Dados inesperados sem validacao defensiva.
  - Acoes recomendadas: Aprimorar tratamento de erro no frontend. | Criar teste de regressao para o fluxo quebrado.
  - Prioridade de ataque: P2
  - Checks iniciais: Usar stack trace para chegar no arquivo/linha. | Adicionar guard clauses no trecho que falha. | Reexecutar fluxo e confirmar ausencia do erro. | Classificar erro: warning ruido vs falha funcional real. | Eliminar erros silenciosos repetitivos. | Confirmar que nao existe regressao apos ajuste.
  - Comandos sugeridos: rg -n "console.error|throw new Error|try\s*\{|catch\s*\(" src/components src/app src/lib || rg -n "console\.error|console\.warn" src || rg -n "catch\s*\(.*\)\s*\{\s*\}" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /servicios
Acao: Saber Más
URL: https://superclim.es/servicios/
Detalhe observado: Loading the image 'https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=1&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&frm=0&rtg=98061810&slo=0&hlo=1&lst=3&bt=0&ct=3&z=0' violates the following Content Security Policy directive: "img-src 'self' https://www.superclim.es https://superclim.es data:". The action has been blocked.
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Erro no console do navegador (runtime_unknown)

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

Causas provaveis detectadas:
- Erro de runtime/console sem assinatura especifica.
- Excecao nao tratada em render ou evento.
- Dados inesperados sem validacao defensiva.

Checks tecnicos sugeridos:
- Usar stack trace para chegar no arquivo/linha.
- Adicionar guard clauses no trecho que falha.
- Reexecutar fluxo e confirmar ausencia do erro.
- [CONSOLE_ERROR] (low) /servicios -> Saber Más: Fetch API cannot load https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=2&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&csp=G-ZDQP8QS1NP;61_1&mde=G-ZDQP8QS1NP;61_1&fin=1&z=0. Refused to connect because it violates the document's Content Security Policy.
  - Classificacao: Erro no console do navegador [runtime_unknown]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Erro de runtime/console sem assinatura especifica. | Excecao nao tratada em render ou evento. | Dados inesperados sem validacao defensiva.
  - Acoes recomendadas: Aprimorar tratamento de erro no frontend. | Criar teste de regressao para o fluxo quebrado.
  - Prioridade de ataque: P2
  - Checks iniciais: Usar stack trace para chegar no arquivo/linha. | Adicionar guard clauses no trecho que falha. | Reexecutar fluxo e confirmar ausencia do erro. | Classificar erro: warning ruido vs falha funcional real. | Eliminar erros silenciosos repetitivos. | Confirmar que nao existe regressao apos ajuste.
  - Comandos sugeridos: rg -n "console.error|throw new Error|try\s*\{|catch\s*\(" src/components src/app src/lib || rg -n "console\.error|console\.warn" src || rg -n "catch\s*\(.*\)\s*\{\s*\}" src
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /servicios
Acao: Saber Más
URL: https://superclim.es/servicios/
Detalhe observado: Fetch API cannot load https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=2&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&csp=G-ZDQP8QS1NP;61_1&mde=G-ZDQP8QS1NP;61_1&fin=1&z=0. Refused to connect because it violates the document's Content Security Policy.
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Erro no console do navegador (runtime_unknown)

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

Causas provaveis detectadas:
- Erro de runtime/console sem assinatura especifica.
- Excecao nao tratada em render ou evento.
- Dados inesperados sem validacao defensiva.

Checks tecnicos sugeridos:
- Usar stack trace para chegar no arquivo/linha.
- Adicionar guard clauses no trecho que falha.
- Reexecutar fluxo e confirmar ausencia do erro.
- [JS_RUNTIME_ERROR] (high) /servicios -> Saber Más: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Saber Más
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) /servicios -> Quienes Somos: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) /servicios -> Limpieza de colchones: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Limpieza de colchones
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) /servicios -> Restauración de Alfombras: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [VISUAL_ALIGNMENT_DRIFT] (low) /servicios/limpieza-de-sofas-barcelona -> visual_quality:alignment: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-30-746Z-servicios-limpieza-de-sofas-barcelona-visual-alignment-drift-footer-footer-fullpage.png
  - Classificacao: VISUAL_ALIGNMENT_DRIFT [generic]
  - Tecnico: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
  - Leigo: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar alinhamento horizontal dos blocos principais ao longo da pagina. | Padronizar container, gutters e max-width entre secoes equivalentes. | Remover deslocamentos isolados que quebram a coluna principal.
  - Comandos sugeridos: rg -n "container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:" src || rg -n "section|wrapper|content|shell|layout" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-30-746Z-servicios-limpieza-de-sofas-barcelona-visual-alignment-drift-footer-footer-fullpage.png
- [VISUAL_TIGHT_SPACING] (medium) /servicios/limpieza-de-sofas-barcelona -> visual_quality:tight_spacing: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-fullpage.png
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
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-fullpage.png
- [VISUAL_WIDTH_INCONSISTENCY] (low) /servicios/limpieza-de-sofas-barcelona -> visual_quality:width_inconsistency: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-32-681Z-servicios-limpieza-de-sofas-barcelona-visual-width-inconsistency-footer-footer-fullpage.png
  - Classificacao: VISUAL_WIDTH_INCONSISTENCY [generic]
  - Tecnico: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
  - Leigo: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural. | Padronizar max-width e largura util entre sections irmas. | Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.
  - Comandos sugeridos: rg -n "max-width|min-width|width:|w-\[|w-full|container|content|max-w-" src || rg -n "section|panel|card|wrapper|content|shell" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-32-681Z-servicios-limpieza-de-sofas-barcelona-visual-width-inconsistency-footer-footer-fullpage.png
- [VISUAL_BOUNDARY_COLLISION] (medium) /servicios/limpieza-de-sofas-barcelona -> visual_quality:boundary_collision: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-fullpage.png
  - Classificacao: VISUAL_BOUNDARY_COLLISION [generic]
  - Tecnico: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
  - Leigo: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual. | Revisar bordas, dividers, margins e paddings que deixam blocos encostados. | Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.
  - Comandos sugeridos: rg -n "border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-fullpage.png
- [VISUAL_HIERARCHY_COLLAPSE] (low) /servicios/limpieza-de-sofas-barcelona -> visual_quality:hierarchy_collapse: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-fullpage.png
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
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
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
- section.hero-page context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-context.png
- section.hero-page focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-focus.png
- section.hero-page full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-fullpage.png
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofas-barcelona -> Quienes Somos: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofas-barcelona -> Restauración de Alfombras: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [VISUAL_ALIGNMENT_DRIFT] (low) /servicios/limpieza-de-sofa-sabadell -> visual_quality:alignment: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-58-741Z-servicios-limpieza-de-sofa-sabadell-visual-alignment-drift-footer-footer-fullpage.png
  - Classificacao: VISUAL_ALIGNMENT_DRIFT [generic]
  - Tecnico: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
  - Leigo: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar alinhamento horizontal dos blocos principais ao longo da pagina. | Padronizar container, gutters e max-width entre secoes equivalentes. | Remover deslocamentos isolados que quebram a coluna principal.
  - Comandos sugeridos: rg -n "container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:" src || rg -n "section|wrapper|content|shell|layout" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-58-741Z-servicios-limpieza-de-sofa-sabadell-visual-alignment-drift-footer-footer-fullpage.png
- [VISUAL_TIGHT_SPACING] (medium) /servicios/limpieza-de-sofa-sabadell -> visual_quality:tight_spacing: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-fullpage.png
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
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-fullpage.png
- [VISUAL_WIDTH_INCONSISTENCY] (low) /servicios/limpieza-de-sofa-sabadell -> visual_quality:width_inconsistency: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-00-781Z-servicios-limpieza-de-sofa-sabadell-visual-width-inconsistency-footer-footer-fullpage.png
  - Classificacao: VISUAL_WIDTH_INCONSISTENCY [generic]
  - Tecnico: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
  - Leigo: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural. | Padronizar max-width e largura util entre sections irmas. | Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.
  - Comandos sugeridos: rg -n "max-width|min-width|width:|w-\[|w-full|container|content|max-w-" src || rg -n "section|panel|card|wrapper|content|shell" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-00-781Z-servicios-limpieza-de-sofa-sabadell-visual-width-inconsistency-footer-footer-fullpage.png
- [VISUAL_BOUNDARY_COLLISION] (medium) /servicios/limpieza-de-sofa-sabadell -> visual_quality:boundary_collision: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-fullpage.png
  - Classificacao: VISUAL_BOUNDARY_COLLISION [generic]
  - Tecnico: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
  - Leigo: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual. | Revisar bordas, dividers, margins e paddings que deixam blocos encostados. | Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.
  - Comandos sugeridos: rg -n "border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-fullpage.png
- [VISUAL_HIERARCHY_COLLAPSE] (low) /servicios/limpieza-de-sofa-sabadell -> visual_quality:hierarchy_collapse: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-fullpage.png
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
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
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
- section.hero-page context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-context.png
- section.hero-page focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-focus.png
- section.hero-page full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-fullpage.png
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofa-sabadell -> Quienes Somos: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofa-sabadell -> Restauración de Alfombras: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [VISUAL_ALIGNMENT_DRIFT] (low) /servicios/limpieza-de-sofa-cerdanyola -> visual_quality:alignment: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-032Z-servicios-limpieza-de-sofa-cerdanyola-visual-alignment-drift-footer-footer-fullpage.png
  - Classificacao: VISUAL_ALIGNMENT_DRIFT [generic]
  - Tecnico: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
  - Leigo: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar alinhamento horizontal dos blocos principais ao longo da pagina. | Padronizar container, gutters e max-width entre secoes equivalentes. | Remover deslocamentos isolados que quebram a coluna principal.
  - Comandos sugeridos: rg -n "container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:" src || rg -n "section|wrapper|content|shell|layout" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-032Z-servicios-limpieza-de-sofa-cerdanyola-visual-alignment-drift-footer-footer-fullpage.png
- [VISUAL_TIGHT_SPACING] (medium) /servicios/limpieza-de-sofa-cerdanyola -> visual_quality:tight_spacing: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-fullpage.png
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
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-fullpage.png
- [VISUAL_WIDTH_INCONSISTENCY] (low) /servicios/limpieza-de-sofa-cerdanyola -> visual_quality:width_inconsistency: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-28-732Z-servicios-limpieza-de-sofa-cerdanyola-visual-width-inconsistency-footer-footer-fullpage.png
  - Classificacao: VISUAL_WIDTH_INCONSISTENCY [generic]
  - Tecnico: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
  - Leigo: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural. | Padronizar max-width e largura util entre sections irmas. | Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.
  - Comandos sugeridos: rg -n "max-width|min-width|width:|w-\[|w-full|container|content|max-w-" src || rg -n "section|panel|card|wrapper|content|shell" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-28-732Z-servicios-limpieza-de-sofa-cerdanyola-visual-width-inconsistency-footer-footer-fullpage.png
- [VISUAL_BOUNDARY_COLLISION] (medium) /servicios/limpieza-de-sofa-cerdanyola -> visual_quality:boundary_collision: Detectada colisao de borda em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-fullpage.png
  - Classificacao: VISUAL_BOUNDARY_COLLISION [generic]
  - Tecnico: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
  - Leigo: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual. | Revisar bordas, dividers, margins e paddings que deixam blocos encostados. | Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.
  - Comandos sugeridos: rg -n "border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectada colisao de borda em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-fullpage.png
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofa-cerdanyola -> Quienes Somos: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofa-cerdanyola -> Restauración de Alfombras: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [VISUAL_ALIGNMENT_DRIFT] (low) /servicios/limpieza-de-sofas-terrassa -> visual_quality:alignment: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-201Z-servicios-limpieza-de-sofas-terrassa-visual-alignment-drift-footer-footer-fullpage.png
  - Classificacao: VISUAL_ALIGNMENT_DRIFT [generic]
  - Tecnico: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
  - Leigo: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar alinhamento horizontal dos blocos principais ao longo da pagina. | Padronizar container, gutters e max-width entre secoes equivalentes. | Remover deslocamentos isolados que quebram a coluna principal.
  - Comandos sugeridos: rg -n "container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:" src || rg -n "section|wrapper|content|shell|layout" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-201Z-servicios-limpieza-de-sofas-terrassa-visual-alignment-drift-footer-footer-fullpage.png
- [VISUAL_TIGHT_SPACING] (medium) /servicios/limpieza-de-sofas-terrassa -> visual_quality:tight_spacing: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-fullpage.png
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
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-fullpage.png
- [VISUAL_WIDTH_INCONSISTENCY] (low) /servicios/limpieza-de-sofas-terrassa -> visual_quality:width_inconsistency: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-54-988Z-servicios-limpieza-de-sofas-terrassa-visual-width-inconsistency-footer-footer-fullpage.png
  - Classificacao: VISUAL_WIDTH_INCONSISTENCY [generic]
  - Tecnico: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
  - Leigo: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural. | Padronizar max-width e largura util entre sections irmas. | Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.
  - Comandos sugeridos: rg -n "max-width|min-width|width:|w-\[|w-full|container|content|max-w-" src || rg -n "section|panel|card|wrapper|content|shell" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-54-988Z-servicios-limpieza-de-sofas-terrassa-visual-width-inconsistency-footer-footer-fullpage.png
- [VISUAL_BOUNDARY_COLLISION] (medium) /servicios/limpieza-de-sofas-terrassa -> visual_quality:boundary_collision: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-fullpage.png
  - Classificacao: VISUAL_BOUNDARY_COLLISION [generic]
  - Tecnico: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
  - Leigo: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual. | Revisar bordas, dividers, margins e paddings que deixam blocos encostados. | Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.
  - Comandos sugeridos: rg -n "border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-fullpage.png
- [VISUAL_HIERARCHY_COLLAPSE] (low) /servicios/limpieza-de-sofas-terrassa -> visual_quality:hierarchy_collapse: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-fullpage.png
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
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
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
- section.hero-page context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-context.png
- section.hero-page focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-focus.png
- section.hero-page full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-fullpage.png
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofas-terrassa -> Quienes Somos: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [JS_RUNTIME_ERROR] (high) /servicios/limpieza-de-sofas-terrassa -> Restauración de Alfombras: Cannot read properties of null (reading 'addEventListener')
  - Classificacao: Acesso invalido a null/undefined [runtime_null_undefined_access]
  - Tecnico: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
  - Leigo: Uma falha interna no codigo da pagina interrompeu parte do funcionamento esperado.
  - Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
  - Causas provaveis: Dados assincronos nao carregados antes do uso. | Objeto opcional sem guarda. | Mudanca de contrato de dados sem ajuste na UI.
  - Acoes recomendadas: Aplicar optional chaining e fallback de render. | Cobrir com teste de estado vazio/erro/loading.
  - Prioridade de ataque: P0
  - Checks iniciais: Mapear variavel nula no stack trace. | Adicionar guard clauses antes do acesso. | Garantir valor default para estado assicrono. | Mapear stack do erro no console para arquivo/linha. | Corrigir null/undefined e estados nao inicializados. | Adicionar guard clauses e fallback de render.
  - Comandos sugeridos: rg -n "\?\.|null|undefined" src/components src/app src/lib || rg -n "\?\.|\!\.|as any|null|undefined" src/components src/app src/lib || rg -n "window\.|document\.|localStorage" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
- [VISUAL_ALIGNMENT_DRIFT] (low) /servicios/limpieza-de-sofas-sant-cugat -> visual_quality:alignment: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-22-896Z-servicios-limpieza-de-sofas-sant-cugat-visual-alignment-drift-footer-footer-fullpage.png
  - Classificacao: VISUAL_ALIGNMENT_DRIFT [generic]
  - Tecnico: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
  - Leigo: Algumas partes grandes da interface parecem tortas ou fora do mesmo padrao visual da pagina.
  - Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar alinhamento horizontal dos blocos principais ao longo da pagina. | Padronizar container, gutters e max-width entre secoes equivalentes. | Remover deslocamentos isolados que quebram a coluna principal.
  - Comandos sugeridos: rg -n "container|max-width|mx-auto|padding-inline|px-|pl-|pr-|left:" src || rg -n "section|wrapper|content|shell|layout" src/components src/app
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-22-896Z-servicios-limpieza-de-sofas-sant-cugat-visual-alignment-drift-footer-footer-fullpage.png
- [VISUAL_TIGHT_SPACING] (medium) /servicios/limpieza-de-sofas-sant-cugat -> visual_quality:tight_spacing: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-fullpage.png
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
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-fullpage.png
- [VISUAL_WIDTH_INCONSISTENCY] (low) /servicios/limpieza-de-sofas-sant-cugat -> visual_quality:width_inconsistency: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-24-678Z-servicios-limpieza-de-sofas-sant-cugat-visual-width-inconsistency-footer-footer-fullpage.png
  - Classificacao: VISUAL_WIDTH_INCONSISTENCY [generic]
  - Tecnico: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
  - Leigo: Partes grandes da pagina ficaram com larguras muito diferentes sem parecer intencional, deixando o layout irregular.
  - Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
  - Prioridade de ataque: P2
  - Checks iniciais: Comparar a largura dos blocos principais que deveriam compartilhar a mesma coluna estrutural. | Padronizar max-width e largura util entre sections irmas. | Remover overrides isolados que deixam um bloco estreito/largo demais sem contexto.
  - Comandos sugeridos: rg -n "max-width|min-width|width:|w-\[|w-full|container|content|max-w-" src || rg -n "section|panel|card|wrapper|content|shell" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-24-678Z-servicios-limpieza-de-sofas-sant-cugat-visual-width-inconsistency-footer-footer-fullpage.png
- [VISUAL_BOUNDARY_COLLISION] (medium) /servicios/limpieza-de-sofas-sant-cugat -> visual_quality:boundary_collision: Detectada colisao de borda em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
  - Evidencias: C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-context.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-focus.png | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-fullpage.png
  - Classificacao: VISUAL_BOUNDARY_COLLISION [generic]
  - Tecnico: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
  - Leigo: Algumas partes grandes da tela estao encostando uma na outra, como se as linhas e blocos estivessem se batendo.
  - Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
  - Prioridade de ataque: P1
  - Checks iniciais: Medir o gap real entre blocos consecutivos que compartilham a mesma coluna visual. | Revisar bordas, dividers, margins e paddings que deixam blocos encostados. | Garantir separacao clara entre conteudo principal, CTA, FAQ, listas e cards longos.
  - Comandos sugeridos: rg -n "border|divider|margin-top|margin-bottom|padding-top|padding-bottom|gap:|row-gap|space-y-" src || rg -n "section|card|panel|stack|wrapper|content" src/components src/styles
  - Prompt de correcao: Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectada colisao de borda em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-fullpage.png

## Prompts De Correcao Por Issue

### 1cef5958ec02 | VISUAL_LAYOUT_OVERFLOW

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_LAYOUT_OVERFLOW] (medium)
Rota: /
Acao: visual_quality:overflow
URL: https://superclim.es/
Detalhe observado: Detectado overflow visual em 6 bloco(s). | div.swiper-slide.swiper-slide-next (right, delta=292px, rect=1128-1828) ; img (right, delta=92px, rect=1328-1628) ; div.swiper-slide (right, delta=1002px, rect=1838-2538)
Explicacao tecnica: Um bloco visual excedeu a largura util do viewport e esta vazando horizontalmente ou cortando a composicao.
Resolucao recomendada: Revisar widths/min-widths, containers, imagens e widgets fixos para impedir overflow horizontal e manter o layout dentro do viewport.
Classificacao inteligente: VISUAL_LAYOUT_OVERFLOW (generic)

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
- div.swiper-slide.swiper-slide-next full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-31-546Z-home-visual-layout-overflow-div-swiper-slide-swiper-slide-next-fullpage.png
```

### f298e2e6ab27 | VISUAL_ALIGNMENT_DRIFT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /
Acao: visual_quality:alignment
URL: https://superclim.es/
Detalhe observado: Detectado drift de alinhamento em 3 bloco(s) principais. | Baseline left=0px. | header (left=198px, drift=198px) ; section.hero (left=198px, drift=198px) ; section.masterhead (left=198px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-34-626Z-home-visual-alignment-drift-header-fullpage.png
```

### e11e84bc10bb | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /
Acao: visual_quality:tight_spacing
URL: https://superclim.es/
Detalhe observado: Detectado espacamento apertado em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px) ; section#servicios.services -> section#more-services.services (gap=0px) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px)
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
- section.masterhead full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-37-495Z-home-visual-tight-spacing-section-masterhead-fullpage.png
```

### 4f948e18d9f1 | VISUAL_GAP_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_GAP_INCONSISTENCY] (low)
Rota: /
Acao: visual_quality:gap_inconsistency
URL: https://superclim.es/
Detalhe observado: Detectada inconsistencia de espacamento em 6 transicao(oes) visuais. | header -> section.hero (gap=640px, baseline=78px, drift=562px, too_loose) ; section.gallery-custom -> section.masterhead (gap=30px, baseline=78px, drift=48px, too_tight) ; section.masterhead -> section#servicios.services (gap=0px, baseline=78px, drift=78px, too_tight)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-39-690Z-home-visual-gap-inconsistency-header-fullpage.png
```

### e0d5c22c8199 | VISUAL_WIDTH_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/
Detalhe observado: Detectada largura inconsistente em 6 bloco(s) principais. | section.gallery-custom (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#servicios.services (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#more-services.services (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- section.gallery-custom full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-42-336Z-home-visual-width-inconsistency-section-gallery-custom-fullpage.png
```

### 2f263f3ac004 | VISUAL_BOUNDARY_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /
Acao: visual_quality:boundary_collision
URL: https://superclim.es/
Detalhe observado: Detectada colisao de borda em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px, shared=1) ; section#servicios.services -> section#more-services.services (gap=0px, shared=1) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- section.masterhead full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-44-010Z-home-visual-boundary-collision-section-masterhead-fullpage.png
```

### 7a82c757ffdc | VISUAL_HIERARCHY_COLLAPSE

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.masterhead (heading=22px, body=16px, ratio=1.38x, gap=6px)
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
- section.masterhead full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-17-45-716Z-home-visual-hierarchy-collapse-section-masterhead-fullpage.png
```

### 6e656415f94c | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Más Servicios
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### a79cfa7b6946 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Saber Más
URL: https://superclim.es/limpieza-de-sofas/limpieza-de-sofas-a-domicilio
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### afbbac2d2561 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 3d3f0fe0ab48 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Limpieza de colchones
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 8af9a70ee673 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 4863c4cd285c | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /
Acao: Limpieza de Muebles en Cuero
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 1fe8875a6bbd | VISUAL_ALIGNMENT_DRIFT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/
Detalhe observado: Detectado drift de alinhamento em 2 bloco(s) principais. | Baseline left=198px. | section#introduccion-servicios.intro-services (left=0px, drift=198px) ; footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- section#introduccion-servicios.intro-services context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-context.png
- section#introduccion-servicios.intro-services focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-focus.png
- section#introduccion-servicios.intro-services full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-11-693Z-servicios-visual-alignment-drift-section-introduccion-servicios-intro-services-fullpage.png
```

### 1a3b640623a1 | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /servicios
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-12-653Z-servicios-visual-tight-spacing-header-fullpage.png
```

### e5d7d4cf4dd1 | VISUAL_WIDTH_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/
Detalhe observado: Detectada largura inconsistente em 2 bloco(s) principais. | section#introduccion-servicios.intro-services (width=1536px, baseline=1140px, drift=396px, too_wide) ; footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- section#introduccion-servicios.intro-services context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-context.png
- section#introduccion-servicios.intro-services focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-focus.png
- section#introduccion-servicios.intro-services full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-13-902Z-servicios-visual-width-inconsistency-section-introduccion-servicios-intro-services-fullpage.png
```

### 887d9e929978 | VISUAL_BOUNDARY_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px, shared=1) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px, shared=1) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-14-844Z-servicios-visual-boundary-collision-header-fullpage.png
```

### c0c695cb3337 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Más Servicios
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 19d9fec922f5 | CONSOLE_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /servicios
Acao: Saber Más
URL: https://superclim.es/servicios/
Detalhe observado: Loading the image 'https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=1&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&frm=0&rtg=98061810&slo=0&hlo=1&lst=3&bt=0&ct=3&z=0' violates the following Content Security Policy directive: "img-src 'self' https://www.superclim.es https://superclim.es data:". The action has been blocked.
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Erro no console do navegador (runtime_unknown)

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

Causas provaveis detectadas:
- Erro de runtime/console sem assinatura especifica.
- Excecao nao tratada em render ou evento.
- Dados inesperados sem validacao defensiva.

Checks tecnicos sugeridos:
- Usar stack trace para chegar no arquivo/linha.
- Adicionar guard clauses no trecho que falha.
- Reexecutar fluxo e confirmar ausencia do erro.
```

### bc4bd68cb8e6 | CONSOLE_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [CONSOLE_ERROR] (low)
Rota: /servicios
Acao: Saber Más
URL: https://superclim.es/servicios/
Detalhe observado: Fetch API cannot load https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=2&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&csp=G-ZDQP8QS1NP;61_1&mde=G-ZDQP8QS1NP;61_1&fin=1&z=0. Refused to connect because it violates the document's Content Security Policy.
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Erro no console do navegador (runtime_unknown)

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

Causas provaveis detectadas:
- Erro de runtime/console sem assinatura especifica.
- Excecao nao tratada em render ou evento.
- Dados inesperados sem validacao defensiva.

Checks tecnicos sugeridos:
- Usar stack trace para chegar no arquivo/linha.
- Adicionar guard clauses no trecho que falha.
- Reexecutar fluxo e confirmar ausencia do erro.
```

### 6777b1169880 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Saber Más
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### f94881c3ddb2 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### cc8b7da7debe | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Limpieza de colchones
URL: https://superclim.es/mas-servicios/
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### f0578eb1ecb9 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 76227b12c5a6 | VISUAL_ALIGNMENT_DRIFT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-30-746Z-servicios-limpieza-de-sofas-barcelona-visual-alignment-drift-footer-footer-fullpage.png
```

### ecd9bb680596 | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-31-399Z-servicios-limpieza-de-sofas-barcelona-visual-tight-spacing-header-fullpage.png
```

### 5f835ba3ab39 | VISUAL_WIDTH_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-32-681Z-servicios-limpieza-de-sofas-barcelona-visual-width-inconsistency-footer-footer-fullpage.png
```

### fd68b509273a | VISUAL_BOUNDARY_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-33-311Z-servicios-limpieza-de-sofas-barcelona-visual-boundary-collision-header-fullpage.png
```

### c71f27d9ebcf | VISUAL_HIERARCHY_COLLAPSE

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/servicios/limpieza-de-sofas-barcelona
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
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
- section.hero-page context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-context.png
- section.hero-page focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-focus.png
- section.hero-page full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-34-598Z-servicios-limpieza-de-sofas-barcelona-visual-hierarchy-collapse-section-hero-page-fullpage.png
```

### f1b78f69bf8c | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 32285c604996 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-barcelona
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 1fbbfc47cd35 | VISUAL_ALIGNMENT_DRIFT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-58-741Z-servicios-limpieza-de-sofa-sabadell-visual-alignment-drift-footer-footer-fullpage.png
```

### 62461a998a55 | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-18-59-378Z-servicios-limpieza-de-sofa-sabadell-visual-tight-spacing-header-fullpage.png
```

### 90837ec2ed4d | VISUAL_WIDTH_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-00-781Z-servicios-limpieza-de-sofa-sabadell-visual-width-inconsistency-footer-footer-fullpage.png
```

### 1e6d6013b0e5 | VISUAL_BOUNDARY_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-01-414Z-servicios-limpieza-de-sofa-sabadell-visual-boundary-collision-header-fullpage.png
```

### 7df5122de6a4 | VISUAL_HIERARCHY_COLLAPSE

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/servicios/limpieza-de-sofa-sabadell
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
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
- section.hero-page context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-context.png
- section.hero-page focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-focus.png
- section.hero-page full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-02-820Z-servicios-limpieza-de-sofa-sabadell-visual-hierarchy-collapse-section-hero-page-fullpage.png
```

### af6dc09bde4d | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 600968f40812 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-sabadell
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### e2d53547b617 | VISUAL_ALIGNMENT_DRIFT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-032Z-servicios-limpieza-de-sofa-cerdanyola-visual-alignment-drift-footer-footer-fullpage.png
```

### bde7da09fa98 | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-27-556Z-servicios-limpieza-de-sofa-cerdanyola-visual-tight-spacing-header-fullpage.png
```

### 6ca58ec6f65b | VISUAL_WIDTH_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-28-732Z-servicios-limpieza-de-sofa-cerdanyola-visual-width-inconsistency-footer-footer-fullpage.png
```

### 6ccfb29ba03f | VISUAL_BOUNDARY_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofa-cerdanyola
Detalhe observado: Detectada colisao de borda em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-29-252Z-servicios-limpieza-de-sofa-cerdanyola-visual-boundary-collision-header-fullpage.png
```

### d19a14e2cfc2 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### a09d3cbdd6c1 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofa-cerdanyola
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 6e7678bc2d09 | VISUAL_ALIGNMENT_DRIFT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-201Z-servicios-limpieza-de-sofas-terrassa-visual-alignment-drift-footer-footer-fullpage.png
```

### 38e8bbfe84db | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-53-735Z-servicios-limpieza-de-sofas-terrassa-visual-tight-spacing-header-fullpage.png
```

### ed0c6ea14584 | VISUAL_WIDTH_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-54-988Z-servicios-limpieza-de-sofas-terrassa-visual-width-inconsistency-footer-footer-fullpage.png
```

### fe90b45a2b4d | VISUAL_BOUNDARY_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-55-584Z-servicios-limpieza-de-sofas-terrassa-visual-boundary-collision-header-fullpage.png
```

### c5635c0034dd | VISUAL_HIERARCHY_COLLAPSE

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_HIERARCHY_COLLAPSE] (low)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: visual_quality:hierarchy_collapse
URL: https://superclim.es/servicios/limpieza-de-sofas-terrassa
Detalhe observado: Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
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
- section.hero-page context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-context.png
- section.hero-page focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-focus.png
- section.hero-page full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-19-57-197Z-servicios-limpieza-de-sofas-terrassa-visual-hierarchy-collapse-section-hero-page-fullpage.png
```

### 8c1cded25227 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: Quienes Somos
URL: https://superclim.es/quienes-somos
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### 35e21ac35834 | JS_RUNTIME_ERROR

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [JS_RUNTIME_ERROR] (high)
Rota: /servicios/limpieza-de-sofas-terrassa
Acao: Restauración de Alfombras
URL: https://superclim.es/restauracion-de-alfombras
Detalhe observado: Cannot read properties of null (reading 'addEventListener')
Explicacao tecnica: Erro de JavaScript/console detectado durante interacao. Pode quebrar renderizacao, eventos ou fluxo de dados.
Resolucao recomendada: Mapear stack trace para arquivo/linha, corrigir causa raiz e adicionar tratamento defensivo.
Classificacao inteligente: Acesso invalido a null/undefined (runtime_null_undefined_access)

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

Causas provaveis detectadas:
- Dados assincronos nao carregados antes do uso.
- Objeto opcional sem guarda.
- Mudanca de contrato de dados sem ajuste na UI.

Checks tecnicos sugeridos:
- Mapear variavel nula no stack trace.
- Adicionar guard clauses antes do acesso.
- Garantir valor default para estado assicrono.
```

### d95b40acccf7 | VISUAL_ALIGNMENT_DRIFT

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_ALIGNMENT_DRIFT] (low)
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:alignment
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
Explicacao tecnica: Blocos principais da pagina perderam alinhamento estrutural e sairam do eixo dominante do layout.
Resolucao recomendada: Padronizar grid, margins, max-width e alinhamento dos blocos principais para manter consistencia visual entre secoes.
Classificacao inteligente: VISUAL_ALIGNMENT_DRIFT (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-22-896Z-servicios-limpieza-de-sofas-sant-cugat-visual-alignment-drift-footer-footer-fullpage.png
```

### 318b03f14eaf | VISUAL_TIGHT_SPACING

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_TIGHT_SPACING] (medium)
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:tight_spacing
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-23-460Z-servicios-limpieza-de-sofas-sant-cugat-visual-tight-spacing-header-fullpage.png
```

### cb062c9ecef0 | VISUAL_WIDTH_INCONSISTENCY

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_WIDTH_INCONSISTENCY] (low)
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:width_inconsistency
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
Explicacao tecnica: Blocos equivalentes perderam consistencia de largura e quebraram a coluna dominante da composicao.
Resolucao recomendada: Padronizar largura util e max-width dos blocos principais para manter uma mesma malha visual ao longo da pagina.
Classificacao inteligente: VISUAL_WIDTH_INCONSISTENCY (generic)

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
- footer.footer full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-24-678Z-servicios-limpieza-de-sofas-sant-cugat-visual-width-inconsistency-footer-footer-fullpage.png
```

### d844d649abff | VISUAL_BOUNDARY_COLLISION

```text
Atue como engenheiro de software senior focado em causa raiz.
Corrija a issue abaixo de forma definitiva, sem gambiarras e sem regressao.

Issue: [VISUAL_BOUNDARY_COLLISION] (medium)
Rota: /servicios/limpieza-de-sofas-sant-cugat
Acao: visual_quality:boundary_collision
URL: https://superclim.es/servicios/limpieza-de-sofas-sant-cugat
Detalhe observado: Detectada colisao de borda em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
Explicacao tecnica: Blocos estruturais consecutivos ficaram praticamente colados, com bordas ou divisorias encostando sem respiro suficiente.
Resolucao recomendada: Adicionar respiro real entre blocos principais, revisar bordas/dividers e impedir que cards ou secoes terminem grudados uns nos outros.
Classificacao inteligente: VISUAL_BOUNDARY_COLLISION (generic)

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
- header context | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-context.png
- header focus | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-focus.png
- header full page | C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim\reports\visual-evidence\2026-03-11T10-20-25-188Z-servicios-limpieza-de-sofas-sant-cugat-visual-boundary-collision-header-fullpage.png
```


## Prompt Master

```text
Atue como engenheiro de software senior e corrija todas as issues listadas abaixo com foco em causa raiz.

Nao aplique correcoes cosmeticas. Garanta comportamento funcional correto em desktop e mobile.

Exigencias minimas: sem botao sem efeito, sem callback solto, sem erro fetch sem feedback, sem 4xx/5xx inesperado no fluxo principal e sem ordem de secoes quebrada.

Workflow obrigatorio: reproduzir, identificar causa raiz, corrigir com menor impacto, validar novamente via auditor.

Entregue ao final: codigo corrigido, resumo da causa raiz por categoria e evidencias de revalidacao.

Resolva erros de runtime/rede do frontend.
Garanta try/catch, fallback de estado e tratamento de respostas invalidas.
Ocorrencias:
- / -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- / -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- / -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- / -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- / -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- / -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofas-barcelona -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofas-barcelona -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofa-sabadell -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofa-sabadell -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofa-cerdanyola -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofa-cerdanyola -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofas-terrassa -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofas-terrassa -> JS_RUNTIME_ERROR: Cannot read properties of null (reading 'addEventListener')
- /servicios -> CONSOLE_ERROR: Loading the image 'https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=1&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&frm=0&rtg=98061810&slo=0&hlo=1&lst=3&bt=0&ct=3&z=0' violates the following Content Security Policy directive: "img-src 'self' https://www.superclim.es https://superclim.es data:". The action has been blocked.

Corrija as inconsistencias de composicao visual da interface.
O objetivo e padronizar respiro, alinhamento, camadas e ritmo visual entre blocos importantes.
Ocorrencias:
- / -> VISUAL_LAYOUT_OVERFLOW: Detectado overflow visual em 6 bloco(s). | div.swiper-slide.swiper-slide-next (right, delta=292px, rect=1128-1828) ; img (right, delta=92px, rect=1328-1628) ; div.swiper-slide (right, delta=1002px, rect=1838-2538)
- / -> VISUAL_ALIGNMENT_DRIFT: Detectado drift de alinhamento em 3 bloco(s) principais. | Baseline left=0px. | header (left=198px, drift=198px) ; section.hero (left=198px, drift=198px) ; section.masterhead (left=198px, drift=198px)
- /servicios -> VISUAL_ALIGNMENT_DRIFT: Detectado drift de alinhamento em 2 bloco(s) principais. | Baseline left=198px. | section#introduccion-servicios.intro-services (left=0px, drift=198px) ; footer.footer (left=0px, drift=198px)
- /servicios/limpieza-de-sofas-barcelona -> VISUAL_ALIGNMENT_DRIFT: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
- /servicios/limpieza-de-sofa-sabadell -> VISUAL_ALIGNMENT_DRIFT: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
- /servicios/limpieza-de-sofa-cerdanyola -> VISUAL_ALIGNMENT_DRIFT: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
- /servicios/limpieza-de-sofas-terrassa -> VISUAL_ALIGNMENT_DRIFT: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
- /servicios/limpieza-de-sofas-sant-cugat -> VISUAL_ALIGNMENT_DRIFT: Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
- / -> VISUAL_TIGHT_SPACING: Detectado espacamento apertado em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px) ; section#servicios.services -> section#more-services.services (gap=0px) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px)
- /servicios -> VISUAL_TIGHT_SPACING: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px)
- /servicios/limpieza-de-sofas-barcelona -> VISUAL_TIGHT_SPACING: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
- /servicios/limpieza-de-sofa-sabadell -> VISUAL_TIGHT_SPACING: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
- /servicios/limpieza-de-sofa-cerdanyola -> VISUAL_TIGHT_SPACING: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
- /servicios/limpieza-de-sofas-terrassa -> VISUAL_TIGHT_SPACING: Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
- /servicios/limpieza-de-sofas-sant-cugat -> VISUAL_TIGHT_SPACING: Detectado espacamento apertado em 2 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
- / -> VISUAL_GAP_INCONSISTENCY: Detectada inconsistencia de espacamento em 6 transicao(oes) visuais. | header -> section.hero (gap=640px, baseline=78px, drift=562px, too_loose) ; section.gallery-custom -> section.masterhead (gap=30px, baseline=78px, drift=48px, too_tight) ; section.masterhead -> section#servicios.services (gap=0px, baseline=78px, drift=78px, too_tight)
- / -> VISUAL_WIDTH_INCONSISTENCY: Detectada largura inconsistente em 6 bloco(s) principais. | section.gallery-custom (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#servicios.services (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#more-services.services (width=1536px, baseline=1140px, drift=396px, too_wide)
- /servicios -> VISUAL_WIDTH_INCONSISTENCY: Detectada largura inconsistente em 2 bloco(s) principais. | section#introduccion-servicios.intro-services (width=1536px, baseline=1140px, drift=396px, too_wide) ; footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
- /servicios/limpieza-de-sofas-barcelona -> VISUAL_WIDTH_INCONSISTENCY: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
- /servicios/limpieza-de-sofa-sabadell -> VISUAL_WIDTH_INCONSISTENCY: Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)

Use a classificacao inteligente para atacar causa raiz de fetch/network/http/runtime.
Para cada item: confirmar causa, aplicar fix robusto e validar com replay da auditoria.
Diagnosticos capturados:
- / -> visual_quality:overflow | VISUAL_LAYOUT_OVERFLOW [generic] | Detectado overflow visual em 6 bloco(s). | div.swiper-slide.swiper-slide-next (right, delta=292px, rect=1128-1828) ; img (right, delta=92px, rect=1328-1628) ; div.swiper-slide (right, delta=1002px, rect=1838-2538)
- / -> visual_quality:alignment | VISUAL_ALIGNMENT_DRIFT [generic] | Detectado drift de alinhamento em 3 bloco(s) principais. | Baseline left=0px. | header (left=198px, drift=198px) ; section.hero (left=198px, drift=198px) ; section.masterhead (left=198px, drift=198px)
- / -> visual_quality:tight_spacing | VISUAL_TIGHT_SPACING [generic] | Detectado espacamento apertado em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px) ; section#servicios.services -> section#more-services.services (gap=0px) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px)
- / -> visual_quality:gap_inconsistency | VISUAL_GAP_INCONSISTENCY [generic] | Detectada inconsistencia de espacamento em 6 transicao(oes) visuais. | header -> section.hero (gap=640px, baseline=78px, drift=562px, too_loose) ; section.gallery-custom -> section.masterhead (gap=30px, baseline=78px, drift=48px, too_tight) ; section.masterhead -> section#servicios.services (gap=0px, baseline=78px, drift=78px, too_tight)
- / -> visual_quality:width_inconsistency | VISUAL_WIDTH_INCONSISTENCY [generic] | Detectada largura inconsistente em 6 bloco(s) principais. | section.gallery-custom (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#servicios.services (width=1536px, baseline=1140px, drift=396px, too_wide) ; section#more-services.services (width=1536px, baseline=1140px, drift=396px, too_wide)
- / -> visual_quality:boundary_collision | VISUAL_BOUNDARY_COLLISION [generic] | Detectada colisao de borda em 4 transicao(oes) entre blocos. | section.masterhead -> section#servicios.services (gap=0px, shared=1) ; section#servicios.services -> section#more-services.services (gap=0px, shared=1) ; section#sobre-nosotros.about -> section#reseñas.testimonials (gap=0px, shared=1)
- / -> visual_quality:hierarchy_collapse | VISUAL_HIERARCHY_COLLAPSE [generic] | Detectado colapso de hierarquia visual em 1 bloco(s). | section.masterhead (heading=22px, body=16px, ratio=1.38x, gap=6px)
- / -> Más Servicios | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- / -> Saber Más | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- / -> Quienes Somos | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- / -> Limpieza de colchones | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- / -> Restauración de Alfombras | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- / -> Limpieza de Muebles en Cuero | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- /servicios -> visual_quality:alignment | VISUAL_ALIGNMENT_DRIFT [generic] | Detectado drift de alinhamento em 2 bloco(s) principais. | Baseline left=198px. | section#introduccion-servicios.intro-services (left=0px, drift=198px) ; footer.footer (left=0px, drift=198px)
- /servicios -> visual_quality:tight_spacing | VISUAL_TIGHT_SPACING [generic] | Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px)
- /servicios -> visual_quality:width_inconsistency | VISUAL_WIDTH_INCONSISTENCY [generic] | Detectada largura inconsistente em 2 bloco(s) principais. | section#introduccion-servicios.intro-services (width=1536px, baseline=1140px, drift=396px, too_wide) ; footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
- /servicios -> visual_quality:boundary_collision | VISUAL_BOUNDARY_COLLISION [generic] | Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero (gap=0px, shared=1) ; section.hero -> section#introduccion-servicios.intro-services (gap=0px, shared=1) ; section#introduccion-servicios.intro-services -> section#limpieza-de-sofas.service-detail (gap=0px, shared=1)
- /servicios -> Más Servicios | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- /servicios -> Saber Más | Erro no console do navegador [runtime_unknown] | Loading the image 'https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=1&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&frm=0&rtg=98061810&slo=0&hlo=1&lst=3&bt=0&ct=3&z=0' violates the following Content Security Policy directive: "img-src 'self' https://www.superclim.es https://superclim.es data:". The action has been blocked.
- /servicios -> Saber Más | Erro no console do navegador [runtime_unknown] | Fetch API cannot load https://www.googletagmanager.com/td?id=G-ZDQP8QS1NP&v=3&t=t&pid=1453803428&gtm=45je6391v898061810za200zd898061810&seq=2&exp=103116026~103200004~115616986~115938466~115938468~116024733~117484252&dl=superclim.es%2Fservicios%2F&tdp=G-ZDQP8QS1NP;98061810;0;0;0&csp=G-ZDQP8QS1NP;61_1&mde=G-ZDQP8QS1NP;61_1&fin=1&z=0. Refused to connect because it violates the document's Content Security Policy.
- /servicios -> Saber Más | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- /servicios -> Quienes Somos | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- /servicios -> Limpieza de colchones | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- /servicios -> Restauración de Alfombras | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
- /servicios/limpieza-de-sofas-barcelona -> visual_quality:alignment | VISUAL_ALIGNMENT_DRIFT [generic] | Detectado drift de alinhamento em 1 bloco(s) principais. | Baseline left=198px. | footer.footer (left=0px, drift=198px)
- /servicios/limpieza-de-sofas-barcelona -> visual_quality:tight_spacing | VISUAL_TIGHT_SPACING [generic] | Detectado espacamento apertado em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px) ; section.hero-page -> section#contenido.content (gap=0px) ; section#contenido.content -> footer.footer (gap=0px)
- /servicios/limpieza-de-sofas-barcelona -> visual_quality:width_inconsistency | VISUAL_WIDTH_INCONSISTENCY [generic] | Detectada largura inconsistente em 1 bloco(s) principais. | footer.footer (width=1536px, baseline=1140px, drift=396px, too_wide)
- /servicios/limpieza-de-sofas-barcelona -> visual_quality:boundary_collision | VISUAL_BOUNDARY_COLLISION [generic] | Detectada colisao de borda em 3 transicao(oes) entre blocos. | header -> section.hero-page (gap=0px, shared=1) ; section.hero-page -> section#contenido.content (gap=0px, shared=1) ; section#contenido.content -> footer.footer (gap=0px, shared=1)
- /servicios/limpieza-de-sofas-barcelona -> visual_quality:hierarchy_collapse | VISUAL_HIERARCHY_COLLAPSE [generic] | Detectado colapso de hierarquia visual em 1 bloco(s). | section.hero-page (heading=19.2px, body=12.8px, ratio=1.5x, gap=6.4px)
- /servicios/limpieza-de-sofas-barcelona -> Quienes Somos | Acesso invalido a null/undefined [runtime_null_undefined_access] | Cannot read properties of null (reading 'addEventListener')
```

## Prompt Rapido Do Assistente

```text
Atue como engenheiro de software senior com foco em execucao rapida e causa raiz.
Total de issues: 55.
Ordem de ataque: high -> medium -> low.
Nao aceitar fix cosmetico: cada problema precisa de evidencia de resolucao.

Top issues para iniciar:
1. [JS_RUNTIME_ERROR] (high) / -> Más Servicios | Cannot read properties of null (reading 'addEventListener')
2. [JS_RUNTIME_ERROR] (high) / -> Saber Más | Cannot read properties of null (reading 'addEventListener')
3. [JS_RUNTIME_ERROR] (high) / -> Quienes Somos | Cannot read properties of null (reading 'addEventListener')
4. [JS_RUNTIME_ERROR] (high) / -> Limpieza de colchones | Cannot read properties of null (reading 'addEventListener')
5. [JS_RUNTIME_ERROR] (high) / -> Restauración de Alfombras | Cannot read properties of null (reading 'addEventListener')
6. [JS_RUNTIME_ERROR] (high) / -> Limpieza de Muebles en Cuero | Cannot read properties of null (reading 'addEventListener')
7. [JS_RUNTIME_ERROR] (high) /servicios -> Más Servicios | Cannot read properties of null (reading 'addEventListener')
8. [JS_RUNTIME_ERROR] (high) /servicios -> Saber Más | Cannot read properties of null (reading 'addEventListener')

SEO (obrigatorio):
Atue como especialista SEO senior com foco em causa raiz e impacto real no ranking.
Site auditado: https://superclim.es
Score SEO atual: 82/100.
Objetivo: corrigir todos os itens pendentes abaixo sem fix cosmetico.

Checklist SEO pendente (explicacao para leigos + acao):
1. Title unico e com tamanho ideal (30-65) | por que importa: E o texto principal que aparece no Google. | o que fazer: Defina um title unico por pagina com foco na intencao do usuario.
2. Meta description clara (70-170) | por que importa: Ajuda a pessoa entender a pagina antes de clicar. | o que fazer: Crie descricao objetiva com beneficio real e chamada para acao.
3. Estrutura de headings com 1 H1 | por que importa: Organiza o tema principal da pagina para Google e usuarios. | o que fazer: Mantenha apenas um H1 claro e use H2/H3 para secoes.
4. Schema JSON-LD (LocalBusiness/Service/FAQ) | por que importa: Aumenta chance de rich results no Google. | o que fazer: Adicione dados estruturados validos por pagina.
5. Meta social (Open Graph + Twitter Card) | por que importa: Melhora compartilhamento e CTR em redes sociais. | o que fazer: Complete og:title, og:description, og:image, og:type e twitter:card.
6. Meta robots presente e coerente | por que importa: Define como bots devem indexar/seguir links. | o que fazer: Defina meta robots adequada para cada tipo de pagina.

Issues SEO detectadas:
1. [SEO_OPEN_GRAPH_INCOMPLETE] (medium) Open Graph incompleto (faltando og:title, og:description, og:image ou og:type). | recomendacao: Complete as metas Open Graph para melhorar compartilhamento e CTR.
2. [SEO_META_DESCRIPTION_LENGTH] (medium) Meta description com 188 caracteres (ideal: 70-170). | recomendacao: Ajuste o tamanho da meta description para evitar corte no resultado de busca.
3. [SEO_TITLE_LENGTH] (medium) Title com 100 caracteres (ideal: 30-65). | recomendacao: Ajuste o tamanho do title para melhorar leitura no Google.
4. [SEO_H1_MULTIPLE] (medium) 3 H1 encontrados (ideal: 1). | recomendacao: Mantenha um unico H1 para reforcar hierarquia semantica.
5. [SEO_TWITTER_CARD_MISSING] (low) Twitter Card ausente. | recomendacao: Adicione meta twitter:card e metadados sociais complementares.
6. [SEO_META_ROBOTS_MISSING] (low) Meta robots ausente. | recomendacao: Defina meta robots explicita para controle de indexacao.
7. [SEO_STRUCTURED_DATA_MISSING] (low) Nenhum JSON-LD encontrado. | recomendacao: Considere schema.org (LocalBusiness, Service, FAQ) para melhorar rich results.

Entrega obrigatoria:
- listar arquivos alterados e motivo de cada alteracao
- mostrar antes/depois dos metadados principais
- validar novamente e comprovar melhoria de score

Comando de revalidacao: node src/index.mjs --config "C:\Users\Administrador\Documents\SitePulse-QA\qa\temp-engine-check\superclim.json" --fresh --live-log --human-log --scope "full" --no-server
```
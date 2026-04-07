# 02. Requisitos

## Requisitos funcionais

- RF01: o sistema deve permitir cadastrar uma nova solicitacao interna
- RF02: o sistema deve registrar prioridade, prazo, solicitante e area responsavel
- RF03: o sistema deve permitir acompanhar o status de cada solicitacao
- RF04: o sistema deve criar ou vincular tarefas operacionais a cada solicitacao
- RF05: o sistema deve permitir mover tarefas entre etapas de execucao
- RF06: o sistema deve exibir indicadores resumidos da operacao
- RF07: o sistema deve registrar atualizacoes entre departamentos
- RF08: o sistema deve manter historico das movimentacoes relevantes
- RF09: o sistema deve permitir filtrar e buscar solicitacoes
- RF10: o sistema deve permitir visualizar detalhes da solicitacao selecionada

## Requisitos nao funcionais

- RNF01: a interface deve ser intuitiva e responsiva
- RNF02: as informacoes principais devem ser localizadas em poucos cliques
- RNF03: o sistema deve manter consistencia visual entre as telas
- RNF04: o prototipo deve possuir tempo de carregamento baixo em ambiente local
- RNF05: a arquitetura deve permitir evolucao futura para persistencia real

## Regras de negocio

- RN01: toda solicitacao deve possuir uma area responsavel
- RN02: toda solicitacao deve possuir prioridade e prazo
- RN03: uma solicitacao so pode ser concluida apos percorrer o fluxo definido
- RN04: tarefas bloqueadas devem ficar visiveis no quadro de execucao
- RN05: cada atualizacao publicada deve indicar autor, area e publico alvo

## Historias de usuario

- HU01: como colaborador, quero abrir uma solicitacao para nao depender de mensagens informais
- HU02: como lider de area, quero visualizar prioridades para decidir o que deve ser atendido primeiro
- HU03: como analista operacional, quero mover tarefas entre etapas para manter o quadro atualizado
- HU04: como gestor, quero ver os bloqueios para atuar rapidamente nos gargalos
- HU05: como stakeholder, quero ver um historico recente para entender o contexto das mudancas

## Criterios de aceite

### CA01 - Cadastro de solicitacao

- dado que o formulario foi preenchido
- quando o usuario confirmar o cadastro
- entao a solicitacao deve aparecer na lista
- e uma task inicial deve ser gerada automaticamente

### CA02 - Evolucao do fluxo

- dado que existe uma solicitacao aberta
- quando o usuario acionar o avancar etapa
- entao o status deve ser atualizado no detalhe e no painel

### CA03 - Quadro operacional

- dado que existem tarefas cadastradas
- quando o usuario abrir o quadro de tarefas
- entao as tarefas devem estar agrupadas por etapa

### CA04 - Mural interdepartamental

- dado que um alinhamento foi publicado
- quando outro usuario acessar a tela de departamentos
- entao a mensagem deve aparecer no topo do mural

## Matriz de rastreabilidade resumida

| Item | Requisito relacionado | Tela do prototipo |
|---|---|---|
| Cadastro de solicitacao | RF01, RF02 | `/solicitacoes` |
| Detalhamento da demanda | RF03, RF10 | `/solicitacoes` |
| Quadro de execucao | RF04, RF05 | `/tarefas` |
| Dashboard executivo | RF06, RF08 | `/` |
| Alinhamentos entre areas | RF07 | `/departamentos` |

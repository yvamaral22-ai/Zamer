# 02. Requisitos

## Requisitos funcionais

| Identificador | Descricao do requisito | Prioridade |
|---|---|---|
| RF01 | o sistema deve permitir cadastrar uma nova solicitacao interna | Alta |
| RF02 | o sistema deve registrar prioridade, prazo, solicitante e area responsavel em cada solicitacao | Alta |
| RF03 | o sistema deve permitir acompanhar o status de cada solicitacao ao longo do fluxo | Alta |
| RF04 | o sistema deve criar ou vincular tarefas operacionais a cada solicitacao | Alta |
| RF05 | o sistema deve permitir mover tarefas entre etapas de execucao | Alta |
| RF06 | o sistema deve exibir indicadores resumidos da operacao no dashboard | Media |
| RF07 | o sistema deve registrar atualizacoes entre departamentos em um mural compartilhado | Media |
| RF08 | o sistema deve manter historico das movimentacoes relevantes de cada solicitacao | Alta |
| RF09 | o sistema deve permitir filtrar e buscar solicitacoes por criterios como status, prioridade e area | Media |
| RF10 | o sistema deve permitir visualizar os detalhes da solicitacao selecionada | Alta |

## Requisitos nao funcionais

| Identificador | Categoria | Descricao do requisito |
|---|---|---|
| RNF01 | Usabilidade | a interface deve ser intuitiva e responsiva, permitindo uso adequado em desktop e dispositivos moveis |
| RNF02 | Usabilidade | as informacoes principais devem ser localizadas em poucos cliques, facilitando o acompanhamento das solicitacoes |
| RNF03 | Consistencia visual | o sistema deve manter padrao visual e de navegacao entre dashboard, solicitacoes, tarefas e departamentos |
| RNF04 | Desempenho | o prototipo deve apresentar baixo tempo de carregamento em ambiente local para nao comprometer a demonstracao do fluxo |
| RNF05 | Manutenibilidade | a arquitetura deve permitir evolucao futura para persistencia real e integracao com backend sem reestruturacao completa |

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

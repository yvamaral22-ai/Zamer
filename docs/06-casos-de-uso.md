# 06. Casos de Uso

## Atores

- Colaborador solicitante
- Gestor de departamento
- Analista operacional
- Diretoria

## Caso de uso 01 - Registrar solicitacao

### Objetivo

Permitir que um colaborador cadastre uma nova demanda em um fluxo padronizado.

### Ator principal

Colaborador solicitante

### Pre-condicoes

- o usuario tem acesso ao sistema
- a area responsavel pode ser identificada

### Fluxo principal

1. o colaborador acessa a central de solicitacoes
2. informa titulo, solicitante, area, prioridade, prazo e descricao
3. confirma o cadastro
4. o sistema cria a solicitacao
5. o sistema cria a primeira task vinculada

### Pos-condicoes

- a solicitacao passa a ser rastreavel no sistema
- a area responsavel pode iniciar a triagem

## Caso de uso 02 - Acompanhar solicitacao

### Ator principal

Colaborador solicitante ou gestor

### Fluxo principal

1. o ator acessa a lista de solicitacoes
2. filtra ou busca a demanda
3. seleciona a solicitacao desejada
4. consulta status, prazo, responsavel e tasks relacionadas

## Caso de uso 03 - Atualizar status da solicitacao

### Ator principal

Gestor de departamento

### Fluxo principal

1. o gestor seleciona a solicitacao
2. aciona o avancar etapa
3. o sistema atualiza o status
4. o historico operacional e atualizado

## Caso de uso 04 - Gerenciar tarefas

### Ator principal

Analista operacional

### Fluxo principal

1. o analista acessa o quadro de tarefas
2. visualiza tasks por etapa
3. move a task para frente ou para tras no fluxo
4. o sistema atualiza o status da task
5. o sistema registra a movimentacao no historico

## Caso de uso 05 - Publicar alinhamento entre areas

### Ator principal

Gestor ou lider de departamento

### Fluxo principal

1. o ator acessa o mural de departamentos
2. informa area, publico, autor e mensagem
3. publica o alinhamento
4. o sistema adiciona a mensagem ao mural
5. o sistema registra a atividade recente

## Caso de uso 06 - Consultar indicadores executivos

### Ator principal

Diretoria

### Fluxo principal

1. a diretoria acessa o dashboard
2. consulta solicitacoes ativas, bloqueios e lead time medio
3. identifica gargalos e prioridades operacionais

## Relacao com o prototipo

| Caso de uso | Tela principal |
|---|---|
| Registrar solicitacao | `/solicitacoes` |
| Acompanhar solicitacao | `/solicitacoes` |
| Atualizar status | `/solicitacoes` |
| Gerenciar tarefas | `/tarefas` |
| Publicar alinhamento | `/departamentos` |
| Consultar indicadores | `/` |

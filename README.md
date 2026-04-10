# IntegraFlow

Prototipo funcional de um sistema corporativo para gestao integrada de solicitacoes internas, tarefas interdepartamentais e comunicacao operacional.

## Objetivo

O projeto foi concebido para responder ao desafio de engenharia de software proposto no enunciado:

- centralizar solicitacoes internas em um unico fluxo
- aumentar a rastreabilidade das tarefas entre departamentos
- reduzir retrabalho com atualizacoes e historicos visiveis
- apoiar uma abordagem agil e iterativa com backlog, requisitos e UML

## Escopo do MVP

O prototipo implementa quatro frentes principais:

- `/` dashboard com indicadores, funil e historico recente
- `/solicitacoes` cadastro, filtro e acompanhamento de demandas
- `/tarefas` quadro operacional por etapa
- `/departamentos` mural de alinhamentos interdepartamentais

## Stack

- Next.js 16.2.2
- React 19
- TypeScript
- App Router
- CSS global com design system proprio

## Estrutura

```text
src/
  app/
  components/
  lib/
docs/
  01-visao-produto.md
  02-requisitos.md
  03-backlog.md
  04-modelagem-uml.md
  05-validacao.md
  06-casos-de-uso.md
  07-arquitetura.md
  08-relatorio-analise-processo.md
  09-analise-stakeholders.md
  10-modelagem-processo-atual-bpmn.md
```

## Artefatos tecnicos

Os principais artefatos do projeto ficam em `docs/`:

- [01-visao-produto.md](./docs/01-visao-produto.md)
- [02-requisitos.md](./docs/02-requisitos.md)
- [03-backlog.md](./docs/03-backlog.md)
- [04-modelagem-uml.md](./docs/04-modelagem-uml.md)
- [05-validacao.md](./docs/05-validacao.md)
- [06-casos-de-uso.md](./docs/06-casos-de-uso.md)
- [07-arquitetura.md](./docs/07-arquitetura.md)
- [08-relatorio-analise-processo.md](./docs/08-relatorio-analise-processo.md)
- [09-analise-stakeholders.md](./docs/09-analise-stakeholders.md)
- [10-modelagem-processo-atual-bpmn.md](./docs/10-modelagem-processo-atual-bpmn.md)

## Como rodar

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
```

## Estado atual

- prototipo navegavel implementado
- modelagem e documentacao inicial concluida
- build validado localmente
- vulnerabilidades conhecidas do `npm audit` resolvidas na base atual

## Evolucoes recomendadas

- persistencia real em banco de dados
- autenticacao por perfil
- trilha de auditoria por usuario
- notificacoes e anexos
- validacao formal com stakeholders reais

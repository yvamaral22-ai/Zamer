# 05. Validacao com Stakeholders

## Status atual

O prototipo funcional foi concluido e esta pronto para validacao.

**Importante:** nesta etapa nao houve sessao real com usuarios externos. O documento abaixo prepara a conducao da validacao e registra como os feedbacks devem ser coletados.

## Objetivo da validacao

Verificar se o prototipo:

- representa adequadamente o processo escolhido
- reduz perda de contexto entre departamentos
- facilita acompanhamento de prazos e bloqueios
- apresenta navegação intuitiva para os stakeholders

## Stakeholders sugeridos para a sessao

- 1 representante da diretoria
- 1 lider de TI
- 1 lider de RH
- 1 lider de operacoes
- 1 usuario solicitante interno

## Roteiro da sessao

### Etapa 1 - Contextualizacao

- apresentar o problema atual
- explicar o objetivo do sistema
- mostrar o fluxo do MVP

### Etapa 2 - Cenarios de teste

1. cadastrar uma nova solicitacao
2. localizar a demanda e consultar detalhes
3. avancar o status da solicitacao
4. abrir o quadro de tarefas e verificar bloqueios
5. publicar um alinhamento entre departamentos
6. retornar ao dashboard e confirmar a rastreabilidade

### Etapa 3 - Coleta de feedback

Perguntas sugeridas:

- o fluxo representado faz sentido para sua rotina?
- alguma informacao essencial ficou faltando?
- o quadro de tarefas ajuda a entender gargalos?
- o mural de alinhamentos reduz dependencia de mensagens soltas?
- o que seria prioridade para a proxima iteracao?

## Criterios de sucesso

- pelo menos 80% dos participantes entendem o fluxo sem explicacao adicional
- os stakeholders conseguem completar os cenarios principais sem bloqueio grave
- o dashboard e percebido como util para acompanhamento
- a centralizacao da informacao e avaliada como melhoria clara

## Template de registro

| Stakeholder | Tela | Feedback | Severidade | Acao sugerida |
|---|---|---|---|---|
| Exemplo | `/solicitacoes` | Falta campo para categoria | Media | Incluir categoria na proxima iteracao |

## Proximos passos apos a validacao

- priorizar melhorias a partir dos feedbacks
- definir backlog da iteracao seguinte
- evoluir o prototipo para persistencia real
- considerar autenticacao e historico por usuario

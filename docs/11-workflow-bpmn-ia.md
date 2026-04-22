# Workflow Do Projeto Para IA Gerar BPMN

## Objetivo Do Sistema

O sistema IntegraFlow centraliza solicitacoes internas, execucao de tasks e comunicacao entre departamentos em um unico fluxo rastreavel.

## Atores Sugeridos Para O BPMN

- Solicitante
- Departamento responsavel
- Responsavel da solicitacao
- Equipe operacional
- Gestores ou diretoria

## Telas E Funcoes Do Site

- `Painel`: mostra KPIs, distribuicao das solicitacoes por status, tasks criticas, carga por departamento e historico recente.
- `Solicitacoes`: permite criar, listar, filtrar, selecionar, editar, comentar e avancar solicitacoes.
- `Tarefas`: mostra um quadro por etapa, permite comentar e mover tasks entre `Planejada`, `Em progresso`, `Bloqueada` e `Concluida`.
- `Departamentos`: mostra o resumo por area e permite publicar alinhamentos operacionais para `Todos`, `Gestores` ou `Operacional`.

## Workflow Principal Da Solicitacao

1. O solicitante abre uma nova solicitacao informando titulo, solicitante, departamento, prioridade, prazo e descricao.
2. O sistema cria a solicitacao com status `Nova`, define o `owner` com base no lider do departamento e cria automaticamente uma task inicial em `Planejada`.
3. A equipe acessa a central de solicitacoes, pesquisa ou filtra a demanda e seleciona a solicitacao para ver o contexto completo.
4. O responsavel pode editar os dados da solicitacao, ajustando escopo, solicitante, departamento, prioridade, prazo, descricao e `owner`.
5. Antes de avancar a solicitacao, o responsavel registra um comentario de andamento explicando o que esta sendo feito, bloqueios ou proximos passos.
6. A solicitacao avanca pelas etapas `Nova -> Triagem -> Execucao -> Validacao -> Concluida`.
7. Na etapa `Validacao`, o proximo avancar representa o encerramento da solicitacao como `Concluida`.

## Workflow Principal Das Tasks

1. Cada solicitacao possui uma ou mais tasks vinculadas.
2. As tasks aparecem no quadro nas colunas `Planejada`, `Em progresso`, `Bloqueada` e `Concluida`.
3. O responsavel da task pode registrar comentario de contexto diretamente no card sem mudar de etapa.
4. Para avancar uma task, o usuario registra o contexto e move a task para a proxima etapa.
5. A task tambem pode voltar para a etapa anterior quando necessario.
6. Quando uma task chega em `Concluida`, a solicitacao vinculada e movida automaticamente para `Validacao` caso ainda nao esteja concluida.
7. Se a task estiver bloqueada, o quadro deve evidenciar o risco e o motivo do bloqueio.

## Workflow De Comunicacao Entre Departamentos

1. Usuarios acessam a tela de departamentos para ver capacidade, demandas abertas e bloqueios por area.
2. Um usuario publica um alinhamento operacional informando departamento, publico, autor e mensagem.
3. O alinhamento entra no feed de atualizacoes e passa a compor o historico do sistema.

## Regras De Rastreabilidade

- Toda mudanca importante deve gerar historico.
- Comentarios podem ser registrados em solicitacoes e em tasks.
- Mudancas de status entram no historico recente do painel.
- Atualizacoes publicadas no mural tambem entram no historico.

## Regras De Negocio Importantes

- Criar solicitacao gera task inicial automaticamente.
- Editar solicitacao pode atualizar departamento, `owner` e prazo das tasks abertas vinculadas.
- Avancar solicitacao exige comentario de andamento.
- Avancar ou concluir task exige comentario de contexto.
- Concluir task empurra a solicitacao para `Validacao`.
- Concluir solicitacao fecha o fluxo ate a entrega final.

## Estrutura BPMN Sugerida

- Evento inicial: solicitacao aberta.
- Atividade: registrar solicitacao.
- Atividade automatica: criar task inicial e definir responsavel.
- Gateway: dados da solicitacao precisam de ajuste?
- Atividade: editar solicitacao.
- Atividade: registrar comentario de andamento.
- Subprocesso: executar tasks vinculadas.
- Gateway: existe bloqueio?
- Atividade: publicar alinhamento entre departamentos.
- Gateway: task concluida?
- Atividade automatica: mover solicitacao para `Validacao`.
- Atividade: validar entrega final.
- Gateway: aprovado?
- Se sim: concluir solicitacao.
- Se nao: retornar para `Execucao` com novo comentario e nova rodada de tasks.

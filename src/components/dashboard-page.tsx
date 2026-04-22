'use client';

import Link from 'next/link';

import { usePrototype } from '@/components/prototype-provider';
import {
  DepartmentPill,
  MetricCard,
  Panel,
  SectionHeader,
  StatusPill,
} from '@/components/ui';
import {
  differenceInDays,
  formatDateTime,
  formatShortDate,
  isCriticalDeadline,
  isOpenRequest,
  relativeSlaText,
} from '@/lib/formatters';
import { requestStatusOrder } from '@/lib/prototype-data';

const bpmnWorkflowNotes = `BRIEFING PARA IA GERAR O BPMN DO PROJETO INTEGRAFLOW

1. Objetivo do sistema
O sistema centraliza solicitacoes internas, execucao de tasks e comunicacao entre departamentos em um unico fluxo rastreavel.

2. Atores sugeridos para o BPMN
Solicitante
Departamento responsavel
Responsavel da solicitacao
Equipe operacional
Gestores ou diretoria

3. Telas e funcoes do site
Painel: mostra KPIs, distribuicao das solicitacoes por status, tasks criticas, carga por departamento e historico recente.
Solicitacoes: permite criar, listar, filtrar, selecionar, editar, comentar e avancar solicitacoes.
Tarefas: mostra um quadro por etapa, permite comentar e mover tasks entre Planejada, Em progresso, Bloqueada e Concluida.
Departamentos: mostra o resumo por area e permite publicar alinhamentos operacionais para Todos, Gestores ou Operacional.

4. Workflow principal da solicitacao
Passo 1: o solicitante abre uma nova solicitacao informando titulo, solicitante, departamento, prioridade, prazo e descricao.
Passo 2: o sistema cria a solicitacao com status Nova, define o owner com base no lider do departamento e cria automaticamente uma task inicial em Planejada.
Passo 3: a equipe acessa a central de solicitacoes, pesquisa ou filtra a demanda e seleciona a solicitacao para ver o contexto completo.
Passo 4: o responsavel pode editar os dados da solicitacao, ajustando escopo, solicitante, departamento, prioridade, prazo, descricao e owner.
Passo 5: antes de avancar a solicitacao, o responsavel registra um comentario de andamento explicando o que esta sendo feito, bloqueios ou proximos passos.
Passo 6: a solicitacao avanca pelas etapas Nova -> Triagem -> Execucao -> Validacao -> Concluida.
Passo 7: na etapa Validacao, o proximo avancar representa o encerramento da solicitacao como Concluida.

5. Workflow principal das tasks
Passo 1: cada solicitacao possui uma ou mais tasks vinculadas.
Passo 2: as tasks aparecem no quadro nas colunas Planejada, Em progresso, Bloqueada e Concluida.
Passo 3: o responsavel da task pode registrar comentario de contexto diretamente no card sem mudar de etapa.
Passo 4: para avancar uma task, o usuario registra o contexto e move a task para a proxima etapa.
Passo 5: a task tambem pode voltar para a etapa anterior quando necessario.
Passo 6: quando uma task chega em Concluida, a solicitacao vinculada e movida automaticamente para Validacao caso ainda nao esteja concluida.
Passo 7: se a task estiver bloqueada, o quadro deve evidenciar o risco e o motivo do bloqueio.

6. Workflow de comunicacao entre departamentos
Passo 1: usuarios acessam a tela de departamentos para ver capacidade, demandas abertas e bloqueios por area.
Passo 2: um usuario publica um alinhamento operacional informando departamento, publico, autor e mensagem.
Passo 3: o alinhamento entra no feed de atualizacoes e passa a compor o historico do sistema.

7. Regras de rastreabilidade
Toda mudanca importante deve gerar historico.
Comentarios podem ser registrados em solicitacoes e em tasks.
Mudancas de status entram no historico recente do painel.
Atualizacoes publicadas no mural tambem entram no historico.

8. Regras de negocio importantes
Criar solicitacao gera task inicial automaticamente.
Editar solicitacao pode atualizar departamento, owner e prazo das tasks abertas vinculadas.
Avancar solicitacao exige comentario de andamento.
Avancar ou concluir task exige comentario de contexto.
Concluir task empurra a solicitacao para Validacao.
Concluir solicitacao fecha o fluxo ate a entrega final.

9. Estrutura BPMN sugerida
Evento inicial: solicitacao aberta.
Atividade: registrar solicitacao.
Atividade automatica: criar task inicial e definir responsavel.
Gateway: dados da solicitacao precisam de ajuste?
Atividade: editar solicitacao.
Atividade: registrar comentario de andamento.
Subprocesso: executar tasks vinculadas.
Gateway: existe bloqueio?
Atividade: publicar alinhamento entre departamentos.
Gateway: task concluida?
Atividade automatica: mover solicitacao para Validacao.
Atividade: validar entrega final.
Gateway: aprovado?
Se sim: concluir solicitacao.
Se nao: retornar para Execucao com novo comentario e nova rodada de tasks.`;

export function DashboardPage() {
  const { activities, departments, requests, tasks, updates } = usePrototype();

  const openRequests = requests.filter((request) => isOpenRequest(request.status));
  const blockedTasks = tasks.filter((task) => task.status === 'Bloqueada');
  const criticalTasks = tasks
    .filter((task) => task.status !== 'Concluida')
    .filter((task) => task.status === 'Bloqueada' || isCriticalDeadline(task.dueAt))
    .slice(0, 4);

  const averageLeadTime =
    openRequests.length > 0
      ? Math.round(
          openRequests.reduce(
            (sum, request) => sum + differenceInDays(request.openedAt, request.dueAt),
            0,
          ) / openRequests.length,
        )
      : 0;

  const mostRecentUpdate = updates[0];
  const maxStatusCount = Math.max(
    ...requestStatusOrder.map(
      (status) => requests.filter((request) => request.status === status).length,
    ),
    1,
  );

  return (
    <div className="workspace reveal">
      <SectionHeader
        eyebrow="Problema alvo"
        title="Fluxo unico para demandas, execucao e comunicacao entre areas"
        description="O painel resume a operacao e destaca onde a diretoria ganha visibilidade imediata."
        action={
          <Link href="/solicitacoes" className="button-link">
            Abrir central de solicitacoes
          </Link>
        }
      />

      <div className="metric-grid">
        <MetricCard
          label="Solicitacoes ativas"
          value={String(openRequests.length)}
          note="Demandas ainda em andamento no funil"
        />
        <MetricCard
          label="Tasks bloqueadas"
          value={String(blockedTasks.length)}
          note="Itens que exigem destravamento imediato"
        />
        <MetricCard
          label="Lead time medio"
          value={`${averageLeadTime} dias`}
          note="Janela media planejada por solicitacao"
        />
        <MetricCard
          label="Ultimo alinhamento"
          value={mostRecentUpdate ? formatShortDate(mostRecentUpdate.createdAt) : '-'}
          note="Data do comunicado interdepartamental mais recente"
        />
      </div>

      <div className="section-grid section-grid--wide">
        <Panel>
          <SectionHeader
            eyebrow="Funil atual"
            title="Distribuicao das solicitacoes"
            description="Visao resumida do pipeline para acompanhamento executivo."
          />
          <div className="progress-stack">
            {requestStatusOrder.map((status) => {
              const count = requests.filter((request) => request.status === status).length;
              const width = `${(count / maxStatusCount) * 100}%`;

              return (
                <div className="progress-row" key={status}>
                  <div className="progress-row__label">
                    <StatusPill value={status} />
                    <strong>{count}</strong>
                  </div>
                  <div className="progress-row__track">
                    <span className="progress-row__fill" style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow="Atencao imediata"
            title="Tasks criticas desta sprint"
            description="Bloqueios e prazos proximos recebem destaque para evitar atrasos em cascata."
          />
          <div className="feed">
            {criticalTasks.map((task) => {
              const request = requests.find((item) => item.id === task.requestId);
              const department = departments.find((item) => item.id === task.departmentId);

              return (
                <article className="feed-item" key={task.id}>
                  <div className="feed-item__content">
                    <div className="feed-item__header">
                      <strong>{task.title}</strong>
                      <StatusPill value={task.status} />
                    </div>
                    <p>{request?.title ?? 'Solicitacao relacionada'}</p>
                    <div className="meta-row">
                      {department ? <DepartmentPill department={department} /> : null}
                      <span>{relativeSlaText(task.dueAt)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="section-grid">
        <Panel>
          <SectionHeader
            eyebrow="Capacidade por area"
            title="Carga operacional dos departamentos"
            description="Cada area exibe backlog aberto e foco tatico atual."
          />

          <div className="department-list">
            {departments.map((department) => {
              const requestCount = requests.filter(
                (request) =>
                  request.departmentId === department.id && isOpenRequest(request.status),
              ).length;
              const taskCount = tasks.filter(
                (task) => task.departmentId === department.id && task.status !== 'Concluida',
              ).length;

              return (
                <div className="department-row" key={department.id}>
                  <div>
                    <DepartmentPill department={department} />
                    <p className="department-row__goal">{department.goal}</p>
                  </div>
                  <div className="department-row__metrics">
                    <strong>{requestCount} demandas</strong>
                    <span>{taskCount} tasks abertas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow="Rastreabilidade"
            title="Historico recente da operacao"
            description="Feed que concentra mudancas de status e comunicados para reduzir perda de contexto."
          />
          <div className="feed">
            {activities.slice(0, 5).map((activity) => (
              <article className="feed-item" key={activity.id}>
                <div className="feed-item__content">
                  <div className="feed-item__header">
                    <strong>{activity.label}</strong>
                    <span>{formatDateTime(activity.createdAt)}</span>
                  </div>
                  <p>{activity.highlight}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionHeader
          eyebrow="Bloco de notas"
          title="Workflow do projeto para IA gerar BPMN"
          description="Texto pronto para copiar e colar em outra IA e pedir a modelagem BPMN do processo do sistema."
        />
        <p className="notes-block__hint">
          Copie o texto abaixo e use como prompt base para gerar o BPMN do fluxo completo.
        </p>
        <textarea
          className="notes-block"
          value={bpmnWorkflowNotes}
          readOnly
          rows={30}
          spellCheck={false}
        />
      </Panel>

      <Panel className="panel--spotlight">
        <SectionHeader
          eyebrow="Proximo passo do MVP"
          title="Fechar o ciclo da solicitacao ate a validacao final"
          description="A combinacao de trilha de historico, status visiveis e handoffs claros reduz retrabalho e aumenta previsibilidade."
          action={
            <Link href="/tarefas" className="button-link button-link--dark">
              Ver quadro de execucao
            </Link>
          }
        />
        <div className="spotlight-grid">
          <div>
            <span className="eyebrow">Beneficio esperado</span>
            <p className="spotlight-copy">
              Menor dependencia de mensagens soltas e mais clareza sobre quem esta com
              cada etapa.
            </p>
          </div>
          <div className="detail-block">
            <span className="detail-block__label">Entrega desta iteracao</span>
            <strong>Analise, modelagem e prototipo navegavel</strong>
          </div>
        </div>
      </Panel>
    </div>
  );
}

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
O sistema centraliza solicitações internas, execução de tarefas e comunicação entre departamentos em um único fluxo rastreável.

2. Atores sugeridos para o BPMN
Solicitante
Departamento responsável
Responsável pela solicitação
Equipe operacional
Gestores ou diretoria

3. Telas e funções do site
Painel: mostra KPIs, distribuição das solicitações por status, tarefas críticas, carga por departamento e histórico recente.
Solicitações: permite criar, listar, filtrar, selecionar, editar, comentar e avançar solicitações.
Tarefas: mostra um quadro por etapa e permite comentar e mover tarefas entre Planejada, Em progresso, Bloqueada e Concluída.
Departamentos: mostra o resumo por área e permite publicar alinhamentos operacionais para Todos, Gestores ou Operacional.

4. Fluxo principal da solicitação
Passo 1: o solicitante abre uma nova solicitação, informando título, solicitante, departamento, prioridade, prazo e descrição.
Passo 2: o sistema cria a solicitação com status Nova, define o responsável com base no líder do departamento e cria automaticamente uma tarefa inicial em Planejada.
Passo 3: a equipe acessa a central de solicitações, pesquisa ou filtra a demanda e seleciona a solicitação para ver o contexto completo.
Passo 4: o responsável pode editar os dados da solicitação, ajustando escopo, solicitante, departamento, prioridade, prazo, descrição e responsável.
Passo 5: antes de avançar a solicitação, o responsável registra um comentário de andamento, explicando o que está sendo feito, os bloqueios e os próximos passos.
Passo 6: a solicitação avança pelas etapas Nova -> Triagem -> Execução -> Validação -> Concluída.
Passo 7: na etapa Validação, o próximo avançar representa o encerramento da solicitação como Concluída.

5. Fluxo principal das tarefas
Passo 1: cada solicitação possui uma ou mais tarefas vinculadas.
Passo 2: as tarefas aparecem no quadro, nas colunas Planejada, Em progresso, Bloqueada e Concluída.
Passo 3: o responsável pela tarefa pode registrar comentário de contexto diretamente no card, sem mudar de etapa.
Passo 4: para avançar uma tarefa, o usuário registra o contexto e move a tarefa para a próxima etapa.
Passo 5: a tarefa também pode voltar para a etapa anterior, quando necessário.
Passo 6: quando uma tarefa chega em Concluída, a solicitação vinculada é movida automaticamente para Validação, caso ainda não esteja concluída.
Passo 7: se a tarefa estiver bloqueada, o quadro deve evidenciar o risco e o motivo do bloqueio.

6. Fluxo de comunicação entre departamentos
Passo 1: usuários acessam a tela de departamentos para ver capacidade, demandas abertas e bloqueios por área.
Passo 2: um usuário publica um alinhamento operacional, informando departamento, público, autor e mensagem.
Passo 3: o alinhamento entra no feed de atualizações e passa a compor o histórico do sistema.

7. Regras de rastreabilidade
Toda mudança importante deve gerar histórico.
Comentários podem ser registrados em solicitações e em tarefas.
Mudanças de status entram no histórico recente do painel.
Atualizações publicadas no mural também entram no histórico.

8. Regras de negócio importantes
Criar solicitação gera tarefa inicial automaticamente.
Editar solicitação pode atualizar departamento, responsável e prazo das tarefas abertas vinculadas.
Avançar solicitação exige comentário de andamento.
Avançar ou concluir tarefa exige comentário de contexto.
Concluir tarefa empurra a solicitação para Validação.
Concluir solicitação fecha o fluxo até a entrega final.

9. Estrutura BPMN sugerida
Evento inicial: solicitação aberta.
Atividade: registrar solicitação.
Atividade automática: criar tarefa inicial e definir responsável.
Gateway: os dados da solicitação precisam de ajuste?
Atividade: editar solicitação.
Atividade: registrar comentário de andamento.
Subprocesso: executar tarefas vinculadas.
Gateway: existe bloqueio?
Atividade: publicar alinhamento entre departamentos.
Gateway: tarefa concluída?
Atividade automática: mover solicitação para Validação.
Atividade: validar entrega final.
Gateway: aprovado?
Se sim: concluir solicitação.
Se não: retornar para Execução com novo comentário e nova rodada de tarefas.`;

export function DashboardPage() {
  const { activities, departments, requests, tasks, updates } = usePrototype();

  const openRequests = requests.filter((request) => isOpenRequest(request.status));
  const blockedTasks = tasks.filter((task) => task.status === 'Bloqueada');
  const criticalTasks = tasks
    .filter((task) => task.status !== 'Concluída')
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
        title="Fluxo único para demandas, execução e comunicação entre áreas"
        description="O painel resume a operação e destaca onde a diretoria ganha visibilidade imediata."
        action={
          <Link href="/solicitacoes" className="button-link">
            Abrir central de solicitações
          </Link>
        }
      />

      <div className="metric-grid">
        <MetricCard
          label="Solicitações ativas"
          value={String(openRequests.length)}
          note="Demandas ainda em andamento no funil"
        />
        <MetricCard
          label="Tarefas bloqueadas"
          value={String(blockedTasks.length)}
          note="Itens que exigem destravamento imediato"
        />
        <MetricCard
          label="Lead time médio"
          value={`${averageLeadTime} dias`}
          note="Janela média planejada por solicitação"
        />
        <MetricCard
          label="Último alinhamento"
          value={mostRecentUpdate ? formatShortDate(mostRecentUpdate.createdAt) : '-'}
          note="Data do comunicado interdepartamental mais recente"
        />
      </div>

      <div className="section-grid section-grid--wide">
        <Panel>
          <SectionHeader
            eyebrow="Funil atual"
            title="Distribuição das solicitações"
            description="Visão resumida do pipeline para acompanhamento executivo."
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
            eyebrow="Atenção imediata"
            title="Tarefas críticas desta sprint"
            description="Bloqueios e prazos próximos recebem destaque para evitar atrasos em cascata."
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
                    <p>{request?.title ?? 'Solicitação relacionada'}</p>
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
            eyebrow="Capacidade por área"
            title="Carga operacional dos departamentos"
            description="Cada área exibe backlog aberto e foco tático atual."
          />

          <div className="department-list">
            {departments.map((department) => {
              const requestCount = requests.filter(
                (request) =>
                  request.departmentId === department.id && isOpenRequest(request.status),
              ).length;
              const taskCount = tasks.filter(
                (task) => task.departmentId === department.id && task.status !== 'Concluída',
              ).length;

              return (
                <div className="department-row" key={department.id}>
                  <div>
                    <DepartmentPill department={department} />
                    <p className="department-row__goal">{department.goal}</p>
                  </div>
                  <div className="department-row__metrics">
                    <strong>{requestCount} demandas</strong>
                    <span>{taskCount} tarefas abertas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow="Rastreabilidade"
            title="Histórico recente da operação"
            description="Feed que concentra mudanças de status e comunicados para reduzir perda de contexto."
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
          title="Fluxo do projeto para IA gerar BPMN"
          description="Texto pronto para copiar e colar em outra IA e solicitar a modelagem BPMN do processo do sistema."
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
          eyebrow="Próximo passo do MVP"
          title="Fechar o ciclo da solicitação até a validação final"
          description="A combinação de trilha de histórico, status visíveis e transições claras reduz retrabalho e aumenta previsibilidade."
          action={
            <Link href="/tarefas" className="button-link button-link--dark">
              Ver quadro de execução
            </Link>
          }
        />
        <div className="spotlight-grid">
          <div>
            <span className="eyebrow">Benefício esperado</span>
            <p className="spotlight-copy">
              Menor dependência de mensagens soltas e mais clareza sobre quem está com
              cada etapa.
            </p>
          </div>
          <div className="detail-block">
            <span className="detail-block__label">Entrega desta iteração</span>
            <strong>Análise, modelagem e protótipo navegável</strong>
          </div>
        </div>
      </Panel>
    </div>
  );
}

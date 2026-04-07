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

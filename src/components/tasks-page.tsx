'use client';

import { useState, useTransition } from 'react';

import { usePrototype } from '@/components/prototype-provider';
import {
  DepartmentPill,
  GhostButton,
  Panel,
  SectionHeader,
  StatusPill,
} from '@/components/ui';
import { formatShortDate, isCriticalDeadline, relativeSlaText } from '@/lib/formatters';
import { taskStatusOrder } from '@/lib/prototype-data';
import type { DepartmentId, TaskStatus } from '@/lib/types';

type DepartmentFilter = DepartmentId | 'Todas';

export function TasksPage() {
  const { departments, moveTask, requests, tasks } = usePrototype();
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('Todas');
  const [isPending, startTransition] = useTransition();

  const visibleTasks =
    departmentFilter === 'Todas'
      ? tasks
      : tasks.filter((task) => task.departmentId === departmentFilter);

  const blockedTasks = visibleTasks.filter((task) => task.status === 'Bloqueada').length;
  const tasksNearDeadline = visibleTasks.filter(
    (task) => task.status !== 'Concluida' && isCriticalDeadline(task.dueAt),
  ).length;

  function shiftTask(taskId: string, direction: 'back' | 'forward') {
    startTransition(() => {
      moveTask(taskId, direction);
    });
  }

  return (
    <div className="workspace reveal">
      <SectionHeader
        eyebrow="Execucao rastreavel"
        title="Quadro de tarefas por etapa"
        description="O quadro organiza dependencias do fluxo e deixa claro quando uma entrega trava outra area."
        action={
          <select
            className="select-inline"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value as DepartmentFilter)}
          >
            <option value="Todas">Todas as areas</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-card__label">Tasks filtradas</span>
          <strong className="metric-card__value">{visibleTasks.length}</strong>
          <span className="metric-card__note">Total atual no quadro</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Bloqueios</span>
          <strong className="metric-card__value">{blockedTasks}</strong>
          <span className="metric-card__note">Itens esperando decisao ou insumo</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Prazos criticos</span>
          <strong className="metric-card__value">{tasksNearDeadline}</strong>
          <span className="metric-card__note">Tasks com prazo em ate 2 dias</span>
        </div>
      </div>

      <div className="board">
        {taskStatusOrder.map((status) => {
          const columnTasks = visibleTasks.filter((task) => task.status === status);

          return (
            <Panel className="board__column" key={status}>
              <div className="board__column-header">
                <div>
                  <span className="eyebrow">Etapa</span>
                  <h3>{status}</h3>
                </div>
                <strong>{columnTasks.length}</strong>
              </div>

              <div className="board__stack">
                {columnTasks.map((task) => {
                  const department = departments.find(
                    (departmentItem) => departmentItem.id === task.departmentId,
                  );
                  const request = requests.find((requestItem) => requestItem.id === task.requestId);
                  const isRisk = task.status === 'Bloqueada' || isCriticalDeadline(task.dueAt);
                  const index = taskStatusOrder.indexOf(task.status as TaskStatus);

                  return (
                    <article
                      className={isRisk ? 'task-card task-card--risk' : 'task-card'}
                      key={task.id}
                    >
                      <div className="task-card__header">
                        <strong>{task.title}</strong>
                        <StatusPill value={task.status} />
                      </div>

                      <p>{request?.title ?? 'Solicitacao vinculada'}</p>

                      <div className="meta-row">
                        {department ? <DepartmentPill department={department} /> : null}
                        <span>{task.assignee}</span>
                      </div>

                      <div className="meta-row">
                        <span>Prazo {formatShortDate(task.dueAt)}</span>
                        <span>{relativeSlaText(task.dueAt)}</span>
                      </div>

                      {task.blockedReason ? (
                        <p className="task-card__warning">{task.blockedReason}</p>
                      ) : null}

                      <div className="task-card__actions">
                        <GhostButton
                          disabled={isPending || index === 0}
                          onClick={() => shiftTask(task.id, 'back')}
                        >
                          Voltar
                        </GhostButton>
                        <GhostButton
                          disabled={isPending || index === taskStatusOrder.length - 1}
                          onClick={() => shiftTask(task.id, 'forward')}
                        >
                          Avancar
                        </GhostButton>
                      </div>
                    </article>
                  );
                })}

                {columnTasks.length === 0 ? (
                  <p className="empty-state">Nenhuma task nesta etapa.</p>
                ) : null}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

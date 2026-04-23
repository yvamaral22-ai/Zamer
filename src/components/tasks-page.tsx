'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { usePrototype } from '@/components/prototype-provider';
import {
  AccentButton,
  DepartmentPill,
  GhostButton,
  Panel,
  SectionHeader,
  StatusPill,
} from '@/components/ui';
import {
  formatDateTime,
  formatShortDate,
  initials,
  isCriticalDeadline,
  relativeSlaText,
} from '@/lib/formatters';
import { taskStatusOrder } from '@/lib/prototype-data';
import type { CommentItem, Department, DepartmentId, TaskItem, TaskStatus } from '@/lib/types';

type DepartmentFilter = DepartmentId | 'Todas';

const boardStatusClass: Record<TaskStatus, string> = {
  Planejada: 'board__column--planned',
  'Em progresso': 'board__column--progress',
  Bloqueada: 'board__column--blocked',
  Concluída: 'board__column--done',
};

function taskCountLabel(count: number) {
  return `${count} ${count === 1 ? 'tarefa' : 'tarefas'}`;
}

function columnSummary(status: TaskStatus, count: number, atRiskCount: number) {
  if (count === 0) {
    return 'Sem movimentação nesta etapa.';
  }

  if (status === 'Concluída') {
    return `${taskCountLabel(count)} com contexto final registrado.`;
  }

  if (status === 'Bloqueada') {
    return `${taskCountLabel(count)} aguardando destravamento.`;
  }

  if (atRiskCount > 0) {
    return `${atRiskCount} exigem atenção imediata ao prazo.`;
  }

  return `${taskCountLabel(count)} distribuídas com acompanhamento ativo.`;
}

function TaskBoardCard({
  comments,
  department,
  isExpanded,
  onToggle,
  requestTitle,
  task,
}: {
  comments: CommentItem[];
  department?: Department;
  isExpanded: boolean;
  onToggle: () => void;
  requestTitle: string;
  task: TaskItem;
}) {
  const isRisk = task.status === 'Bloqueada' || isCriticalDeadline(task.dueAt);
  const latestComment = comments[0];
  const commentCountLabel = `${comments.length} ${comments.length === 1 ? 'comentário' : 'comentários'}`;
  const previewLabel = task.blockedReason
    ? 'Bloqueio ativo'
    : latestComment
      ? `Último contexto por ${latestComment.author}`
      : isRisk
        ? 'Tarefa em atenção imediata'
        : 'Tarefa pronta para atualização';
  const previewMeta = latestComment
    ? formatDateTime(latestComment.createdAt)
    : `Prazo ${formatShortDate(task.dueAt)}`;
  const previewText =
    task.blockedReason ??
    latestComment?.message ??
    'Abra os detalhes para registrar contexto, comentar a execução e mover a tarefa com mais clareza.';

  return (
    <article
      className={[
        'task-card',
        isRisk ? 'task-card--risk' : '',
        isExpanded ? 'task-card--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="task-card__summary"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`task-inspector-${task.id}`}
      >
        <div className="task-card__summary-top">
          <div className="task-card__summary-main">
            <div className="task-card__summary-tags">
              {department ? <DepartmentPill department={department} /> : null}
              <span className="task-card__owner">
                <span className="task-card__avatar">{initials(task.assignee)}</span>
                {task.assignee}
              </span>
            </div>

            <div className="task-card__header">
              <strong>{task.title}</strong>
              <StatusPill value={task.status} />
            </div>
          </div>

          <span className="task-card__toggle-indicator">
            {isExpanded ? 'Em foco' : 'Abrir detalhes'}
          </span>
        </div>

        <p className="task-card__request-title">{requestTitle}</p>

        <div className="task-card__meta-grid">
          <span className="task-card__meta-chip">Prazo {formatShortDate(task.dueAt)}</span>
          <span
            className={[
              'task-card__meta-chip',
              isRisk ? 'task-card__meta-chip--risk' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {relativeSlaText(task.dueAt)}
          </span>
          <span className="task-card__meta-chip">Esforço {task.effort}</span>
          <span className="task-card__meta-chip">{commentCountLabel}</span>
        </div>
      </button>

      <div className="task-card__preview">
        <p className={task.blockedReason ? 'task-card__warning' : 'task-card__preview-copy'}>
          {previewText}
        </p>

        <div className="task-card__preview-footer">
          <span>{previewLabel}</span>
          <span>{previewMeta}</span>
        </div>
      </div>
    </article>
  );
}

function TaskBoardDetails({
  comments,
  department,
  isPending,
  onAddComment,
  onClose,
  onMoveTask,
  requestTitle,
  task,
}: {
  comments: CommentItem[];
  department?: Department;
  isPending: boolean;
  onAddComment: (task: TaskItem, input: { author: string; message: string }) => void;
  onClose: () => void;
  onMoveTask: (
    task: TaskItem,
    direction: 'back' | 'forward',
    input?: { author: string; message: string },
  ) => void;
  requestTitle: string;
  task: TaskItem;
}) {
  const [commentForm, setCommentForm] = useState({
    author: task.assignee,
    message: '',
  });

  useEffect(() => {
    setCommentForm({
      author: task.assignee,
      message: '',
    });
  }, [task.id, task.assignee]);

  const isRisk = task.status === 'Bloqueada' || isCriticalDeadline(task.dueAt);
  const index = taskStatusOrder.indexOf(task.status);
  const nextStatus = taskStatusOrder[Math.min(index + 1, taskStatusOrder.length - 1)];
  const latestComment = comments[0];
  const hasCommentMessage = commentForm.message.trim().length > 0;
  const detailMessage =
    task.blockedReason ??
    latestComment?.message ??
    'Nenhum bloqueio foi registrado até aqui. Use o formulário ao lado para documentar o andamento antes de mover a tarefa.';

  return (
    <>
      <SectionHeader
        eyebrow="Tarefa em foco"
        title={task.title}
        description="Os detalhes ficam centralizados aqui para facilitar leitura, contexto e atualização da etapa."
        action={
          <GhostButton type="button" onClick={onClose}>
            Fechar detalhes
          </GhostButton>
        }
      />

      <div className="task-inspector__layout">
        <div className="task-inspector__content">
          <div className="tag-row">
            {department ? <DepartmentPill department={department} /> : null}
            <StatusPill value={task.status} />
            <span className="tag">Prazo {formatShortDate(task.dueAt)}</span>
            <span className="tag">{relativeSlaText(task.dueAt)}</span>
            <span className="tag">Esforço {task.effort}</span>
          </div>

          <p className={task.blockedReason ? 'task-card__warning' : 'panel-copy'}>
            {detailMessage}
          </p>

          <div className="detail-grid">
            <div className="detail-block">
              <span className="detail-block__label">Solicitação vinculada</span>
              <strong>{requestTitle}</strong>
            </div>
            <div className="detail-block">
              <span className="detail-block__label">Responsável</span>
              <strong>{task.assignee}</strong>
            </div>
            <div className="detail-block">
              <span className="detail-block__label">Prazo final</span>
              <strong>{formatShortDate(task.dueAt)}</strong>
            </div>
            <div className="detail-block">
              <span className="detail-block__label">Situação</span>
              <strong>{isRisk ? 'Exige atenção' : 'Acompanhamento estável'}</strong>
            </div>
          </div>

          <div className="detail-stack">
            <SectionHeader
              eyebrow="Histórico"
              title="Últimos registros da tarefa"
              description="Comentários recentes ajudam a entender a transição da etapa sem abrir outros painéis."
            />

            {comments.length > 0 ? (
              <div className="feed">
                {comments.slice(0, 3).map((comment) => (
                  <article className="feed-item" key={comment.id}>
                    <div className="feed-item__content">
                      <div className="feed-item__header">
                        <strong>{comment.author}</strong>
                        <span>{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p>{comment.message}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">Nenhum comentário foi registrado nesta tarefa.</p>
            )}
          </div>
        </div>

        <form
          className="task-inspector__form"
          onSubmit={(event) => {
            event.preventDefault();

            if (!hasCommentMessage) {
              return;
            }

            onAddComment(task, {
              author: commentForm.author.trim() || task.assignee,
              message: commentForm.message.trim(),
            });
            setCommentForm((current) => ({
              ...current,
              message: '',
            }));
          }}
        >
          <SectionHeader
            eyebrow="Atualização"
            title="Registrar contexto da etapa"
            description="Comente o andamento e use os controles abaixo para avançar, concluir ou retornar a tarefa."
          />

          <label className="task-card__field">
            Autor do comentário
            <input
              value={commentForm.author}
              onChange={(event) =>
                setCommentForm((current) => ({
                  ...current,
                  author: event.target.value,
                }))
              }
              placeholder="Quem está atualizando a tarefa"
            />
          </label>

          <label className="task-card__field">
            Contexto da etapa
            <textarea
              value={commentForm.message}
              onChange={(event) =>
                setCommentForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="Ex.: Implementação em andamento, testes iniciados e dependência externa ainda pendente."
              rows={5}
            />
          </label>

          <div className="task-card__actions">
            <GhostButton type="submit" disabled={isPending || !hasCommentMessage}>
              Registrar comentário
            </GhostButton>

            <GhostButton
              type="button"
              disabled={isPending || index === 0}
              onClick={() => onMoveTask(task, 'back')}
            >
              Voltar
            </GhostButton>

            <AccentButton
              type="button"
              disabled={isPending || index === taskStatusOrder.length - 1 || !hasCommentMessage}
              onClick={() => {
                onMoveTask(task, 'forward', {
                  author: commentForm.author.trim() || task.assignee,
                  message: commentForm.message.trim(),
                });
                setCommentForm((current) => ({
                  ...current,
                  message: '',
                }));
              }}
            >
              {nextStatus === 'Concluída' ? 'Concluir com contexto' : 'Avançar com contexto'}
            </AccentButton>
          </div>
        </form>
      </div>
    </>
  );
}

export function TasksPage() {
  const { addComment, comments, departments, moveTask, requests, tasks } = usePrototype();
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('Todas');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inspectorRef = useRef<HTMLDivElement | null>(null);

  const visibleTasks =
    departmentFilter === 'Todas'
      ? tasks
      : tasks.filter((task) => task.departmentId === departmentFilter);

  const departmentsById = new Map(departments.map((department) => [department.id, department]));
  const requestsById = new Map(requests.map((request) => [request.id, request]));
  const taskCommentsById = comments.reduce((map, comment) => {
    if (comment.entityType !== 'task') {
      return map;
    }

    const currentComments = map.get(comment.entityId) ?? [];
    currentComments.push(comment);
    map.set(comment.entityId, currentComments);
    return map;
  }, new Map<string, CommentItem[]>());

  const blockedTasks = visibleTasks.filter((task) => task.status === 'Bloqueada').length;
  const tasksNearDeadline = visibleTasks.filter(
    (task) => task.status !== 'Concluída' && isCriticalDeadline(task.dueAt),
  ).length;

  const selectedTask = expandedTaskId
    ? visibleTasks.find((task) => task.id === expandedTaskId) ?? null
    : null;
  const selectedDepartment = selectedTask
    ? departmentsById.get(selectedTask.departmentId)
    : undefined;
  const selectedRequest = selectedTask
    ? requestsById.get(selectedTask.requestId)
    : undefined;
  const selectedComments = selectedTask ? taskCommentsById.get(selectedTask.id) ?? [] : [];

  useEffect(() => {
    if (!expandedTaskId) {
      return;
    }

    const taskIsVisible = visibleTasks.some((task) => task.id === expandedTaskId);

    if (!taskIsVisible) {
      setExpandedTaskId(null);
    }
  }, [expandedTaskId, visibleTasks]);

  useEffect(() => {
    if (!selectedTask) {
      return;
    }

    inspectorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [selectedTask?.id]);

  function handleAddTaskComment(
    task: TaskItem,
    input: { author: string; message: string },
  ) {
    startTransition(() => {
      addComment({
        entityType: 'task',
        entityId: task.id,
        departmentId: task.departmentId,
        author: input.author,
        message: input.message,
      });
    });
  }

  function handleMoveTask(
    task: TaskItem,
    direction: 'back' | 'forward',
    input?: { author: string; message: string },
  ) {
    startTransition(() => {
      moveTask(task.id, direction, input);
    });
  }

  return (
    <div className="workspace reveal">
      <SectionHeader
        eyebrow="Execução rastreável"
        title="Quadro de tarefas por etapa"
        description="Clique em uma tarefa para abrir os detalhes em um painel dedicado, com contexto, histórico e ações da etapa."
        action={
          <select
            className="select-inline"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value as DepartmentFilter)}
          >
            <option value="Todas">Todas as áreas</option>
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
          <span className="metric-card__label">Tarefas filtradas</span>
          <strong className="metric-card__value">{visibleTasks.length}</strong>
          <span className="metric-card__note">Total atual no quadro</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Bloqueios</span>
          <strong className="metric-card__value">{blockedTasks}</strong>
          <span className="metric-card__note">Itens aguardando decisão ou insumo</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Prazos críticos</span>
          <strong className="metric-card__value">{tasksNearDeadline}</strong>
          <span className="metric-card__note">Tarefas com prazo em até 2 dias</span>
        </div>
      </div>

      <div ref={inspectorRef} id={selectedTask ? `task-inspector-${selectedTask.id}` : undefined}>
        {selectedTask ? (
          <Panel className="task-inspector">
            <TaskBoardDetails
              comments={selectedComments}
              department={selectedDepartment}
              isPending={isPending}
              onAddComment={handleAddTaskComment}
              onClose={() => setExpandedTaskId(null)}
              onMoveTask={handleMoveTask}
              requestTitle={selectedRequest?.title ?? 'Solicitação vinculada'}
              task={selectedTask}
            />
          </Panel>
        ) : (
          <Panel className="task-inspector task-inspector--empty">
            <SectionHeader
              eyebrow="Detalhamento"
              title="Selecione uma tarefa do quadro"
              description="Use o botão “Abrir detalhes” em qualquer card para visualizar informações completas, histórico e ações da etapa."
            />
          </Panel>
        )}
      </div>

      <div className="board">
        {taskStatusOrder.map((status) => {
          const columnTasks = visibleTasks.filter((task) => task.status === status);
          const atRiskTasks = columnTasks.filter(
            (task) => task.status === 'Bloqueada' || isCriticalDeadline(task.dueAt),
          ).length;

          return (
            <Panel className={`board__column ${boardStatusClass[status]}`} key={status}>
              <div className="board__column-header">
                <div className="board__column-copy">
                  <span className="eyebrow">Etapa</span>
                  <h3>{status}</h3>
                  <p>{columnSummary(status, columnTasks.length, atRiskTasks)}</p>
                </div>
                <div className="board__column-badge">
                  <strong>{columnTasks.length}</strong>
                  <span>{taskCountLabel(columnTasks.length)}</span>
                </div>
              </div>

              <div className="board__stack">
                {columnTasks.map((task) => {
                  const department = departmentsById.get(task.departmentId);
                  const request = requestsById.get(task.requestId);
                  const taskComments = taskCommentsById.get(task.id) ?? [];

                  return (
                    <TaskBoardCard
                      comments={taskComments}
                      department={department}
                      isExpanded={expandedTaskId === task.id}
                      key={task.id}
                      onToggle={() =>
                        setExpandedTaskId((current) => (current === task.id ? null : task.id))
                      }
                      requestTitle={request?.title ?? 'Solicitação vinculada'}
                      task={task}
                    />
                  );
                })}

                {columnTasks.length === 0 ? (
                  <div className="empty-state empty-state--board">
                    <strong>Quadro limpo</strong>
                    <span>Nenhuma tarefa precisa de acompanhamento nesta etapa.</span>
                  </div>
                ) : null}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

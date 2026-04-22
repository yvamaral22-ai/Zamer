'use client';

import { useEffect, useState, useTransition } from 'react';

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
  isCriticalDeadline,
  relativeSlaText,
} from '@/lib/formatters';
import { taskStatusOrder } from '@/lib/prototype-data';
import type { CommentItem, Department, DepartmentId, TaskItem, TaskStatus } from '@/lib/types';

type DepartmentFilter = DepartmentId | 'Todas';

function TaskBoardCard({
  comments,
  department,
  isPending,
  onAddComment,
  onMoveTask,
  requestTitle,
  task,
}: {
  comments: CommentItem[];
  department?: Department;
  isPending: boolean;
  onAddComment: (task: TaskItem, input: { author: string; message: string }) => void;
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
  const index = taskStatusOrder.indexOf(task.status as TaskStatus);
  const nextStatus = taskStatusOrder[Math.min(index + 1, taskStatusOrder.length - 1)];
  const hasCommentMessage = commentForm.message.trim().length > 0;

  return (
    <article className={isRisk ? 'task-card task-card--risk' : 'task-card'}>
      <div className="task-card__header">
        <strong>{task.title}</strong>
        <StatusPill value={task.status} />
      </div>

      <p>{requestTitle}</p>

      <div className="meta-row">
        {department ? <DepartmentPill department={department} /> : null}
        <span>{task.assignee}</span>
      </div>

      <div className="meta-row">
        <span>Prazo {formatShortDate(task.dueAt)}</span>
        <span>{relativeSlaText(task.dueAt)}</span>
      </div>

      {task.blockedReason ? <p className="task-card__warning">{task.blockedReason}</p> : null}

      <div className="task-card__comment-stack">
        <label className="task-card__field">
          Autor do comentario
          <input
            value={commentForm.author}
            onChange={(event) =>
              setCommentForm((current) => ({
                ...current,
                author: event.target.value,
              }))
            }
            placeholder="Quem esta atualizando a task"
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
            placeholder="Ex.: Implementacao em andamento, testes iniciados e dependencia externa ainda pendente."
            rows={3}
          />
        </label>
      </div>

      {comments.length > 0 ? (
        <div className="task-card__history">
          {comments.slice(0, 2).map((comment) => (
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
      ) : null}

      <div className="task-card__actions">
        <GhostButton
          type="button"
          disabled={isPending || !hasCommentMessage}
          onClick={() => {
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
          Registrar comentario
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
          {nextStatus === 'Concluida' ? 'Concluir com contexto' : 'Avancar com contexto'}
        </AccentButton>
      </div>
    </article>
  );
}

export function TasksPage() {
  const { addComment, comments, departments, moveTask, requests, tasks } = usePrototype();
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
        eyebrow="Execucao rastreavel"
        title="Quadro de tarefas por etapa"
        description="Cada card agora aceita comentario de andamento antes de avancar ou concluir a execucao."
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
                  const taskComments = comments.filter(
                    (comment) =>
                      comment.entityType === 'task' && comment.entityId === task.id,
                  );

                  return (
                    <TaskBoardCard
                      comments={taskComments}
                      department={department}
                      isPending={isPending}
                      key={task.id}
                      onAddComment={handleAddTaskComment}
                      onMoveTask={handleMoveTask}
                      requestTitle={request?.title ?? 'Solicitacao vinculada'}
                      task={task}
                    />
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

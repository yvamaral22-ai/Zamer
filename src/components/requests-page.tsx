'use client';

import { useDeferredValue, useEffect, useState, useTransition } from 'react';

import { usePrototype } from '@/components/prototype-provider';
import {
  AccentButton,
  DepartmentPill,
  GhostButton,
  MetricCard,
  Panel,
  PriorityPill,
  SectionHeader,
  StatusPill,
} from '@/components/ui';
import {
  formatDateTime,
  formatShortDate,
  isCriticalDeadline,
  isOpenRequest,
  relativeSlaText,
} from '@/lib/formatters';
import type {
  NewRequestInput,
  RequestItem,
  RequestStatus,
  UpdateRequestInput,
} from '@/lib/types';

type RequestFilter = RequestStatus | 'Todas';

const initialForm: NewRequestInput = {
  title: '',
  requester: '',
  departmentId: 'ti',
  priority: 'Média',
  dueAt: '2026-04-15T18:00',
  description: '',
};

const emptyEditForm: UpdateRequestInput = {
  id: '',
  title: '',
  requester: '',
  departmentId: 'ti',
  priority: 'Média',
  dueAt: '2026-04-15T18:00',
  description: '',
  owner: '',
};

function buildEditForm(request?: RequestItem): UpdateRequestInput {
  if (!request) {
    return emptyEditForm;
  }

  return {
    id: request.id,
    title: request.title,
    requester: request.requester,
    departmentId: request.departmentId,
    priority: request.priority,
    dueAt: request.dueAt.slice(0, 16),
    description: request.description,
    owner: request.owner,
  };
}

function hasDraftChanges(draft: UpdateRequestInput, request?: RequestItem) {
  if (!request) {
    return false;
  }

  return (
    draft.title !== request.title ||
    draft.requester !== request.requester ||
    draft.departmentId !== request.departmentId ||
    draft.priority !== request.priority ||
    draft.dueAt !== request.dueAt.slice(0, 16) ||
    draft.description !== request.description ||
    draft.owner !== request.owner
  );
}

export function RequestsPage() {
  const {
    addComment,
    advanceRequest,
    comments,
    createRequest,
    departments,
    requests,
    tasks,
    updateRequest,
  } = usePrototype();
  const [selectedId, setSelectedId] = useState<string>('');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [statusFilter, setStatusFilter] = useState<RequestFilter>('Todas');
  const [showComposer, setShowComposer] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState<UpdateRequestInput>(emptyEditForm);
  const [requestComment, setRequestComment] = useState({
    author: '',
    message: '',
  });
  const [isPending, startTransition] = useTransition();

  const departmentsById = new Map(
    departments.map((department) => [department.id, department]),
  );
  const taskCountByRequestId = tasks.reduce((map, task) => {
    map.set(task.requestId, (map.get(task.requestId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === 'Todas' || request.status === statusFilter;
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      request.title.toLowerCase().includes(normalizedQuery) ||
      request.requester.toLowerCase().includes(normalizedQuery) ||
      request.id.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  useEffect(() => {
    if (filteredRequests.length === 0) {
      return;
    }

    const selectedStillVisible = filteredRequests.some((request) => request.id === selectedId);

    if (!selectedStillVisible) {
      setSelectedId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedId]);

  const selectedRequest =
    filteredRequests.find((request) => request.id === selectedId) ?? filteredRequests[0];

  useEffect(() => {
    if (!selectedRequest) {
      return;
    }

    setEditForm(buildEditForm(selectedRequest));
    setRequestComment({
      author: selectedRequest.owner,
      message: '',
    });
    setShowEditor(false);
  }, [selectedRequest?.id]);

  const relatedTasks = selectedRequest
    ? tasks.filter((task) => task.requestId === selectedRequest.id)
    : [];

  const requestComments = selectedRequest
    ? comments.filter(
        (comment) =>
          comment.entityType === 'request' && comment.entityId === selectedRequest.id,
      )
    : [];

  const selectedDepartment = selectedRequest
    ? departmentsById.get(selectedRequest.departmentId)
    : undefined;

  const totalRequests = requests.length;
  const openRequests = requests.filter((request) => isOpenRequest(request.status)).length;
  const newRequests = requests.filter((request) => request.status === 'Nova').length;
  const triageRequests = requests.filter((request) => request.status === 'Triagem').length;
  const executionRequests = requests.filter((request) => request.status === 'Execução').length;
  const validationRequests = requests.filter(
    (request) => request.status === 'Validação',
  ).length;
  const completedRequests = requests.filter(
    (request) => request.status === 'Concluída',
  ).length;
  const urgentRequests = requests.filter(
    (request) =>
      isOpenRequest(request.status) &&
      (request.priority === 'Alta' ||
        request.priority === 'Crítica' ||
        isCriticalDeadline(request.dueAt)),
  ).length;
  const canSaveDraft = hasDraftChanges(editForm, selectedRequest);
  const hasCommentMessage = requestComment.message.trim().length > 0;

  function updateForm<K extends keyof NewRequestInput>(field: K, value: NewRequestInput[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateEditForm<K extends keyof UpdateRequestInput>(
    field: K,
    value: UpdateRequestInput[K],
  ) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      const createdId = createRequest(form);
      setSelectedId(createdId);
      setForm(initialForm);
      setShowComposer(false);
    });
  }

  function handleSaveRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRequest) {
      return;
    }

    startTransition(() => {
      updateRequest(editForm);
      setShowEditor(false);
    });
  }

  function handleAddRequestComment() {
    if (!selectedRequest || !hasCommentMessage) {
      return;
    }

    startTransition(() => {
      addComment({
        entityType: 'request',
        entityId: selectedRequest.id,
        departmentId: selectedRequest.departmentId,
        author: requestComment.author.trim() || selectedRequest.owner,
        message: requestComment.message.trim(),
      });
      setRequestComment((current) => ({
        ...current,
        message: '',
      }));
    });
  }

  function handleAdvanceWithContext() {
    if (!selectedRequest || !hasCommentMessage) {
      return;
    }

    startTransition(() => {
      advanceRequest(selectedRequest.id, {
        author: requestComment.author.trim() || selectedRequest.owner,
        message: requestComment.message.trim(),
      });
      setRequestComment((current) => ({
        ...current,
        message: '',
      }));
    });
  }

  return (
    <div className="workspace reveal">
      <div className="summary-strip">
        <MetricCard
          className="metric-card--flat metric-card--gold"
          label="Total de solicitações"
          value={String(totalRequests)}
          note="Visão consolidada da fila"
        />
        <MetricCard
          className="metric-card--flat metric-card--green"
          label="Solicitações abertas"
          value={String(openRequests)}
          note="Demandas ainda em andamento"
        />
        <MetricCard
          className="metric-card--flat metric-card--rose"
          label="Em triagem"
          value={String(triageRequests)}
          note="Itens aguardando direcionamento"
        />
        <MetricCard
          className="metric-card--flat metric-card--red"
          label="Em execução"
          value={String(executionRequests)}
          note="Demandas com atendimento ativo"
        />
        <MetricCard
          className="metric-card--flat metric-card--orange"
          label="Fila prioritária"
          value={String(urgentRequests)}
          note="Alta prioridade ou prazo curto"
        />
        <MetricCard
          className="metric-card--flat metric-card--blue"
          label="Em validação"
          value={String(validationRequests)}
          note="Aguardando aceite final"
        />
        <MetricCard
          className="metric-card--flat metric-card--stone"
          label="Concluídas"
          value={String(completedRequests)}
          note="Fluxos encerrados"
        />
      </div>

      <Panel className="control-panel">
        <SectionHeader
          eyebrow="Central de solicitações"
          title="Filtro e distribuição da fila"
          description="A leitura ficou mais compacta e tabular, mantendo criação, edição, comentários e avanço no mesmo fluxo."
          action={
            <div className="toolbar__actions">
              <GhostButton type="button" onClick={() => setShowComposer((current) => !current)}>
                {showComposer ? 'Fechar cadastro' : 'Nova solicitação'}
              </GhostButton>
              {selectedRequest ? (
                <GhostButton type="button" onClick={() => setShowEditor((current) => !current)}>
                  {showEditor ? 'Fechar edição' : 'Editar selecionada'}
                </GhostButton>
              ) : null}
            </div>
          }
        />

        <div className="toolbar toolbar--requests">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, solicitante ou código"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as RequestFilter)}
          >
            <option value="Todas">Todas</option>
            <option value="Nova">Nova</option>
            <option value="Triagem">Triagem</option>
            <option value="Execução">Execução</option>
            <option value="Validação">Validação</option>
            <option value="Concluída">Concluída</option>
          </select>
          <AccentButton type="button" onClick={() => setShowComposer((current) => !current)}>
            {showComposer ? 'Ocultar formulário' : 'Adicionar'}
          </AccentButton>
        </div>

        <div className="list-summary">
          <span>{filteredRequests.length} resultados exibidos</span>
          <span>{newRequests} itens ainda estão como novos na fila</span>
          <span>Selecione uma linha para abrir o contexto completo</span>
        </div>

        {showComposer ? (
          <form className="form-grid form-grid--compact" onSubmit={handleSubmit}>
            <label>
              Título
              <input
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="Ex.: Automatizar aprovação de adiantamentos"
                required
              />
            </label>

            <label>
              Solicitante
              <input
                value={form.requester}
                onChange={(event) => updateForm('requester', event.target.value)}
                placeholder="Nome de quem abriu a demanda"
                required
              />
            </label>

            <label>
              Departamento
              <select
                value={form.departmentId}
                onChange={(event) =>
                  updateForm('departmentId', event.target.value as NewRequestInput['departmentId'])
                }
              >
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Prioridade
              <select
                value={form.priority}
                onChange={(event) =>
                  updateForm('priority', event.target.value as NewRequestInput['priority'])
                }
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </label>

            <label>
              Prazo
              <input
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => updateForm('dueAt', event.target.value)}
                required
              />
            </label>

            <label className="form-grid__full">
              Descrição
              <textarea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder="Descreva o problema atual, impacto e resultado esperado."
                rows={4}
                required
              />
            </label>

            <div className="form-grid__actions">
              <AccentButton disabled={isPending || !form.title || !form.requester}>
                {isPending ? 'Registrando...' : 'Criar solicitação'}
              </AccentButton>
            </div>
          </form>
        ) : null}
      </Panel>

      <Panel className="request-table-panel">
        <div className="request-table-wrapper">
          <div className="request-table__head">
            <span>ID</span>
            <span>Título</span>
            <span>Departamento</span>
            <span>Status</span>
            <span>Abertura</span>
            <span>Prazo</span>
            <span>Prioridade</span>
            <span>Responsável</span>
            <span>Tarefas</span>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="request-table">
              {filteredRequests.map((request) => {
                const department = departmentsById.get(request.departmentId);
                const relatedTaskCount = taskCountByRequestId.get(request.id) ?? 0;

                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedId(request.id)}
                    className={
                      request.id === selectedRequest?.id
                        ? 'request-table__row request-table__row--active'
                        : 'request-table__row'
                    }
                  >
                    <span className="request-table__cell request-table__cell--mono">
                      {request.id}
                    </span>
                    <span className="request-table__cell request-table__cell--main">
                      <strong>{request.title}</strong>
                      <small>{request.requester}</small>
                    </span>
                    <span className="request-table__cell">
                      {department ? <DepartmentPill department={department} /> : '-'}
                    </span>
                    <span className="request-table__cell">
                      <StatusPill value={request.status} />
                    </span>
                    <span className="request-table__cell request-table__cell--muted">
                      {formatShortDate(request.openedAt)}
                    </span>
                    <span className="request-table__cell request-table__cell--muted">
                      {formatShortDate(request.dueAt)}
                    </span>
                    <span className="request-table__cell">
                      <PriorityPill value={request.priority} />
                    </span>
                    <span className="request-table__cell request-table__cell--stack">
                      <strong>{request.owner}</strong>
                      <small>{relativeSlaText(request.dueAt)}</small>
                    </span>
                    <span className="request-table__cell request-table__cell--count">
                      {relatedTaskCount}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="empty-state request-table__empty">
              Nenhuma solicitação encontrada com os filtros atuais.
            </p>
          )}
        </div>
      </Panel>

      {selectedRequest ? (
        <div className="request-detail-layout">
          <Panel>
            <SectionHeader
              eyebrow={selectedRequest.id}
              title={selectedRequest.title}
              description="Os dados da solicitação seguem editáveis, agora com uma leitura mais próxima de fila corporativa."
              action={
                <GhostButton type="button" onClick={() => setShowEditor((current) => !current)}>
                  {showEditor ? 'Fechar edição' : 'Editar solicitação'}
                </GhostButton>
              }
            />

            <p className="panel-copy">{selectedRequest.description}</p>

            <div className="tag-row">
              {selectedDepartment ? <DepartmentPill department={selectedDepartment} /> : null}
              <StatusPill value={selectedRequest.status} />
              <PriorityPill value={selectedRequest.priority} />
              <span className="tag">Prazo {formatShortDate(selectedRequest.dueAt)}</span>
              <span className="tag">Aberta em {formatShortDate(selectedRequest.openedAt)}</span>
            </div>

            <div className="detail-grid">
              <div className="detail-block">
                <span className="detail-block__label">Responsável</span>
                <strong>{selectedRequest.owner}</strong>
              </div>
              <div className="detail-block">
                <span className="detail-block__label">Solicitante</span>
                <strong>{selectedRequest.requester}</strong>
              </div>
              <div className="detail-block">
                <span className="detail-block__label">Prazo final</span>
                <strong>{formatShortDate(selectedRequest.dueAt)}</strong>
              </div>
              <div className="detail-block">
                <span className="detail-block__label">SLA</span>
                <strong>{relativeSlaText(selectedRequest.dueAt)}</strong>
              </div>
            </div>

            {selectedRequest.tags.length > 0 ? (
              <div className="tag-row">
                {selectedRequest.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </Panel>

          <Panel>
            <SectionHeader
              eyebrow="Contexto operacional"
              title="Comentários e avanço da solicitação"
              description="O registro de andamento continua obrigatório antes de mover a solicitação no fluxo."
            />

            <form
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                handleAddRequestComment();
              }}
            >
              <label>
                Autor do registro
                <input
                  value={requestComment.author}
                  onChange={(event) =>
                    setRequestComment((current) => ({
                      ...current,
                      author: event.target.value,
                    }))
                  }
                  placeholder="Quem está atualizando a solicitação"
                  required
                />
              </label>

              <label className="form-grid__full">
                Comentário de andamento
                <textarea
                  value={requestComment.message}
                  onChange={(event) =>
                    setRequestComment((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Ex.: Ajuste em execução, aguardando validação do Financeiro e revisão final do escopo."
                  rows={4}
                  required
                />
              </label>

              <div className="form-grid__actions">
                <GhostButton disabled={isPending || !hasCommentMessage}>
                  {isPending ? 'Registrando...' : 'Salvar comentário'}
                </GhostButton>
                <AccentButton
                  type="button"
                  onClick={handleAdvanceWithContext}
                  disabled={
                    isPending || selectedRequest.status === 'Concluída' || !hasCommentMessage
                  }
                >
                  {selectedRequest.status === 'Concluída'
                    ? 'Fluxo concluído'
                    : selectedRequest.status === 'Validação'
                      ? 'Registrar e concluir'
                      : 'Registrar e avançar'}
                </AccentButton>
              </div>
            </form>

            {requestComments.length > 0 ? (
              <div className="feed">
                {requestComments.map((comment) => (
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
              <p className="empty-state">Ainda não há comentários nesta solicitação.</p>
            )}
          </Panel>

          {showEditor ? (
            <Panel className="request-detail-layout__full">
              <SectionHeader
                eyebrow="Edição direta"
                title="Atualizar dados da solicitação"
                description="Ajuste escopo, prazo, prioridade e responsável sem sair do contexto da fila."
              />

              <form className="form-grid form-grid--compact" onSubmit={handleSaveRequest}>
                <label>
                  Título
                  <input
                    value={editForm.title}
                    onChange={(event) => updateEditForm('title', event.target.value)}
                    required
                  />
                </label>

                <label>
                  Solicitante
                  <input
                    value={editForm.requester}
                    onChange={(event) => updateEditForm('requester', event.target.value)}
                    required
                  />
                </label>

                <label>
                  Departamento responsável
                  <select
                    value={editForm.departmentId}
                    onChange={(event) =>
                      updateEditForm(
                        'departmentId',
                        event.target.value as UpdateRequestInput['departmentId'],
                      )
                    }
                  >
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Prioridade
                  <select
                    value={editForm.priority}
                    onChange={(event) =>
                      updateEditForm(
                        'priority',
                        event.target.value as UpdateRequestInput['priority'],
                      )
                    }
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </label>

                <label>
                  Prazo
                  <input
                    type="datetime-local"
                    value={editForm.dueAt}
                    onChange={(event) => updateEditForm('dueAt', event.target.value)}
                    required
                  />
                </label>

                <label>
                  Responsável
                  <input
                    value={editForm.owner}
                    onChange={(event) => updateEditForm('owner', event.target.value)}
                    required
                  />
                </label>

                <label className="form-grid__full">
                  Descrição
                  <textarea
                    value={editForm.description}
                    onChange={(event) => updateEditForm('description', event.target.value)}
                    rows={5}
                    required
                  />
                </label>

                <div className="form-grid__actions">
                  <GhostButton
                    type="button"
                    onClick={() => {
                      setEditForm(buildEditForm(selectedRequest));
                      setShowEditor(false);
                    }}
                  >
                    Cancelar
                  </GhostButton>
                  <AccentButton
                    disabled={
                      isPending ||
                      !editForm.title ||
                      !editForm.requester ||
                      !editForm.owner ||
                      !canSaveDraft
                    }
                  >
                    {isPending ? 'Salvando...' : 'Salvar alterações'}
                  </AccentButton>
                </div>
              </form>
            </Panel>
          ) : null}

          <Panel className="request-detail-layout__full">
            <div className="detail-stack">
              <SectionHeader
                eyebrow="Dependências"
                title="Tarefas vinculadas"
                description="As tarefas ligadas à solicitação seguem acessíveis com o mesmo histórico contextual."
              />
              {relatedTasks.length > 0 ? (
                <div className="feed">
                  {relatedTasks.map((task) => {
                    const latestTaskComment = comments.find(
                      (comment) =>
                        comment.entityType === 'task' && comment.entityId === task.id,
                    );

                    return (
                      <article className="feed-item" key={task.id}>
                        <div className="feed-item__content">
                          <div className="feed-item__header">
                            <strong>{task.title}</strong>
                            <StatusPill value={task.status} />
                          </div>
                          <p>
                            {task.assignee} | prazo {formatShortDate(task.dueAt)} | esforço{' '}
                            {task.effort}
                          </p>
                          {latestTaskComment ? (
                            <p>Último comentário: {latestTaskComment.message}</p>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-state">Nenhuma tarefa vinculada encontrada.</p>
              )}
            </div>
          </Panel>
        </div>
      ) : (
        <Panel>
          <p className="empty-state">
            Selecione uma solicitação para visualizar os detalhes.
          </p>
        </Panel>
      )}
    </div>
  );
}

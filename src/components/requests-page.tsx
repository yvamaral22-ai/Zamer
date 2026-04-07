'use client';

import { useEffect, useDeferredValue, useState, useTransition } from 'react';

import { usePrototype } from '@/components/prototype-provider';
import {
  AccentButton,
  DepartmentPill,
  GhostButton,
  Panel,
  PriorityPill,
  SectionHeader,
  StatusPill,
} from '@/components/ui';
import { formatShortDate, relativeSlaText } from '@/lib/formatters';
import type { NewRequestInput, RequestStatus } from '@/lib/types';

type RequestFilter = RequestStatus | 'Todas';

const initialForm: NewRequestInput = {
  title: '',
  requester: '',
  departmentId: 'ti',
  priority: 'Media',
  dueAt: '2026-04-15T18:00',
  description: '',
};

export function RequestsPage() {
  const { advanceRequest, createRequest, departments, requests, tasks } = usePrototype();
  const [selectedId, setSelectedId] = useState<string>('');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [statusFilter, setStatusFilter] = useState<RequestFilter>('Todas');
  const [showComposer, setShowComposer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedId && requests[0]) {
      setSelectedId(requests[0].id);
    }
  }, [requests, selectedId]);

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

  const selectedRequest =
    filteredRequests.find((request) => request.id === selectedId) ??
    requests.find((request) => request.id === selectedId) ??
    filteredRequests[0];

  const relatedTasks = selectedRequest
    ? tasks.filter((task) => task.requestId === selectedRequest.id)
    : [];

  function updateForm<K extends keyof NewRequestInput>(
    field: K,
    value: NewRequestInput[K],
  ) {
    setForm((current) => ({
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

  function handleAdvance() {
    if (!selectedRequest) {
      return;
    }

    startTransition(() => {
      advanceRequest(selectedRequest.id);
    });
  }

  return (
    <div className="workspace reveal">
      <SectionHeader
        eyebrow="Gestao centralizada"
        title="Solicitacoes com contexto, prioridade e SLA no mesmo fluxo"
        description="A tela organiza entrada, acompanhamento e detalhamento sem depender de planilhas paralelas."
        action={
          <GhostButton onClick={() => setShowComposer((current) => !current)}>
            {showComposer ? 'Fechar formulario' : 'Nova solicitacao'}
          </GhostButton>
        }
      />

      {showComposer ? (
        <Panel>
          <SectionHeader
            eyebrow="Entrada do fluxo"
            title="Registrar nova solicitacao"
            description="Ao cadastrar a demanda, o sistema ja cria a primeira task da area responsavel."
          />

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Titulo
              <input
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="Ex.: Automatizar aprovacao de adiantamentos"
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
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Critica">Critica</option>
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
              Descricao
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
                {isPending ? 'Registrando...' : 'Criar solicitacao'}
              </AccentButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <div className="section-grid section-grid--wide">
        <Panel>
          <SectionHeader
            eyebrow="Fila operacional"
            title="Lista de solicitacoes"
            description="Pesquise, filtre e selecione uma demanda para analisar detalhes e dependencias."
          />

          <div className="toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por titulo, solicitante ou codigo"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as RequestFilter)}
            >
              <option value="Todas">Todas</option>
              <option value="Nova">Nova</option>
              <option value="Triagem">Triagem</option>
              <option value="Execucao">Execucao</option>
              <option value="Validacao">Validacao</option>
              <option value="Concluida">Concluida</option>
            </select>
          </div>

          <div className="request-list">
            {filteredRequests.map((request) => {
              const department = departments.find(
                (departmentItem) => departmentItem.id === request.departmentId,
              );

              return (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => setSelectedId(request.id)}
                  className={
                    request.id === selectedRequest?.id
                      ? 'request-row request-row--active'
                      : 'request-row'
                  }
                >
                  <div className="request-row__main">
                    <div className="request-row__header">
                      <strong>{request.title}</strong>
                      <PriorityPill value={request.priority} />
                    </div>
                    <p>{request.requester}</p>
                    <div className="meta-row">
                      {department ? <DepartmentPill department={department} /> : null}
                      <StatusPill value={request.status} />
                      <span>{relativeSlaText(request.dueAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          {selectedRequest ? (
            <>
              <SectionHeader
                eyebrow={selectedRequest.id}
                title={selectedRequest.title}
                description={selectedRequest.description}
                action={
                  <AccentButton
                    onClick={handleAdvance}
                    disabled={isPending || selectedRequest.status === 'Concluida'}
                  >
                    {selectedRequest.status === 'Concluida'
                      ? 'Fluxo concluido'
                      : 'Avancar etapa'}
                  </AccentButton>
                }
              />

              <div className="detail-grid">
                <div className="detail-block">
                  <span className="detail-block__label">Responsavel</span>
                  <strong>{selectedRequest.owner}</strong>
                </div>
                <div className="detail-block">
                  <span className="detail-block__label">Solicitante</span>
                  <strong>{selectedRequest.requester}</strong>
                </div>
                <div className="detail-block">
                  <span className="detail-block__label">Prazo</span>
                  <strong>{formatShortDate(selectedRequest.dueAt)}</strong>
                </div>
                <div className="detail-block">
                  <span className="detail-block__label">Status</span>
                  <StatusPill value={selectedRequest.status} />
                </div>
              </div>

              <div className="tag-row">
                {selectedRequest.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="detail-stack">
                <SectionHeader
                  eyebrow="Dependencias"
                  title="Tasks vinculadas"
                  description="Toda solicitacao gera tarefas relacionadas para garantir execucao rastreavel."
                />
                {relatedTasks.length > 0 ? (
                  <div className="feed">
                    {relatedTasks.map((task) => (
                      <article className="feed-item" key={task.id}>
                        <div className="feed-item__content">
                          <div className="feed-item__header">
                            <strong>{task.title}</strong>
                            <StatusPill value={task.status} />
                          </div>
                          <p>
                            {task.assignee} · prazo {formatShortDate(task.dueAt)} · esforco{' '}
                            {task.effort}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Nenhuma task vinculada encontrada.</p>
                )}
              </div>
            </>
          ) : (
            <p className="empty-state">
              Selecione uma solicitacao para visualizar os detalhes.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

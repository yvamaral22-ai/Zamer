'use client';

import { useState, useTransition } from 'react';

import { usePrototype } from '@/components/prototype-provider';
import {
  AccentButton,
  DepartmentPill,
  Panel,
  SectionHeader,
} from '@/components/ui';
import { formatDateTime, isOpenRequest } from '@/lib/formatters';
import type { NewUpdateInput } from '@/lib/types';

const initialUpdate: NewUpdateInput = {
  departmentId: 'ti',
  audience: 'Todos',
  author: 'Coordenacao do projeto',
  message: '',
};

export function DepartmentsPage() {
  const { addUpdate, departments, requests, tasks, updates } = usePrototype();
  const [form, setForm] = useState(initialUpdate);
  const [isPending, startTransition] = useTransition();

  function updateForm<K extends keyof NewUpdateInput>(
    field: K,
    value: NewUpdateInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      addUpdate(form);
      setForm(initialUpdate);
    });
  }

  return (
    <div className="workspace reveal">
      <SectionHeader
        eyebrow="Comunicacao operacional"
        title="Alinhamentos entre departamentos sem perder historico"
        description="O mural registra combinados, publico-alvo e impacto direto nas demandas em andamento."
      />

      <div className="department-summary-grid">
        {departments.map((department) => {
          const openRequestCount = requests.filter(
            (request) =>
              request.departmentId === department.id && isOpenRequest(request.status),
          ).length;
          const blockedTaskCount = tasks.filter(
            (task) => task.departmentId === department.id && task.status === 'Bloqueada',
          ).length;

          return (
            <Panel key={department.id}>
              <div className="department-summary">
                <DepartmentPill department={department} />
                <p>{department.goal}</p>
                <div className="department-summary__metrics">
                  <strong>{openRequestCount} demandas abertas</strong>
                  <span>{blockedTaskCount} bloqueios ativos</span>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="section-grid section-grid--wide">
        <Panel>
          <SectionHeader
            eyebrow="Mural"
            title="Atualizacoes publicadas"
            description="Comunicados recentes exibem quem falou, para quem e qual contexto foi compartilhado."
          />
          <div className="feed">
            {updates.map((update) => {
              const department = departments.find(
                (departmentItem) => departmentItem.id === update.departmentId,
              );

              return (
                <article className="feed-item" key={update.id}>
                  <div className="feed-item__content">
                    <div className="feed-item__header">
                      <strong>{update.author}</strong>
                      <span>{formatDateTime(update.createdAt)}</span>
                    </div>
                    <div className="meta-row">
                      {department ? <DepartmentPill department={department} /> : null}
                      <span>Publico: {update.audience}</span>
                    </div>
                    <p>{update.message}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow="Novo alinhamento"
            title="Registrar mensagem operacional"
            description="Use o formulario para simular a troca de contexto entre departamentos."
          />

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Departamento
              <select
                value={form.departmentId}
                onChange={(event) =>
                  updateForm('departmentId', event.target.value as NewUpdateInput['departmentId'])
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
              Publico
              <select
                value={form.audience}
                onChange={(event) =>
                  updateForm('audience', event.target.value as NewUpdateInput['audience'])
                }
              >
                <option value="Todos">Todos</option>
                <option value="Gestores">Gestores</option>
                <option value="Operacional">Operacional</option>
              </select>
            </label>

            <label className="form-grid__full">
              Autor
              <input
                value={form.author}
                onChange={(event) => updateForm('author', event.target.value)}
                placeholder="Quem esta publicando o alinhamento"
                required
              />
            </label>

            <label className="form-grid__full">
              Mensagem
              <textarea
                value={form.message}
                onChange={(event) => updateForm('message', event.target.value)}
                placeholder="Ex.: Dependencia financeira liberada para o fechamento da sprint."
                rows={5}
                required
              />
            </label>

            <div className="form-grid__actions">
              <AccentButton disabled={isPending || !form.message}>
                {isPending ? 'Publicando...' : 'Publicar alinhamento'}
              </AccentButton>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}

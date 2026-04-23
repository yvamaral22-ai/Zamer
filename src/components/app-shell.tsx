'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { usePrototype } from '@/components/prototype-provider';
import { isOpenRequest } from '@/lib/formatters';

const navigationGroups = [
  {
    label: 'Visao geral',
    items: [
      {
        href: '/',
        label: 'Dashboard',
        description: 'Resumo da operacao',
      },
      {
        href: '/solicitacoes',
        label: 'Solicitacoes',
        description: 'Fila e atendimento',
      },
    ],
  },
  {
    label: 'Operacao',
    items: [
      {
        href: '/tarefas',
        label: 'Tarefas',
        description: 'Kanban por etapa',
      },
      {
        href: '/departamentos',
        label: 'Departamentos',
        description: 'Mural entre areas',
      },
    ],
  },
];

const pageContent: Record<
  string,
  { eyebrow: string; title: string; summary: string; breadcrumb: string }
> = {
  '/': {
    eyebrow: 'Visao executiva',
    title: 'Painel integrado da operacao',
    summary: 'Indicadores, gargalos e historico reunidos em um layout mais compacto.',
    breadcrumb: 'Dashboard',
  },
  '/solicitacoes': {
    eyebrow: 'Atendimento interno',
    title: 'Central de solicitacoes',
    summary: 'Pesquisa, filtros e acompanhamento da fila no mesmo fluxo visual.',
    breadcrumb: 'Solicitacoes',
  },
  '/tarefas': {
    eyebrow: 'Execucao',
    title: 'Quadro operacional',
    summary: 'Tarefas distribuidas por etapa com foco em contexto e movimentacao.',
    breadcrumb: 'Tarefas',
  },
  '/departamentos': {
    eyebrow: 'Comunicacao',
    title: 'Painel de departamentos',
    summary: 'Capacidade, bloqueios e alinhamentos compartilhados entre areas.',
    breadcrumb: 'Departamentos',
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { requests, tasks, departments } = usePrototype();

  const currentPage = pageContent[pathname] ?? pageContent['/'];
  const openRequests = requests.filter((request) => isOpenRequest(request.status)).length;
  const blockedTasks = tasks.filter((task) => task.status === 'Bloqueada').length;
  const engagedDepartments = departments.filter((department) =>
    requests.some((request) => request.departmentId === department.id),
  ).length;

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="brand-block brand-block--system">
          <span className="brand-block__eyebrow">Zamer</span>
          <h1 className="brand-block__title">Central Operacional</h1>
          <p className="brand-block__copy">
            Casca visual mais proxima de um painel corporativo, sem alterar a logica
            do prototipo.
          </p>
        </div>

        <div className="sidebar-summary">
          <div className="sidebar-summary__item">
            <span>Solicitacoes abertas</span>
            <strong>{openRequests}</strong>
          </div>
          <div className="sidebar-summary__item">
            <span>Tarefas bloqueadas</span>
            <strong>{blockedTasks}</strong>
          </div>
          <div className="sidebar-summary__item">
            <span>Areas ativas</span>
            <strong>{engagedDepartments}</strong>
          </div>
        </div>

        {navigationGroups.map((group) => (
          <div className="sidebar-section" key={group.label}>
            <p className="sidebar-label">{group.label}</p>
            <nav className="navigation">
              {group.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active ? 'navigation__item navigation__item--active' : 'navigation__item'
                    }
                  >
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>

      <div className="shell__canvas">
        <div className="shell__content">
          <div className="shell__utilitybar">
            <div className="shell__breadcrumbs">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>{currentPage.breadcrumb}</span>
            </div>

            <div className="shell__utility-actions">
              <Link href="/solicitacoes" className="utility-button utility-button--accent">
                + Adicionar
              </Link>
              <Link href="/solicitacoes" className="utility-button">
                Pesquisar
              </Link>
              <Link href="/tarefas" className="utility-button">
                Kanban
              </Link>
            </div>
          </div>

          <header className="topbar topbar--compact">
            <div className="topbar__main">
              <p className="eyebrow">{currentPage.eyebrow}</p>
              <h2 className="topbar__title">{currentPage.title}</h2>
              <p className="topbar__summary">{currentPage.summary}</p>
            </div>

            <div className="topbar__meta">
              <span>Pulso operacional</span>
              <strong>
                {openRequests} abertas | {blockedTasks} bloqueios | {engagedDepartments}{' '}
                areas envolvidas
              </strong>
            </div>
          </header>

          <main className="shell__main">{children}</main>
        </div>
      </div>
    </div>
  );
}

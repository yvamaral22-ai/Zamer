'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { usePrototype } from '@/components/prototype-provider';
import { isOpenRequest } from '@/lib/formatters';

const navigationItems = [
  {
    href: '/',
    label: 'Painel',
    description: 'Resumo da operação',
  },
  {
    href: '/solicitacoes',
    label: 'Solicitações',
    description: 'Entrada e rastreabilidade',
  },
  {
    href: '/tarefas',
    label: 'Tarefas',
    description: 'Execução por etapa',
  },
  {
    href: '/departamentos',
    label: 'Departamentos',
    description: 'Transições e comunicação',
  },
];

const pageContent: Record<string, { title: string; summary: string }> = {
  '/': {
    title: 'Painel integrado da operação',
    summary: 'Fluxos, gargalos e histórico operacional em um único ambiente.',
  },
  '/solicitacoes': {
    title: 'Central de solicitações internas',
    summary: 'Cadastre, acompanhe e evolua demandas com status e SLA visíveis.',
  },
  '/tarefas': {
    title: 'Quadro de execução',
    summary: 'Acompanhe a entrega entre áreas, com foco em bloqueios e próximos passos.',
  },
  '/departamentos': {
    title: 'Mural interdepartamental',
    summary: 'Compartilhe alinhamentos, transições e combinados operacionais.',
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
        <div className="brand-block">
          <span className="brand-block__eyebrow">Projeto acadêmico</span>
          <h1 className="brand-block__title">IntegraFlow</h1>
          <p className="brand-block__copy">
            Sistema corporativo para consolidar solicitações, tarefas e comunicação
            operacional.
          </p>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">Navegação</p>
          <nav className="navigation">
            {navigationItems.map((item) => {
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

        <div className="sidebar-section">
          <p className="sidebar-label">Pulso da operação</p>
          <div className="sidebar-stack">
            <div className="sidebar-tile">
              <span>Solicitações abertas</span>
              <strong>{openRequests}</strong>
            </div>
            <div className="sidebar-tile">
              <span>Tarefas bloqueadas</span>
              <strong>{blockedTasks}</strong>
            </div>
            <div className="sidebar-tile">
              <span>Áreas engajadas</span>
              <strong>{engagedDepartments}</strong>
            </div>
          </div>
        </div>
      </aside>

      <div className="shell__canvas">
        <div className="shell__content">
          <header className="topbar">
            <div className="topbar__main">
              <p className="eyebrow">Sprint 01 | Concepção e protótipo</p>
              <h2 className="topbar__title">{currentPage.title}</h2>
              <p className="topbar__summary">{currentPage.summary}</p>
            </div>

            <div className="topbar__meta">
              <span>Stakeholders em foco</span>
              <strong>Diretoria, TI, RH, Financeiro e Operações</strong>
            </div>
          </header>

          <main className="shell__main">{children}</main>
        </div>
      </div>
    </div>
  );
}

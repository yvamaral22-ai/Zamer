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
    description: 'Resumo da operacao',
  },
  {
    href: '/solicitacoes',
    label: 'Solicitacoes',
    description: 'Entrada e rastreabilidade',
  },
  {
    href: '/tarefas',
    label: 'Tarefas',
    description: 'Execucao por etapa',
  },
  {
    href: '/departamentos',
    label: 'Departamentos',
    description: 'Handoffs e comunicacao',
  },
];

const pageContent: Record<string, { title: string; summary: string }> = {
  '/': {
    title: 'Painel integrado da operacao',
    summary: 'Fluxos, gargalos e historico operacional em um unico ambiente.',
  },
  '/solicitacoes': {
    title: 'Central de solicitacoes internas',
    summary: 'Cadastre, acompanhe e evolua demandas com status e SLA visiveis.',
  },
  '/tarefas': {
    title: 'Quadro de execucao',
    summary: 'Acompanhe a entrega entre areas com foco em bloqueios e proximos passos.',
  },
  '/departamentos': {
    title: 'Mural interdepartamental',
    summary: 'Compartilhe alinhamentos, handoffs e combinados operacionais.',
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
          <span className="brand-block__eyebrow">Projeto academico</span>
          <h1 className="brand-block__title">IntegraFlow</h1>
          <p className="brand-block__copy">
            Sistema corporativo para consolidar solicitacoes, tarefas e comunicacao
            operacional.
          </p>
        </div>

        <nav className="navigation">
          {navigationItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'navigation__item navigation__item--active' : 'navigation__item'}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-stack">
          <div className="sidebar-tile">
            <span>Solicitacoes abertas</span>
            <strong>{openRequests}</strong>
          </div>
          <div className="sidebar-tile">
            <span>Tasks bloqueadas</span>
            <strong>{blockedTasks}</strong>
          </div>
          <div className="sidebar-tile">
            <span>Areas engajadas</span>
            <strong>{engagedDepartments}</strong>
          </div>
        </div>
      </aside>

      <div className="shell__canvas">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sprint 01 · Concepcao e prototipo</p>
            <h2 className="topbar__title">{currentPage.title}</h2>
            <p className="topbar__summary">{currentPage.summary}</p>
          </div>

          <div className="topbar__meta">
            <span>Stakeholders foco</span>
            <strong>Diretoria, TI, RH, Financeiro e Operacoes</strong>
          </div>
        </header>

        <main className="shell__content">{children}</main>
      </div>
    </div>
  );
}

import type { CSSProperties, ReactNode } from 'react';

import type {
  Department,
  RequestPriority,
  RequestStatus,
  TaskStatus,
} from '@/lib/types';

function joinClasses(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

const requestStatusClass: Record<RequestStatus, string> = {
  Nova: 'status-pill--new',
  Triagem: 'status-pill--triage',
  Execução: 'status-pill--execution',
  Validação: 'status-pill--validation',
  Concluída: 'status-pill--done',
};

const taskStatusClass: Record<TaskStatus, string> = {
  Planejada: 'status-pill--planned',
  'Em progresso': 'status-pill--progress',
  Bloqueada: 'status-pill--blocked',
  Concluída: 'status-pill--done',
};

const priorityClass: Record<RequestPriority, string> = {
  Baixa: 'priority-pill--low',
  Média: 'priority-pill--medium',
  Alta: 'priority-pill--high',
  Crítica: 'priority-pill--critical',
};

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={joinClasses('panel', className)}>{children}</section>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-header__title">{title}</h2>
        {description ? (
          <p className="section-header__description">{description}</p>
        ) : null}
      </div>
      {action ? <div className="section-header__action">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <span className="metric-card__note">{note}</span>
    </div>
  );
}

export function StatusPill({ value }: { value: RequestStatus | TaskStatus }) {
  const isRequestStatus = value in requestStatusClass;
  const className = isRequestStatus
    ? requestStatusClass[value as RequestStatus]
    : taskStatusClass[value as TaskStatus];

  return <span className={joinClasses('status-pill', className)}>{value}</span>;
}

export function PriorityPill({ value }: { value: RequestPriority }) {
  return (
    <span className={joinClasses('priority-pill', priorityClass[value])}>{value}</span>
  );
}

export function DepartmentPill({ department }: { department: Department }) {
  const style = {
    '--department-accent': department.accent,
    '--department-surface': department.surface,
  } as CSSProperties;

  return (
    <span className="department-pill" style={style}>
      {department.name}
    </span>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={joinClasses('button', 'button--ghost', className)}>
      {children}
    </button>
  );
}

export function AccentButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={joinClasses('button', 'button--accent', className)}>
      {children}
    </button>
  );
}

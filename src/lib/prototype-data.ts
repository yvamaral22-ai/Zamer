import type {
  ActivityItem,
  CommentItem,
  Department,
  DepartmentId,
  NewCommentInput,
  NewRequestInput,
  NewUpdateInput,
  PrototypeState,
  RequestItem,
  RequestStatus,
  TaskItem,
  TaskStatus,
  UpdateItem,
} from '@/lib/types';

export const requestStatusOrder = [
  'Nova',
  'Triagem',
  'Execucao',
  'Validacao',
  'Concluida',
] as const satisfies readonly RequestStatus[];

export const taskStatusOrder = [
  'Planejada',
  'Em progresso',
  'Bloqueada',
  'Concluida',
] as const satisfies readonly TaskStatus[];

const seededDepartments: Department[] = [
  {
    id: 'ti',
    name: 'Tecnologia',
    lead: 'Nina Costa',
    goal: 'Incidentes internos resolvidos em ate 4h',
    accent: '#9b3d1f',
    surface: '#f7dfd1',
  },
  {
    id: 'rh',
    name: 'Recursos Humanos',
    lead: 'Clara Ribeiro',
    goal: 'Onboarding validado em ate 2 dias',
    accent: '#2e6c5d',
    surface: '#ddefe9',
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    lead: 'Luis Prado',
    goal: 'Reembolsos conferidos em ate 1 dia util',
    accent: '#6b5b10',
    surface: '#f3edcc',
  },
  {
    id: 'operacoes',
    name: 'Operacoes',
    lead: 'Paula Mendes',
    goal: 'Fechamentos e rotinas sem retrabalho',
    accent: '#425a93',
    surface: '#dae4fb',
  },
  {
    id: 'comercial',
    name: 'Comercial',
    lead: 'Rafael Nunes',
    goal: 'Aprovacoes comerciais com rastreabilidade',
    accent: '#7f3b6f',
    surface: '#f4dced',
  },
];

const seededRequests: RequestItem[] = [
  {
    id: 'REQ-1001',
    title: 'Onboarding de novos analistas',
    requester: 'Juliana Rocha',
    departmentId: 'rh',
    priority: 'Alta',
    status: 'Triagem',
    openedAt: '2026-04-02T09:00:00',
    dueAt: '2026-04-10T18:00:00',
    description:
      'Padronizar checklist, acessos e treinamentos para reduzir retrabalho no inicio das jornadas.',
    owner: 'Clara Ribeiro',
    tags: ['People Ops', 'Checklist'],
  },
  {
    id: 'REQ-1002',
    title: 'Atualizar politica de reembolso',
    requester: 'Marcos Araujo',
    departmentId: 'financeiro',
    priority: 'Media',
    status: 'Validacao',
    openedAt: '2026-03-30T08:30:00',
    dueAt: '2026-04-08T17:00:00',
    description:
      'Revisar criterios de aprovacao e disponibilizar novo fluxo com aprovacoes automaticas por faixa de valor.',
    owner: 'Luis Prado',
    tags: ['Compliance', 'Politica'],
  },
  {
    id: 'REQ-1003',
    title: 'Criar canal unico para chamados de TI',
    requester: 'Bianca Lopes',
    departmentId: 'ti',
    priority: 'Critica',
    status: 'Execucao',
    openedAt: '2026-04-01T11:20:00',
    dueAt: '2026-04-07T14:00:00',
    description:
      'Eliminar mensagens dispersas entre email e chat com um funil unico de atendimento tecnico.',
    owner: 'Nina Costa',
    tags: ['Suporte', 'SLA'],
  },
  {
    id: 'REQ-1004',
    title: 'Revisar fluxo de aprovacao comercial',
    requester: 'Leandro Siqueira',
    departmentId: 'comercial',
    priority: 'Alta',
    status: 'Nova',
    openedAt: '2026-04-05T15:10:00',
    dueAt: '2026-04-12T18:00:00',
    description:
      'Mapear aprovacoes manuais e consolidar aprovacoes em um painel com trilha de auditoria.',
    owner: 'Rafael Nunes',
    tags: ['Pipeline', 'Governanca'],
  },
  {
    id: 'REQ-1005',
    title: 'Padronizar checklist de fechamento mensal',
    requester: 'Amanda Moura',
    departmentId: 'operacoes',
    priority: 'Alta',
    status: 'Triagem',
    openedAt: '2026-04-03T10:15:00',
    dueAt: '2026-04-09T19:00:00',
    description:
      'Concentrar tarefas recorrentes de fechamento em um roteiro unico com dependencias e alertas.',
    owner: 'Paula Mendes',
    tags: ['Rotina', 'Padronizacao'],
  },
];

const seededTasks: TaskItem[] = [
  {
    id: 'TSK-3001',
    requestId: 'REQ-1003',
    title: 'Configurar fila unica de suporte',
    departmentId: 'ti',
    assignee: 'Nina Costa',
    status: 'Em progresso',
    dueAt: '2026-04-07T14:00:00',
    effort: '8h',
  },
  {
    id: 'TSK-3002',
    requestId: 'REQ-1005',
    title: 'Documentar etapas do fechamento mensal',
    departmentId: 'operacoes',
    assignee: 'Paula Mendes',
    status: 'Bloqueada',
    dueAt: '2026-04-08T18:00:00',
    effort: '6h',
    blockedReason: 'Dependencia de validacao financeira ainda pendente.',
  },
  {
    id: 'TSK-3003',
    requestId: 'REQ-1002',
    title: 'Validar regras de aprovacao por faixa',
    departmentId: 'financeiro',
    assignee: 'Luis Prado',
    status: 'Concluida',
    dueAt: '2026-04-07T12:00:00',
    effort: '4h',
  },
  {
    id: 'TSK-3004',
    requestId: 'REQ-1001',
    title: 'Revisar acessos do onboarding',
    departmentId: 'rh',
    assignee: 'Clara Ribeiro',
    status: 'Planejada',
    dueAt: '2026-04-09T16:00:00',
    effort: '5h',
  },
  {
    id: 'TSK-3005',
    requestId: 'REQ-1004',
    title: 'Consolidar matriz de aprovadores',
    departmentId: 'comercial',
    assignee: 'Rafael Nunes',
    status: 'Planejada',
    dueAt: '2026-04-11T17:00:00',
    effort: '5h',
  },
];

const seededUpdates: UpdateItem[] = [
  {
    id: 'UPD-5001',
    departmentId: 'ti',
    audience: 'Todos',
    author: 'Nina Costa',
    message:
      'Canal unico de suporte entra em piloto nesta sprint com acompanhamento diario de SLA.',
    createdAt: '2026-04-06T08:40:00',
  },
  {
    id: 'UPD-5002',
    departmentId: 'financeiro',
    audience: 'Gestores',
    author: 'Luis Prado',
    message:
      'Nova politica de reembolso precisa de aceite final antes da publicacao interna.',
    createdAt: '2026-04-05T16:20:00',
  },
  {
    id: 'UPD-5003',
    departmentId: 'operacoes',
    audience: 'Operacional',
    author: 'Paula Mendes',
    message:
      'Checklist de fechamento sera unificado apos alinhamento com financeiro e RH.',
    createdAt: '2026-04-05T09:15:00',
  },
];

const seededComments: CommentItem[] = [
  {
    id: 'COM-6001',
    entityType: 'request',
    entityId: 'REQ-1003',
    departmentId: 'ti',
    author: 'Nina Costa',
    message:
      'Mapeamento do canal atual concluido e configuracao da fila unica em andamento.',
    createdAt: '2026-04-06T10:10:00',
  },
  {
    id: 'COM-6002',
    entityType: 'task',
    entityId: 'TSK-3002',
    departmentId: 'operacoes',
    author: 'Paula Mendes',
    message:
      'Checklist parcial revisado. A equipe segue aguardando aprovacao financeira para liberar a etapa seguinte.',
    createdAt: '2026-04-06T11:35:00',
  },
];

const seededActivities: ActivityItem[] = [
  {
    id: 'ACT-7001',
    kind: 'task',
    label: 'Task desbloqueada em Financeiro',
    highlight: 'Validar regras de aprovacao por faixa',
    createdAt: '2026-04-06T09:05:00',
  },
  {
    id: 'ACT-7002',
    kind: 'request',
    label: 'Solicitacao movida para execucao',
    highlight: 'Criar canal unico para chamados de TI',
    createdAt: '2026-04-05T14:45:00',
  },
  {
    id: 'ACT-7003',
    kind: 'update',
    label: 'Comunicado publicado para gestores',
    highlight: 'Nova politica de reembolso',
    createdAt: '2026-04-05T11:20:00',
  },
];

function cloneRequests(items: RequestItem[]) {
  return items.map((item) => ({ ...item, tags: [...item.tags] }));
}

function cloneTasks(items: TaskItem[]) {
  return items.map((item) => ({ ...item }));
}

function cloneUpdates(items: UpdateItem[]) {
  return items.map((item) => ({ ...item }));
}

function cloneComments(items: CommentItem[]) {
  return items.map((item) => ({ ...item }));
}

function cloneActivities(items: ActivityItem[]) {
  return items.map((item) => ({ ...item }));
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function findDepartment(departments: Department[], id: DepartmentId) {
  return departments.find((department) => department.id === id);
}

export function buildRequestBundle(
  input: NewRequestInput,
  departments: Department[],
) {
  const requestId = createId('REQ');
  const assignedDepartment = findDepartment(departments, input.departmentId);
  const now = new Date().toISOString();

  const request: RequestItem = {
    id: requestId,
    title: input.title,
    requester: input.requester,
    departmentId: input.departmentId,
    priority: input.priority,
    status: 'Nova',
    openedAt: now,
    dueAt: input.dueAt,
    description: input.description,
    owner: assignedDepartment?.lead ?? 'Coordenacao',
    tags: [assignedDepartment?.name ?? 'Operacao', input.priority],
  };

  const task: TaskItem = {
    id: createId('TSK'),
    requestId,
    title: `Atender ${input.title.toLowerCase()}`,
    departmentId: input.departmentId,
    assignee: assignedDepartment?.lead ?? 'Coordenacao',
    status: 'Planejada',
    dueAt: input.dueAt,
    effort: input.priority === 'Critica' ? '8h' : '4h',
  };

  const activity: ActivityItem = {
    id: createId('ACT'),
    kind: 'request',
    label: `${input.requester} abriu uma nova solicitacao`,
    highlight: input.title,
    createdAt: now,
  };

  return { requestId, request, task, activity };
}

export function buildUpdateBundle(
  input: NewUpdateInput,
  departments: Department[],
) {
  const now = new Date().toISOString();
  const department = findDepartment(departments, input.departmentId);

  const update: UpdateItem = {
    id: createId('UPD'),
    departmentId: input.departmentId,
    audience: input.audience,
    author: input.author,
    message: input.message,
    createdAt: now,
  };

  const activity: ActivityItem = {
    id: createId('ACT'),
    kind: 'update',
    label: `Alinhamento publicado por ${department?.name ?? 'Area interna'}`,
    highlight: input.message,
    createdAt: now,
  };

  return { update, activity };
}

export function buildCommentBundle(input: NewCommentInput) {
  const now = new Date().toISOString();
  const targetLabel =
    input.entityType === 'request' ? 'solicitacao' : 'task';

  const comment: CommentItem = {
    id: createId('COM'),
    entityType: input.entityType,
    entityId: input.entityId,
    departmentId: input.departmentId,
    author: input.author,
    message: input.message,
    createdAt: now,
  };

  const activity: ActivityItem = {
    id: createId('ACT'),
    kind: 'update',
    label: `Comentario registrado em ${targetLabel}`,
    highlight: input.message,
    createdAt: now,
  };

  return { comment, activity };
}

export function createInitialState(): PrototypeState {
  return {
    departments: seededDepartments.map((department) => ({ ...department })),
    requests: cloneRequests(seededRequests),
    tasks: cloneTasks(seededTasks),
    updates: cloneUpdates(seededUpdates),
    comments: cloneComments(seededComments),
    activities: cloneActivities(seededActivities),
  };
}

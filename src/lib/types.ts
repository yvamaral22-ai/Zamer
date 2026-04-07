export type DepartmentId =
  | 'ti'
  | 'rh'
  | 'financeiro'
  | 'operacoes'
  | 'comercial';

export type RequestPriority = 'Baixa' | 'Media' | 'Alta' | 'Critica';

export type RequestStatus =
  | 'Nova'
  | 'Triagem'
  | 'Execucao'
  | 'Validacao'
  | 'Concluida';

export type TaskStatus =
  | 'Planejada'
  | 'Em progresso'
  | 'Bloqueada'
  | 'Concluida';

export type UpdateAudience = 'Todos' | 'Gestores' | 'Operacional';

export type Department = {
  id: DepartmentId;
  name: string;
  lead: string;
  goal: string;
  accent: string;
  surface: string;
};

export type RequestItem = {
  id: string;
  title: string;
  requester: string;
  departmentId: DepartmentId;
  priority: RequestPriority;
  status: RequestStatus;
  openedAt: string;
  dueAt: string;
  description: string;
  owner: string;
  tags: string[];
};

export type TaskItem = {
  id: string;
  requestId: string;
  title: string;
  departmentId: DepartmentId;
  assignee: string;
  status: TaskStatus;
  dueAt: string;
  effort: string;
  blockedReason?: string;
};

export type UpdateItem = {
  id: string;
  departmentId: DepartmentId;
  audience: UpdateAudience;
  author: string;
  message: string;
  createdAt: string;
};

export type ActivityKind = 'request' | 'task' | 'update';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  label: string;
  highlight: string;
  createdAt: string;
};

export type PrototypeState = {
  departments: Department[];
  requests: RequestItem[];
  tasks: TaskItem[];
  updates: UpdateItem[];
  activities: ActivityItem[];
};

export type NewRequestInput = {
  title: string;
  requester: string;
  departmentId: DepartmentId;
  priority: RequestPriority;
  dueAt: string;
  description: string;
};

export type NewUpdateInput = {
  departmentId: DepartmentId;
  audience: UpdateAudience;
  author: string;
  message: string;
};

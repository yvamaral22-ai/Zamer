'use client';

import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import {
  buildCommentBundle,
  buildRequestBundle,
  buildUpdateBundle,
  createId,
  createInitialState,
  requestStatusOrder,
  taskStatusOrder,
} from '@/lib/prototype-data';
import type {
  NewCommentInput,
  NewRequestInput,
  NewUpdateInput,
  PrototypeState,
  RequestStatus,
  TaskStatus,
  UpdateRequestInput,
} from '@/lib/types';

type PrototypeContextValue = PrototypeState & {
  hydrated: boolean;
  createRequest: (input: NewRequestInput) => string;
  updateRequest: (input: UpdateRequestInput) => void;
  advanceRequest: (requestId: string, note?: { author: string; message: string }) => void;
  moveTask: (
    taskId: string,
    direction: 'back' | 'forward',
    note?: { author: string; message: string },
  ) => void;
  addUpdate: (input: NewUpdateInput) => string;
  addComment: (input: NewCommentInput) => string;
};

type PrototypeAction =
  | { type: 'hydrate'; payload: PrototypeState }
  | {
      type: 'create-request';
      payload: ReturnType<typeof buildRequestBundle>;
    }
  | {
      type: 'update-request';
      payload: UpdateRequestInput;
    }
  | {
      type: 'advance-request';
      requestId: string;
      note?: { author: string; message: string };
    }
  | {
      type: 'move-task';
      taskId: string;
      direction: 'back' | 'forward';
      note?: { author: string; message: string };
    }
  | {
      type: 'add-update';
      payload: ReturnType<typeof buildUpdateBundle>;
    }
  | {
      type: 'add-comment';
      payload: ReturnType<typeof buildCommentBundle>;
    };

const STORAGE_KEY = 'integraflow-prototype-v2';
const PrototypeContext = createContext<PrototypeContextValue | null>(null);

function nextRequestStatus(currentStatus: RequestStatus) {
  const index = requestStatusOrder.indexOf(currentStatus);
  return requestStatusOrder[Math.min(index + 1, requestStatusOrder.length - 1)];
}

function nextTaskStatus(currentStatus: TaskStatus, direction: 'back' | 'forward') {
  const index = taskStatusOrder.indexOf(currentStatus);

  if (direction === 'back') {
    return taskStatusOrder[Math.max(index - 1, 0)];
  }

  return taskStatusOrder[Math.min(index + 1, taskStatusOrder.length - 1)];
}

function prependActivity(
  currentActivities: PrototypeState['activities'],
  nextActivity: PrototypeState['activities'][number],
) {
  return [nextActivity, ...currentActivities].slice(0, 10);
}

function syncRequestTags(
  currentTags: string[],
  departmentName: string,
  priority: UpdateRequestInput['priority'],
  departmentNames: string[],
) {
  const priorityTags = new Set(['Baixa', 'Media', 'Alta', 'Critica']);
  const departmentTagSet = new Set(departmentNames);
  const preserved = currentTags.filter(
    (tag) => !priorityTags.has(tag) && !departmentTagSet.has(tag),
  );

  return [departmentName, priority, ...preserved].slice(0, 4);
}

function prototypeReducer(
  state: PrototypeState,
  action: PrototypeAction,
): PrototypeState {
  switch (action.type) {
    case 'hydrate':
      return action.payload;
    case 'create-request':
      return {
        ...state,
        requests: [action.payload.request, ...state.requests],
        tasks: [action.payload.task, ...state.tasks],
        activities: prependActivity(state.activities, action.payload.activity),
      };
    case 'update-request': {
      const department =
        state.departments.find((item) => item.id === action.payload.departmentId) ??
        state.departments[0];
      const nextTags = syncRequestTags(
        state.requests.find((request) => request.id === action.payload.id)?.tags ?? [],
        department?.name ?? 'Operacao',
        action.payload.priority,
        state.departments.map((item) => item.name),
      );

      return {
        ...state,
        requests: state.requests.map((request) =>
          request.id === action.payload.id
            ? {
                ...request,
                title: action.payload.title,
                requester: action.payload.requester,
                departmentId: action.payload.departmentId,
                priority: action.payload.priority,
                dueAt: action.payload.dueAt,
                description: action.payload.description,
                owner: action.payload.owner,
                tags: nextTags,
              }
            : request,
        ),
        tasks: state.tasks.map((task) =>
          task.requestId === action.payload.id && task.status !== 'Concluida'
            ? {
                ...task,
                departmentId: action.payload.departmentId,
                assignee: action.payload.owner,
                dueAt: action.payload.dueAt,
              }
            : task,
        ),
        activities: prependActivity(state.activities, {
          id: createId('ACT'),
          kind: 'request',
          label: 'Solicitacao atualizada',
          highlight: action.payload.title,
          createdAt: new Date().toISOString(),
        }),
      };
    }
    case 'advance-request': {
      let nextStatus: RequestStatus | null = null;
      let nextTitle = '';
      let nextDepartmentId = state.departments[0]?.id ?? 'ti';
      let nextOwner = 'Coordenacao';

      const requests = state.requests.map((request) => {
        if (request.id !== action.requestId) {
          return request;
        }

        nextStatus = nextRequestStatus(request.status);
        nextTitle = request.title;
        nextDepartmentId = request.departmentId;
        nextOwner = request.owner;
        return {
          ...request,
          status: nextStatus,
        };
      });

      if (!nextStatus) {
        return state;
      }

      const tasks =
        nextStatus === 'Concluida'
          ? state.tasks.map((task) =>
              task.requestId === action.requestId
                ? {
                    ...task,
                    status: 'Concluida' as TaskStatus,
                  }
                : task,
            )
          : state.tasks;

      let comments = state.comments;
      let activities = state.activities;

      if (action.note?.message.trim()) {
        const commentPayload = buildCommentBundle({
          entityType: 'request',
          entityId: action.requestId,
          departmentId: nextDepartmentId,
          author: action.note.author.trim() || nextOwner,
          message: action.note.message.trim(),
        });
        comments = [commentPayload.comment, ...comments];
        activities = prependActivity(activities, commentPayload.activity);
      }

      return {
        ...state,
        requests,
        tasks,
        comments,
        activities: prependActivity(activities, {
          id: `ACT-STATUS-${action.requestId}-${Date.now()}`,
          kind: 'request',
          label: `Solicitacao movida para ${nextStatus}`,
          highlight: nextTitle,
          createdAt: new Date().toISOString(),
        }),
      };
    }
    case 'move-task': {
      let nextStatus: TaskStatus | null = null;
      let nextTitle = '';
      let linkedRequestId = '';
      let nextDepartmentId = state.departments[0]?.id ?? 'ti';
      let nextAssignee = 'Coordenacao';

      const tasks = state.tasks.map((task) => {
        if (task.id !== action.taskId) {
          return task;
        }

        nextStatus = nextTaskStatus(task.status, action.direction);
        nextTitle = task.title;
        linkedRequestId = task.requestId;
        nextDepartmentId = task.departmentId;
        nextAssignee = task.assignee;

        return {
          ...task,
          status: nextStatus as TaskStatus,
        };
      });

      if (!nextStatus) {
        return state;
      }

      const requests =
        nextStatus === 'Concluida'
          ? state.requests.map((request) =>
              request.id === linkedRequestId && request.status !== 'Concluida'
                ? {
                    ...request,
                    status: 'Validacao' as RequestStatus,
                  }
                : request,
            )
          : state.requests;

      let comments = state.comments;
      let activities = state.activities;

      if (action.note?.message.trim()) {
        const commentPayload = buildCommentBundle({
          entityType: 'task',
          entityId: action.taskId,
          departmentId: nextDepartmentId,
          author: action.note.author.trim() || nextAssignee,
          message: action.note.message.trim(),
        });
        comments = [commentPayload.comment, ...comments];
        activities = prependActivity(activities, commentPayload.activity);
      }

      return {
        ...state,
        requests,
        tasks,
        comments,
        activities: prependActivity(activities, {
          id: `ACT-TASK-${action.taskId}-${Date.now()}`,
          kind: 'task',
          label: `Task movida para ${nextStatus}`,
          highlight: nextTitle,
          createdAt: new Date().toISOString(),
        }),
      };
    }
    case 'add-update':
      return {
        ...state,
        updates: [action.payload.update, ...state.updates],
        activities: prependActivity(state.activities, action.payload.activity),
      };
    case 'add-comment':
      return {
        ...state,
        comments: [action.payload.comment, ...state.comments],
        activities: prependActivity(state.activities, action.payload.activity),
      };
    default:
      return state;
  }
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(prototypeReducer, undefined, createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const cachedState = window.localStorage.getItem(STORAGE_KEY);

      if (cachedState) {
        dispatch({
          type: 'hydrate',
          payload: JSON.parse(cachedState) as PrototypeState,
        });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  const persistState = useEffectEvent((nextState: PrototypeState) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistState(state);
  }, [hydrated, state]);

  const createRequest = (input: NewRequestInput) => {
    const payload = buildRequestBundle(input, state.departments);
    dispatch({ type: 'create-request', payload });
    return payload.requestId;
  };

  const updateRequest = (input: UpdateRequestInput) => {
    dispatch({ type: 'update-request', payload: input });
  };

  const advanceRequest = (requestId: string, note?: { author: string; message: string }) => {
    dispatch({ type: 'advance-request', requestId, note });
  };

  const moveTask = (
    taskId: string,
    direction: 'back' | 'forward',
    note?: { author: string; message: string },
  ) => {
    dispatch({ type: 'move-task', taskId, direction, note });
  };

  const addUpdate = (input: NewUpdateInput) => {
    const payload = buildUpdateBundle(input, state.departments);
    dispatch({ type: 'add-update', payload });
    return payload.update.id;
  };

  const addComment = (input: NewCommentInput) => {
    const payload = buildCommentBundle(input);
    dispatch({ type: 'add-comment', payload });
    return payload.comment.id;
  };

  return (
    <PrototypeContext.Provider
      value={{
        ...state,
        hydrated,
        createRequest,
        updateRequest,
        advanceRequest,
        moveTask,
        addUpdate,
        addComment,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
}

export function usePrototype() {
  const context = useContext(PrototypeContext);

  if (!context) {
    throw new Error('usePrototype must be used inside PrototypeProvider');
  }

  return context;
}

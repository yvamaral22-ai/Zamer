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
  buildRequestBundle,
  buildUpdateBundle,
  createInitialState,
  requestStatusOrder,
  taskStatusOrder,
} from '@/lib/prototype-data';
import type {
  NewRequestInput,
  NewUpdateInput,
  PrototypeState,
  RequestStatus,
  TaskStatus,
} from '@/lib/types';

type PrototypeContextValue = PrototypeState & {
  hydrated: boolean;
  createRequest: (input: NewRequestInput) => string;
  advanceRequest: (requestId: string) => void;
  moveTask: (taskId: string, direction: 'back' | 'forward') => void;
  addUpdate: (input: NewUpdateInput) => string;
};

type PrototypeAction =
  | { type: 'hydrate'; payload: PrototypeState }
  | {
      type: 'create-request';
      payload: ReturnType<typeof buildRequestBundle>;
    }
  | {
      type: 'advance-request';
      requestId: string;
    }
  | {
      type: 'move-task';
      taskId: string;
      direction: 'back' | 'forward';
    }
  | {
      type: 'add-update';
      payload: ReturnType<typeof buildUpdateBundle>;
    };

const STORAGE_KEY = 'integraflow-prototype-v1';
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
    case 'advance-request': {
      let nextStatus: RequestStatus | null = null;
      let nextTitle = '';

      const requests = state.requests.map((request) => {
        if (request.id !== action.requestId) {
          return request;
        }

        nextStatus = nextRequestStatus(request.status);
        nextTitle = request.title;
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

      return {
        ...state,
        requests,
        tasks,
        activities: prependActivity(state.activities, {
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

      const tasks = state.tasks.map((task) => {
        if (task.id !== action.taskId) {
          return task;
        }

        nextStatus = nextTaskStatus(task.status, action.direction);
        nextTitle = task.title;
        linkedRequestId = task.requestId;

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

      return {
        ...state,
        requests,
        tasks,
        activities: prependActivity(state.activities, {
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

  const advanceRequest = (requestId: string) => {
    dispatch({ type: 'advance-request', requestId });
  };

  const moveTask = (taskId: string, direction: 'back' | 'forward') => {
    dispatch({ type: 'move-task', taskId, direction });
  };

  const addUpdate = (input: NewUpdateInput) => {
    const payload = buildUpdateBundle(input, state.departments);
    dispatch({ type: 'add-update', payload });
    return payload.update.id;
  };

  return (
    <PrototypeContext.Provider
      value={{
        ...state,
        hydrated,
        createRequest,
        advanceRequest,
        moveTask,
        addUpdate,
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

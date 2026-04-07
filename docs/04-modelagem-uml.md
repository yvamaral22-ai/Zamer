# 04. Modelagem UML

## 4.1 Fluxo principal do processo

```mermaid
flowchart LR
  A[Colaborador abre solicitacao] --> B[Sistema registra demanda]
  B --> C[Gestor realiza triagem]
  C --> D[Task inicial e criada]
  D --> E[Area responsavel executa]
  E --> F{Existe bloqueio?}
  F -- Sim --> G[Registrar alinhamento entre areas]
  G --> E
  F -- Nao --> H[Enviar para validacao]
  H --> I{Aprovado?}
  I -- Sim --> J[Encerrar solicitacao]
  I -- Nao --> E
```

## 4.2 Diagrama de classes

```mermaid
classDiagram
  class Solicitacao {
    +id: string
    +titulo: string
    +solicitante: string
    +prioridade: string
    +status: string
    +prazo: datetime
    +descricao: string
  }

  class Tarefa {
    +id: string
    +titulo: string
    +responsavel: string
    +status: string
    +prazo: datetime
    +esforco: string
  }

  class Departamento {
    +id: string
    +nome: string
    +lider: string
    +meta: string
  }

  class Atualizacao {
    +id: string
    +autor: string
    +publico: string
    +mensagem: string
    +dataHora: datetime
  }

  class Atividade {
    +id: string
    +tipo: string
    +descricao: string
    +dataHora: datetime
  }

  Departamento "1" --> "0..*" Solicitacao : recebe
  Solicitacao "1" --> "0..*" Tarefa : gera
  Departamento "1" --> "0..*" Atualizacao : publica
  Solicitacao "1" --> "0..*" Atividade : registra
  Tarefa "1" --> "0..*" Atividade : registra
```

## 4.3 Diagrama de sequencia

```mermaid
sequenceDiagram
  actor Colaborador
  participant Sistema
  participant Gestor
  participant Area

  Colaborador->>Sistema: Cadastrar solicitacao
  Sistema-->>Colaborador: Confirmar registro
  Sistema->>Gestor: Notificar nova demanda
  Gestor->>Sistema: Classificar prioridade e prazo
  Sistema->>Area: Criar task inicial
  Area->>Sistema: Atualizar andamento
  Sistema-->>Colaborador: Exibir status atualizado
  Area->>Sistema: Enviar para validacao
  Gestor->>Sistema: Aprovar encerramento
```

## 4.4 Diagrama de estados da solicitacao

```mermaid
stateDiagram-v2
  [*] --> Nova
  Nova --> Triagem
  Triagem --> Execucao
  Execucao --> Validacao
  Validacao --> Concluida
  Validacao --> Execucao: ajuste necessario
  Execucao --> Triagem: repriorizacao
  Concluida --> [*]
```

## 4.5 Interpretacao

- a solicitacao e o objeto central do fluxo
- cada solicitacao pode gerar uma ou mais tarefas
- os departamentos interagem por meio de tarefas e atualizacoes
- a trilha de atividades reforca a rastreabilidade

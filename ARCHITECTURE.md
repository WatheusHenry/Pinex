# Arquitetura da Extensão

## 🏗️ Princípios de Design

### Separação de Responsabilidades
Cada componente e hook tem uma responsabilidade única e bem definida:
- **Componentes**: Apenas renderização e UI
- **Hooks**: Lógica de negócio e gerenciamento de estado
- **Utils**: Funções puras e utilitárias
- **Constants**: Valores fixos e configurações

### Composição sobre Herança
Componentes pequenos e reutilizáveis que podem ser compostos para criar funcionalidades complexas.

### Single Source of Truth
O estado é gerenciado centralmente através de hooks customizados e sincronizado com `chrome.storage`.

## 📦 Estrutura de Componentes

```
Sidebar (Container)
├── ResizeHandle
├── ToggleButton
├── TabMenu
│   └── Tab Items
├── ActionMenu
│   ├── QuickPaste Button
│   ├── Clear Button
│   └── Close Button
└── DropZone
    ├── EmptyState
    └── ImageGrid
        └── MediaItem[]
```

## 🔄 Fluxo de Estado

### Estado Local (React)
- UI state (isVisible, isDragging, width)
- Gerenciado por useState

### Estado Persistente (Chrome Storage)
- Tabs e imagens
- Configurações do usuário
- Sincronizado automaticamente entre abas

### Fluxo de Sincronização
```
Ação do Usuário
    ↓
Hook Customizado (useSidebarState)
    ↓
Atualização do Estado Local
    ↓
Persistência no Chrome Storage
    ↓
Sincronização Automática (storage.onChanged)
    ↓
Atualização em Todas as Abas
```

## 🎯 Padrões Utilizados

### Custom Hooks Pattern
Encapsula lógica complexa em hooks reutilizáveis:
- `useSidebarState`: Gerenciamento de estado
- `useDragAndDrop`: Lógica de drag and drop
- `useClipboard`: Integração com clipboard
- `useDarkMode`: Detecção de tema

### Container/Presentational Pattern
- **Container** (Sidebar.jsx): Gerencia estado e lógica
- **Presentational** (MediaItem, EmptyState): Apenas renderização

### Factory Pattern
`createFloatingViewer`: Cria viewers flutuantes de forma consistente

## 🔧 Boas Práticas Implementadas

### 1. Código Limpo
- Funções pequenas e focadas
- Nomes descritivos
- Comentários apenas quando necessário

### 2. Performance
- Memoização implícita via React
- Event listeners limpos no cleanup
- Lazy loading de imagens

### 3. Manutenibilidade
- Constantes centralizadas
- Código modular e testável
- Estrutura de pastas clara

### 4. Extensibilidade
- Fácil adicionar novos tipos de mídia
- Simples criar novas abas
- Componentes reutilizáveis

## 🚀 Como Adicionar Novas Funcionalidades

### Adicionar Novo Tipo de Mídia
1. Adicionar extensão em `constants/index.js`
2. Atualizar `mediaExtractor.js`
3. Criar componente específico se necessário

### Adicionar Nova Aba
1. Atualizar `DEFAULT_TABS` em `constants/index.js`
2. O resto é automático!

### Adicionar Nova Ação
1. Criar componente de botão
2. Adicionar ao `ActionMenu.jsx`
3. Implementar lógica no hook apropriado

## 🧪 Testabilidade

A arquitetura facilita testes:
- **Hooks**: Podem ser testados isoladamente
- **Utils**: Funções puras, fáceis de testar
- **Componentes**: Podem receber props mockadas

## 📊 Métricas de Qualidade

- **Coesão**: Alta - cada módulo tem responsabilidade única
- **Acoplamento**: Baixo - dependências mínimas entre módulos
- **Complexidade**: Baixa - funções pequenas e focadas
- **Reusabilidade**: Alta - componentes e hooks reutilizáveis

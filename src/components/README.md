# 📁 Estrutura de Componentes

Organização modular dos componentes React por funcionalidade.

## 📂 Estrutura de Pastas

```
src/components/
├── sidebar/          # Componentes da sidebar principal
│   ├── Sidebar.jsx           # Componente principal da sidebar
│   ├── TabMenu.jsx           # Menu de abas
│   ├── ActionMenu.jsx        # Menu de ações (botões)
│   ├── DropZone.jsx          # Área de drop para arquivos
│   ├── ToggleButton.jsx      # Botão de toggle da sidebar
│   ├── ResizeHandle.jsx      # Handle para redimensionar
│   └── index.js              # Exports centralizados
│
├── windows/          # Janelas flutuantes (React components)
│   ├── NoteViewerWindow.jsx      # Janela de edição de notas
│   ├── FloatingViewerWindow.jsx  # Janela de visualização de mídia
│   └── index.js                  # Exports centralizados
│
├── media/            # Componentes de mídia e conteúdo
│   ├── ImageGrid.jsx         # Grid de imagens/notas
│   ├── MediaItem.jsx         # Item de mídia (imagem/vídeo)
│   ├── NoteItem.jsx          # Item de nota
│   └── index.js              # Exports centralizados
│
└── common/           # Componentes compartilhados
    ├── EmptyState.jsx        # Estado vazio
    └── index.js              # Exports centralizados
```

## 🎯 Categorias

### 📌 Sidebar (`/sidebar`)
Componentes relacionados à barra lateral principal da aplicação.

**Responsabilidades:**
- Gerenciamento de visibilidade
- Sistema de abas
- Ações do usuário
- Redimensionamento
- Drag & drop

**Componentes:**
- `Sidebar` - Container principal
- `TabMenu` - Navegação entre abas
- `ActionMenu` - Botões de ação
- `DropZone` - Área de drop
- `ToggleButton` - Botão de mostrar/ocultar
- `ResizeHandle` - Controle de largura

### 🪟 Windows (`/windows`)
Janelas flutuantes que são renderizadas como componentes React separados.

**Responsabilidades:**
- Edição de notas
- Visualização de mídia
- Drag & drop de janelas
- Redimensionamento
- Minimização

**Componentes:**
- `NoteViewerWindow` - Editor de notas flutuante
- `FloatingViewerWindow` - Visualizador de mídia flutuante

### 🖼️ Media (`/media`)
Componentes para exibição e gerenciamento de conteúdo (imagens, vídeos, notas).

**Responsabilidades:**
- Renderização de grid
- Exibição de mídia
- Exibição de notas
- Interações com itens

**Componentes:**
- `ImageGrid` - Grid responsivo
- `MediaItem` - Item de imagem/vídeo
- `NoteItem` - Item de nota

### 🔧 Common (`/common`)
Componentes reutilizáveis em toda a aplicação.

**Responsabilidades:**
- Estados vazios
- Componentes genéricos
- Utilidades visuais

**Componentes:**
- `EmptyState` - Tela vazia com instruções

## 📦 Imports

### Usando arquivos index:
```javascript
// Importar múltiplos componentes de uma pasta
import { Sidebar, TabMenu, ActionMenu } from './components/sidebar';
import { NoteViewerWindow, FloatingViewerWindow } from './components/windows';
import { ImageGrid, MediaItem, NoteItem } from './components/media';
import { EmptyState } from './components/common';
```

### Importação direta:
```javascript
// Importar componente específico
import Sidebar from './components/sidebar/Sidebar';
import NoteViewerWindow from './components/windows/NoteViewerWindow';
```

## 🔄 Dependências entre Componentes

```
Sidebar
├── TabMenu
├── ActionMenu
├── ToggleButton
├── ResizeHandle
└── DropZone
    ├── EmptyState (common)
    └── ImageGrid (media)
        ├── MediaItem (media)
        └── NoteItem (media)

Windows (independentes)
├── NoteViewerWindow
└── FloatingViewerWindow
```

## ✨ Benefícios da Organização

1. **Modularidade**: Cada pasta tem uma responsabilidade clara
2. **Escalabilidade**: Fácil adicionar novos componentes
3. **Manutenibilidade**: Código organizado e fácil de encontrar
4. **Reutilização**: Componentes comuns centralizados
5. **Imports Limpos**: Arquivos index facilitam importações
6. **Separação de Conceitos**: Cada categoria tem seu propósito

## 🚀 Adicionando Novos Componentes

### 1. Identifique a categoria:
- É parte da sidebar? → `/sidebar`
- É uma janela flutuante? → `/windows`
- É conteúdo de mídia? → `/media`
- É reutilizável? → `/common`

### 2. Crie o componente:
```javascript
// src/components/[categoria]/NovoComponente.jsx
const NovoComponente = () => {
  return <div>Novo Componente</div>;
};

export default NovoComponente;
```

### 3. Adicione ao index:
```javascript
// src/components/[categoria]/index.js
export { default as NovoComponente } from './NovoComponente';
```

## 📝 Convenções

- **Nomes de arquivos**: PascalCase (ex: `NoteViewerWindow.jsx`)
- **Nomes de pastas**: camelCase (ex: `sidebar/`, `windows/`)
- **Exports**: Named exports no index.js
- **Default exports**: Nos componentes individuais
- **Extensão**: `.jsx` para componentes React
- **Extensão**: `.js` para arquivos de configuração/exports

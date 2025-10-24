# Pinex

Extensão moderna do Chrome construída com React + Vite que adiciona uma sidebar lateral inteligente para salvar e organizar imagens e vídeos de qualquer página web.

## ✨ Funcionalidades

- 📸 **Drag & Drop**: Arraste imagens diretamente da página
- 📝 **Notas de Texto**: Crie e edite notas junto com suas mídias
- 📋 **Clipboard**: Cole imagens da área de transferência
- 🗂️ **Múltiplas Abas**: Organize suas mídias e notas em 3 abas personalizáveis
- 🎬 **Viewers Flutuantes**: Visualize mídias em janelas redimensionáveis
- 🌓 **Modo Escuro**: Detecta automaticamente o tema do site
- 💾 **Persistência**: Suas mídias e notas são salvas automaticamente
- 🔄 **Sincronização**: Dados sincronizados entre todas as abas do navegador
- 💾 **Auto-Save**: Notas salvam automaticamente ao fechar
- ⌨️ **Atalhos**: Ctrl+Enter para salvar, Esc para fechar

## 🚀 Instalação

1. **Instale as dependências:**

```bash
npm install
```

2. **Build da extensão:**

```bash
npm run build
```

3. **Carregue no Chrome:**
   - Abra `chrome://extensions/`
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta do projeto

## 📖 Como Usar

### Abrir/Fechar Sidebar

- Clique no ícone da extensão na barra de ferramentas
- Ou aproxime o mouse da borda direita da tela

### Adicionar Mídias

- **Arrastar**: Arraste qualquer imagem ou vídeo da página para a sidebar
- **Colar**: Copie uma imagem e clique no botão de colar na sidebar
- **Suporta**: JPG, PNG, GIF, WebP, MP4, WebM e mais

### Organizar

- Use as 3 abas para categorizar suas mídias
- Clique no X para deletar uma mídia
- Use o botão de lixeira para limpar toda a aba

### Visualizar

- Clique em qualquer mídia para abrir em um viewer flutuante
- Redimensione e mova o viewer livremente
- Minimize para manter o viewer acessível

## 🏗️ Arquitetura

O projeto foi completamente refatorado seguindo as melhores práticas de desenvolvimento:

```
src/
├── components/      # Componentes React modulares
├── hooks/          # Custom hooks para lógica de negócio
├── utils/          # Funções utilitárias
├── constants/      # Configurações centralizadas
└── content.jsx     # Ponto de entrada
```

### Documentação Detalhada

- 📁 [Estrutura do Código](src/README.md)
- 🏛️ [Arquitetura](ARCHITECTURE.md)
- 🔄 [Refatoração](REFACTORING.md)
- 💻 [Guia de Desenvolvimento](DEVELOPMENT.md)

## 🛠️ Desenvolvimento

### Modo de Desenvolvimento

```bash
npm run dev
```

### Build de Produção

```bash
npm run build
```

### Estrutura de Componentes

- **Sidebar**: Componente principal
- **TabMenu**: Navegação entre abas
- **DropZone**: Área de drag & drop
- **MediaItem**: Item individual de mídia
- **FloatingViewer**: Visualizador flutuante

### Custom Hooks

- `useSidebarState`: Gerenciamento de estado e persistência
- `useDragAndDrop`: Lógica de drag and drop
- `useClipboard`: Integração com clipboard
- `useDarkMode`: Detecção de tema

## 🎯 Tecnologias

- ⚛️ React 18
- ⚡ Vite 5
- 🎨 CSS Modules
- 🔧 Chrome Extensions API
- 💾 Chrome Storage API

## 📦 Build

O build gera os seguintes arquivos em `dist/`:

- `content.js` - Content script principal
- `content.css` - Estilos da sidebar
- `background.js` - Service worker
- `manifest.json` - Configuração da extensão

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🙏 Agradecimentos

Construído com ❤️ usando React e Vite.

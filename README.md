# Chrome Sidebar Extension

Extensão do Chrome com React + Vite que adiciona uma sidebar lateral nas páginas.

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Build da extensão:
```bash
npm run build
```

3. Carregue no Chrome:
   - Abra `chrome://extensions/`
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta do projeto

## Uso

- Clique no ícone da extensão na barra de ferramentas para mostrar/esconder a sidebar
- Use o botão de seta na lateral da sidebar para alternar a visibilidade
- A sidebar aparece no lado direito de qualquer página

## Desenvolvimento

```bash
npm run dev
```

Após fazer alterações, execute `npm run build` e recarregue a extensão no Chrome.

# Fluxo de alterações e publicação

- Trabalhe na branch `preview`. Envie primeiro para ela todas as atualizações do site.
- Mostre as alterações e os resultados de validação ao usuário antes de propor a publicação.
- Só faça merge de `preview` em `main` após autorização explícita do usuário para as alterações em questão. Uma autorização anterior não aprova alterações futuras.
- Não faça push direto de novas alterações para `main` ou `gh-pages` para contornar essa revisão.
- O workflow de Pages publica o conteúdo de `main` na raiz e o conteúdo de `preview` em `/preview/`. Um push em `preview` pode republicar o artefato completo, mas não deve incorporar mudanças de `preview` à página principal.
- Cada tarefa já usa um ambiente isolado. Use o checkout existente; não crie worktrees sem solicitação explícita.

O site usa HTML, CSS e JavaScript nativos. Consulte `README.md` para execução e testes. Preserve o visual atual até que o usuário autorize aplicar a nova paleta.

# Delícia de Bolos

Landing page responsiva de confeitaria, feita com HTML, CSS e JavaScript nativos, sem dependências de produção ou etapa de build.

## Executar

Na pasta do projeto, inicie um servidor HTTP com Python 3:

```sh
cd /workspace/Delicia-de-Bolos
python3 -m http.server 8000 --bind 0.0.0.0
```

Sirva os arquivos por HTTP; abrir `index.html` diretamente como arquivo não carrega os módulos JavaScript. Para disponibilizar o site, hospede a pasta em um serviço de sites estáticos com HTTPS. Não há backend nem processamento de pagamento. O servidor Python é apenas para desenvolvimento.

## Organização

- `index.html`: estrutura semântica, navegação fixa, seções e diálogo acessível da sacola.
- `css/styles.css`: identidade visual, componentes e layouts para desktop e celular.
- `js/products.js`: catálogo, opções, preços em centavos e imagens.
- `js/main.js`: renderização dos produtos, filtros, seletor de opções e quantidades.
- `js/cart.js`: sacola, persistência local, cálculo de totais e cópia do pedido.
- `assets/`: imagens ilustrativas locais e ícone; detalhes em `assets/SOURCES.md`.
- `tests/browser_smoke.py`: verificações funcionais reais no Chromium.

## Personalizar antes de publicar

O PDF mencionado na solicitação não estava disponível. A paleta **provisória** de creme, rosa e vinho está concentrada nos tokens `:root` de `css/styles.css`. Substitua-os pelas cores oficiais quando o PDF for fornecido.

Os seis produtos, seus nomes, opções e preços são **demonstrativos**. Atualize `js/products.js` com o catálogo real antes de aceitar encomendas. Os preços são números inteiros em centavos; por exemplo, `12000` representa R$ 120,00. Cada quantidade representa uma opção completa: dois itens de uma caixa de 25 docinhos representam duas caixas, não dois docinhos.

As fotos são ilustrações geradas para este projeto. A grade usa uma composição de três colunas por duas linhas com `photoPosition`. Para usar fotos individuais oficiais, atualize `image`, remova `photoPosition` do produto e ajuste `.product-photo` para `background-size: cover`. A miniatura da sacola já aceita imagens individuais.

## Sacola e Instagram

A sacola é salva em `localStorage` na chave `delicia-cart-v1`. Contém somente identificadores dos produtos, variantes e quantidades. Os valores são sempre recalculados a partir do catálogo atual. Há um limite de 99 por opção, tratamento de dados inválidos e funcionamento em memória se o armazenamento estiver bloqueado.

Ao clicar em **Copiar Pedido e Enviar no Instagram**, o site consolida os produtos e o total estimado e tenta `navigator.clipboard.writeText`. A API exige HTTPS ou um contexto local seguro e pode depender da permissão do navegador. O código contém comentários sobre esse processo e disponibiliza o resumo selecionável quando a cópia automática falha.

Depois da cópia, um botão abre o perfil **@deliciadeboloss** em outra aba. O cliente deve iniciar uma conversa e colar o resumo; o Instagram não permite preencher automaticamente uma mensagem por esse link. A encomenda, o valor final, a data, o pagamento e a entrega/retirada são confirmados diretamente com a confeitaria. A sacola não é apagada ao copiar.

## Revisão e publicação

As próximas atualizações devem ir primeiro para a branch `preview`. O merge em `main` depende de autorização explícita do usuário para cada conjunto de mudanças; consulte `AGENTS.md`.

O workflow `.github/workflows/deploy.yml` monta dois sites estáticos no mesmo artefato:

- Produção: `https://bipelipe.github.io/Delicia-de-Bolos/`, com arquivos de `main`.
- Revisão: `https://bipelipe.github.io/Delicia-de-Bolos/preview/`, com arquivos de `preview`.

Os endereços dependem de uma publicação bem-sucedida. Um push em `preview` atualiza a revisão e republica os arquivos aprovados de `main` na raiz, sem incorporar as mudanças da revisão à produção. O workflow copia apenas `index.html`, `css`, `js`, `assets` e `.nojekyll`; não publica metadados Git nem arquivos de testes.

Em **Settings → Pages → Build and deployment**, a origem deve ser **GitHub Actions**. Se o ambiente `github-pages` tiver restrições de branches, elas precisam permitir esse fluxo de publicação para `main` e `preview`, mantendo as aprovações exigidas. O workflow pode ser iniciado por um push em qualquer uma dessas branches. Não faça merge ou altere proteções para contornar a aprovação do usuário.

## Validação

Com o servidor acima ativo e Playwright para Python e Chromium instalados:

```sh
python3 tests/browser_smoke.py
```

O teste usa `/usr/bin/chromium`. É possível personalizar `CHROMIUM_PATH` e `DELICIA_BASE_URL`. Os testes não exigem acesso ao Instagram e simulam tanto a cópia autorizada quanto sua recusa. As capturas de tela são gravadas em `/tmp`.

Foram verificados filtros, opções, quantidades, união de itens, totais, remoção, persistência, dados corrompidos, resumo, destino do Instagram, restauração de foco e layout em 1440, 390 e 320 pixels.

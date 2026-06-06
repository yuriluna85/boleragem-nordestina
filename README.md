# Nordestão FC — Portal de Curadoria e Compilação do Futebol Nordestino

Este é um projeto completo de curadoria e compilação de notícias de futebol da região Nordeste, divididas entre futebol masculino, feminino e jogadores de destaque. O sistema gera um histórico organizado por datas e temas que pode ser consultado a qualquer momento diretamente pelo navegador.

---

## 🚀 Como Funciona o Sistema?

O projeto está dividido em duas partes integradas de forma transparente:

1. **O Compilador de Notícias (`compilador.js`)**: 
   - Um script backend em Node.js (sem dependências externas) que consulta feeds esportivos atualizados (como os da Gazeta Esportiva).
   - Aplica filtros inteligentes de palavras-chave para identificar notícias ligadas aos times e estados do Nordeste.
   - Categoriza as notícias nos três temas principais: **Masculino**, **Feminino** e **Jogadores**.
   - Salva os dados de forma estruturada na pasta de histórico `DATA/ANO/MES/TEMA` em formatos:
     - **CSV**: Para exportação, auditoria, análise de dados e planilhas.
     - **JSON**: Para carregamento rápido e dinâmico na interface web.
   - Gera um arquivo central `ultimas-noticias.json` na raiz com as notícias mais recentes.
   - **Histórico Inicial**: Na primeira execução, gera automaticamente um histórico retroativo dos últimos 2 anos (2024 a 2026) com notícias realistas e variadas, fornecendo dados imediatos para o portal e para os gráficos de métricas.

2. **A Interface Web (`index.html`)**:
   - Um portal moderno, responsivo e com visual premium (Dark Mode esportivo com glassmorphism).
   - Carrega as notícias em tempo real e atualiza os dados automaticamente a cada **30 minutos** (com contador visual discreto).
   - Permite consultar o histórico completo de notícias compiladas selecionando o **Ano/Mês** desejado (desde janeiro de 2024) no painel de busca.
   - Inclui espaços otimizados para blocos de anúncios do **Google AdSense** (atualmente ocultados via CSS).
   - **Acessibilidade Completa (WCAG)**: Botão de Alto Contraste, controles de redimensionamento de texto (A+/A-), semântica ARIA completa e navegação otimizada para teclado (`focus-visible`).

---

## 📅 Sincronização Editorial Automática (GitHub Actions)

O compilador está preparado para rodar diretamente nos servidores do **GitHub** por meio do **GitHub Actions**. Isso mantém as notícias atualizadas de forma contínua sem que você precise deixar seu computador ligado!

O fluxo de trabalho está configurado no arquivo **[.github/workflows/atualizar-portal.yml](file:///.github/workflows/atualizar-portal.yml)**:
- O GitHub executa o script do compilador a cada **30 minutos** (via cronjob do GitHub Actions).
- O script busca notícias recentes e atualiza a pasta de histórico `DATA`, o arquivo de métricas e o arquivo `ultimas-noticias.json`.
- O GitHub Actions realiza um commit e push automático dessas atualizações editoriais de volta para o seu repositório.

### Como Ativar:
Ao enviar a pasta do projeto para o seu repositório no GitHub, o fluxo de Actions já será detectado automaticamente.
> [!IMPORTANT]
> Certifique-se de que nas configurações do seu repositório (**Settings > Actions > General > Workflow permissions**), a opção **"Read and write permissions"** esteja marcada para permitir que o compilador grave os commits com as atualizações no repositório.

---

## 🛠️ Como Atualizar o Portal Localmente?

### Requisitos:
- Ter o **Node.js** instalado em seu computador (versão 18 ou superior).

### Execução Manual:
1. Abra a pasta do projeto.
2. Dê um duplo clique no arquivo **[atualizar-portal.bat](file:///G:/Meu%20Drive/ESPECIALIZA%C3%87%C3%9OS/CLI/boleragem-nordestina-historico/atualizar-portal.bat)**.
3. O compilador será aberto no terminal, processará as notícias (gerando a base histórica de 2 anos caso a execute pela primeira vez), atualizará as métricas e consolidará o portal instantaneamente.

---

## ♿ Recursos de Acessibilidade

O portal foi desenvolvido seguindo as recomendações do **WCAG** para garantir acessibilidade universal:
- **🌓 Alto Contraste**: Inverte as cores da interface para um contraste rígido (preto, branco e amarelo), ideal para pessoas com daltonismo, baixa visão ou fotossensibilidade.
- **🔍 Tamanho da Fonte (A- / A+ / Normal)**: Permite ajustar dinamicamente o tamanho de todos os textos de forma harmoniosa (usando unidades baseadas em `rem`), salvando as preferências do usuário no `localStorage`.
- **⌨️ Navegação por Teclado**: Foco visível (`focus-visible`) em todos os botões, links e campos da página.
- **🏷️ Semântica e Leitores de Tela**: Uso de marcos estruturais (HTML5 semântico) e propriedades ARIA (como `aria-live` para atualizações de status, `aria-label` e estados de abas `role="tab"`).

---

## 💰 Como Configurar o Google AdSense?

Os anúncios estão **ocultados por padrão** para manter o visual limpo (`display: none` no CSS). Para reexibi-los, siga os passos abaixo:

1. Acesse sua conta do [Google AdSense](https://adsense.google.com/) e obtenha seu ID de cliente (formato `ca-pub-XXXXXXXXXXXXXXXX`).
2. Abra o arquivo [index.html](file:///G:/Meu%20Drive/ESPECIALIZA%C3%87%C3%9OS/CLI/boleragem-nordestina-historico/index.html).
3. Descomente a tag `<script>` do AdSense no `<head>` (inserindo seu ID):
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-seu-id-aqui" crossorigin="anonymous"></script>
   ```
4. Crie seus blocos de anúncios no painel do AdSense e copie os códigos gerados.
5. Substitua os placeholders correspondentes (como `.adsense-block`) no HTML pelos códigos do seu anúncio.
6. No CSS do `index.html` (linhas 181 e 211), altere a propriedade `display: none;` das classes `.adsense-wrapper` e `.sidebar-ads-block` para `display: flex;` para torná-los visíveis na tela.

---

## 📂 Estrutura de Arquivos do Projeto
```
boleragem-nordestina-historico/
│
├── .github/
│   └── workflows/
│       └── atualizar-portal.yml   # Workflow de atualização no GitHub
│
├── DATA/                          # Banco de dados histórico compilado
│   └── [ANO]/
│       └── [MÊS]/
│           ├── masculino/
│           │   ├── masculino.csv
│           │   └── masculino.json
│           ├── feminino/
│           │   ├── feminino.csv
│           │   └── feminino.json
│           └── jogadores/
│               ├── jogadores.csv
│               └── jogadores.json
│
├── index.html                     # Interface gráfica premium com WCAG
├── favicon.svg                    # Ícone personalizado para a aba do navegador
├── compilador.js                  # Compilador de notícias em Node.js
├── atualizar-portal.bat           # Atalho de atualização local
├── ultimas-noticias.json          # Cache das notícias mais recentes
├── metricas.json                  # Dados estatísticos e métricas compilados
├── times-nordeste.json            # Base de dados histórica dos clubes dos 9 estados
└── README.md                      # Esta documentação
```

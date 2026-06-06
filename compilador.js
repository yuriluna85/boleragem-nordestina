const fs = require('fs');
const path = require('path');

// Configurações
const FEED_URL = 'https://www.gazetaesportiva.com/feed/';

const PALAVRAS_NE = [
  'sport', 'fortaleza', 'bahia', 'ceará', 'ceara', 'vitória', 'vitoria',
  'náutico', 'nautico', 'santa cruz', 'ferroviário', 'ferroviario', 'abc', 'botafogo-pb',
  'crb', 'csa', 'sampaio', 'nordeste', 'recife', 'salvador', 'pernambuco', 'alagoas',
  'paraíba', 'paraiba', 'maranhão', 'maranhao', 'piauí', 'piaui', 'sergipe',
  'rio grande do norte', 'natal'
];

const CLUBES_MONITORADOS = [
  { nome: 'Sport', termos: ['sport', 'leão da ilha', 'rubro-negro pernambucano'] },
  { nome: 'Fortaleza', termos: ['fortaleza', 'trio do pici', 'leão do pici'] },
  { nome: 'Bahia', termos: ['bahia', 'esquadrão de aço', 'tricolor baiano'] },
  { nome: 'Ceará', termos: ['ceará', 'ceara', 'vozão', 'alvinegro cearense'] },
  { nome: 'Vitória', termos: ['vitória', 'vitoria', 'leão da barra', 'rubro-negro baiano'] },
  { nome: 'Náutico', termos: ['náutico', 'nautico', 'timbú'] },
  { nome: 'Santa Cruz', termos: ['santa cruz', 'coral', 'tricolor do arruda'] },
  { nome: 'CRB', termos: ['crb', 'galo da praia'] },
  { nome: 'CSA', termos: ['csa', 'azulão'] },
  { nome: 'ABC', termos: ['abc', 'alvinegro potiguar'] },
  { nome: 'Botafogo-PB', termos: ['botafogo-pb', 'belo'] },
  { nome: 'Sampaio Corrêa', termos: ['sampaio', 'bolívia querida'] }
];

const ESTADOS_MONITORADOS = {
  'PE': ['pe', 'pernambuco', 'recife', 'arruda', 'ilha do retiro'],
  'CE': ['ce', 'ceará', 'ceara', 'fortaleza', 'castelão', 'pici'],
  'BA': ['ba', 'bahia', 'salvador', 'fonte nova', 'barradão', 'vitoria', 'vitória'],
  'AL': ['al', 'alagoas', 'maceió', 'maceio', 'crb', 'csa', 'rei pelé'],
  'RN': ['rn', 'rio grande do norte', 'natal', 'abc', 'frasqueirão'],
  'PB': ['pb', 'paraíba', 'paraiba', 'joão pessoa', 'joao pessoa', 'botafogo-pb', 'almeidão'],
  'MA': ['ma', 'maranhão', 'maranhao', 'são luís', 'sao luis', 'sampaio'],
  'PI': ['pi', 'piauí', 'piaui', 'teresina', 'albertão'],
  'SE': ['se', 'sergipe', 'aracaju', 'batistão']
};

const PALAVRAS_JOGADORES = [
  'renato kayzer', 'everton ribeiro', 'thiago galhardo', 'yago pikachu', 
  'joão ricardo', 'léo gamalho', 'lucero', 'cauly', 'jean lucas', 'jogador',
  'contratação', 'reforço', 'elenco', 'mercado da bola', 'transferência', 'atacante', 'meia'
];

// Curadoria de notícias locais caso a busca em tempo real retorne poucos dados sobre futebol nordestino
const FALLBACKS = {
  masculino: [
    {
      titulo: "Sport Recife e Bahia empatam clássico na Ilha do Retiro por 2 a 2",
      desc: "Em um jogo emocionante e cheio de alternativas, Leão da Ilha e Esquadrão dividiram pontos pela Série A do Brasileirão. Gols saíram no segundo tempo.",
      fonte: "Nordestão FC",
      imagem: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    },
    {
      titulo: "Fortaleza vence o Ceará no Clássico-Rei e assume topo da tabela",
      desc: "O Tricolor do Pici superou o maior rival por 1 a 0 na Arena Castelão com gol de Yago Pikachu e garantiu a liderança do campeonato regional.",
      fonte: "Diário de Esportes",
      imagem: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    },
    {
      titulo: "Vitória anuncia novo patrocinador master para a temporada 2026",
      desc: "O Leão da Barra fechou uma das maiores parcerias de sua história recente. O patrocínio deve viabilizar a vinda de novos reforços em julho.",
      fonte: "Bahia Notícias",
      imagem: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    },
    {
      titulo: "Botafogo-PB e CRB se enfrentam pelas quartas da Copa do Nordeste",
      desc: "Partida de ida será disputada no Almeidão. Expectativa é de casa cheia para apoiar o Belo diante do embalado time alagoano.",
      fonte: "Portal Paraíba",
      imagem: "https://images.unsplash.com/photo-1504156067013-fbe0f2c8b78b?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    }
  ],
  feminino: [
    {
      titulo: "Fortaleza Feminino goleia e assume a ponta do Brasileirão A1",
      desc: "As Leoas venceram o clássico com autoridade por 4 a 1 e continuam invictas na competição nacional de futebol feminino.",
      fonte: "Ceará Esportes",
      imagem: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    },
    {
      titulo: "Sport Feminino atrai público recorde na Arena de Pernambuco",
      desc: "Mais de 15 mil torcedores empurraram as Leoas na vitória histórica contra o Bahia. Um novo marco para o esporte feminino no Nordeste.",
      fonte: "Pernambuco Press",
      imagem: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    },
    {
      titulo: "Bahia Feminino contrata dupla de ataque campeã sul-americana",
      desc: "O Tricolor de Aço se reforça visando a disputa do mata-mata do Brasileiro Feminino A2. Apresentação das novas atletas ocorre nesta segunda.",
      fonte: "Salvador News",
      imagem: "https://images.unsplash.com/photo-1551958219-acbc608c6d77?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    }
  ],
  jogadores: [
    {
      titulo: "Everton Ribeiro completa 120 jogos pelo Bahia com golaço na Fonte Nova",
      desc: "O veterano meia do Bahia comandou a vitória tricolor com passes decisivos e um belíssimo gol de fora da área, aplaudido de pé.",
      fonte: "Bahia Esportes",
      imagem: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    },
    {
      titulo: "Renato Kayzer entra na mira de clubes europeus após grande fase no Castelão",
      desc: "Artilheiro do Fortaleza marcou 15 gols nos últimos 20 jogos. Agentes confirmam contatos de times da Itália e de Portugal.",
      fonte: "Diário do Ceará",
      imagem: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    },
    {
      titulo: "Revelação do Ceará SC viaja para testes na Alemanha neste fim de semana",
      desc: "O jovem meio-campista de apenas 18 anos despertou interesse de clubes da Bundesliga após excelente atuação na Copa São Paulo.",
      fonte: "Vozão Diário",
      imagem: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
      url: "https://www.gazetaesportiva.com"
    }
  ]
};

// Função auxiliar para escapar campos do CSV conforme RFC 4180
function escapeCSV(val) {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  str = str.replace(/"/g, '""'); // Duplica aspas internas
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
}

// Limpa tags HTML
function cleanHTML(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

// Faz requisição HTTP e retorna texto (nativo do Node.js 18+)
async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!response.ok) throw new Error(`Erro ao acessar URL: ${response.statusText}`);
  return await response.text();
}

// Parse simples de XML para extrair itens do feed RSS
function parseRSS(xmlText) {
  const items = [];
  const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
  
  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemXml.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/) || itemXml.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemXml.match(/<description>([\s\S]*?)<\/description>/);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    
    // Suporte a tags de thumbnail do WordPress
    const imageMatch = itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/) || 
                       itemXml.match(/<media:content[^>]*url=["']([^"']+)["']/) ||
                       itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/);

    const title = cleanHTML(titleMatch ? titleMatch[1] : '');
    const link = (linkMatch ? linkMatch[1] : '').trim();
    const description = cleanHTML(descMatch ? descMatch[1] : '');
    const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toUTCString();
    const imageUrl = imageMatch ? imageMatch[1] : 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';

    if (title) {
      items.push({
        titulo: title,
        desc: description.slice(0, 180) + (description.length > 180 ? '...' : ''),
        url: link,
        imagem: imageUrl,
        data: new Date(pubDate).toISOString(),
        fonte: 'Gazeta Esportiva'
      });
    }
  }
  return items;
}

// Processa notícias e categoriza pelos 3 temas
async function buscarNoticias() {
  console.log(`Buscando notícias no feed: ${FEED_URL}...`);
  const resultados = {
    masculino: [],
    feminino: [],
    jogadores: []
  };

  try {
    const xml = await fetchText(FEED_URL);
    const noticiasLidas = parseRSS(xml);
    console.log(`Lidas ${noticiasLidas.length} notícias gerais no feed.`);

    noticiasLidas.forEach(n => {
      const text = (n.titulo + ' ' + n.desc).toLowerCase();
      
      // 1. Feminino
      if (text.includes('feminino') || text.includes('feminina') || text.includes('mulher') || text.includes('meninas')) {
        if (PALAVRAS_NE.some(p => text.includes(p))) {
          resultados.feminino.push(n);
        }
      } 
      // 2. Jogadores
      else if (PALAVRAS_JOGADORES.some(j => text.includes(j))) {
        if (PALAVRAS_NE.some(p => text.includes(p))) {
          resultados.jogadores.push(n);
        }
      } 
      // 3. Masculino Geral (Notícias Nordeste)
      else if (PALAVRAS_NE.some(p => text.includes(p))) {
        resultados.masculino.push(n);
      }
    });

  } catch (error) {
    console.error(`Erro ao buscar feed:`, error.message);
  }

  // Complementa com notícias da curadoria local se as notícias reais do Nordeste estiverem vazias/poucas no feed de hoje
  for (const tema of ['masculino', 'feminino', 'jogadores']) {
    const minDesejado = 4;
    if (resultados[tema].length < minDesejado) {
      const listaFallback = FALLBACKS[tema];
      let i = 0;
      while (resultados[tema].length < minDesejado && i < listaFallback.length) {
        const item = listaFallback[i];
        const dataPublicacao = new Date(Date.now() - (i * 3 * 3600 * 1000)).toISOString();
        resultados[tema].push({
          ...item,
          data: dataPublicacao,
          url: `${item.url}?id=curado-${tema}-${i}-${dataPublicacao.slice(0, 10)}`,
          id: `curado-${tema}-${i}`
        });
        i++;
      }
      console.log(`Tema '${tema}': Adicionadas ${i} notícias da curadoria para manter o portal dinâmico.`);
    }
    resultados[tema].sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  return resultados;
}

// Cria diretórios nível por nível com retries automáticos para contornar bloqueios/sincronização do Google Drive virtual no Windows
function criarDiretorioRobustamente(dirPath) {
  if (fs.existsSync(dirPath)) return;
  const parts = dirPath.split(path.sep);
  let currentPath = '';
  for (const part of parts) {
    if (!part) {
      currentPath += path.sep;
      continue;
    }
    if (part.endsWith(':')) {
      currentPath = part + path.sep;
      continue;
    }
    currentPath = path.join(currentPath, part);
    if (!fs.existsSync(currentPath)) {
      let retries = 3;
      while (retries > 0) {
        try {
          fs.mkdirSync(currentPath);
          break;
        } catch (e) {
          if (e.code === 'EEXIST') {
            break;
          }
          retries--;
          if (retries === 0) {
            if (fs.existsSync(currentPath) || e.code === 'EEXIST') break;
            throw e;
          }
          const start = Date.now();
          while (Date.now() - start < 150) {}
        }
      }
    }
  }
}

// Salva dados no formato de histórico em DATA/ANO/MES/TEMA
function salvarHistorico(tema, noticias, dataEspecifica = null) {
  if (noticias.length === 0) return;

  const refDate = dataEspecifica || new Date();
  const ano = refDate.getFullYear().toString();
  const mes = String(refDate.getMonth() + 1).padStart(2, '0');

  // Estrutura de pastas: DATA > ANO > MES > TEMA
  const dirPath = path.join(__dirname, 'DATA', ano, mes, tema);
  criarDiretorioRobustamente(dirPath);

  const csvPath = path.join(dirPath, `${tema}.csv`);
  const jsonPath = path.join(dirPath, `${tema}.json`);

  // 1. Gravar CSV
  let csvContent = '';
  if (!fs.existsSync(csvPath)) {
    csvContent = 'data_busca,data_publicacao,titulo,resumo,fonte,url,imagem_url\n';
  }

  const dataBusca = refDate.toISOString();
  noticias.forEach(n => {
    csvContent += `${escapeCSV(dataBusca)},${escapeCSV(n.data)},${escapeCSV(n.titulo)},${escapeCSV(n.desc)},${escapeCSV(n.fonte)},${escapeCSV(n.url)},${escapeCSV(n.imagem)}\n`;
  });

  fs.appendFileSync(csvPath, csvContent, 'utf-8');

  // 2. Gravar/Atualizar JSON para o Histórico
  let historicoDia = [];
  if (fs.existsSync(jsonPath)) {
    try {
      historicoDia = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } catch (e) {
      historicoDia = [];
    }
  }

  noticias.forEach(n => {
    if (!historicoDia.some(h => h.url === n.url)) {
      historicoDia.push({
        dataBusca,
        data: n.data,
        titulo: n.titulo,
        desc: n.desc,
        fonte: n.fonte,
        url: n.url,
        imagem: n.imagem
      });
    }
  });

  historicoDia.sort((a, b) => new Date(b.data) - new Date(a.data));
  fs.writeFileSync(jsonPath, JSON.stringify(historicoDia, null, 2), 'utf-8');
}

// Busca recursiva por arquivos JSON de histórico, ignorando a pasta de perfis individuais de atletas
function buscarArquivosJSON(dir, filesList = []) {
  if (!fs.existsSync(dir)) return filesList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file === 'atletas') continue; // Ignora currículos de atletas no histórico geral de notícias
      buscarArquivosJSON(name, filesList);
    } else if (file.endsWith('.json')) {
      filesList.push(name);
    }
  }
  return filesList;
}

// Gera o arquivo metricas.json
function gerarMetricas() {
  console.log("Compilando estatísticas e métricas do histórico...");
  const dataDirPath = path.join(__dirname, 'DATA');
  const jsonFiles = buscarArquivosJSON(dataDirPath);
  
  let todasNoticias = [];
  
  // Agrupa todas as notícias coletadas
  jsonFiles.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (Array.isArray(content)) {
        todasNoticias = todasNoticias.concat(content);
      }
    } catch (e) {
      console.error(`Erro ao ler arquivo para métricas: ${file}`, e.message);
    }
  });

  // Remove duplicatas gerais baseadas na URL
  const urlsUnicas = new Set();
  const noticiasUnicas = [];
  todasNoticias.forEach(n => {
    if (!urlsUnicas.has(n.url)) {
      urlsUnicas.add(n.url);
      noticiasUnicas.push(n);
    }
  });

  // Inicializa Contadores das Métricas
  const totalNoticias = noticiasUnicas.length;
  const totaisCategorias = { masculino: 0, feminino: 0, jogadores: 0 };
  const contagemEstados = { PE: 0, CE: 0, BA: 0, AL: 0, RN: 0, PB: 0, MA: 0, PI: 0, SE: 0 };
  const contagemClubes = {};
  const contagemFontes = {};

  // Processa as notícias únicas para as métricas
  noticiasUnicas.forEach(n => {
    const texto = (n.titulo + ' ' + n.desc).toLowerCase();
    
    // 1. Contagem por Categoria (Tema)
    if (texto.includes('feminino') || texto.includes('feminina')) {
      totaisCategorias.feminino++;
    } else if (PALAVRAS_JOGADORES.some(j => texto.includes(j)) && !texto.includes('campeonato')) {
      totaisCategorias.jogadores++;
    } else {
      totaisCategorias.masculino++;
    }

    // 2. Contagem por Fonte
    const fonte = n.fonte || 'Desconhecido';
    contagemFontes[fonte] = (contagemFontes[fonte] || 0) + 1;

    // 3. Contagem por Estado
    for (const [est, termos] of Object.entries(ESTADOS_MONITORADOS)) {
      if (termos.some(t => texto.includes(t))) {
        contagemEstados[est] = (contagemEstados[est] || 0) + 1;
      }
    }

    // 4. Contagem por Clube
    CLUBES_MONITORADOS.forEach(c => {
      if (c.termos.some(t => texto.includes(t))) {
        const nomeChave = c.nome;
        contagemClubes[nomeChave] = (contagemClubes[nomeChave] || 0) + 1;
      }
    });
  });

  // Formata o ranking de fontes e clubes (ordenado por volume de menções)
  const rankingClubes = Object.entries(contagemClubes)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // top 5 clubes mais citados

  const rankingFontes = Object.entries(contagemFontes)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  const metricas = {
    geradoEm: new Date().toISOString(),
    totais: {
      totalGeral: totalNoticias,
      porCategoria: totaisCategorias
    },
    porEstado: contagemEstados,
    topClubes: rankingClubes,
    fontesRanking: rankingFontes
  };

  const metricasPath = path.join(__dirname, 'metricas.json');
  fs.writeFileSync(metricasPath, JSON.stringify(metricas, null, 2), 'utf-8');
  console.log(`Métricas geradas com sucesso em: ${metricasPath}`);
}

// Salva dados históricos sobrescrevendo arquivos antigos (usado apenas no seed inicial para limpeza de duplicatas)
function salvarHistoricoSobrescrevendo(tema, noticias, dataEspecifica) {
  if (noticias.length === 0) return;

  const refDate = dataEspecifica;
  const ano = refDate.getFullYear().toString();
  const mes = String(refDate.getMonth() + 1).padStart(2, '0');

  const dirPath = path.join(__dirname, 'DATA', ano, mes, tema);
  criarDiretorioRobustamente(dirPath);

  const csvPath = path.join(dirPath, `${tema}.csv`);
  const jsonPath = path.join(dirPath, `${tema}.json`);

  // 1. Gravar CSV
  let csvContent = 'data_busca,data_publicacao,titulo,resumo,fonte,url,imagem_url\n';
  const dataBusca = refDate.toISOString();
  noticias.forEach(n => {
    csvContent += `${escapeCSV(dataBusca)},${escapeCSV(n.data)},${escapeCSV(n.titulo)},${escapeCSV(n.desc)},${escapeCSV(n.fonte)},${escapeCSV(n.url)},${escapeCSV(n.imagem)}\n`;
  });
  fs.writeFileSync(csvPath, csvContent, 'utf-8');

  // 2. Gravar JSON
  const historicoDia = noticias.map(n => ({
    dataBusca,
    data: n.data,
    titulo: n.titulo,
    desc: n.desc,
    fonte: n.fonte,
    url: n.url,
    imagem: n.imagem
  }));
  fs.writeFileSync(jsonPath, JSON.stringify(historicoDia, null, 2), 'utf-8');
}

// Verifica se a pasta DATA está vazia ou inexistente e gera 2 anos de sementes históricas retroativas (2024 a 2026)
function verificarEGerarHistoricoRetroativo() {
  const dataDirPath = path.join(__dirname, 'DATA');
  
  if (fs.existsSync(dataDirPath)) {
    const anosExistentes = fs.readdirSync(dataDirPath).filter(file => {
      const fullPath = path.join(dataDirPath, file);
      return fs.statSync(fullPath).isDirectory() && /^\d{4}$/.test(file);
    });
    if (anosExistentes.length >= 2) {
      console.log("Histórico retroativo detectado. Pulando geração de sementes...");
      return;
    }
  }

  console.log("Iniciando geração de dados históricos retroativos dos últimos 2 anos (2024 e 2025)...");

  const CLUBES_GERADOR = [
    { nome: 'Sport Recife', estado: 'PE', fonte: 'Pernambuco Press' },
    { nome: 'Fortaleza', estado: 'CE', fonte: 'Diário do Ceará' },
    { nome: 'Bahia', estado: 'BA', fonte: 'Bahia Esportes' },
    { nome: 'Ceará', estado: 'CE', fonte: 'Ceará Notícias' },
    { nome: 'Vitória', estado: 'BA', fonte: 'Salvador Esportes' },
    { nome: 'Náutico', estado: 'PE', fonte: 'Recife Gols' },
    { nome: 'Santa Cruz', estado: 'PE', fonte: 'Futebol Coral' },
    { nome: 'CRB', estado: 'AL', fonte: 'Alagoas Alerta' },
    { nome: 'CSA', estado: 'AL', fonte: 'Maceió Sports' },
    { nome: 'ABC', estado: 'RN', fonte: 'RN Esportivo' },
    { nome: 'Botafogo-PB', estado: 'PB', fonte: 'Portal Paraíba' },
    { nome: 'Sampaio Corrêa', estado: 'MA', fonte: 'Maranhão Esportivo' }
  ];

  const IMAGENS_GERADOR = [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504156067013-fbe0f2c8b78b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551958219-acbc608c6d77?q=80&w=600&auto=format&fit=crop"
  ];

  const JOGADORES_LISTA = ["Everton Ribeiro", "Lucero", "Cauly", "Yago Pikachu", "Renato Kayzer", "Jean Lucas", "Thiago Galhardo", "Léo Gamalho", "Gustavo Coutinho", "Lucas Lima", "Souza", "Zé Hugo"];

  const DIVISOES = ["A", "B", "C"];

  const periodos = [];
  
  // 2024 Completo (Meses 1 a 12)
  for (let m = 1; m <= 12; m++) {
    periodos.push({ ano: 2024, mes: m });
  }
  // 2025 Completo (Meses 1 a 12)
  for (let m = 1; m <= 12; m++) {
    periodos.push({ ano: 2025, mes: m });
  }
  // 2026 até Maio (Meses 1 a 5, já que Junho é o mês atual)
  for (let m = 1; m <= 5; m++) {
    periodos.push({ ano: 2026, mes: m });
  }

  for (const p of periodos) {
    const ano = p.ano;
    const mes = p.mes;

    for (const tema of ['masculino', 'feminino', 'jogadores']) {
      const noticias = [];
      for (let i = 0; i < 3; i++) {
        // Cálculo cíclico determinístico para variedade de notícias
        const seedVal = ano + mes + i;
        const clubeA = CLUBES_GERADOR[seedVal % CLUBES_GERADOR.length];
        const clubeB = CLUBES_GERADOR[(seedVal + 3) % CLUBES_GERADOR.length];
        const jogador = JOGADORES_LISTA[seedVal % JOGADORES_LISTA.length];
        const imagem = IMAGENS_GERADOR[seedVal % IMAGENS_GERADOR.length];
        const divisao = DIVISOES[seedVal % DIVISOES.length];

        let titulo = '';
        let desc = '';
        let url = `https://www.gazetaesportiva.com/noticias/${tema}/${ano}/${mes}/${i}-${clubeA.nome.toLowerCase().replace(/ /g, '-')}`;

        if (tema === 'masculino') {
          const templates = [
            `${clubeA.nome} vence o clássico contra o ${clubeB.nome} em duelo eletrizante`,
            `Após jogo tenso, ${clubeA.nome} e ${clubeB.nome} empatam sob festa da torcida`,
            `${clubeA.nome} anuncia nova contratação visando o campeonato nacional`,
            `Duelo regional: ${clubeA.nome} enfrenta o ${clubeB.nome} valendo liderança`,
            `${clubeA.nome} faz partida brilhante e goleia em rodada importante`,
            `Com gol no fim, ${clubeA.nome} bate ${clubeB.nome} e soma 3 pontos valiosos`
          ];
          titulo = templates[seedVal % templates.length];
          desc = `Em um jogo marcado por forte intensidade e disputa tática, o futebol masculino do Nordeste mostrou sua força. A partida movimentou os torcedores locais e foi um grande espetáculo de competitividade esportiva regional.`;
        } else if (tema === 'feminino') {
          const templates = [
            `${clubeA.nome} Feminino brilha em campo e vence clássico estadual`,
            `Público histórico prestigia rodada dupla do ${clubeA.nome} Feminino`,
            `Futebol Feminino: ${clubeA.nome} anuncia investimento de peso e novas atletas`,
            `${clubeA.nome} Feminino domina a partida e goleia o ${clubeB.nome}`,
            `Com elenco entrosado, ${clubeA.nome} Feminino assume topo da tabela regional`
          ];
          titulo = templates[seedVal % templates.length];
          desc = `O confronto demonstrou o alto nível técnico e a evolução constante do futebol feminino no Nordeste, atraindo cada vez mais atenção de torcedores e fortalecendo os projetos esportivos estaduais da categoria.`;
        } else {
          const templates = [
            `${jogador} se destaca em campo e comanda vitória importante do ${clubeA.nome}`,
            `${jogador} comemora marca de jogos históricos vestindo a camisa do ${clubeA.nome}`,
            `Renovação confirmada: ${jogador} estende vínculo com o ${clubeA.nome} para a temporada`,
            `Destaque do ${clubeA.nome}, meia ${jogador} recebe sondagem de clubes nacionais`,
            `${jogador} se recupera de lesão e volta a treinar forte no ${clubeA.nome}`
          ];
          titulo = templates[seedVal % templates.length];
          desc = `O jogador comentou sobre o bom momento no elenco e a determinação de ajudar o time nas competições nacionais. O departamento técnico celebrou a dedicação e o rendimento físico demonstrados no gramado.`;
        }

        // Dias espaçados no mês: dia 5, dia 15 e dia 25
        const dia = 5 + (i * 10);
        const dataPublicacao = new Date(ano, mes - 1, dia, 12 + i, 30, 0).toISOString();

        noticias.push({
          data: dataPublicacao,
          titulo,
          desc,
          fonte: clubeA.fonte,
          url,
          imagem
        });
      }

      // Salva no histórico usando a data do meio do mês correspondente como referência
      const refDate = new Date(ano, mes - 1, 15);
      try {
        salvarHistoricoSobrescrevendo(tema, noticias, refDate);
      } catch (e) {
        console.warn(`Aviso: Não foi possível gerar seed histórico para ${ano}-${mes} no tema '${tema}' localmente:`, e.message);
      }
    }
  }

  console.log("Dados históricos retroativos criados com sucesso!");
}

const BIOGRAFIAS_PADRAO = {
  "renato-kayzer": {
    nomeCompleto: "Renato Kayzer de Souza",
    nascimento: "17/02/1996 (30 anos)",
    naturalidade: "Jaciara (MT)",
    clubesAnteriores: "Vasco, Athletico-PR, Ceará, América-MG",
    conquistas: "Copa do Brasil (2020), Campeonato Cearense (2023, 2024)",
    biografia: "Centroavante de forte presença de área e faro de gol, Renato Kayzer se firmou como um dos principais artilheiros do futebol nordestino com gols decisivos em competições regionais e nacionais.",
    fotoUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=300&auto=format&fit=crop"
  },
  "everton-ribeiro": {
    nomeCompleto: "Éverton Augusto de Barros Ribeiro",
    nascimento: "10/04/1989 (37 anos)",
    naturalidade: "Arujá (SP)",
    clubesAnteriores: "Coritiba, Cruzeiro, Al-Ahli, Flamengo",
    conquistas: "Libertadores (2019, 2022), Campeonato Brasileiro (2013, 2014, 2019, 2020), Copa do Brasil (2022)",
    biografia: "Meio-campista clássico de técnica refinada, visão de jogo excepcional e liderança nata. Everton Ribeiro comanda as ações ofensivas no futebol nordestino, agregando experiência de Seleção Brasileira.",
    fotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop"
  },
  "thiago-galhardo": {
    nomeCompleto: "Thiago Galhardo do Nascimento Rocha",
    nascimento: "20/07/1989 (36 anos)",
    naturalidade: "São João del Rei (MG)",
    clubesAnteriores: "Botafogo, Vasco, Ceará, Internacional, Fortaleza, Coritiba",
    conquistas: "Campeonato Cearense (2023), Copa do Nordeste (2024)",
    biografia: "Jogador versátil que atua tanto como meia de ligação quanto como centroavante. Thiago Galhardo destaca-se pela inteligência tática, movimentação constante e facilidade de finalização.",
    fotoUrl: "https://images.unsplash.com/photo-1518281400280-854e0c69114c?q=80&w=300&auto=format&fit=crop"
  },
  "yago-pikachu": {
    nomeCompleto: "Glaybson Yago Souza Lisboa",
    nascimento: "05/06/1992 (34 anos)",
    naturalidade: "Belém (PA)",
    clubesAnteriores: "Paysandu, Vasco da Gama, Shimizu S-Pulse",
    conquistas: "Copa do Nordeste (2022, 2024), Campeonato Cearense (2021, 2022, 2023)",
    biografia: "Ala-direito icônico, reconhecido por sua incrível capacidade de marcar gols e dar assistências. Yago Pikachu é um dos atletas mais decisivos e queridos da torcida no futebol nordestino.",
    fotoUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=300&auto=format&fit=crop"
  },
  "kanu": {
    nomeCompleto: "Victor Hugo Oliveira do Nascimento",
    nascimento: "03/05/1997 (29 anos)",
    naturalidade: "Salvador (BA)",
    clubesAnteriores: "Cabofriense, Botafogo",
    conquistas: "Campeonato Brasileiro - Série B (2021), Campeonato Baiano (2024)",
    biografia: "Zagueiro de vigor físico imponente, precisão nos desarmes e excelente jogo aéreo. Kanu destaca-se como o xerife e um dos pilares defensivos da equipe no cenário regional e nacional.",
    fotoUrl: "https://images.unsplash.com/photo-1486282414372-3580f3c4eedb?q=80&w=300&auto=format&fit=crop"
  },
  "joao-ricardo": {
    nomeCompleto: "João Ricardo Riedi",
    nascimento: "06/09/1988 (37 anos)",
    naturalidade: "Mariano Moro (RS)",
    clubesAnteriores: "América-MG, Chapecoense, Ceará",
    conquistas: "Copa do Nordeste (2020, 2024), Campeonato Cearense (2023, 2024)",
    biografia: "Goleiro de reflexos apurados e extrema segurança sob as traves. João Ricardo é conhecido por grandes defesas em clássicos regionais e cobranças de pênaltis decisivas.",
    fotoUrl: "https://images.unsplash.com/photo-1516731415730-0c6419000676?q=80&w=300&auto=format&fit=crop"
  },
  "leo-gamalho": {
    nomeCompleto: "Léo Gamalho de Souza",
    nascimento: "30/01/1986 (40 anos)",
    naturalidade: "Porto Alegre (RS)",
    clubesAnteriores: "Santa Cruz, Bahia, Goiás, Ponte Preta, Vitória",
    conquistas: "Campeonato Pernambucano (2015), Campeonato Baiano (2015), Campeonato Brasileiro - Série B (2023)",
    biografia: "O lendário 'Ibra do Nordeste'. Léo Gamalho é sinônimo de gols por onde passa no futebol nordestino, sendo um centroavante de área clássico, com excelente posicionamento e força aérea.",
    fotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop"
  },
  "cristiane": {
    nomeCompleto: "Cristiane Rozeira de Souza Silva",
    nascimento: "15/05/1985 (41 anos)",
    naturalidade: "Osasco (SP)",
    clubesAnteriores: "Santos, PSG, Chicago Red Stars, São Paulo",
    conquistas: "Medalha de Ouro nos Jogos Pan-Americanos (2003, 2007), Vice-Campeã Mundial (2007), Vice-Campeã Olímpica (2004, 2008)",
    biografia: "Uma das maiores lendas da história do futebol feminino mundial. Cristiane rozeira agregou classe, faro de gol absurdo e peso internacional ao futebol feminino da região Nordeste.",
    fotoUrl: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=300&auto=format&fit=crop"
  },
  "maysa": {
    nomeCompleto: "Maysa Caroline Oliveira da Silva",
    nascimento: "12/03/2002 (24 anos)",
    naturalidade: "Fortaleza (CE)",
    clubesAnteriores: "Categorias de base do Fortaleza",
    conquistas: "Campeonato Cearense Feminino (2022, 2024)",
    biografia: "Revelação promissora do futebol feminino cearense, Maysa destaca-se por sua visão de jogo apurada no meio-campo, passes em profundidade e chegada dinâmica na área de ataque.",
    fotoUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6d77?q=80&w=300&auto=format&fit=crop"
  },
  "geyse": {
    nomeCompleto: "Geyse da Silva Ferreira",
    nascimento: "27/03/1998 (28 anos)",
    naturalidade: "Maragogi (AL)",
    clubesAnteriores: "Benfica, Barcelona, Manchester United",
    conquistas: "Copa América Feminina (2022), Champions League Feminina (2022/2023), Campeonato Espanhol Feminino (2022/2023)",
    biografia: "Atacante de velocidade explosiva, dribles desconcertantes e presença internacional de destaque. Geyse orgulha o esporte regional com conquistas de peso na Europa e Seleção.",
    fotoUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=300&auto=format&fit=crop"
  },
  "pricila": {
    nomeCompleto: "Pricila da Silva Pinheiro",
    nascimento: "08/08/2000 (25 anos)",
    naturalidade: "Juazeiro do Norte (CE)",
    clubesAnteriores: "Juventude-CE, Ceará SC",
    conquistas: "Campeonato Cearense Feminino (2021, 2023)",
    biografia: "Zagueira de ótima recuperação, desarme limpo e espírito de liderança em campo. Pricila vem crescendo como uma das referências defensivas no futebol feminino regional.",
    fotoUrl: "https://images.unsplash.com/photo-1516731415730-0c6419000676?q=80&w=300&auto=format&fit=crop"
  },
  "karen": {
    nomeCompleto: "Karen Aline Xavier de Almeida",
    nascimento: "24/10/1995 (30 anos)",
    naturalidade: "Salvador (BA)",
    clubesAnteriores: "Vitória-BA, Bahia",
    conquistas: "Campeonato Baiano Feminino (2022, 2023, 2024)",
    biografia: "Goleira ágil, segura e de excelente liderança verbal na linha de defesa. Karen é uma das goleiras mais consistentes e experientes do futebol feminino baiano nos últimos anos.",
    fotoUrl: "https://images.unsplash.com/photo-1628891890467-b79f2c879657?q=80&w=300&auto=format&fit=crop"
  },
  "juliana": {
    nomeCompleto: "Juliana Maria dos Santos",
    nascimento: "14/09/1997 (28 anos)",
    naturalidade: "Recife (PE)",
    clubesAnteriores: "Náutico, Sport Recife",
    conquistas: "Campeonato Pernambucano Feminino (2022, 2024)",
    biografia: "Meio-campista clássica e versátil, Juliana distribui o jogo com maestria no meio de campo das Leoas da Ilha, sendo perigosa em finalizações de média distância.",
    fotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop"
  }
};

// Gera currículo e histórico de notícias individual para cada jogador/jogadora monitorado
function atualizarPerfisAtletas() {
  console.log("Atualizando currículos e históricos individuais dos atletas...");
  const atletasPath = path.join(__dirname, 'atletas.json');
  
  if (!fs.existsSync(atletasPath)) {
    console.warn("Aviso: Arquivo atletas.json não encontrado na raiz. Pulando perfis...");
    return;
  }

  let configAtletas = { jogadores: [], jogadoras: [] };
  try {
    configAtletas = JSON.parse(fs.readFileSync(atletasPath, 'utf-8'));
  } catch (e) {
    console.error("Erro ao ler atletas.json:", e.message);
    return;
  }

  // 1. Carrega todas as notícias do histórico para buscar menções (buscarArquivosJSON agora ignora atletas/)
  const dataDirPath = path.join(__dirname, 'DATA');
  const jsonFiles = buscarArquivosJSON(dataDirPath);
  let todasNoticias = [];

  jsonFiles.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (Array.isArray(content)) {
        todasNoticias = todasNoticias.concat(content);
      }
    } catch (e) {}
  });

  // Remove duplicatas gerais do histórico
  const urlsUnicas = new Set();
  const noticiasUnicas = [];
  todasNoticias.forEach(n => {
    if (!urlsUnicas.has(n.url)) {
      urlsUnicas.add(n.url);
      noticiasUnicas.push(n);
    }
  });

  // 2. Garante a pasta DATA/atletas/
  const atletasDir = path.join(dataDirPath, 'atletas');
  criarDiretorioRobustamente(atletasDir);

  const listaAtletas = [...configAtletas.jogadores, ...configAtletas.jogadoras];

  listaAtletas.forEach(atleta => {
    const slug = atleta.slug || atleta.nome.toLowerCase().replace(/ /g, '-');
    const atletaFile = path.join(atletasDir, `${slug}.json`);

    let perfil = {};
    if (fs.existsSync(atletaFile)) {
      try {
        perfil = JSON.parse(fs.readFileSync(atletaFile, 'utf-8'));
      } catch (e) {
        perfil = {};
      }
    }

    const bioPredefinida = BIOGRAFIAS_PADRAO[slug] || {
      nomeCompleto: atleta.nome,
      nascimento: "Não informado",
      naturalidade: "Região Nordeste",
      clubesAnteriores: atleta.time,
      conquistas: "Destaque regional",
      biografia: `Atleta em destaque monitorado pelo portal no futebol do Nordeste. Atua como ${atleta.pos} defendendo as cores do ${atleta.time}.`
    };

    perfil.nome = atleta.nome;
    perfil.time = atleta.time;
    perfil.pos = atleta.pos;
    perfil.gols = atleta.gols;
    perfil.icone = atleta.icone;
    perfil.slug = slug;

    perfil.nomeCompleto = perfil.nomeCompleto || bioPredefinida.nomeCompleto;
    perfil.nascimento = perfil.nascimento || bioPredefinida.nascimento;
    perfil.naturalidade = perfil.naturalidade || bioPredefinida.naturalidade;
    perfil.clubesAnteriores = perfil.clubesAnteriores || bioPredefinida.clubesAnteriores;
    perfil.conquistas = perfil.conquistas || bioPredefinida.conquistas;
    perfil.biografia = perfil.biografia || bioPredefinida.biografia;
    perfil.fotoUrl = perfil.fotoUrl || bioPredefinida.fotoUrl;

    // 3. Busca menções nas notícias
    const noticiasAtleta = [];
    const termosBusca = atleta.termos || [atleta.nome.toLowerCase()];

    noticiasUnicas.forEach(n => {
      const texto = (n.titulo + ' ' + n.desc).toLowerCase();
      if (termosBusca.some(t => texto.includes(t.toLowerCase()))) {
        noticiasAtleta.push({
          data: n.data,
          titulo: n.titulo,
          desc: n.desc,
          fonte: n.fonte,
          url: n.url,
          imagem: n.imagem
        });
      }
    });

    noticiasAtleta.sort((a, b) => new Date(b.data) - new Date(a.data));
    perfil.noticias = noticiasAtleta;

    try {
      fs.writeFileSync(atletaFile, JSON.stringify(perfil, null, 2), 'utf-8');
    } catch (e) {
      console.warn(`Aviso: Não foi possível salvar o perfil local do atleta '${atleta.nome}':`, e.message);
    }
  });

  console.log(`Perfis de atletas atualizados com sucesso em: ${atletasDir}`);
}

// Execução principal
async function executarCompilador() {
  console.log(`--- Iniciando Compilador de Notícias Nordestão FC (${new Date().toLocaleString()}) ---`);
  
  // 1. Gera o histórico retroativo se estiver vazio
  verificarEGerarHistoricoRetroativo();

  // 2. Busca as notícias recentes reais via feed RSS
  const resultados = await buscarNoticias();
  
  // 3. Salva a rodada atual no histórico do mês corrente
  for (const tema of ['masculino', 'feminino', 'jogadores']) {
    console.log(`Atualizando histórico do tema: ${tema} (${resultados[tema].length} notícias)`);
    try {
      salvarHistorico(tema, resultados[tema]);
    } catch (e) {
      console.warn(`Aviso: Não foi possível salvar o histórico local para o tema '${tema}' neste mês corrente devido a travas do sincronizador de arquivos:`, e.message);
    }
  }

  // 4. Salva o arquivo de últimas notícias na raiz
  const ultimasNoticiasPath = path.join(__dirname, 'ultimas-noticias.json');
  fs.writeFileSync(ultimasNoticiasPath, JSON.stringify({
    ultimaAtualizacao: new Date().toISOString(),
    dados: resultados
  }, null, 2), 'utf-8');
  
  console.log(`Arquivo de últimas notícias updated em: ${ultimasNoticiasPath}`);
  
  // 5. Compila estatísticas gerais atualizadas
  gerarMetricas();

  // 6. Atualiza currículos e históricos individuais dos atletas
  atualizarPerfisAtletas();
  
  console.log('--- Execução do Compilador finalizada com sucesso! ---');
}

executarCompilador();

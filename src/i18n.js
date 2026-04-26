import { config } from './config';

const n = config.ownerName;

const translations = {
  en: {
    // ── Header ──────────────────────────────────────────────────────────────
    subtitle: 'Community Edition',
    ownerProgress: `${n}'s Progress`,
    forkGithub: 'FORK ON GITHUB',
    shareTracker: 'Share Tracker',
    skipToContent: 'Skip to content',

    // ── Stats cards ─────────────────────────────────────────────────────────
    totalStickers: 'Total Stickers',
    ownerOwned: `${n}'s Owned`,
    ownerMissing: `${n}'s Missing`,
    duplicatesForTrade: 'Duplicates for Trade',

    // ── Tab navigation ──────────────────────────────────────────────────────
    tabsLabel: 'App sections',
    tabTrade: 'Trade & Compare',
    tabInventory: 'Collection Progress',
    tabDuplicates: 'Available Duplicates',
    tabSticking: 'Sticking Guide',
    tabInvestment: 'Investment',

    // ── Trade tab — your collection panel ───────────────────────────────────
    yourCollection: 'Your Collection',
    enterStickers: 'Enter your stickers to find trade matches.',
    clear: 'CLEAR',
    clearAriaLabel: 'Clear your collection',
    template: 'TEMPLATE',
    templateAriaLabel: 'Download CSV template',
    option1: 'Option 1: Paste Text',
    pastePlaceholder: 'Type or paste (e.g. ARG 1, ARG 2, BRA 10...)',
    pasteTip: 'Tip: Enter "ARG 1" twice to count it as a duplicate.',
    option2: 'Option 2: Interactive Grid',
    option3: 'Option 3: Upload CSV',

    // ── Trade tab — comparison engine ────────────────────────────────────────
    comparisonEngine: 'Comparison Engine',
    yourProgress: 'Your Progress',
    stickers: 'Stickers',
    copyTradeMessage: 'Copy Trade Message',
    iHaveYouNeed: 'I HAVE WHAT YOU NEED',
    youHaveINeed: 'YOU HAVE WHAT I NEED',
    addToFindMatches: 'Add your collection above to find matches.',
    noMatchesYet: 'No matches found yet.',

    // ── Trade tab — contact card ─────────────────────────────────────────────
    letsSwap: "Let's Swap! 🤝",
    swapDesc: `Found some matches? Reach out via LinkedIn or Email and let's complete our albums together!`,
    linkedinProfile: 'LinkedIn Profile',
    sendEmail: 'Send Email',
    emailSubject: 'WC 2026 Sticker Swap',
    emailLabel: 'Email',
    locationLabel: 'Location',
    howItWorks: 'How It Works',
    step1: 'Enter your stickers via paste, grid, or CSV upload.',
    step2: 'The engine compares your duplicates against my missing stickers.',
    step3: 'Copy the pre-filled message and get in touch!',

    // ── Inventory tab ────────────────────────────────────────────────────────
    searchPlaceholder: 'Search team or number…',
    searchAriaLabel: 'Search stickers',
    filterAriaLabel: 'Filter stickers by status',
    filterAll: 'All',
    filterOwned: 'Owned',
    filterMissing: 'Missing',
    filterDuplicated: 'Duplicated',
    grid: 'Grid',
    byTeam: 'By Team',
    clickToToggle: 'Click a sticker card to toggle ownership.',
    stickerAriaLabel: (team, num, status) => `${team} ${num}, ${status}`,

    // ── Duplicates tab ───────────────────────────────────────────────────────
    availableForTrade: 'Available for Trade',
    duplicatesDesc: `These are the stickers ${n} has more than one of. If you see something you need, reach out!`,
    noDuplicates: 'No duplicates available yet.',
    copyDuplicatesList: 'Copy List',
    showingCount: (n) => `${n} sticker${n !== 1 ? 's' : ''}`,

    // ── Sticking Guide tab ───────────────────────────────────────────────────
    stickingTitle: 'Sticking Guide',
    stickingDesc: 'Open a new pack, paste the codes below, and the guide sorts them by album page — no more flipping back and forth.',
    stickingInputLabel: 'New stickers (from your latest pack)',
    stickingInputPlaceholder: 'Paste codes here, e.g. ARG 1, BRA 5, ESP 3…',
    stickingInputTip: 'Tip: Paste multiple packs at once — just dump all the codes in together.',
    stickingFound: (n) => `${n} sticker${n !== 1 ? 's' : ''} found`,
    stickingNoMatch: 'No stickers matched.',
    stickingNoMatchDesc: 'Check that team codes are 3 letters (e.g. ARG, BRA, ESP) and the numbers are correct.',
    stickingNoPageGroup: 'No page assigned',
    stickingNoPagesDesc: 'Add a "Page" column to your Google Sheet for full sticking guide support.',
    stickingPage: 'Page',
    stickingMarkPage: 'Mark page done',
    stickingMarkOne: (team, num) => `Mark ${team} ${num} as stuck`,
    stickingMarkAll: 'Mark all as stuck',
    stickingClear: 'New pack / Reset',
    stickingClearAriaLabel: 'Clear current pack and start fresh',
    stickingAllDone: 'All placed! 🎉',
    stickingAllDoneDesc: 'Every sticker from this pack is in the album. Paste the next pack to continue.',
    stickingCount: (n, p) => `${n} sticker${n !== 1 ? 's' : ''} to place across ${p} page${p !== 1 ? 's' : ''}`,

    // ── Investment tab ───────────────────────────────────────────────────────
    configuration: 'Configuration',
    pricePerPackLabel: 'Price per Pack (€)',
    pricePerPackId: 'price-per-pack',
    stickersPerPackLabel: 'Stickers per Pack',
    stickersPerPackId: 'stickers-per-pack',
    totalSpent: 'Total Spent (Est.)',
    totalSpentDesc: 'Based on your sticker count',
    packsPurchased: 'Packs Purchased',
    packsPurchasedDesc: 'Total estimate',
    packsRemaining: 'Packs Remaining',
    packsRemainingDesc: 'Best case (no duplicates)',
    costToComplete: 'Cost to Complete',
    costToCompleteDesc: 'Minimum investment needed',
    efficiencyAnalysis: 'Efficiency Analysis',
    duplicateRate: 'Duplicate Rate',
    duplicateRateDesc: 'Of all stickers purchased, these are repeats.',
    valueInTrades: 'Value in Trades',
    valueInTradesDesc: 'Value "locked" in duplicates available to trade.',
    newPerPack: 'New Stickers per Pack',
    newPerPackDesc: 'Average new stickers per pack opened.',

    // ── Loading / Error screens ──────────────────────────────────────────────
    loadingMsg: 'Loading your collection…',
    failedTitle: 'Failed to Load Data',
    failedDesc: 'Could not fetch sticker data. Check your connection and try again.',
    tryAgain: 'Try Again',

    // ── Toast messages ───────────────────────────────────────────────────────
    toastCleared: 'Collection cleared.',
    toastDownloaded: 'Template downloaded!',
    toastUploaded: 'Collection uploaded!',
    toastTradeCopied: 'Trade message copied!',
    toastLinkCopied: 'Link copied!',
    toastStuckCleared: 'Pack reset.',
    toastDuplicatesCopied: 'Duplicates list copied!',

    // ── Footer ───────────────────────────────────────────────────────────────
    contact: 'Contact',
    worldCupEdition: '2026 World Cup Edition',
    tagline: 'Premium Sticker Tracker © 2026',

    // ── Trade message body ───────────────────────────────────────────────────
    tradeMessage: (iHave, youHave) =>
      `Hi! I saw your WC 2026 tracker and it looks like we have some stickers to swap. 🤝\n\nI have for you: ${iHave || 'Nothing at the moment'}\nYou have for me: ${youHave || 'Nothing at the moment'}\n\nLet's connect!`,
  },

  pt: {
    // ── Header ──────────────────────────────────────────────────────────────
    subtitle: 'Edição Comunitária',
    ownerProgress: `Progresso de ${n}`,
    forkGithub: 'FORK NO GITHUB',
    shareTracker: 'Partilhar Tracker',
    skipToContent: 'Saltar para o conteúdo',

    // ── Stats cards ─────────────────────────────────────────────────────────
    totalStickers: 'Total de Cromos',
    ownerOwned: `Cromos de ${n}`,
    ownerMissing: `Em Falta (${n})`,
    duplicatesForTrade: 'Repetidos para Troca',

    // ── Tab navigation ──────────────────────────────────────────────────────
    tabsLabel: 'Secções da aplicação',
    tabTrade: 'Trocas & Comparação',
    tabInventory: 'Progresso da Coleção',
    tabDuplicates: 'Repetidos Disponíveis',
    tabSticking: 'Guia de Colagem',
    tabInvestment: 'Investimento',

    // ── Trade tab — your collection panel ───────────────────────────────────
    yourCollection: 'A Tua Coleção',
    enterStickers: 'Indica os teus cromos para encontrar trocas.',
    clear: 'LIMPAR',
    clearAriaLabel: 'Limpar a tua coleção',
    template: 'MODELO',
    templateAriaLabel: 'Descarregar modelo CSV',
    option1: 'Opção 1: Colar Texto',
    pastePlaceholder: 'Escreve ou cola (ex: ARG 1, ARG 2, BRA 10…)',
    pasteTip: 'Dica: Escreve "ARG 1" duas vezes para contar como repetido.',
    option2: 'Opção 2: Grelha Interativa',
    option3: 'Opção 3: Carregar CSV',

    // ── Trade tab — comparison engine ────────────────────────────────────────
    comparisonEngine: 'Motor de Comparação',
    yourProgress: 'O Teu Progresso',
    stickers: 'Cromos',
    copyTradeMessage: 'Copiar Mensagem de Troca',
    iHaveYouNeed: 'EU TENHO O QUE PRECISAS',
    youHaveINeed: 'TU TENS O QUE EU PRECISO',
    addToFindMatches: 'Adiciona a tua coleção para encontrar correspondências.',
    noMatchesYet: 'Ainda não há correspondências.',

    // ── Trade tab — contact card ─────────────────────────────────────────────
    letsSwap: 'Vamos Trocar! 🤝',
    swapDesc: 'Encontraste correspondências? Contacta-me via LinkedIn ou Email e vamos completar os nossos álbuns juntos!',
    linkedinProfile: 'Perfil LinkedIn',
    sendEmail: 'Enviar Email',
    emailSubject: 'Troca de Cromos - Mundial 2026',
    emailLabel: 'Email',
    locationLabel: 'Localização',
    howItWorks: 'Como Funciona',
    step1: 'Introduz os teus cromos por texto, grelha ou ficheiro CSV.',
    step2: 'O motor compara os teus repetidos com os que me faltam.',
    step3: 'Copia a mensagem pré-preenchida e entra em contacto!',

    // ── Inventory tab ────────────────────────────────────────────────────────
    searchPlaceholder: 'Pesquisar equipa ou número…',
    searchAriaLabel: 'Pesquisar cromos',
    filterAriaLabel: 'Filtrar cromos por estado',
    filterAll: 'Todos',
    filterOwned: 'Tenho',
    filterMissing: 'Em Falta',
    filterDuplicated: 'Repetidos',
    grid: 'Grelha',
    byTeam: 'Por Equipa',
    clickToToggle: 'Clica num cromo para marcar como teu.',
    stickerAriaLabel: (team, num, status) => `${team} ${num}, ${status}`,

    // ── Duplicates tab ───────────────────────────────────────────────────────
    availableForTrade: 'Disponíveis para Troca',
    duplicatesDesc: `Estes são os cromos que ${n} tem em duplicado. Se precisas de algum, fala comigo!`,
    noDuplicates: 'Ainda não há repetidos disponíveis.',
    copyDuplicatesList: 'Copiar Lista',
    showingCount: (n) => `${n} cromo${n !== 1 ? 's' : ''}`,

    // ── Sticking Guide tab ───────────────────────────────────────────────────
    stickingTitle: 'Guia de Colagem',
    stickingDesc: 'Abre uma saqueta nova, cola os códigos abaixo, e o guia ordena-os por página do álbum — sem teres de andar sempre a folhear.',
    stickingInputLabel: 'Cromos da tua saqueta nova',
    stickingInputPlaceholder: 'Cola os códigos aqui, ex: ARG 1, BRA 5, ESP 3…',
    stickingInputTip: 'Dica: Podes colar várias saquetas ao mesmo tempo — junta todos os códigos.',
    stickingFound: (n) => `${n} cromo${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`,
    stickingNoMatch: 'Nenhum cromo encontrado.',
    stickingNoMatchDesc: 'Verifica que os códigos de equipa têm 3 letras (ex: ARG, BRA, ESP) e os números estão corretos.',
    stickingNoPageGroup: 'Sem página atribuída',
    stickingNoPagesDesc: 'Adiciona uma coluna "Page" na tua Google Sheet para usar o guia de colagem.',
    stickingPage: 'Página',
    stickingMarkPage: 'Marcar página como feita',
    stickingMarkOne: (team, num) => `Marcar ${team} ${num} como colado`,
    stickingMarkAll: 'Marcar todos como colados',
    stickingClear: 'Saqueta nova / Reiniciar',
    stickingClearAriaLabel: 'Limpar saqueta atual e começar de novo',
    stickingAllDone: 'Todos colados! 🎉',
    stickingAllDoneDesc: 'Todos os cromos desta saqueta estão no álbum. Cola os da próxima para continuar.',
    stickingCount: (n, p) => `${n} cromo${n !== 1 ? 's' : ''} para colar em ${p} página${p !== 1 ? 's' : ''}`,

    // ── Investment tab ───────────────────────────────────────────────────────
    configuration: 'Configuração',
    pricePerPackLabel: 'Preço por Saqueta (€)',
    pricePerPackId: 'price-per-pack',
    stickersPerPackLabel: 'Cromos por Saqueta',
    stickersPerPackId: 'stickers-per-pack',
    totalSpent: 'Total Gasto (Est.)',
    totalSpentDesc: 'Com base nos cromos que tens',
    packsPurchased: 'Saquetas Compradas',
    packsPurchasedDesc: 'Estimativa total',
    packsRemaining: 'Saquetas em Falta',
    packsRemainingDesc: 'Melhor cenário (sem repetidos)',
    costToComplete: 'Custo para Completar',
    costToCompleteDesc: 'Investimento mínimo necessário',
    efficiencyAnalysis: 'Análise de Eficiência',
    duplicateRate: 'Taxa de Repetidos',
    duplicateRateDesc: 'De todos os cromos comprados, estes são repetidos.',
    valueInTrades: 'Valor em Trocas',
    valueInTradesDesc: 'Valor "preso" em repetidos que podes trocar.',
    newPerPack: 'Cromos Novos por Saqueta',
    newPerPackDesc: 'Média de cromos novos por cada saqueta aberta.',

    // ── Loading / Error screens ──────────────────────────────────────────────
    loadingMsg: 'A carregar a tua coleção…',
    failedTitle: 'Erro ao Carregar',
    failedDesc: 'Não foi possível obter os dados. Verifica a ligação e tenta novamente.',
    tryAgain: 'Tentar Novamente',

    // ── Toast messages ───────────────────────────────────────────────────────
    toastCleared: 'Coleção limpa.',
    toastDownloaded: 'Modelo descarregado!',
    toastUploaded: 'Coleção carregada!',
    toastTradeCopied: 'Mensagem de troca copiada!',
    toastLinkCopied: 'Link copiado!',
    toastStuckCleared: 'Saqueta reiniciada.',
    toastDuplicatesCopied: 'Lista de repetidos copiada!',

    // ── Footer ───────────────────────────────────────────────────────────────
    contact: 'Contacto',
    worldCupEdition: 'Edição Mundial 2026',
    tagline: 'Tracker Premium de Cromos © 2026',

    // ── Trade message body ───────────────────────────────────────────────────
    tradeMessage: (iHave, youHave) =>
      `Olá! Vi no teu tracker que temos cromos para trocar. 🤝\n\nEu tenho para ti: ${iHave || 'Nenhum neste momento'}\nTu tens para mim: ${youHave || 'Nenhum neste momento'}\n\nVamos falar?`,
  },
};

export default translations;

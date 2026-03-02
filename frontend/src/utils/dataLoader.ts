import type { AssetData, AssetCategory, AssetInfo } from '../types';

// Asset metadata for UI display - 70 assets total
export const ASSET_METADATA: Record<string, AssetInfo> = {
  // ETF - Large Cap US (8)
  'SPY': {
    symbol: 'SPY',
    category: 'etf',
    name: 'SPDR S&P 500 ETF',
    description: 'Tracks the S&P 500 index',
    popularity_rank: 1,
    inceptionDate: '22 gennaio 1993',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.09%',
    aum: '~$500 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/spdr-sp-500-etf-trust-spy',
    longDescription: 'L\'SPDR S&P 500 ETF Trust è stato il primo ETF quotato negli Stati Uniti e rimane uno dei più grandi al mondo per patrimonio gestito. Replica le performance dell\'indice S&P 500, offrendo esposizione alle 500 maggiori aziende americane per capitalizzazione di mercato. È lo strumento preferito da investitori istituzionali e retail per ottenere un\'esposizione diversificata al mercato azionario USA con costi contenuti.'
  },
  'QQQ': {
    symbol: 'QQQ',
    category: 'etf',
    name: 'Invesco QQQ Trust',
    description: 'Tracks the Nasdaq 100 index',
    popularity_rank: 2,
    inceptionDate: '10 marzo 1999',
    provider: 'Invesco',
    expenseRatio: '0.20%',
    aum: '~$200 miliardi',
    website: 'https://www.invesco.com/qqq-etf/en/home.html',
    longDescription: 'L\'Invesco QQQ Trust replica l\'indice Nasdaq-100, che include le 100 più grandi aziende non finanziarie quotate sul Nasdaq. Fortemente concentrato sul settore tecnologico con aziende come Apple, Microsoft, Amazon e Meta, offre un\'esposizione mirata all\'innovazione e alla crescita del tech americano.'
  },
  'VTI': {
    symbol: 'VTI',
    category: 'etf',
    name: 'Vanguard Total Stock Market ETF',
    description: 'Total US stock market',
    popularity_rank: 3,
    inceptionDate: '24 maggio 2001',
    provider: 'Vanguard',
    expenseRatio: '0.03%',
    aum: '~$350 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vti',
    longDescription: 'Il Vanguard Total Stock Market ETF offre esposizione all\'intero mercato azionario USA, dalle mega-cap alle small-cap. Con oltre 3.500 azioni, rappresenta circa il 100% del mercato azionario investibile americano. Le commissioni ultra-basse e l\'ampia diversificazione lo rendono ideale per strategie buy-and-hold a lungo termine.'
  },
  'VOO': {
    symbol: 'VOO',
    category: 'etf',
    name: 'Vanguard S&P 500 ETF',
    description: 'S&P 500 low-cost alternative',
    popularity_rank: 4,
    inceptionDate: '7 settembre 2010',
    provider: 'Vanguard',
    expenseRatio: '0.03%',
    aum: '~$350 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/voo',
    longDescription: 'Il Vanguard S&P 500 ETF replica l\'indice S&P 500 con costi estremamente contenuti. È un\'alternativa a basso costo a SPY, ideale per investitori che privilegiano l\'efficienza fiscale e commissioni minime. Offre le stesse performance dell\'S&P 500 ma con un expense ratio tra i più bassi del mercato.'
  },
  'IVV': {
    symbol: 'IVV',
    category: 'etf',
    name: 'iShares Core S&P 500 ETF',
    description: 'S&P 500 liquid alternative',
    popularity_rank: 5,
    inceptionDate: '15 maggio 2000',
    provider: 'BlackRock',
    expenseRatio: '0.03%',
    aum: '~$380 miliardi',
    website: 'https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf',
    longDescription: 'L\'iShares Core S&P 500 ETF è uno degli ETF sull\'S&P 500 più liquidi e negoziati al mondo. Gestito da BlackRock, il più grande asset manager globale, combina bassissimi costi di gestione con volumi di trading elevati. Ideale per investitori istituzionali e retail che cercano efficienza nei costi e facilità di negoziazione.'
  },
  'SPLG': {
    symbol: 'SPLG',
    category: 'etf',
    name: 'SPDR Portfolio S&P 500 ETF',
    description: 'S&P 500 ultra low-cost',
    inceptionDate: '25 novembre 2005',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.02%',
    aum: '~$25 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/spdr-portfolio-sp-500-etf-splg',
    longDescription: 'Lo SPDR Portfolio S&P 500 ETF offre esposizione all\'S&P 500 con uno dei cost ratio più bassi disponibili sul mercato. Parte della linea Portfolio di State Street, è progettato per investitori a lungo termine che vogliono minimizzare l\'impatto delle commissioni sui rendimenti complessivi.'
  },
  'DIA': {
    symbol: 'DIA',
    category: 'etf',
    name: 'SPDR Dow Jones Industrial Average ETF',
    description: 'Dow Jones 30 industrials',
    inceptionDate: '14 gennaio 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.16%',
    aum: '~$30 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/spdr-dow-jones-industrial-average-etf-trust-dia',
    longDescription: 'Lo SPDR Dow Jones Industrial Average ETF replica il Dow Jones Industrial Average, l\'indice più antico e riconosciuto del mercato azionario USA. Composto da 30 blue-chip americane selezionate, offre esposizione concentrata alle aziende industriali e di servizi più stabili e consolidate del paese.'
  },
  'VTV': {
    symbol: 'VTV',
    category: 'etf',
    name: 'Vanguard Value ETF',
    description: 'Large-cap value stocks',
    inceptionDate: '26 gennaio 2004',
    provider: 'Vanguard',
    expenseRatio: '0.04%',
    aum: '~$120 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vtv',
    longDescription: 'Il Vanguard Value ETF si concentra su azioni large-cap value statunitensi, ovvero società mature con valutazioni inferiori alla media di mercato. Ideale per investitori che credono nella strategia value investing, storicamente performante nel lungo periodo. Include aziende dei settori finanziario, sanitario ed energetico.'
  },

  // ETF - Small/Mid Cap US (3)
  'IWM': {
    symbol: 'IWM',
    category: 'etf',
    name: 'iShares Russell 2000 ETF',
    description: 'Small-cap US stocks',
    inceptionDate: '22 maggio 2000',
    provider: 'BlackRock',
    expenseRatio: '0.19%',
    aum: '~$60 miliardi',
    website: 'https://www.ishares.com/us/products/239710/ishares-russell-2000-etf',
    longDescription: 'L\'iShares Russell 2000 ETF offre esposizione alle small-cap americane attraverso l\'indice Russell 2000. Con circa 2.000 piccole aziende, rappresenta un segmento del mercato con alto potenziale di crescita ma anche maggiore volatilità. Ideale per diversificare oltre le large-cap e catturare l\'innovazione nelle piccole imprese.'
  },
  'VB': {
    symbol: 'VB',
    category: 'etf',
    name: 'Vanguard Small-Cap ETF',
    description: 'Small-cap index',
    inceptionDate: '26 gennaio 2004',
    provider: 'Vanguard',
    expenseRatio: '0.05%',
    aum: '~$50 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vb',
    longDescription: 'Il Vanguard Small-Cap ETF replica l\'indice CRSP US Small Cap, offrendo un\'ampia esposizione alle piccole aziende statunitensi. Con commissioni molto competitive, è ideale per investitori che vogliono beneficiare del premio storico delle small-cap mantenendo costi contenuti.'
  },
  'IJH': {
    symbol: 'IJH',
    category: 'etf',
    name: 'iShares Core S&P Mid-Cap ETF',
    description: 'Mid-cap US stocks',
    inceptionDate: '22 maggio 2000',
    provider: 'BlackRock',
    expenseRatio: '0.05%',
    aum: '~$80 miliardi',
    website: 'https://www.ishares.com/us/products/239763/ishares-core-sp-midcap-etf',
    longDescription: 'L\'iShares Core S&P Mid-Cap ETF replica l\'indice S&P MidCap 400, composto da circa 400 aziende di medie dimensioni. Le mid-cap offrono un bilanciamento interessante tra la stabilità delle large-cap e il potenziale di crescita delle small-cap, con volatilità intermedia.'
  },

  // ETF - International (4)
  'VEA': {
    symbol: 'VEA',
    category: 'etf',
    name: 'Vanguard Developed Markets ETF',
    description: 'Developed markets ex-US',
    inceptionDate: '20 luglio 2007',
    provider: 'Vanguard',
    expenseRatio: '0.05%',
    aum: '~$120 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vea',
    longDescription: 'Il Vanguard Developed Markets ETF offre esposizione ai mercati sviluppati internazionali escludendo gli USA. Include Europa, Giappone, Canada, Australia e altri paesi sviluppati. Ideale per diversificazione geografica e riduzione del rischio di concentrazione sul mercato americano.'
  },
  'VWO': {
    symbol: 'VWO',
    category: 'etf',
    name: 'Vanguard Emerging Markets ETF',
    description: 'Emerging markets stocks',
    inceptionDate: '4 marzo 2005',
    provider: 'Vanguard',
    expenseRatio: '0.08%',
    aum: '~$90 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vwo',
    longDescription: 'Il Vanguard Emerging Markets ETF investe nei mercati emergenti globali, inclusi Cina, India, Brasile, Taiwan e Corea del Sud. Offre esposizione alla crescita economica dei paesi in via di sviluppo con costi contenuti, bilanciando opportunità di rendimento superiore con maggiore volatilità.'
  },
  'EFA': {
    symbol: 'EFA',
    category: 'etf',
    name: 'iShares MSCI EAFE ETF',
    description: 'Developed markets ex-North America',
    inceptionDate: '14 agosto 2001',
    provider: 'BlackRock',
    expenseRatio: '0.32%',
    aum: '~$70 miliardi',
    website: 'https://www.ishares.com/us/products/239623/ishares-msci-eafe-etf',
    longDescription: 'L\'iShares MSCI EAFE ETF replica l\'indice MSCI EAFE (Europe, Australasia, Far East), escludendo USA e Canada. Con una forte presenza in Europa e Giappone, è uno degli strumenti più utilizzati per diversificazione internazionale su mercati sviluppati non nordamericani.'
  },
  'IEFA': {
    symbol: 'IEFA',
    category: 'etf',
    name: 'iShares Core MSCI EAFE ETF',
    description: 'Developed markets low-cost',
    inceptionDate: '18 ottobre 2012',
    provider: 'BlackRock',
    expenseRatio: '0.07%',
    aum: '~$110 miliardi',
    website: 'https://www.ishares.com/us/products/244048/ishares-core-msci-eafe-etf',
    longDescription: 'L\'iShares Core MSCI EAFE ETF è la versione a basso costo di EFA, con un expense ratio significativamente inferiore. Offre la stessa esposizione ai mercati sviluppati internazionali ma con maggiore efficienza dei costi, ideale per investitori buy-and-hold.'
  },

  // ETF - Sectors (7)
  'XLK': {
    symbol: 'XLK',
    category: 'etf',
    name: 'Technology Select Sector SPDR',
    description: 'S&P 500 technology sector',
    inceptionDate: '16 dicembre 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$55 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-technology-select-sector-spdr-fund-xlk',
    longDescription: 'Il Technology Select Sector SPDR investe nelle aziende tecnologiche dell\'S&P 500, inclusi giganti come Apple, Microsoft, e Nvidia. Offre esposizione concentrata al settore tech, con alto potenziale di crescita ma anche maggiore volatilità. Ideale per investitori ottimisti sull\'innovazione tecnologica.'
  },
  'XLE': {
    symbol: 'XLE',
    category: 'etf',
    name: 'Energy Select Sector SPDR',
    description: 'S&P 500 energy sector',
    inceptionDate: '16 dicembre 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$35 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-energy-select-sector-spdr-fund-xle',
    longDescription: 'L\'Energy Select Sector SPDR si concentra sul settore energetico dell\'S&P 500, includendo aziende petrolifere, del gas e dei servizi energetici. Utilizzato come hedge contro l\'inflazione e per diversificazione settoriale, beneficia dei rialzi dei prezzi delle materie prime energetiche.'
  },
  'XLF': {
    symbol: 'XLF',
    category: 'etf',
    name: 'Financial Select Sector SPDR',
    description: 'S&P 500 financials sector',
    inceptionDate: '16 dicembre 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$45 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-financial-select-sector-spdr-fund-xlf',
    longDescription: 'Il Financial Select Sector SPDR investe nelle società finanziarie dell\'S&P 500, incluse banche, assicurazioni e società di investimento. Sensibile ai tassi di interesse, tende a performare bene in ambienti di tassi crescenti. Include leader come JPMorgan, Bank of America e Berkshire Hathaway.'
  },
  'XLV': {
    symbol: 'XLV',
    category: 'etf',
    name: 'Health Care Select Sector SPDR',
    description: 'S&P 500 healthcare sector',
    inceptionDate: '16 dicembre 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$40 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-health-care-select-sector-spdr-fund-xlv',
    longDescription: 'L\'Health Care Select Sector SPDR offre esposizione al settore sanitario dell\'S&P 500, includendo farmaceutiche, biotecnologie e dispositivi medici. Considerato un settore difensivo con crescita strutturale legata all\'invecchiamento della popolazione e all\'innovazione medica.'
  },
  'XLI': {
    symbol: 'XLI',
    category: 'etf',
    name: 'Industrial Select Sector SPDR',
    description: 'S&P 500 industrials sector',
    inceptionDate: '16 dicembre 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$20 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-industrial-select-sector-spdr-fund-xli',
    longDescription: 'L\'Industrial Select Sector SPDR investe nelle aziende industriali dell\'S&P 500, inclusi produttori, servizi di trasporto e aziende aerospaziali. Ciclico per natura, tende a performare bene durante espansioni economiche e progetti infrastrutturali.'
  },
  'XLP': {
    symbol: 'XLP',
    category: 'etf',
    name: 'Consumer Staples Select Sector SPDR',
    description: 'S&P 500 consumer staples',
    inceptionDate: '16 dicembre 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$18 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-consumer-staples-select-sector-spdr-fund-xlp',
    longDescription: 'Il Consumer Staples Select Sector SPDR si concentra su aziende di beni di consumo essenziali come cibo, bevande e prodotti per la casa. Settore difensivo con domanda stabile indipendentemente dal ciclo economico, ideale per ridurre la volatilità del portafoglio.'
  },
  'XLY': {
    symbol: 'XLY',
    category: 'etf',
    name: 'Consumer Discretionary Select Sector SPDR',
    description: 'S&P 500 consumer discretionary',
    inceptionDate: '16 dicembre 1998',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$20 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-consumer-discretionary-select-sector-spdr-fund-xly',
    longDescription: 'Il Consumer Discretionary Select Sector SPDR investe in aziende di beni di consumo non essenziali come retail, automobili e intrattenimento. Include giganti come Amazon e Tesla. Settore ciclico che beneficia della crescita economica e dell\'aumento della spesa dei consumatori.'
  },

  // Crypto (13)
  'BTC-USD': {
    symbol: 'BTC-USD',
    category: 'crypto',
    name: 'Bitcoin',
    description: 'Leading cryptocurrency',
    popularity_rank: 1,
    inceptionDate: '3 gennaio 2009',
    aum: 'Market Cap ~$1.3 trilioni',
    website: 'https://bitcoin.org',
    longDescription: 'Bitcoin è la prima e più grande criptovaluta per capitalizzazione di mercato, creata da Satoshi Nakamoto. Funziona come una rete di pagamento peer-to-peer decentralizzata e una riserva di valore digitale. Con un\'offerta massima fissa di 21 milioni di monete, Bitcoin è spesso definito "oro digitale" per le sue proprietà deflazionistiche e il suo ruolo come protezione contro l\'inflazione.'
  },
  'ETH-USD': {
    symbol: 'ETH-USD',
    category: 'crypto',
    name: 'Ethereum',
    description: 'Smart contract platform',
    popularity_rank: 2,
    inceptionDate: '30 luglio 2015',
    aum: 'Market Cap ~$400 miliardi',
    website: 'https://ethereum.org',
    longDescription: 'Ethereum è una piattaforma blockchain decentralizzata che permette la creazione di smart contracts e applicazioni decentralizzate (dApps). Creato da Vitalik Buterin, è la base per gran parte della finanza decentralizzata (DeFi) e degli NFT. Dal 2022 utilizza il meccanismo Proof-of-Stake, riducendo drasticamente il consumo energetico.'
  },
  'BNB-USD': {
    symbol: 'BNB-USD',
    category: 'crypto',
    name: 'Binance Coin',
    description: 'Binance exchange token',
    popularity_rank: 3,
    inceptionDate: 'Luglio 2017',
    aum: 'Market Cap ~$90 miliardi',
    website: 'https://www.binance.com/en/bnb',
    longDescription: 'Binance Coin è la criptovaluta nativa dell\'exchange Binance, il più grande exchange di criptovalute al mondo per volume. BNB viene utilizzato per sconti sulle commissioni di trading, pagamenti e come token di utilità sulla Binance Smart Chain. Ha multipli casi d\'uso nell\'ecosistema Binance e oltre.'
  },
  'SOL-USD': {
    symbol: 'SOL-USD',
    category: 'crypto',
    name: 'Solana',
    description: 'High-performance blockchain',
    popularity_rank: 4,
    inceptionDate: 'Marzo 2020',
    aum: 'Market Cap ~$70 miliardi',
    website: 'https://solana.com',
    longDescription: 'Solana è una blockchain ad alte prestazioni progettata per applicazioni decentralizzate e crypto-currencies. Utilizza un meccanismo di consenso innovativo chiamato Proof-of-History insieme al Proof-of-Stake per raggiungere velocità di transazione elevate (fino a 65.000 TPS) con commissioni molto basse, rendendola competitiva con le reti tradizionali.'
  },
  'ADA-USD': {
    symbol: 'ADA-USD',
    category: 'crypto',
    name: 'Cardano',
    description: 'Proof-of-stake blockchain',
    popularity_rank: 5,
    inceptionDate: 'Settembre 2017',
    aum: 'Market Cap ~$35 miliardi',
    website: 'https://cardano.org',
    longDescription: 'Cardano è una blockchain Proof-of-Stake di terza generazione fondata da Charles Hoskinson, co-fondatore di Ethereum. Si distingue per l\'approccio accademico basato su ricerca peer-reviewed e sviluppo formale. Mira a fornire una piattaforma sicura e scalabile per smart contracts, con particolare focus su sostenibilità e governance decentralizzata.'
  },
  'XRP-USD': {
    symbol: 'XRP-USD',
    category: 'crypto',
    name: 'Ripple',
    description: 'Payment settlement network',
    popularity_rank: 6,
    inceptionDate: '2012',
    aum: 'Market Cap ~$120 miliardi',
    website: 'https://ripple.com',
    longDescription: 'XRP è la criptovaluta nativa del Ripple payment protocol, progettato per facilitare pagamenti transfrontalieri rapidi e a basso costo per istituzioni finanziarie. A differenza di Bitcoin, XRP non viene minato e tutte le monete (100 miliardi) sono state pre-minate. Ripple Labs lavora con banche e provider di pagamento globali per modernizzare i trasferimenti di denaro internazionali.'
  },
  'DOGE-USD': {
    symbol: 'DOGE-USD',
    category: 'crypto',
    name: 'Dogecoin',
    description: 'Meme cryptocurrency',
    inceptionDate: 'Dicembre 2013',
    aum: 'Market Cap ~$25 miliardi',
    website: 'https://dogecoin.com',
    longDescription: 'Dogecoin è nato come criptovaluta meme basata sul popolare meme "Doge" con un cane Shiba Inu. Nonostante le origini scherzose, ha sviluppato una community forte e viene utilizzato per micropagamenti e mance online. Ha guadagnato notorietà mainstream grazie al supporto di personalità come Elon Musk e ha un\'inflazione controllata con nessun limite massimo di supply.'
  },
  'TRX-USD': {
    symbol: 'TRX-USD',
    category: 'crypto',
    name: 'Tron',
    description: 'Decentralized entertainment platform',
    inceptionDate: 'Settembre 2017',
    aum: 'Market Cap ~$15 miliardi',
    website: 'https://tron.network',
    longDescription: 'TRON è una blockchain decentralizzata fondata da Justin Sun, focalizzata su intrattenimento digitale e condivisione di contenuti. Mira a costruire un sistema di intrattenimento di contenuti globale gratuito utilizzando tecnologia blockchain. TRON supporta smart contracts, dApps e ha acquisito BitTorrent per espandere il suo ecosistema.'
  },
  'AVAX-USD': {
    symbol: 'AVAX-USD',
    category: 'crypto',
    name: 'Avalanche',
    description: 'Layer 1 blockchain platform',
    inceptionDate: 'Settembre 2020',
    aum: 'Market Cap ~$14 miliardi',
    website: 'https://www.avax.network',
    longDescription: 'Avalanche è una piattaforma blockchain Layer 1 progettata per smart contracts ad alta velocità e low-cost. Utilizza un meccanismo di consenso unico che permette finalità delle transazioni sub-secondi. Avalanche è compatibile con Ethereum Virtual Machine (EVM), facilitando la migrazione di dApps da Ethereum, e si posiziona come alternativa scalabile per DeFi e enterprise applications.'
  },
  'MATIC-USD': {
    symbol: 'MATIC-USD',
    category: 'crypto',
    name: 'Polygon',
    description: 'Ethereum layer 2 scaling',
    inceptionDate: 'Ottobre 2017',
    aum: 'Market Cap ~$8 miliardi',
    website: 'https://polygon.technology',
    longDescription: 'Polygon (precedentemente Matic Network) è una soluzione di scaling Layer 2 per Ethereum che offre transazioni più veloci e economiche. Fornisce un framework per costruire e connettere reti blockchain compatibili con Ethereum. Polygon è ampiamente adottato per applicazioni DeFi, gaming e NFT grazie alle sue basse commissioni e alta throughput.'
  },
  'LINK-USD': {
    symbol: 'LINK-USD',
    category: 'crypto',
    name: 'Chainlink',
    description: 'Decentralized oracle network',
    inceptionDate: 'Settembre 2017',
    aum: 'Market Cap ~$16 miliardi',
    website: 'https://chain.link',
    longDescription: 'Chainlink è una rete di oracoli decentralizzata che permette agli smart contracts su blockchain di accedere in modo sicuro a dati del mondo reale, API esterne e sistemi di pagamento. Risolve il "problema dell\'oracolo" collegando blockchain con dati off-chain. È fondamentale per molte applicazioni DeFi che necessitano di feed di prezzo affidabili e altri dati esterni.'
  },
  'DOT-USD': {
    symbol: 'DOT-USD',
    category: 'crypto',
    name: 'Polkadot',
    description: 'Multi-chain blockchain protocol',
    inceptionDate: 'Maggio 2020',
    aum: 'Market Cap ~$9 miliardi',
    website: 'https://polkadot.network',
    longDescription: 'Polkadot è un protocollo multi-chain che permette a diverse blockchain di trasferire messaggi e valore in modo trust-free, condividendo caratteristiche di sicurezza uniche. Fondato da Gavin Wood, co-fondatore di Ethereum, Polkadot mira a facilitare un web decentralizzato (Web3) connettendo blockchain pubbliche e private. Utilizza un sistema di parachains per scalabilità e interoperabilità.'
  },
  'ATOM-USD': {
    symbol: 'ATOM-USD',
    category: 'crypto',
    name: 'Cosmos',
    description: 'Blockchain interoperability',
    inceptionDate: 'Marzo 2019',
    aum: 'Market Cap ~$4 miliardi',
    website: 'https://cosmos.network',
    longDescription: 'Cosmos si definisce "l\'Internet delle blockchain", fornendo un ecosistema di blockchain interconnesse. Utilizza il protocollo Inter-Blockchain Communication (IBC) per permettere a diverse blockchain di comunicare e trasferire asset. Cosmos SDK rende facile per gli sviluppatori costruire blockchain personalizzate, e l\'hub Cosmos coordina l\'interoperabilità tra tutte le zone connesse.'
  },

  // Commodities - Metals (5)
  'GLD': {
    symbol: 'GLD',
    category: 'commodities',
    name: 'SPDR Gold Shares',
    description: 'Physical gold holdings',
    popularity_rank: 1,
    inceptionDate: '18 novembre 2004',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.40%',
    aum: '~$60 miliardi',
    website: 'https://www.spdrgoldshares.com',
    longDescription: 'Lo SPDR Gold Shares è il più grande ETF sull\'oro al mondo, con riserve fisiche di lingotti d\'oro depositati in caveau sicuri. Ogni quota rappresenta circa 1/10 di oncia d\'oro. È uno strumento popolare per hedging contro inflazione, instabilità geopolitica e volatilità dei mercati azionari, offrendo esposizione diretta al prezzo dell\'oro senza necessità di custodia fisica.'
  },
  'SLV': {
    symbol: 'SLV',
    category: 'commodities',
    name: 'iShares Silver Trust',
    description: 'Physical silver holdings',
    inceptionDate: '21 aprile 2006',
    provider: 'BlackRock',
    expenseRatio: '0.50%',
    aum: '~$12 miliardi',
    website: 'https://www.ishares.com/us/products/239855/ishares-silver-trust-fund',
    longDescription: 'L\'iShares Silver Trust offre esposizione al prezzo dell\'argento fisico attraverso riserve di argento depositato. L\'argento ha usi industriali significativi oltre al suo ruolo come metallo prezioso, rendendolo sensibile sia alla domanda di beni rifugio che ai cicli economici. Spesso utilizzato come alternativa più volatile e accessibile all\'oro.'
  },
  'PPLT': {
    symbol: 'PPLT',
    category: 'commodities',
    name: 'Aberdeen Platinum Shares ETF',
    description: 'Physical platinum holdings',
    inceptionDate: '8 gennaio 2010',
    provider: 'abrdn (Aberdeen)',
    expenseRatio: '0.60%',
    aum: '~$1 miliardo',
    website: 'https://www.aberdeeninvestments.com/docs?editionId=f759aacf-4314-41c1-b8b3-3e02c2967aed',
    longDescription: 'L\'Aberdeen Platinum Shares ETF investe in platino fisico. Il platino è un metallo prezioso raro utilizzato principalmente nell\'industria automobilistica per catalizzatori, gioielleria e applicazioni industriali. Il suo prezzo è influenzato dalla domanda industriale, rendendo questo ETF interessante per diversificazione nei metalli preziosi con caratteristiche uniche.'
  },
  'PALL': {
    symbol: 'PALL',
    category: 'commodities',
    name: 'Aberdeen Palladium Shares ETF',
    description: 'Physical palladium holdings',
    inceptionDate: '8 gennaio 2010',
    provider: 'abrdn (Aberdeen)',
    expenseRatio: '0.60%',
    aum: '~$300 milioni',
    website: 'https://www.aberdeeninvestments.com/docs?editionId=0f2bbbf3-25ce-4024-9343-765d2e4e3e01',
    longDescription: 'L\'Aberdeen Palladium Shares ETF detiene palladio fisico. Il palladio è un metallo del gruppo del platino utilizzato principalmente in catalizzatori per automobili a benzina. Più raro del platino, ha visto una domanda crescente con l\'inasprimento delle normative sulle emissioni. Offre esposizione a un metallo industriale critico con supply limitata.'
  },
  'IAU': {
    symbol: 'IAU',
    category: 'commodities',
    name: 'iShares Gold Trust',
    description: 'Gold low-cost alternative',
    inceptionDate: '21 gennaio 2005',
    provider: 'BlackRock',
    expenseRatio: '0.25%',
    aum: '~$30 miliardi',
    website: 'https://www.ishares.com/us/products/239561/ishares-gold-trust-fund',
    longDescription: 'L\'iShares Gold Trust è un\'alternativa a basso costo a GLD per investire in oro fisico. Con un expense ratio inferiore e la stessa esposizione diretta all\'oro tramite riserve fisiche, è ideale per investitori che vogliono protezione contro inflazione e diversificazione mantenendo i costi al minimo.'
  },

  // Commodities - Industrial Metals (2)
  'COPX': {
    symbol: 'COPX',
    category: 'commodities',
    name: 'Global X Copper Miners ETF',
    description: 'Copper mining companies',
    inceptionDate: '28 aprile 2010',
    provider: 'Global X',
    expenseRatio: '0.65%',
    aum: '~$1.5 miliardi',
    website: 'https://www.globalxetfs.com/funds/copx',
    longDescription: 'Il Global X Copper Miners ETF investe in società minerarie di rame globali. Il rame è un metallo industriale fondamentale per elettrificazione, energie rinnovabili e infrastrutture. Con la transizione energetica e l\'adozione di veicoli elettrici, la domanda di rame è prevista in forte crescita, rendendo questo ETF interessante per investitori tematici sulla green economy.'
  },
  'CPER': {
    symbol: 'CPER',
    category: 'commodities',
    name: 'United States Copper Index Fund',
    description: 'Copper futures tracking',
    inceptionDate: '28 novembre 2011',
    provider: 'United States Commodity Funds',
    expenseRatio: '1.07%',
    aum: '~$100 milioni',
    website: 'https://www.uscfinvestments.com/cper',
    longDescription: 'Il United States Copper Index Fund offre esposizione ai futures sul rame, tracciando direttamente il prezzo del metallo. A differenza di COPX che investe in mining companies, CPER offre esposizione pura alla commodity stessa. Il rame è considerato un indicatore economico chiave grazie ai suoi molteplici usi industriali.'
  },

  // Commodities - Energy (2)
  'USO': {
    symbol: 'USO',
    category: 'commodities',
    name: 'United States Oil Fund',
    description: 'WTI crude oil futures',
    inceptionDate: '10 aprile 2006',
    provider: 'United States Commodity Funds',
    expenseRatio: '0.79%',
    aum: '~$2 miliardi',
    website: 'https://www.uscfinvestments.com/uso',
    longDescription: 'Il United States Oil Fund traccia il prezzo del petrolio WTI (West Texas Intermediate) attraverso futures contracts. Offre un modo per investitori retail di ottenere esposizione al prezzo del petrolio senza contratti futures diretti. Utilizzato per speculazione sui prezzi dell\'energia o come hedge contro aumenti dei costi energetici, ma soggetto a contango e backwardation.'
  },
  'UNG': {
    symbol: 'UNG',
    category: 'commodities',
    name: 'United States Natural Gas Fund',
    description: 'Natural gas futures',
    inceptionDate: '18 aprile 2007',
    provider: 'United States Commodity Funds',
    expenseRatio: '1.06%',
    aum: '~$800 milioni',
    website: 'https://www.uscfinvestments.com/ung',
    longDescription: 'Il United States Natural Gas Fund offre esposizione al prezzo del gas naturale attraverso futures. Il gas naturale è una commodity energetica volatile influenzata da fattori stagionali, meteorologici e geopolitici. Utilizzato come combustibile per elettricità e riscaldamento, è considerato una fonte di transizione verso energie rinnovabili.'
  },

  // Commodities - Agriculture (2)
  'DBA': {
    symbol: 'DBA',
    category: 'commodities',
    name: 'Invesco DB Agriculture Fund',
    description: 'Agricultural commodities basket',
    inceptionDate: '5 gennaio 2007',
    provider: 'Invesco',
    expenseRatio: '0.93%',
    aum: '~$600 milioni',
    website: 'https://www.invesco.com/us/financial-products/etfs/product-detail?audienceType=investor&ticker=DBA',
    longDescription: 'L\'Invesco DB Agriculture Fund investe in un paniere di futures su commodities agricole inclusi mais, grano, soia e zucchero. Offre esposizione diversificata al settore agricolo, utilizzato come hedge contro inflazione alimentare e per diversificazione del portafoglio. I prezzi agricoli sono influenzati da meteo, domanda globale e politiche commerciali.'
  },
  'CORN': {
    symbol: 'CORN',
    category: 'commodities',
    name: 'Teucrium Corn Fund',
    description: 'Corn futures tracking',
    inceptionDate: '9 giugno 2010',
    provider: 'Teucrium',
    expenseRatio: '1.13%',
    aum: '~$150 milioni',
    website: 'https://teucrium.com/corn',
    longDescription: 'Il Teucrium Corn Fund traccia il prezzo del mais attraverso futures contracts. Il mais è una delle commodities agricole più importanti, utilizzato per alimentazione umana, mangimi animali, etanolo e applicazioni industriali. L\'investimento in mais offre esposizione a trend demografici e di domanda alimentare globale.'
  },

  // Commodities - Diversified (1)
  'DBC': {
    symbol: 'DBC',
    category: 'commodities',
    name: 'Invesco DB Commodity Index Tracking Fund',
    description: 'Diversified commodities basket',
    inceptionDate: '3 febbraio 2006',
    provider: 'Invesco',
    expenseRatio: '0.87%',
    aum: '~$1.5 miliardi',
    website: 'https://www.invesco.com/us/financial-products/etfs/product-detail?audienceType=investor&ticker=DBC',
    longDescription: 'L\'Invesco DB Commodity Index Tracking Fund offre esposizione diversificata a un paniere di commodities inclusi energia, metalli preziosi, metalli industriali e agricoltura. Utilizzato come hedge contro inflazione e per diversificazione oltre azioni e obbligazioni. Le commodities hanno storicamente bassa correlazione con asset finanziari tradizionali.'
  },

  // Bonds - Total Market (5)
  'AGG': {
    symbol: 'AGG',
    category: 'bonds',
    name: 'iShares Core US Aggregate Bond ETF',
    description: 'US investment-grade bonds',
    popularity_rank: 1,
    inceptionDate: '22 settembre 2003',
    provider: 'BlackRock',
    expenseRatio: '0.03%',
    aum: '~$100 miliardi',
    website: 'https://www.ishares.com/us/products/239458/ishares-core-total-us-bond-market-etf',
    longDescription: 'L\'iShares Core US Aggregate Bond ETF replica l\'indice Bloomberg US Aggregate Bond, rappresentando l\'intero mercato obbligazionario investment-grade USA. Include treasury, corporate, mortgage-backed e asset-backed securities. È il core holding obbligazionario più popolare per portafogli diversificati, offrendo esposizione bilanciata a reddito fisso con bassissimi costi.'
  },
  'BND': {
    symbol: 'BND',
    category: 'bonds',
    name: 'Vanguard Total Bond Market ETF',
    description: 'Total US bond market',
    popularity_rank: 2,
    inceptionDate: '3 aprile 2007',
    provider: 'Vanguard',
    expenseRatio: '0.03%',
    aum: '~$95 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/bnd',
    longDescription: 'Il Vanguard Total Bond Market ETF offre esposizione all\'intero mercato obbligazionario USA investment-grade. Simile ad AGG ma gestito da Vanguard, è ideale per investitori buy-and-hold che cercano reddito stabile, preservazione del capitale e diversificazione rispetto alle azioni. Include migliaia di obbligazioni con duration media di circa 6-7 anni.'
  },
  'VTEB': {
    symbol: 'VTEB',
    category: 'bonds',
    name: 'Vanguard Tax-Exempt Bond ETF',
    description: 'Municipal bonds',
    inceptionDate: '21 agosto 2015',
    provider: 'Vanguard',
    expenseRatio: '0.05%',
    aum: '~$12 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vteb',
    longDescription: 'Il Vanguard Tax-Exempt Bond ETF investe in obbligazioni municipali (muni bonds) emesse da stati, città e governi locali USA. Gli interessi sono esenti da tasse federali e, in alcuni casi, statali. Ideale per investitori in fasce fiscali elevate che cercano reddito tax-efficient, offrendo rendimenti post-tasse competitivi nonostante yield nominali inferiori.'
  },
  'TLT': {
    symbol: 'TLT',
    category: 'bonds',
    name: 'iShares 20+ Year Treasury Bond ETF',
    description: 'Long-term US treasuries',
    inceptionDate: '22 luglio 2002',
    provider: 'BlackRock',
    expenseRatio: '0.15%',
    aum: '~$50 miliardi',
    website: 'https://www.ishares.com/us/products/239454/ishares-20-year-treasury-bond-etf',
    longDescription: 'L\'iShares 20+ Year Treasury Bond ETF investe in treasury bonds USA con scadenze superiori a 20 anni. Alta duration significa elevata sensibilità ai tassi di interesse: apprezza significativamente quando i tassi scendono e viceversa. Utilizzato come hedge deflazionistico, per speculazione sui tassi o come componente difensiva in portafogli risk-parity.'
  },
  'TIP': {
    symbol: 'TIP',
    category: 'bonds',
    name: 'iShares TIPS Bond ETF',
    description: 'Treasury inflation-protected securities',
    inceptionDate: '4 dicembre 2003',
    provider: 'BlackRock',
    expenseRatio: '0.19%',
    aum: '~$40 miliardi',
    website: 'https://www.ishares.com/us/products/239467/ishares-tips-bond-etf',
    longDescription: 'L\'iShares TIPS Bond ETF investe in Treasury Inflation-Protected Securities, obbligazioni governative USA il cui valore principale si aggiusta con l\'inflazione CPI. Offrono protezione diretta contro inflazione, rendendo questo ETF ideale per preservare potere d\'acquisto. Particolarmente utili in ambienti di inflazione crescente o incerta.'
  },

  // Bonds - Duration-Specific Treasuries (4)
  'SHY': {
    symbol: 'SHY',
    category: 'bonds',
    name: 'iShares 1-3 Year Treasury Bond ETF',
    description: 'Short-term treasuries',
    inceptionDate: '22 luglio 2002',
    provider: 'BlackRock',
    expenseRatio: '0.15%',
    aum: '~$25 miliardi',
    website: 'https://www.ishares.com/us/products/239452/ishares-13-year-treasury-bond-etf',
    longDescription: 'L\'iShares 1-3 Year Treasury Bond ETF investe in treasury bonds USA a breve termine con scadenze 1-3 anni. Bassa duration significa bassa volatilità e rischio di tasso d\'interesse minimo. Ideale per parcheggiare liquidità con rendimenti leggermente superiori ai money market, o come componente conservativa per bilanciare portafogli più rischiosi.'
  },
  'IEF': {
    symbol: 'IEF',
    category: 'bonds',
    name: 'iShares 7-10 Year Treasury Bond ETF',
    description: 'Intermediate treasuries',
    inceptionDate: '22 luglio 2002',
    provider: 'BlackRock',
    expenseRatio: '0.15%',
    aum: '~$30 miliardi',
    website: 'https://www.ishares.com/us/products/239456/ishares-710-year-treasury-bond-etf',
    longDescription: 'L\'iShares 7-10 Year Treasury Bond ETF investe in treasury bonds di duration intermedia. Offre un bilanciamento tra rendimento e sensibilità ai tassi, posizionandosi nel mezzo della curva dei rendimenti. Utilizzato come core allocation obbligazionaria per investitori che cercano rendimenti moderati con volatilità controllata.'
  },
  'VGIT': {
    symbol: 'VGIT',
    category: 'bonds',
    name: 'Vanguard Intermediate-Term Treasury ETF',
    description: '3-10 year treasuries',
    inceptionDate: '21 novembre 2009',
    provider: 'Vanguard',
    expenseRatio: '0.04%',
    aum: '~$25 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vgit',
    longDescription: 'Il Vanguard Intermediate-Term Treasury ETF copre treasury bonds con scadenze 3-10 anni. Con costi ultra-bassi e esposizione alla parte intermedia della curva, è ideale per investitori che cercano reddito stabile con duration media. Offre protezione flight-to-quality durante stress di mercato mantenendo rendimenti ragionevoli.'
  },
  'VGLT': {
    symbol: 'VGLT',
    category: 'bonds',
    name: 'Vanguard Long-Term Treasury ETF',
    description: '10+ year treasuries',
    inceptionDate: '21 novembre 2009',
    provider: 'Vanguard',
    expenseRatio: '0.04%',
    aum: '~$10 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vglt',
    longDescription: 'Il Vanguard Long-Term Treasury ETF investe in treasury bonds con scadenze superiori a 10 anni. Alta duration significa maggiore volatilità ma anche maggiore potenziale di apprezzamento quando i tassi scendono. Utilizzato per strategie difensive, speculazione sui tassi o come bilanciamento long-duration per portafogli risk-parity.'
  },

  // Bonds - Corporate (4)
  'LQD': {
    symbol: 'LQD',
    category: 'bonds',
    name: 'iShares iBoxx Investment Grade Corporate Bond ETF',
    description: 'Investment-grade corporate bonds',
    inceptionDate: '22 luglio 2002',
    provider: 'BlackRock',
    expenseRatio: '0.14%',
    aum: '~$40 miliardi',
    website: 'https://www.ishares.com/us/products/239566/ishares-iboxx-investment-grade-corporate-bond-etf',
    longDescription: 'L\'iShares iBoxx Investment Grade Corporate Bond ETF investe in obbligazioni corporate investment-grade USA. Offre rendimenti superiori ai treasury in cambio di rischio di credito moderato. Include bond di grandi aziende con rating BBB o superiore. Ideale per investitori che cercano reddito extra rispetto ai governativi mantenendo qualità creditizia solida.'
  },
  'HYG': {
    symbol: 'HYG',
    category: 'bonds',
    name: 'iShares iBoxx High Yield Corporate Bond ETF',
    description: 'High-yield corporate bonds',
    inceptionDate: '4 aprile 2007',
    provider: 'BlackRock',
    expenseRatio: '0.49%',
    aum: '~$20 miliardi',
    website: 'https://www.ishares.com/us/products/239565/ishares-iboxx-high-yield-corporate-bond-etf',
    longDescription: 'L\'iShares iBoxx High Yield Corporate Bond ETF investe in obbligazioni corporate high-yield (junk bonds) con rating inferiore a investment-grade. Offre rendimenti elevati in cambio di maggiore rischio di default. Correlato più alle azioni che ai treasury, è utilizzato per reddito elevato e diversificazione, ma con volatilità significativa.'
  },
  'VCSH': {
    symbol: 'VCSH',
    category: 'bonds',
    name: 'Vanguard Short-Term Corporate Bond ETF',
    description: '1-5 year corporate bonds',
    inceptionDate: '20 novembre 2009',
    provider: 'Vanguard',
    expenseRatio: '0.04%',
    aum: '~$50 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vcsh',
    longDescription: 'Il Vanguard Short-Term Corporate Bond ETF investe in obbligazioni corporate investment-grade a breve termine (1-5 anni). Offre rendimenti superiori ai treasury a breve con bassa duration e rischio di tasso contenuto. Ideale per investitori conservativi che cercano reddito leggermente superiore ai governativi brevi con rischio di credito limitato.'
  },
  'VCIT': {
    symbol: 'VCIT',
    category: 'bonds',
    name: 'Vanguard Intermediate-Term Corporate Bond ETF',
    description: '5-10 year corporate bonds',
    inceptionDate: '21 novembre 2009',
    provider: 'Vanguard',
    expenseRatio: '0.04%',
    aum: '~$50 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vcit',
    longDescription: 'Il Vanguard Intermediate-Term Corporate Bond ETF investe in corporate bonds investment-grade con scadenze 5-10 anni. Bilancia rendimento superiore ai treasury con duration media e rischio di credito controllato. Utilizzato come core holding corporate per investitori che cercano reddito stabile con volatilità moderata.'
  },

  // Bonds - International/EM (2)
  'BNDX': {
    symbol: 'BNDX',
    category: 'bonds',
    name: 'Vanguard Total International Bond ETF',
    description: 'Non-US investment-grade bonds',
    inceptionDate: '31 maggio 2013',
    provider: 'Vanguard',
    expenseRatio: '0.07%',
    aum: '~$90 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/bndx',
    longDescription: 'Il Vanguard Total International Bond ETF investe in obbligazioni investment-grade non-USA hedged verso il dollaro. Offre diversificazione geografica nel reddito fisso, includendo bond governativi e corporate di mercati sviluppati come Europa, Giappone e Canada. Ideale per investitori che cercano diversificazione globale obbligazionaria senza esposizione valutaria.'
  },
  'EMB': {
    symbol: 'EMB',
    category: 'bonds',
    name: 'iShares J.P. Morgan USD Emerging Markets Bond ETF',
    description: 'Emerging markets USD bonds',
    inceptionDate: '17 dicembre 2007',
    provider: 'BlackRock',
    expenseRatio: '0.39%',
    aum: '~$18 miliardi',
    website: 'https://www.ishares.com/us/products/239572/ishares-jp-morgan-usd-emerging-market-bond-etf',
    longDescription: 'L\'iShares J.P. Morgan USD Emerging Markets Bond ETF investe in obbligazioni governative e corporate di mercati emergenti denominate in dollari USA. Offre rendimenti superiori ai bond developed markets in cambio di rischio politico, economico e di credito maggiore. Include paesi come Messico, Brasile, Indonesia e Arabia Saudita.'
  },

  // Real Estate - US REIT (6)
  'VNQ': {
    symbol: 'VNQ',
    category: 'real_estate',
    name: 'Vanguard Real Estate ETF',
    description: 'US REITs',
    popularity_rank: 1,
    inceptionDate: '23 settembre 2004',
    provider: 'Vanguard',
    expenseRatio: '0.12%',
    aum: '~$40 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vnq',
    longDescription: 'Il Vanguard Real Estate ETF investe in REIT (Real Estate Investment Trusts) statunitensi, offrendo esposizione diversificata al settore immobiliare. Include proprietà residenziali, commerciali, industriali, sanitarie e data center. I REIT distribuiscono almeno il 90% dei profitti come dividendi, rendendo VNQ attraente per reddito. Offre diversificazione e potenziale protezione contro inflazione.'
  },
  'IYR': {
    symbol: 'IYR',
    category: 'real_estate',
    name: 'iShares US Real Estate ETF',
    description: 'US real estate sector',
    inceptionDate: '12 giugno 2000',
    provider: 'BlackRock',
    expenseRatio: '0.39%',
    aum: '~$5 miliardi',
    website: 'https://www.ishares.com/us/products/239520/ishares-us-real-estate-etf',
    longDescription: 'L\'iShares US Real Estate ETF investe nel settore immobiliare USA, principalmente REIT. Offre esposizione a diverse tipologie di proprietà inclusi mall, uffici, appartamenti e strutture specializzate. Con un track record lungo, è uno strumento consolidato per accesso al mercato immobiliare senza proprietà diretta.'
  },
  'XLRE': {
    symbol: 'XLRE',
    category: 'real_estate',
    name: 'Real Estate Select Sector SPDR Fund',
    description: 'S&P 500 real estate sector',
    inceptionDate: '7 ottobre 2015',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.10%',
    aum: '~$5 miliardi',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/the-real-estate-select-sector-spdr-fund-xlre',
    longDescription: 'Il Real Estate Select Sector SPDR Fund investe nelle società immobiliari dell\'S&P 500, principalmente REIT. Come parte della serie Select Sector SPDR, offre esposizione mirata al settore real estate delle più grandi aziende americane. Include leader del settore con capitalizzazioni elevate e track record consolidati.'
  },
  'SCHH': {
    symbol: 'SCHH',
    category: 'real_estate',
    name: 'Schwab US REIT ETF',
    description: 'US REIT index',
    inceptionDate: '12 gennaio 2011',
    provider: 'Charles Schwab',
    expenseRatio: '0.07%',
    aum: '~$7 miliardi',
    website: 'https://www.schwabassetmanagement.com/products/schh',
    longDescription: 'Lo Schwab US REIT ETF offre esposizione ai REIT statunitensi con uno dei cost ratio più bassi del settore. Ideale per investitori buy-and-hold che cercano diversificazione immobiliare e reddito da dividendi con efficienza dei costi massimizzata. Include un ampio spettro di tipologie di proprietà e geografie USA.'
  },
  'USRT': {
    symbol: 'USRT',
    category: 'real_estate',
    name: 'iShares Core US REIT ETF',
    description: 'Core US REIT holdings',
    inceptionDate: '9 settembre 2008',
    provider: 'BlackRock',
    expenseRatio: '0.08%',
    aum: '~$2 miliardi',
    website: 'https://www.ishares.com/us/products/239729/ishares-core-us-reit-etf',
    longDescription: 'L\'iShares Core US REIT ETF è un\'opzione a basso costo per esposizione ai REIT americani. Parte della serie Core di iShares, combina ampia diversificazione con commissioni competitive. Adatto come core holding immobiliare per portafogli diversificati che cercano reddito e apprezzamento del capitale a lungo termine.'
  },
  'RWO': {
    symbol: 'RWO',
    category: 'real_estate',
    name: 'SPDR Dow Jones Global Real Estate ETF',
    description: 'Global real estate',
    inceptionDate: '26 maggio 2008',
    provider: 'State Street Global Advisors',
    expenseRatio: '0.50%',
    aum: '~$500 milioni',
    website: 'https://www.ssga.com/us/en/individual/etfs/funds/spdr-dow-jones-global-real-estate-etf-rwo',
    longDescription: 'Lo SPDR Dow Jones Global Real Estate ETF offre esposizione al mercato immobiliare globale, inclusi USA e mercati internazionali. Permette diversificazione geografica nel settore real estate, beneficiando di dinamiche immobiliari in diverse economie. Include REIT e società immobiliari di mercati sviluppati ed emergenti.'
  },

  // Real Estate - International REIT (2)
  'VNQI': {
    symbol: 'VNQI',
    category: 'real_estate',
    name: 'Vanguard Global ex-US Real Estate ETF',
    description: 'International REITs',
    inceptionDate: '1 novembre 2010',
    provider: 'Vanguard',
    expenseRatio: '0.12%',
    aum: '~$5 miliardi',
    website: 'https://investor.vanguard.com/investment-products/etfs/profile/vnqi',
    longDescription: 'Il Vanguard Global ex-US Real Estate ETF investe in REIT e società immobiliari internazionali escludendo gli USA. Offre esposizione a mercati immobiliari sviluppati come Giappone, UK, Australia e Europa. Ideale per diversificazione geografica nel settore real estate, catturando opportunità in mercati con dinamiche demografiche e normative diverse dagli USA.'
  },
  'IFGL': {
    symbol: 'IFGL',
    category: 'real_estate',
    name: 'iShares International Developed Real Estate ETF',
    description: 'Developed markets ex-US real estate',
    inceptionDate: '31 ottobre 2007',
    provider: 'BlackRock',
    expenseRatio: '0.48%',
    aum: '~$1.5 miliardi',
    website: 'https://www.ishares.com/us/products/239540/ishares-international-developed-real-estate-etf',
    longDescription: 'L\'iShares International Developed Real Estate ETF si concentra su mercati immobiliari sviluppati al di fuori degli USA. Include REIT e società immobiliari di paesi come Giappone, Hong Kong, Singapore, UK e Australia. Offre accesso a mercati immobiliari maturi con caratteristiche diverse dal mercato USA, utile per diversificazione globale del portafoglio immobiliare.'
  },
};

// Cache for loaded data
const dataCache: Map<string, AssetData> = new Map();
const categoryCache: Map<AssetCategory, Record<string, AssetData>> = new Map();

/**
 * Load historical data for a specific asset
 */
export async function loadAssetData(symbol: string): Promise<AssetData | null> {
  // Check cache first
  if (dataCache.has(symbol)) {
    return dataCache.get(symbol)!;
  }

  const assetInfo = ASSET_METADATA[symbol];
  if (!assetInfo) {
    console.error(`Asset ${symbol} not found in metadata`);
    return null;
  }

  try {
    // Load from category file
    const categoryData = await loadCategoryData(assetInfo.category);
    const assetData = categoryData[symbol];

    if (assetData) {
      dataCache.set(symbol, assetData);
      return assetData;
    }

    console.error(`Asset ${symbol} not found in ${assetInfo.category} data`);
    return null;
  } catch (error) {
    console.error(`Error loading data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Load all assets for a specific category
 */
export async function loadCategoryData(category: AssetCategory): Promise<Record<string, AssetData>> {
  // Check cache first
  if (categoryCache.has(category)) {
    return categoryCache.get(category)!;
  }

  try {
    const response = await fetch(`/data/${category}_historical.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    categoryCache.set(category, data);

    // Also cache individual assets
    Object.values(data).forEach((assetData: any) => {
      dataCache.set(assetData.symbol, assetData);
    });

    return data;
  } catch (error) {
    console.error(`Error loading ${category} data:`, error);
    return {};
  }
}

/**
 * Load all historical data
 */
export async function loadAllData(): Promise<Record<AssetCategory, Record<string, AssetData>>> {
  try {
    const response = await fetch('/data/all_assets.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache everything
    Object.entries(data).forEach(([category, categoryData]: [string, any]) => {
      categoryCache.set(category as AssetCategory, categoryData);

      Object.values(categoryData).forEach((assetData: any) => {
        dataCache.set(assetData.symbol, assetData);
      });
    });

    return data;
  } catch (error) {
    console.error('Error loading all data:', error);
    return {} as any;
  }
}

/**
 * Get all available asset symbols by category
 */
export function getAssetsByCategory(category: AssetCategory): AssetInfo[] {
  return Object.values(ASSET_METADATA).filter(asset => asset.category === category);
}

/**
 * Get all available categories
 */
export function getAllCategories(): AssetCategory[] {
  return ['etf', 'crypto', 'commodities', 'bonds', 'real_estate'];
}

/**
 * Get asset metadata by symbol
 */
export function getAssetInfo(symbol: string): AssetInfo | undefined {
  return ASSET_METADATA[symbol];
}

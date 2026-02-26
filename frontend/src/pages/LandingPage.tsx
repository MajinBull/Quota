import { useNavigate } from 'react-router-dom';
import logoQuota from '../assets/logo-quota.png';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <img src={logoQuota} alt="QUOTA" className="h-10" />
            <button
              onClick={() => navigate('/app')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
            >
              Inizia →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 text-center">
        <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-6">
          Semplice • Gratuito • Senza registrazione
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Scopri come sarebbero andati<br />
          <span className="text-indigo-600">i tuoi investimenti</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4 leading-relaxed">
          Simula strategie di investimento con dati storici reali. Visualizza quanto avresti
          guadagnato (o perso) investendo nel passato.
        </p>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
          Nessuna esperienza richiesta. Ti guidiamo passo dopo passo nella creazione
          e analisi del tuo portafoglio ideale.
        </p>
        <button
          onClick={() => navigate('/app')}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40"
        >
          Inizia Subito - È Gratis →
        </button>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">
          Cosa Puoi Fare
        </h2>
        <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
          Strumenti semplici per prendere decisioni informate sui tuoi investimenti
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tanti Tipi di Investimento</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Combina ETF, criptovalute, oro, obbligazioni e immobiliare. Non devi scegliere
              solo uno: crea un mix bilanciato come fanno i professionisti.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tutto Subito o Poco alla Volta?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Scopri se conviene investire tutto insieme o versare piccole somme ogni mese.
              Confronta le due strategie e vedi quale funziona meglio per te.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Mantieni il Bilanciamento</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Simula cosa succede se aggiusti periodicamente il tuo portafoglio per
              mantenerlo sempre bilanciato secondo le percentuali che hai scelto.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dati Veri dal Passato</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Usa prezzi reali fino a 20 anni di storia. Vedi esattamente cosa sarebbe
              successo se avessi investito nel 2010, 2015 o 2020.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Analisi Dettagliate</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Scopri quanto avresti guadagnato ogni anno, qual è stato il calo peggiore
              e quale investimento ha performato meglio. Tutto spiegato in modo chiaro.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Strategie Pronte all'Uso</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Non sai da dove iniziare? Usa portafogli già pronti testati da esperti
              e modificali come vuoi. Perfetto per chi parte da zero.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Come Funziona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Scegli</h3>
              <p className="text-sm text-slate-600">
                Seleziona in cosa vuoi investire (oro, Bitcoin, ETF...) e quanto mettere
                su ciascuno. Puoi anche usare portafogli già pronti.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Simula</h3>
              <p className="text-sm text-slate-600">
                Premi "Esegui" e scopri in pochi secondi come sarebbe andato il tuo
                portafoglio negli ultimi anni. Grafici semplici e chiari.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confronta</h3>
              <p className="text-sm text-slate-600">
                Prova diverse combinazioni, cambia le percentuali e vedi quale strategia
                avrebbe funzionato meglio. Così impari cosa funziona davvero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Curioso di vedere come sarebbe andata?
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          Bastano 2 minuti per simulare il tuo primo portafoglio. Gratis, senza registrazione.
        </p>
        <button
          onClick={() => navigate('/app')}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40"
        >
          Prova Subito - È Gratis →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-slate-600 text-sm">
              <span className="font-semibold text-slate-900">QUOTA Portfolio Intelligence</span>
              {' · '}Backtest platform multi-asset
            </div>
            <div className="text-slate-500 text-xs">
              I rendimenti passati non garantiscono risultati futuri
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

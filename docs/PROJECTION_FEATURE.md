# Feature Proiezione Futura - Changelog

## Data: 2026-03-04 (Update: Correzione Calcoli Matematici)

### Cosa è stato implementato

**Proiezione Futura del Portfolio**
- Modale popup accessibile da backtest salvati (bottone "📈 Previsione")
- 3 scenari: Ottimistico, Base, Pessimistico
- Basato su CAGR geometrico storico + volatilità campione annualizzata

### Bug Fixati

1. **CAGR Geometrico (CRITICO) - Fixed 2026-03-04**
   - File: `frontend/src/utils\projection.ts:29-35`
   - **Problema**: Usava media aritmetica (`averageAnnualReturn`) che sovrastimava rendimenti con volatilità alta
   - **Fix**: Calcolo CAGR geometrico corretto
   ```typescript
   // PRIMA (SBAGLIATO - Media aritmetica)
   const cagr = metrics.averageAnnualReturn / 100;

   // DOPO (CORRETTO - CAGR geometrico)
   const years = (endDate - startDate) / (365.25 days);
   const cagr = Math.pow(finalValue / initialValue, 1/years) - 1;
   ```
   - **Impatto**: Con volatilità alta (crypto) differenza 20-50%+ nelle proiezioni

2. **Volatilità Campione (MINORE) - Fixed 2026-03-04**
   - File: `frontend/src/utils\projection.ts:125-126`
   - **Problema**: Usava varianza popolazione (divide per `n`) invece di campione (`n-1`)
   - **Fix**: Applicata correzione di Bessel (standard in finanza)
   ```typescript
   // PRIMA (divide per n)
   const variance = ... / dailyReturns.length;

   // DOPO (divide per n-1, stimatore non distorto)
   const variance = ... / (dailyReturns.length - 1);
   ```
   - **Impatto**: Sottostimava volatilità di ~2-5% (più rilevante con pochi dati)

### Modifiche UX

1. **Capitale Iniziale Configurabile**
   - Default: €10.000
   - Input manuale + quick buttons (5K, 10K, 25K, 50K)
   - NON usa più il valore finale del backtest
   - Permette all'utente di simulare quanto vuole investire

2. **Modal Compatto**
   - Da `max-w-6xl` a `max-w-4xl`
   - Capitale e Orizzonte affiancati (non verticali)
   - Chart ridotto a 280px altezza
   - Padding/spacing ridotti ovunque
   - Font sizes più piccoli (text-xs, text-sm)

### File Modificati

- `frontend/src/components/ProjectionModal.tsx` - Creato nuovo
- `frontend/src/components/SavedBacktestsList.tsx` - Aggiunto bottone Previsione
- `frontend/src/components/BacktestResults.tsx` - Rimosso ProjectionView inline
- `frontend/src/utils/projection.ts` - Fixato calcolo CAGR

### Stato Deploy

⚠️ **SOLO LOCALE** - NON deployato in produzione
- Testing in corso su localhost:5174
- Da testare prima di commit/push

### Configurazione Proiezione

```typescript
PROJECTION_CONFIG = {
  volatilityCap: 0.12,      // Max 12% volatility
  multiplier: 0.30,         // ±30% spread
  minCAGR: -0.05           // -5% floor pessimistic
}
```

### Formule Matematiche

**CAGR (Compound Annual Growth Rate)**
```
CAGR = (Valore Finale / Valore Iniziale)^(1/anni) - 1
```

**Volatilità Annualizzata (Sample Standard Deviation)**
```
σ_daily = sqrt( Σ(r_i - μ)² / (n-1) )  // Bessel's correction
σ_annual = σ_daily × √252                // Annualization
```

**Scenari Proiezione**
```
Base        = CAGR
Ottimistico = CAGR + (volatilità_cappata × 0.30)
Pessimistico = max(CAGR - (volatilità_cappata × 0.30), -5%)
```

**Proiezione Valore Futuro**
```
FV = PV × (1 + CAGR_scenario)^anni
```

### Testing & Validazione

✅ **Test Matematici Completati** (2026-03-04)
- Test CAGR geometrico vs media aritmetica
- Test volatilità popolazione vs campione
- Test proiezioni con dati simulati realistici (SPY 2010-2020)
- Validation checks: CAGR accuracy, scenario ordering, volatility range
- **Risultato**: 🎉 ALL CHECKS PASSED

### Prossimi Step

1. ✅ Fix calcoli matematici (COMPLETATO)
2. ⏳ Test manuale UI su localhost
3. ⏳ git commit con changelog dettagliato
4. ⏳ git push (deploy Vercel automatico)

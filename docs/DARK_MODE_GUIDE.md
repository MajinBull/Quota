# Dark Mode - Guida Implementazione

## ✅ Stato Attuale

**Setup Completato:**
- ✅ Tailwind configurato con `darkMode: 'class'`
- ✅ Componente `ThemeToggle` creato e integrato nell'header
- ✅ Theme salvato in `localStorage` con persistenza
- ✅ Auto-detection tema sistema operativo

**Componenti con Dark Mode:**
- ✅ **Header** (navbar, logo, tabs, background)
- ✅ **ProjectionModal** (modale proiezione completa)
- ✅ **ThemeToggle** (bottone switch)

**Componenti da aggiornare:**
- ⏳ PortfolioBuilder
- ⏳ BacktestResults
- ⏳ SavedBacktestsList
- ⏳ ComparisonView
- ⏳ AuthModal
- ⏳ Grafici Recharts
- ⏳ Landing page

---

## 🎨 Schema Colori Standard

### Background
```tsx
// Sfondi principali
bg-white dark:bg-slate-900
bg-stone-50 dark:bg-slate-950

// Sfondi secondari (cards, sezioni)
bg-white dark:bg-slate-800
bg-slate-50 dark:bg-slate-800
bg-slate-100 dark:bg-slate-700

// Sfondi colorati
bg-emerald-50 dark:bg-emerald-900/20
bg-indigo-50 dark:bg-indigo-900/20
bg-amber-50 dark:bg-amber-900/20
bg-red-50 dark:bg-red-900/20
```

### Text
```tsx
// Titoli e testo primario
text-slate-900 dark:text-white
text-slate-800 dark:text-slate-100

// Testo secondario
text-slate-700 dark:text-slate-300
text-slate-600 dark:text-slate-400
text-slate-500 dark:text-slate-400
```

### Borders
```tsx
border-slate-200 dark:border-slate-700
border-slate-300 dark:border-slate-600
```

### Hover States
```tsx
hover:bg-slate-100 dark:hover:bg-slate-700
hover:bg-slate-200 dark:hover:bg-slate-600
```

### Buttons
```tsx
// Primary button (no dark variant needed - same color)
bg-indigo-600 hover:bg-indigo-700 text-white

// Secondary button
bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
hover:bg-slate-200 dark:hover:bg-slate-600
```

---

## 🛠️ Come Aggiungere Dark Mode a un Componente

### 1. Background del Componente

**Prima:**
```tsx
<div className="bg-white rounded-lg p-4">
```

**Dopo:**
```tsx
<div className="bg-white dark:bg-slate-800 rounded-lg p-4">
```

### 2. Testo

**Prima:**
```tsx
<h2 className="text-slate-900">Title</h2>
<p className="text-slate-600">Description</p>
```

**Dopo:**
```tsx
<h2 className="text-slate-900 dark:text-white">Title</h2>
<p className="text-slate-600 dark:text-slate-400">Description</p>
```

### 3. Borders

**Prima:**
```tsx
<div className="border border-slate-200">
```

**Dopo:**
```tsx
<div className="border border-slate-200 dark:border-slate-700">
```

### 4. Sezioni Colorate

**Prima:**
```tsx
<div className="bg-emerald-50 border border-emerald-200">
  <span className="text-emerald-700">Success</span>
</div>
```

**Dopo:**
```tsx
<div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
  <span className="text-emerald-700 dark:text-emerald-400">Success</span>
</div>
```

### 5. Cards & Modali

**Prima:**
```tsx
<div className="bg-white shadow-lg rounded-xl border border-slate-200">
```

**Dopo:**
```tsx
<div className="bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
```

---

## 📊 Grafici Recharts in Dark Mode

I grafici richiedono colori dinamici basati sul tema attivo:

### Metodo 1: Hook Custom

```tsx
// hooks/useTheme.ts
export function useTheme() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
```

### Metodo 2: Utility Function

```tsx
// utils/chartColors.ts
export const getChartColors = (isDark: boolean) => ({
  grid: isDark ? '#334155' : '#e2e8f0',       // slate-700 : slate-200
  axis: isDark ? '#cbd5e1' : '#64748b',       // slate-300 : slate-500
  tooltip: {
    bg: isDark ? '#1e293b' : '#ffffff',       // slate-800 : white
    border: isDark ? '#475569' : '#e2e8f0',   // slate-600 : slate-200
    text: isDark ? '#f1f5f9' : '#0f172a',     // slate-100 : slate-900
  },
  legend: isDark ? '#cbd5e1' : '#64748b',     // slate-300 : slate-500
});
```

### Esempio Uso

```tsx
import { useTheme } from '../hooks/useTheme';
import { getChartColors } from '../utils/chartColors';

function MyChart() {
  const isDark = useTheme();
  const colors = getChartColors(isDark);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis stroke={colors.axis} />
        <YAxis stroke={colors.axis} />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltip.bg,
            border: `1px solid ${colors.tooltip.border}`,
            color: colors.tooltip.text,
          }}
        />
        <Legend wrapperStyle={{ color: colors.legend }} />
        <Line type="monotone" dataKey="value" stroke="#6366f1" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## 🧪 Testing Checklist

Quando aggiungi dark mode a un componente:

- [ ] **Background** - Sfondo leggibile in entrambi i temi
- [ ] **Testo** - Contrasto sufficiente (WCAG AA: 4.5:1)
- [ ] **Borders** - Visibili ma non troppo marcati
- [ ] **Hover states** - Evidenti in entrambi i temi
- [ ] **Icons** - Colori aggiornati
- [ ] **Shadows** - Adattate al tema scuro
- [ ] **Inputs** - Leggibili e usabili
- [ ] **Grafici** - Colori dinamici applicati
- [ ] **Modali** - Overlay e backdrop corretti
- [ ] **Mobile** - Testare su viewport piccoli

---

## 🎯 Priorità Implementazione

### High Priority (fare prima)
1. ✅ Header/Navigation
2. ✅ ProjectionModal
3. ⏳ BacktestResults (usato spesso)
4. ⏳ SavedBacktestsList
5. ⏳ PortfolioBuilder

### Medium Priority
6. ⏳ ComparisonView
7. ⏳ AuthModal
8. ⏳ UserProfileButton dropdown
9. ⏳ Grafici Recharts (equity curve, allocazioni)
10. ⏳ RebalanceModal

### Low Priority
11. ⏳ Landing page
12. ⏳ Error messages
13. ⏳ Toast notifications
14. ⏳ Loading spinners

---

## 💡 Tips & Best Practices

### 1. Usa Variabili per Colori Ricorrenti

```tsx
// Invece di ripetere sempre le stesse classi
const cardClasses = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg";

<div className={cardClasses}>Content</div>
```

### 2. Componenti Wrapper

```tsx
// components/ui/Card.tsx
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

// Uso
<Card className="p-4">
  <h3>Title</h3>
</Card>
```

### 3. Tailwind IntelliSense

VS Code mostra automaticamente le varianti `dark:` quando digiti una classe. Usa `Ctrl+Space` per vedere suggerimenti.

### 4. Test Rapido

Dopo ogni modifica:
1. Clicca il toggle
2. Verifica che tutto sia leggibile
3. Controlla hover states
4. Testa su mobile

---

## 📝 Convenzioni

- Usa sempre `dark:` dopo la classe base (es. `bg-white dark:bg-slate-800`)
- Preferisci slate per grigi neutrali
- Per colori accentuati usa opacità ridotta in dark (es. `bg-emerald-900/20`)
- Mantieni consistenza: stessi colori per elementi simili

---

## 🚀 Prossimi Passi

Per completare il dark mode su tutto il sito:

1. **Applicare schema colori standard a tutti i componenti** (4-5h)
2. **Aggiornare grafici Recharts** (1h)
3. **Testare tutto in entrambi i temi** (1h)
4. **Fix edge cases e dettagli** (1h)

**Totale stimato:** 7-8 ore

---

**Ultimo aggiornamento:** 2026-03-04

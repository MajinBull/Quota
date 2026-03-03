# Piano Feature Future - Auth, Pagamenti e Monetizzazione

## 📊 Situazione Attuale vs. Necessità Future

**Stato attuale:**
- ✅ App 100% frontend-only (nessun backend)
- ✅ Tutto funziona lato client (localStorage)
- ✅ Deploy semplice e gratuito su Vercel

**Cosa serve per login + pagamenti:**
- ❌ **Backend/Database** - per salvare utenti e transazioni
- ❌ **Autenticazione** - gestione sessioni, password, email
- ❌ **Payment processor** - integrazione con Stripe/PayPal
- ❌ **API** - endpoint per comunicare frontend ↔ backend

---

## 🎯 Strategia Raccomandata: Approccio Incrementale

### **FASE 1: Deploy Versione Base (ORA)** ⭐

**Cosa:** Pubblicare l'app attuale senza login/pagamenti

**Perché:**
- ✅ Validare il mercato - vedere se c'è interesse
- ✅ Raccogliere feedback utenti reali
- ✅ Testare performance e usabilità
- ✅ Iniziare a fare analytics e SEO
- ✅ Nessun costo di sviluppo backend (ancora)

**Modalità:**
- Free e illimitato per tutti (temporaneamente)
- O con messaggio "Beta gratuita - presto Premium"
- Raccogliere email interessati (form semplice)

**Vantaggi:**
- 🚀 Vai online in 2-3 ore
- 💰 Zero costi (solo dominio)
- 📈 Inizi a costruire audience
- 🔍 Capisci cosa funziona e cosa no

---

### **FASE 2: Aggiungere Auth + Limiti (1-2 settimane dopo)** 🔐

**Cosa:** Login utente + limitazioni free tier

**Come implementare:**

#### Opzione A: **Firebase** (Raccomandato per iniziare) ⭐

**Vantaggi:**
- ✅ Backend-as-a-Service completo
- ✅ Autenticazione pronta (email, Google, GitHub)
- ✅ Database NoSQL (Firestore)
- ✅ Free tier generoso (50k letture/giorno)
- ✅ Integrazione facile con React

**Architettura:**
```
Frontend (Vercel) → Firebase Auth → Firestore DB
                  ↓
              Salvare backtest
              Tracciare limiti (3 backtest free)
```

**Costo:** GRATIS fino a ~25k utenti/mese

**Setup Firebase:**
```bash
npm install firebase
```

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "etf-backtest.firebaseapp.com",
  projectId: "etf-backtest",
  storageBucket: "etf-backtest.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Implementazione Auth:**
```typescript
// components/Login.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';

const handleLogin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

**Salvare backtest su Firestore:**
```typescript
// stores/backtestStore.ts
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';

export async function saveBacktest(userId: string, backtest: BacktestResult) {
  const docRef = await addDoc(collection(db, 'backtests'), {
    userId,
    name: backtest.name,
    result: backtest.result,
    createdAt: new Date(),
    isFavorite: false
  });

  return docRef.id;
}

export async function getUserBacktests(userId: string) {
  const q = query(
    collection(db, 'backtests'),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**Controllare limiti Free:**
```typescript
// components/BacktestButton.tsx
const handleRunBacktest = async () => {
  const user = auth.currentUser;

  if (!user) {
    // Mostra modal login
    setShowLoginModal(true);
    return;
  }

  // Check se utente è premium
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const isPremium = userDoc.data()?.isPremium || false;

  if (!isPremium) {
    // Check numero backtest
    const backtests = await getUserBacktests(user.uid);

    if (backtests.length >= 3) {
      // Mostra modal upgrade
      setShowUpgradeModal(true);
      return;
    }
  }

  // Esegui backtest
  runBacktest();
};
```

#### Opzione B: **Supabase** (Alternativa open-source)

**Vantaggi:**
- PostgreSQL (SQL standard)
- API REST automatica
- Realtime subscriptions
- Storage per file
- Free tier: 500MB database, 50k utenti MAU

**Setup:**
```bash
npm install @supabase/supabase-js
```

```typescript
// supabase.config.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Auth con Supabase:**
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

**Database queries:**
```typescript
// Salvare backtest
const { data, error } = await supabase
  .from('backtests')
  .insert({
    user_id: user.id,
    name: 'My Strategy',
    result: backtestResult,
    created_at: new Date()
  });

// Leggere backtests
const { data, error } = await supabase
  .from('backtests')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

#### Opzione C: **Clerk** (Auth specializzato)

**Vantaggi:**
- UI pre-costruite bellissime
- Social login (Google, GitHub, Twitter)
- Multi-factor authentication
- User management dashboard
- Free tier: 10k utenti attivi/mese

**Nota:** Clerk è solo auth, serve database separato (Firebase/Supabase)

**Setup:**
```bash
npm install @clerk/clerk-react
```

```typescript
// main.tsx
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
);
```

```typescript
// components/App.tsx
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';

function App() {
  return (
    <div>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton afterSignOutUrl="/" />
        {/* App content */}
      </SignedIn>
    </div>
  );
}
```

**Tempo implementazione FASE 2:** 3-5 giorni

---

### **FASE 3: Aggiungere Pagamenti (2-4 settimane dopo)** 💳

**Cosa:** Sistema di pagamento per piano Premium

#### Modelli di Monetizzazione Possibili:

**Opzione 1: Freemium con limiti** ⭐ (Raccomandato)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    FREE TIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 3 backtest salvati
✓ Confronto max 2 strategie
✓ Dati storici fino a 10 anni
✓ Metriche base (rendimento, drawdown)
✓ Templates predefiniti

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PREMIUM - €9.99/mese o €99/anno
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Backtest illimitati
✓ Confronto fino a 5 strategie
✓ Dati completi 20+ anni
✓ Metriche avanzate (Sharpe Ratio, Sortino, Calmar)
✓ Export PDF/CSV
✓ Templates personalizzati
✓ Notifiche email
✓ Priority support
✓ Early access nuove feature
```

**Opzione 2: Pay-per-use**
```
1 backtest  = €1
10 backtest = €8  (20% sconto)
50 backtest = €35 (30% sconto)

+ Pacchetti con scadenza (es. 10 backtest validi 3 mesi)
```

**Opzione 3: Completamente Free + Ads**
```
- Google AdSense
- Affiliate links (broker consigliati, piattaforme trading)
- Sponsored content
- Referral program broker

Potenziale: €2-5 per 1000 visualizzazioni
```

**Opzione 4: Modello Ibrido** (Mix)
```
FREE: 3 backtest + ads
PREMIUM: €7.99/mese - illimitato, no ads
PAY-AS-YOU-GO: €1/backtest per chi non vuole abbonamento
```

#### Implementazione Pagamenti con Stripe

**1. Setup Account Stripe**

- Creare account su https://stripe.com
- Attivare "Test mode" per sviluppo
- Configurare prodotti/piani:
  - Premium Monthly: €9.99/mese (ricorrente)
  - Premium Yearly: €99/anno (ricorrente, 17% sconto)

**2. Installazione SDK**

```bash
npm install @stripe/stripe-js
npm install stripe  # Per backend
```

**3. Frontend: Checkout Button**

```typescript
// components/UpgradeModal.tsx
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function UpgradeModal({ isOpen, onClose }) {
  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    const stripe = await stripePromise;

    // Chiamare API backend per creare sessione checkout
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: auth.currentUser?.uid,
        plan: plan,
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/pricing'
      })
    });

    const session = await response.json();

    // Redirect a Stripe Checkout
    const result = await stripe?.redirectToCheckout({
      sessionId: session.id
    });

    if (result?.error) {
      console.error(result.error.message);
    }
  };

  return (
    <div className="modal">
      <h2>Upgrade to Premium</h2>

      <div className="pricing-cards">
        <div className="plan">
          <h3>Monthly</h3>
          <p className="price">€9.99/month</p>
          <button onClick={() => handleSubscribe('monthly')}>
            Subscribe Monthly
          </button>
        </div>

        <div className="plan popular">
          <span className="badge">Best Value</span>
          <h3>Yearly</h3>
          <p className="price">€99/year</p>
          <p className="discount">Save 17%</p>
          <button onClick={() => handleSubscribe('yearly')}>
            Subscribe Yearly
          </button>
        </div>
      </div>
    </div>
  );
}
```

**4. Backend: Creare Checkout Session**

**Opzione A: Vercel Serverless Function**

```typescript
// api/create-checkout-session.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
  const { userId, plan, successUrl, cancelUrl } = await request.json();

  const priceId = plan === 'monthly'
    ? process.env.STRIPE_PRICE_MONTHLY
    : process.env.STRIPE_PRICE_YEARLY;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId: userId
      }
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Opzione B: Firebase Cloud Function**

```typescript
// functions/src/stripe.ts
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16'
});

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { userId, plan } = data;

  const priceId = plan === 'monthly'
    ? functions.config().stripe.price_monthly
    : functions.config().stripe.price_yearly;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://yourdomain.com/success',
    cancel_url: 'https://yourdomain.com/pricing',
    client_reference_id: userId,
    metadata: { userId }
  });

  return { sessionId: session.id };
});
```

**5. Webhook per Confermare Pagamento**

```typescript
// api/stripe-webhook.ts
import Stripe from 'stripe';
import { db } from '../firebase.config';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Gestire eventi
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // Aggiornare utente come Premium
        await updateDoc(doc(db, 'users', userId), {
          isPremium: true,
          subscriptionId: session.subscription,
          planType: session.mode,
          subscriptionStatus: 'active',
          subscriptionStart: new Date()
        });
      }
      break;

    case 'customer.subscription.deleted':
      // Subscription cancellata
      const subscription = event.data.object as Stripe.Subscription;
      // Trovare user e rimuovere premium
      break;

    case 'invoice.payment_failed':
      // Pagamento fallito
      break;
  }

  return new Response(JSON.stringify({ received: true }));
}
```

**6. Gestire Subscription Status**

```typescript
// hooks/useSubscription.ts
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      const data = doc.data();
      setIsPremium(data?.isPremium || false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { isPremium, loading };
}
```

**7. Customer Portal (Gestione Subscription)**

```typescript
// api/create-portal-session.ts
export async function POST(request: Request) {
  const { userId } = await request.json();

  // Recuperare customerId da database
  const userDoc = await getDoc(doc(db, 'users', userId));
  const customerId = userDoc.data()?.stripeCustomerId;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://yourdomain.com/account'
  });

  return NextResponse.json({ url: session.url });
}
```

```typescript
// components/AccountPage.tsx
const handleManageSubscription = async () => {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.uid })
  });

  const { url } = await response.json();
  window.location.href = url;
};
```

**Tempo implementazione FASE 3:** 5-7 giorni

---

## 🗺️ Timeline Completa di Implementazione

### **Mese 1: Launch MVP**

**Settimana 1-2: Deploy versione attuale (FASE 1)**
- ✅ Seguire PIANO_DEPLOYMENT.md
- ✅ App online, free per tutti
- ✅ Aggiungere banner "Beta - Presto Premium"
- ✅ Form "Resta aggiornato" per raccogliere email (opzionale)

**Settimana 3-4: Monitorare e ottimizzare**
- 📊 Analizzare Vercel Analytics
- 💬 Raccogliere feedback utenti
- 🐛 Fix bug se necessario
- 💰 Decidere modello monetizzazione basato su dati
- 📈 Ottimizzazioni SEO

### **Mese 2: Aggiungere Autenticazione**

**Settimana 1: Setup Backend (Firebase/Supabase)**
- Creare progetto Firebase/Supabase
- Configurare autenticazione (email + Google)
- Setup database schema:
  ```
  users/
    - userId
    - email
    - isPremium: boolean
    - subscriptionId: string
    - createdAt: timestamp

  backtests/
    - backtestId
    - userId
    - name: string
    - result: object
    - isFavorite: boolean
    - createdAt: timestamp
  ```
- Migrare localStorage → cloud database

**Settimana 2: UI Login/Signup**
- Componente Login
- Componente Signup/Register
- Password reset flow
- Protected routes (React Router)
- User profile page
- Logout functionality

**Settimana 3: Implementare limiti Free Tier**
- Contatore backtest per utente
- Modal "Upgrade to Premium" quando raggiunto limite
- Landing page /pricing con piani
- Feature comparison table
- Disabilitare features premium per free users

**Settimana 4: Testing**
- Test completi auth flow
- Test limiti free tier
- Beta testing con 10-20 utenti reali
- Fix bug e UX issues
- Preparare email marketing per launch

### **Mese 3: Aggiungere Pagamenti**

**Settimana 1: Setup Stripe**
- Creare account Stripe
- Configurare prodotti:
  - Premium Monthly (€9.99/mese)
  - Premium Yearly (€99/anno)
- Configurare test mode
- Setup webhook endpoint
- Test transazioni con carte test

**Settimana 2: Backend per Pagamenti**
- Implementare serverless functions (Vercel/Firebase)
- Endpoint `/api/create-checkout-session`
- Endpoint `/api/stripe-webhook`
- Endpoint `/api/create-portal-session`
- Gestione subscription status
- Email transazionali (conferma pagamento)

**Settimana 3: UI Checkout**
- Pricing page professionale
- Checkout flow con Stripe Elements
- Success page (post-pagamento)
- Cancel page
- Account page con "Manage Subscription"
- Badge "Premium" su UI

**Settimana 4: Go Live Payments**
- Disabilitare test mode Stripe
- Test pagamenti reali (piccole somme)
- Setup compliance:
  - Privacy Policy
  - Terms of Service
  - Cookie Policy
  - Refund Policy
- Email marketing per existing users
- Launch announcement

---

## 🛠️ Stack Tecnologico Raccomandato

**Per Auth + Database + Payments:**

```
┌─────────────────────────────────────────────┐
│            FRONTEND (già fatto)             │
│  React 19 + TypeScript + Vite + Tailwind   │
│         Hosting: Vercel (gratuito)          │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│          AUTHENTICATION & DATABASE          │
│                                             │
│  Opzione A: Firebase (raccomandato)        │
│  - Firebase Auth (email, Google, GitHub)   │
│  - Firestore Database (NoSQL)              │
│  - Firebase Cloud Functions (serverless)   │
│                                             │
│  Opzione B: Supabase (alternativa)         │
│  - Supabase Auth                            │
│  - PostgreSQL Database                      │
│  - Supabase Functions                       │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│            PAYMENT PROCESSING               │
│                                             │
│  Stripe (standard de facto)                │
│  - Checkout Sessions                        │
│  - Subscriptions                            │
│  - Customer Portal                          │
│  - Webhooks                                 │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│             SERVIZI AUSILIARI               │
│                                             │
│  Email: SendGrid / Resend                  │
│  Analytics: Vercel Analytics + GA4         │
│  Monitoring: Sentry (error tracking)       │
└─────────────────────────────────────────────┘
```

---

## 💰 Costi Mensili Stimati

**Scenario: 1000 utenti attivi, 100 premium**

| Servizio | Free Tier | Costo Stimato |
|----------|-----------|---------------|
| **Vercel Hosting** | 100 GB bandwidth | €0 (entro limiti) |
| **Firebase** | 50k letture/giorno | €0-25 (scaling) |
| **Stripe** | N/A | 1.4% + €0.25 per transazione |
| **Dominio** | N/A | €1/mese |
| **SendGrid Email** | 100 email/giorno | €0 (free tier) |
| **Totale** | - | **€0-30/mese** |

**Revenue Stimato (100 utenti premium):**
- 70 utenti mensili × €9.99 = €699/mese
- 30 utenti annuali × €99 / 12 = €247/mese
- **Totale: ~€950/mese**

**Profitto netto:** €950 - €30 = **€920/mese**

---

## 📊 Database Schema Dettagliato

### Firebase Firestore Schema

```typescript
// Collection: users
interface User {
  userId: string;                // Firebase Auth UID
  email: string;
  displayName?: string;
  photoURL?: string;
  isPremium: boolean;
  subscriptionId?: string;       // Stripe subscription ID
  stripeCustomerId?: string;     // Stripe customer ID
  planType?: 'monthly' | 'yearly';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  subscriptionStart?: Timestamp;
  subscriptionEnd?: Timestamp;
  backtestCount: number;         // Per tracking limiti free
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// Collection: backtests
interface SavedBacktest {
  backtestId: string;
  userId: string;                // Reference a user
  name: string;
  isFavorite: boolean;
  result: {
    portfolio: Portfolio;
    metrics: PerformanceMetrics;
    equityCurve: EquityPoint[];
    // ... altri dati backtest
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: subscriptions (mirror di Stripe)
interface Subscription {
  subscriptionId: string;
  userId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  plan: 'monthly' | 'yearly';
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  createdAt: Timestamp;
}

// Collection: email_signups (pre-launch)
interface EmailSignup {
  email: string;
  signupDate: Timestamp;
  source?: string;  // 'landing_page' | 'beta_banner' | etc
  notified: boolean;
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Backtests
    match /backtests/{backtestId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;
    }

    // Subscriptions - read only
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow write: if false;  // Solo backend può scrivere
    }
  }
}
```

---

## 🎨 UI/UX Components da Implementare

### 1. Login/Signup Modal

```typescript
// components/AuthModal.tsx
export function AuthModal({ mode, isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="auth-modal">
        {mode === 'login' ? (
          <LoginForm onSuccess={() => onClose()} />
        ) : (
          <SignupForm onSuccess={() => onClose()} />
        )}

        <div className="social-auth">
          <button onClick={signInWithGoogle}>
            <GoogleIcon /> Continue with Google
          </button>
          <button onClick={signInWithGitHub}>
            <GitHubIcon /> Continue with GitHub
          </button>
        </div>

        <p className="switch-mode">
          {mode === 'login' ? (
            <>Don't have an account? <a onClick={() => setMode('signup')}>Sign up</a></>
          ) : (
            <>Already have an account? <a onClick={() => setMode('login')}>Log in</a></>
          )}
        </p>
      </div>
    </Modal>
  );
}
```

### 2. Upgrade Modal

```typescript
// components/UpgradeModal.tsx
export function UpgradeModal({ isOpen, onClose, trigger }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="upgrade-modal">
        <h2>🚀 Upgrade to Premium</h2>

        {trigger === 'backtest_limit' && (
          <p className="message">
            You've reached your free tier limit of 3 saved backtests.
            Upgrade to Premium for unlimited backtests!
          </p>
        )}

        <div className="pricing-cards">
          <PricingCard plan="monthly" />
          <PricingCard plan="yearly" featured />
        </div>

        <FeatureComparison />
      </div>
    </Modal>
  );
}
```

### 3. Pricing Page

```typescript
// pages/PricingPage.tsx
export function PricingPage() {
  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>

      <div className="pricing-grid">
        {/* Free Tier */}
        <div className="pricing-card">
          <h3>Free</h3>
          <p className="price">€0<span>/forever</span></p>
          <ul className="features">
            <li>✓ 3 saved backtests</li>
            <li>✓ Compare 2 strategies</li>
            <li>✓ 10 years historical data</li>
            <li>✓ Basic metrics</li>
          </ul>
          <button>Get Started</button>
        </div>

        {/* Premium Monthly */}
        <div className="pricing-card">
          <h3>Premium Monthly</h3>
          <p className="price">€9.99<span>/month</span></p>
          <ul className="features">
            <li>✓ Unlimited backtests</li>
            <li>✓ Compare 5 strategies</li>
            <li>✓ 20+ years data</li>
            <li>✓ Advanced metrics</li>
            <li>✓ Export PDF/CSV</li>
            <li>✓ Priority support</li>
          </ul>
          <button>Subscribe</button>
        </div>

        {/* Premium Yearly */}
        <div className="pricing-card featured">
          <span className="badge">Best Value - Save 17%</span>
          <h3>Premium Yearly</h3>
          <p className="price">€99<span>/year</span></p>
          <p className="monthly-equiv">€8.25/month</p>
          <ul className="features">
            <li>✓ Everything in Monthly</li>
            <li>✓ 2 months free</li>
            <li>✓ Early access features</li>
          </ul>
          <button>Subscribe</button>
        </div>
      </div>

      <FAQ />
    </div>
  );
}
```

### 4. Account/Profile Page

```typescript
// pages/AccountPage.tsx
export function AccountPage() {
  const { user } = useAuth();
  const { isPremium, subscription } = useSubscription();

  return (
    <div className="account-page">
      <h1>Account Settings</h1>

      <section className="profile">
        <h2>Profile</h2>
        <div>
          <label>Email</label>
          <input value={user.email} disabled />
        </div>
        <div>
          <label>Display Name</label>
          <input value={user.displayName} onChange={updateDisplayName} />
        </div>
      </section>

      <section className="subscription">
        <h2>Subscription</h2>
        {isPremium ? (
          <>
            <p>Plan: Premium {subscription.plan}</p>
            <p>Status: {subscription.status}</p>
            <p>Next billing: {subscription.currentPeriodEnd}</p>
            <button onClick={manageSubscription}>
              Manage Subscription
            </button>
          </>
        ) : (
          <>
            <p>Current Plan: Free</p>
            <button onClick={openUpgradeModal}>
              Upgrade to Premium
            </button>
          </>
        )}
      </section>

      <section className="usage">
        <h2>Usage</h2>
        <p>Saved backtests: {user.backtestCount} / {isPremium ? '∞' : '3'}</p>
      </section>
    </div>
  );
}
```

---

## ✅ Checklist Pre-Launch (Prima di abilitare pagamenti)

### Legale & Compliance

- [ ] **Privacy Policy** - Conforme GDPR
- [ ] **Terms of Service** - Condizioni d'uso chiare
- [ ] **Cookie Policy** - Informativa cookie
- [ ] **Refund Policy** - Politica rimborsi (es. 14 giorni soddisfatti o rimborsati)
- [ ] **Disclaimer finanziario** - "Not financial advice"

### Pagine Richieste

- [ ] `/privacy` - Privacy policy
- [ ] `/terms` - Terms of service
- [ ] `/pricing` - Pricing page
- [ ] `/contact` - Form contatto o email
- [ ] `/success` - Post-checkout success page
- [ ] `/account` - User account/settings

### Email Templates

- [ ] Welcome email (nuovo utente)
- [ ] Payment confirmation
- [ ] Subscription renewal reminder
- [ ] Payment failed notification
- [ ] Cancellation confirmation
- [ ] Password reset

### Testing

- [ ] Test completo auth flow
- [ ] Test limiti free tier
- [ ] Test checkout Stripe (test mode)
- [ ] Test webhooks Stripe
- [ ] Test subscription management
- [ ] Test su mobile
- [ ] Test cross-browser

---

## 🎯 KPI e Metriche da Monitorare

### Pre-Payment (Fase 1-2)

- **User Acquisition:**
  - Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
  - Sign-up rate
  - Email signups (pre-launch)

- **Engagement:**
  - Backtests created per user
  - Time spent on platform
  - Return rate (% utenti che tornano)

- **Feature Usage:**
  - Templates più usati
  - Asset più selezionati
  - Comparison feature usage

### Post-Payment (Fase 3)

- **Conversion:**
  - Free → Premium conversion rate (target: 2-5%)
  - Trial → Paid conversion
  - Average time to conversion

- **Revenue:**
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - ARPU (Average Revenue Per User)
  - LTV (Lifetime Value)

- **Retention:**
  - Churn rate (target: <5%/mese)
  - Monthly retention cohorts
  - Subscription duration media

- **Support:**
  - Support tickets per utente
  - Average resolution time
  - Customer satisfaction score

---

## 📞 Supporto Clienti

### Opzioni per Customer Support

**Fase iniziale (< 100 utenti):**
- Email support: support@tuodominio.com
- FAQ page completa
- Knowledge base/docs

**Crescita (100-1000 utenti):**
- Live chat (Intercom, Crisp, Tawk.to)
- Help center (Notion, GitBook)
- Community Discord/Telegram

**Scala (1000+ utenti):**
- Ticketing system (Zendesk, Help Scout)
- Dedicated support team
- Phone support (premium users)

---

## 🚀 Launch Strategy

### Pre-Launch (2 settimane prima)

1. **Beta Testing**
   - 20-50 beta users
   - Raccogliere feedback
   - Fix bug critici

2. **Content Marketing**
   - Blog post launch announcement
   - Landing page ottimizzata
   - Social media teasers

3. **Email List**
   - Warm-up email sequence
   - Early bird discount (es. 20% off primi 100)

### Launch Day

1. **Comunicazione**
   - Email a lista beta/waitlist
   - Post su Reddit (r/investing, r/ETFs, r/personalfinance)
   - Post LinkedIn/Twitter
   - Product Hunt launch

2. **Monitoring**
   - Server uptime monitoring
   - Error tracking (Sentry)
   - Real-time analytics
   - Support pronto per domande

### Post-Launch (prime 2 settimane)

1. **User Onboarding**
   - Tutorial guidato
   - Email drip campaign
   - In-app tooltips

2. **Iteration**
   - Daily analytics review
   - Quick bug fixes
   - Feature tweaks based on feedback

3. **Growth**
   - Referral program
   - Content marketing
   - SEO optimization

---

## 💡 Raccomandazione Finale

**SEQUENZA CONSIGLIATA:**

### ✅ ADESSO (Questa settimana)
1. Deploy versione attuale (PIANO_DEPLOYMENT.md)
2. Aggiungi banner "🚀 Beta - Presto Premium"
3. Opzionale: Form email per early access

### ⏸️ Settimane 2-4
1. Raccogli feedback e analytics
2. Monitora utilizzo reale
3. Identifica pain points
4. Decidi modello monetizzazione

### 🔐 Mese 2
1. Implementa Firebase + Auth
2. Migra da localStorage a cloud
3. Aggiungi limiti free tier
4. Crea pricing page

### 💳 Mese 3
1. Integra Stripe
2. Implementa checkout flow
3. Launch piano Premium
4. Marketing e growth

---

## 📚 Risorse Utili

### Documentazione
- Firebase: https://firebase.google.com/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Clerk: https://clerk.com/docs

### Tutorial
- Firebase Auth con React: https://firebase.google.com/docs/auth/web/start
- Stripe Subscriptions: https://stripe.com/docs/billing/subscriptions/overview
- Vercel Functions: https://vercel.com/docs/functions

### Tools
- Stripe Test Cards: https://stripe.com/docs/testing
- Firebase Emulator: https://firebase.google.com/docs/emulator-suite
- Postman (API testing): https://www.postman.com

---

**Ultimo aggiornamento:** 26 Febbraio 2026

🎯 Obiettivo: Launch versione gratuita → Raccogliere feedback → Implementare auth → Lanciare Premium

**Prossimi step:** Seguire PIANO_DEPLOYMENT.md per mettere online la versione attuale!

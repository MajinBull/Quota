# 🏗️ Architettura Backend - Guida di Riferimento

## 📋 Overview

Questo documento spiega l'architettura serverless del progetto e quando/come aggiungere un backend in futuro.

**Ultimo aggiornamento**: Febbraio 2026

---

## 🎯 Architettura Attuale (Serverless - No Backend)

### Stack Tecnologico

```
┌─────────────────────────────────────┐
│  FRONTEND (React + Vite)            │
│  - TypeScript                       │
│  - Tailwind CSS                     │
│  - Zustand (state management)       │
│  - Recharts (grafici)               │
│  ↓                                  │
│  Deployed su: Vercel                │
└─────────────────────────────────────┘
           ↓ (Direct API calls via Firebase SDK)
┌─────────────────────────────────────┐
│  FIREBASE (Backend as a Service)    │
│  ├─ Authentication (Email + Google) │
│  ├─ Firestore Database (NoSQL)      │
│  ├─ Security Rules (server-side)    │
│  └─ Hosting logic (Google Cloud)    │
└─────────────────────────────────────┘
```

### ✅ Cosa NON Abbiamo (e Non Serve)

- ❌ Server Node.js/Express
- ❌ Database server tradizionale (MySQL/PostgreSQL)
- ❌ API REST custom
- ❌ Backend code su server fisico/VPS
- ❌ Load balancers
- ❌ Server configuration/maintenance

### ✅ Cosa Fornisce Firebase al Posto del Backend

| Funzionalità | Soluzione Tradizionale | Nostra Soluzione (Firebase) |
|--------------|------------------------|------------------------------|
| **Database** | MySQL/PostgreSQL server | Firestore (cloud NoSQL) |
| **Authentication** | JWT + custom code | Firebase Auth |
| **API Endpoints** | Express routes | Firestore SDK (direct calls) |
| **Security** | Middleware + validation | Security Rules |
| **File Storage** | Server filesystem | Firebase Storage |
| **Server Hosting** | AWS/DigitalOcean/VPS | Google Cloud Platform |
| **Scaling** | Manual load balancers | Auto-scaling automatico |
| **HTTPS/SSL** | Certificati manuali | Automatico |
| **DDoS Protection** | Cloudflare/custom | Incluso (Google) |

---

## 💰 Costi Attuali (Serverless)

### Firebase Free Tier (Spark Plan)

**Firestore Database**:
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

**Authentication**:
- Unlimited users
- Email/Password: free
- Google OAuth: free

**Hosting/Bandwidth**:
- 10 GB/month storage
- 360 MB/day bandwidth

### Vercel Free Tier

**Hosting**:
- 100 GB bandwidth/month
- Automatic HTTPS
- Unlimited deployments
- Vercel Analytics incluso

### 📊 Stima Costi Mensili

| Utenti Attivi | Firestore Reads | Firestore Writes | Costo Stimato |
|---------------|-----------------|------------------|---------------|
| 1-100 | < 50K/day | < 1K/day | **€0** (free tier) |
| 100-1,000 | 50K-500K/day | 1K-10K/day | **€5-15/mese** |
| 1,000-10,000 | 500K-5M/day | 10K-100K/day | **€50-150/mese** |

**Nota**: I costi crescono linearmente con l'uso, nessun costo fisso di server.

---

## ✅ Vantaggi Architettura Serverless

### 1. **Zero Manutenzione Server**
- No configurazione server
- No aggiornamenti OS/security patches
- No gestione uptime/monitoring
- Google gestisce infrastructure

### 2. **Scaling Automatico**
- 1 utente o 100,000 utenti → stesso setup
- Firebase scala automaticamente
- Pay-per-use (no costi fissi)

### 3. **Velocità di Sviluppo**
- No backend code da scrivere per CRUD
- No API REST da creare
- No deployment backend separato
- Focus su business logic

### 4. **Sicurezza Integrata**
- Security rules testate da Google
- HTTPS automatico (no certificati)
- DDoS protection inclusa
- Rate limiting automatico

### 5. **Developer Experience**
- Hot reload locale (Vite)
- Deploy in 1 click (Vercel)
- Real-time updates (Firestore)
- Type-safe (TypeScript)

---

## ⚠️ Quando Serve un Backend Custom

### Casi d'Uso che Richiedono Backend

#### 1. 💳 **Pagamenti (Stripe Integration)**

**Perché serve**:
- Stripe Secret Keys NON possono stare nel frontend
- Devi creare PaymentIntents server-side
- Webhook per conferme pagamento

**Soluzione Consigliata**: Vercel Serverless Functions

```javascript
// frontend/api/create-payment.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // €9.99 in cents
      currency: 'eur',
      metadata: { userId },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Costo**: €0 (incluso in Vercel free tier)

---

#### 2. 🤖 **Operazioni Automatiche (Cron Jobs)**

**Esempi**:
- Pulizia dati vecchi ogni notte
- Invio report mensili
- Update prezzi ETF giornaliero
- Reminder email settimanali

**Soluzione Consigliata**: Vercel Cron Jobs

```javascript
// frontend/api/cron/cleanup-old-data.js
// Triggered daily at midnight via vercel.json

export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete old backtests
    const oldBacktests = await db.collection('backtests')
      .where('savedAt', '<', thirtyDaysAgo)
      .where('isFavorite', '==', false)
      .get();

    const batch = db.batch();
    oldBacktests.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({
      deleted: oldBacktests.size,
      message: 'Cleanup completed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**vercel.json**:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-old-data",
    "schedule": "0 0 * * *"
  }]
}
```

**Costo**: €0 (free tier Vercel)

---

#### 3. 📧 **Email Custom / Notifications**

**Esempi**:
- Welcome email dopo signup
- Email reset password custom
- Notifiche marketing
- Report mensili via email

**Soluzione Consigliata**: Vercel Functions + SendGrid/Resend

```javascript
// frontend/api/send-welcome-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const { email, name } = req.body;

  try {
    await resend.emails.send({
      from: 'onboarding@quota.com',
      to: email,
      subject: 'Benvenuto su Quota!',
      html: `
        <h1>Ciao ${name}!</h1>
        <p>Grazie per esserti registrato su Quota.</p>
        <p>Hai 5 backtest gratuiti per iniziare!</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Costo**:
- Vercel Functions: €0 (free tier)
- Resend: €0 per primi 3,000 email/mese
- SendGrid: €0 per primi 100 email/day

---

#### 4. 👨‍💼 **Admin Operations**

**Esempi**:
- Attivare manualmente premium
- Gestire rimborsi
- Moderazione contenuti
- Analytics dashboard

**Soluzione Consigliata**: Firebase Admin SDK + Vercel Functions

```javascript
// frontend/api/admin/activate-premium.js
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  // Verify admin authentication
  const adminToken = req.headers.authorization?.split('Bearer ')[1];

  try {
    // Verify this is an admin user
    const decodedToken = await admin.auth().verifyIdToken(adminToken);
    const isAdmin = decodedToken.admin === true; // Custom claim

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { userId } = req.body;

    // Update user to premium
    await admin.firestore().collection('users').doc(userId).update({
      isPremium: true,
      premiumActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      message: 'User upgraded to premium'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Costo**: €0 (free tier)

---

#### 5. 🔗 **Integrazioni API Esterne**

**Esempi**:
- SMS notifications (Twilio)
- Webhook da servizi terzi
- Data enrichment (API esterne)
- Social media posting

**Soluzione**: Vercel Functions come middleware

```javascript
// frontend/api/webhooks/stripe.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update user to premium in Firestore
      await activatePremium(paymentIntent.metadata.userId);
      break;

    case 'customer.subscription.deleted':
      // Deactivate premium
      await deactivatePremium(event.data.object.customer);
      break;
  }

  res.json({ received: true });
}
```

---

#### 6. 📊 **Calcoli Pesanti / ML**

**Esempi**:
- Backtest molto complessi (> 10 secondi)
- Machine Learning predictions
- Portfolio optimization avanzata
- Data aggregation massiva

**Soluzione**:
- **Opzione A**: Vercel Functions (max 10s execution)
- **Opzione B**: Firebase Cloud Functions (max 540s)
- **Opzione C**: Dedicated backend se calcoli > 9 minuti

```javascript
// frontend/api/advanced-backtest.js
export const config = {
  maxDuration: 10, // seconds (Vercel Pro: 60s, Enterprise: 900s)
};

export default async function handler(req, res) {
  const { portfolio, settings } = req.body;

  try {
    // Heavy computation here
    const result = await runAdvancedBacktest(portfolio, settings);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🚀 Roadmap Architettura Suggerita

### **Fase 1: MVP - Solo Firebase** ✅ (Attuale)

```
Frontend (Vercel) → Firebase (Auth + Firestore)
```

**Quando**: Primi 100-1000 utenti
**Costo**: €0-10/mese
**Funzionalità**:
- Autenticazione
- Save/Load backtest
- Free tier limits

---

### **Fase 2: Monetizzazione - Aggiungi Stripe**

```
Frontend (Vercel) → Vercel Functions → Stripe API
                  ↓
              Firebase (Firestore)
```

**Quando**: Vuoi vendere premium
**Costo aggiuntivo**: €0 (free tier Vercel)
**File da creare**:
- `frontend/api/create-payment.js`
- `frontend/api/webhooks/stripe.js`
- `frontend/api/create-customer.js`

**Steps**:
1. Aggiungi Stripe SDK: `npm install stripe`
2. Crea 2-3 serverless functions
3. Configura webhook Stripe
4. Testa con Stripe test mode

---

### **Fase 3: Engagement - Email & Automation**

```
Frontend → Vercel Functions → Stripe / SendGrid / Twilio
        ↓
    Vercel Cron → Cleanup / Reports / Notifications
        ↓
    Firebase (Firestore + Auth)
```

**Quando**: Vuoi marketing automation
**Costo aggiuntivo**: €0-20/mese (SendGrid/Resend)
**Funzionalità**:
- Welcome emails
- Report mensili
- Reminder backtest
- Newsletter

---

### **Fase 4: Advanced - Firebase Functions**

```
Frontend → Vercel Functions → Payment / API Gateway
        ↓
    Firebase Functions → Triggers / Cron / Admin Ops
        ↓
    Firestore Database
```

**Quando**: Serve logic complessa server-side
**Costo aggiuntivo**: €10-50/mese (pay-as-go)
**Esempi**:
- Trigger onCreate user → send welcome email
- Trigger onUpdate isPremium → grant access
- Scheduled function → update ETF prices
- Background jobs → data aggregation

---

### **Fase 5: Enterprise - Backend Dedicato** (Solo se Necessario)

```
Frontend (Vercel) → API Gateway (Railway/Render)
                           ↓
                    Node.js Backend
                           ↓
                    PostgreSQL DB + Firebase
```

**Quando**:
- > 10,000 utenti attivi
- Calcoli molto complessi (> 15 minuti)
- Integrazioni enterprise complesse

**Costo**: €100-500/mese
**⚠️ Probabilmente NON necessario per questo progetto**

---

## 📚 Implementazione Pratica

### Come Aggiungere Vercel Serverless Functions

#### 1. Struttura File

```
frontend/
├── api/                         ← Nuova cartella
│   ├── create-payment.js        ← Stripe payment
│   ├── create-customer.js       ← Stripe customer
│   ├── send-email.js           ← Email sending
│   ├── webhooks/
│   │   └── stripe.js           ← Stripe webhooks
│   ├── admin/
│   │   └── activate-premium.js ← Admin ops
│   └── cron/
│       └── cleanup.js          ← Scheduled jobs
├── src/
├── package.json
└── vercel.json                  ← Config cron jobs
```

#### 2. Esempio Completo: Stripe Payment

**File**: `frontend/api/create-payment.js`

```javascript
import Stripe from 'stripe';
import admin from 'firebase-admin';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin (if not already)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user is authenticated
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get or create Stripe customer
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: { firebaseUid: userId },
      });
      customerId = customer.id;

      // Save to Firestore
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({ stripeCustomerId: customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // €9.99
      currency: 'eur',
      customer: customerId,
      metadata: {
        userId,
        plan: 'premium_monthly',
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      customerId,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

#### 3. Frontend Integration

**File**: `frontend/src/services/paymentService.ts`

```typescript
import { auth } from '../config/firebase';

export async function createPaymentIntent(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const token = await user.getIdToken();

  const response = await fetch('/api/create-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  const data = await response.json();
  return data.clientSecret;
}
```

#### 4. Environment Variables (Vercel)

Aggiungi in Vercel Dashboard → Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FIREBASE_PROJECT_ID=quota-8f121
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@quota-8f121.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

---

## 🔐 Security Best Practices

### 1. **Environment Variables**
```javascript
// ✅ CORRETTO
const apiKey = process.env.STRIPE_SECRET_KEY;

// ❌ SBAGLIATO - Mai hardcodare secrets
const apiKey = 'sk_live_1234567890abcdef';
```

### 2. **Authentication Verification**
```javascript
// ✅ CORRETTO - Verifica sempre il token
const token = req.headers.authorization?.split('Bearer ')[1];
const decodedToken = await admin.auth().verifyIdToken(token);

// ❌ SBAGLIATO - Mai fidarsi del client
const userId = req.body.userId; // Client può mandare qualsiasi userId!
```

### 3. **Rate Limiting**
```javascript
// Per production, aggiungi rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // Max 100 richieste per IP
});
```

### 4. **Input Validation**
```javascript
// ✅ CORRETTO
const { amount } = req.body;
if (!amount || amount < 100 || amount > 100000) {
  return res.status(400).json({ error: 'Invalid amount' });
}

// ❌ SBAGLIATO - Usare input senza validazione
await stripe.paymentIntents.create({ amount: req.body.amount });
```

---

## 💡 Quando NON Serve Backend

### ✅ Questi casi NON richiedono backend:

1. **CRUD Operations** → Firestore SDK diretto
2. **User Authentication** → Firebase Auth
3. **File Upload** → Firebase Storage (se serve)
4. **Real-time Updates** → Firestore onSnapshot
5. **Search/Filtering** → Firestore queries
6. **Analytics** → Vercel Analytics + Firebase Analytics
7. **Form Submission** → Firestore direct write
8. **User Preferences** → Firestore user doc

### ⚠️ Questi casi RICHIEDONO backend:

1. **Payments** → Stripe Secret Keys
2. **Email Sending** → SendGrid API
3. **Webhook Handling** → Endpoint server-side
4. **Admin Operations** → Privileged actions
5. **Scheduled Tasks** → Cron jobs
6. **Heavy Computations** → Server-side processing
7. **Third-party APIs** → API keys protection

---

## 📊 Monitoring & Performance

### Metriche da Monitorare (Free Tools)

**Vercel Analytics** (già integrato):
- Page views
- Core Web Vitals
- Real User Monitoring (RUM)
- Geographic distribution

**Firebase Console**:
- Authentication stats
- Firestore usage (reads/writes/deletes)
- Storage usage
- Security rules denials

**Browser DevTools**:
- Network requests timing
- Bundle size analysis
- Memory usage

### Performance Targets

| Metrica | Target | Attuale |
|---------|--------|---------|
| First Contentful Paint (FCP) | < 1.8s | ~1.5s |
| Largest Contentful Paint (LCP) | < 2.5s | ~2.0s |
| Time to Interactive (TTI) | < 3.8s | ~3.0s |
| Firestore Read Latency | < 100ms | ~50-80ms |
| Bundle Size (gzipped) | < 250 KB | ~192 KB |

---

## 🎯 Decision Tree: Serve un Backend?

```
Devo implementare una feature
         ↓
    Richiede secret keys? (Stripe, SendGrid, etc.)
         ↓ SÌ
    Usa Vercel Serverless Function
         ↓ NO
    Richiede operazioni privilegiate? (admin ops)
         ↓ SÌ
    Usa Vercel Function con Firebase Admin SDK
         ↓ NO
    Richiede cron job / scheduled task?
         ↓ SÌ
    Usa Vercel Cron Jobs o Firebase Scheduled Functions
         ↓ NO
    Richiede calcoli > 10 secondi?
         ↓ SÌ
    Usa Firebase Cloud Functions (max 540s)
         ↓ NO
    Richiede calcoli > 9 minuti?
         ↓ SÌ
    Considera backend dedicato (raro!)
         ↓ NO
    ✅ Usa solo Firebase (Firestore + Auth)
```

---

## 📚 Risorse & Link Utili

### Documentazione Ufficiale

- **Vercel Functions**: https://vercel.com/docs/functions
- **Vercel Cron Jobs**: https://vercel.com/docs/cron-jobs
- **Firebase Admin SDK**: https://firebase.google.com/docs/admin/setup
- **Firebase Cloud Functions**: https://firebase.google.com/docs/functions
- **Stripe API**: https://stripe.com/docs/api
- **Resend Email**: https://resend.com/docs

### Tutorial Consigliati

- Vercel + Stripe: https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe
- Firebase Admin: https://firebase.google.com/docs/auth/admin
- Serverless Patterns: https://www.serverless.com/examples

### Tools Utili

- **Stripe CLI**: Per testare webhook localmente
- **Postman**: Per testare API endpoints
- **Firebase Emulator**: Per testare Functions localmente

---

## ✅ Checklist Implementazione Backend

Quando aggiungi backend features in futuro:

### Pre-Implementation
- [ ] Valutare se è DAVVERO necessario (decisione tree)
- [ ] Scegliere tra Vercel Functions / Firebase Functions
- [ ] Pianificare struttura file/folder
- [ ] Identificare secret keys necessarie

### Implementation
- [ ] Creare file nella cartella `frontend/api/`
- [ ] Implementare authentication verification
- [ ] Aggiungere input validation
- [ ] Gestire error handling
- [ ] Testare localmente (`vercel dev`)

### Security
- [ ] Aggiungere environment variables in Vercel
- [ ] Mai hardcodare secrets nel codice
- [ ] Verificare sempre auth token
- [ ] Implementare rate limiting se pubblico

### Testing
- [ ] Test con dati mock
- [ ] Test con Stripe test mode (se payments)
- [ ] Test error cases
- [ ] Test in Vercel Preview deployment

### Deployment
- [ ] Deploy to preview
- [ ] Test in preview environment
- [ ] Deploy to production
- [ ] Monitor logs in Vercel dashboard

### Post-Deployment
- [ ] Verificare function execution in logs
- [ ] Monitorare errori
- [ ] Verificare costi Firebase/Stripe
- [ ] Documentare endpoint API

---

## 🎓 Conclusioni

### Riepilogo Architettura

**Attuale** (✅ Perfetto per MVP):
- Frontend: React + Vite su Vercel
- Backend: Firebase (serverless)
- Database: Firestore
- Auth: Firebase Auth
- Costo: €0-10/mese

**Prossimi Step** (quando serve):
1. Stripe → Aggiungi 2-3 Vercel Functions
2. Email → Aggiungi Resend + 1 Function
3. Admin → Aggiungi Firebase Admin SDK
4. Cron → Aggiungi Vercel Cron Jobs

**Backend Dedicato**: Probabilmente MAI necessario

### Principi Guida

1. **Start Simple**: Firebase è sufficiente per la maggior parte dei casi
2. **Add Incrementally**: Aggiungi backend solo quando serve
3. **Prefer Serverless**: Vercel/Firebase Functions > server tradizionale
4. **Monitor Costs**: Keep an eye su Firebase usage
5. **Security First**: Mai esporre secret keys

---

**Ultimo Aggiornamento**: Febbraio 2026
**Prossima Review**: Quando implementi Stripe payments

---

## 📞 Quick Reference

**Domanda**: Devo aggiungere una feature, serve backend?
**Risposta**: Controlla il Decision Tree a pagina 14

**Domanda**: Come aggiungo Stripe?
**Risposta**: Vedi "Fase 2: Monetizzazione" a pagina 10

**Domanda**: Quanto costa aggiungere backend?
**Risposta**: Vedi "Costi Comparazione" a pagina 3

**Domanda**: Vercel Functions vs Firebase Functions?
**Risposta**: Vercel per API/webhook, Firebase per triggers/cron

---

**Fine Documento** 🎉

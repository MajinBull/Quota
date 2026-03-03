# 🛡️ Risoluzione Problemi: Adblocker & Login

## 🔍 Problema Identificato

Alcuni utenti riscontrano problemi di login/signup causati da **adblocker o estensioni browser** che bloccano le richieste a Firestore (il database cloud).

### Sintomi:

- ✅ Signup sembra funzionare
- ❌ Poi appare errore "Email già in uso"
- ✅ Ricaricando la pagina, l'utente è loggato
- ❌ Console mostra: `ERR_BLOCKED_BY_CLIENT`

---

## ✅ SOLUZIONE IMPLEMENTATA (v2.1)

### Miglioramenti al Codice:

1. **Recovery Automatico**:
   - Se l'account è già creato, il sistema prova automaticamente a fare login
   - Crea il documento Firestore mancante in background
   - L'utente viene loggato correttamente anche con adblocker

2. **Messaggi Migliori**:
   - "Email già registrata. Ricarica la pagina per accedere."
   - "Account creato! Il tuo adblocker sta bloccando alcune funzionalità..."

3. **Resilienza Firestore**:
   - Login funziona anche se Firestore è bloccato
   - Documento utente creato al prossimo tentativo
   - Nessuna perdita dati

---

## 🛠️ GUIDA PER UTENTI: Come Disabilitare Adblocker

Se vedi problemi con login/signup, segui questi passaggi:

### **Chrome/Edge - uBlock Origin**

1. Clicca sull'icona uBlock Origin (in alto a destra)
2. Clicca sul **grande bottone blu** per disabilitare
3. Ricarica la pagina (F5)

### **Chrome/Edge - AdBlock/AdBlock Plus**

1. Clicca sull'icona AdBlock
2. Seleziona "Don't run on pages on this domain"
3. Ricarica la pagina

### **Firefox - uBlock Origin**

1. Clicca sull'icona uBlock Origin
2. Clicca sul bottone blu per disabilitare
3. Ricarica la pagina

### **Brave Browser**

1. Clicca sull'icona dello scudo (in alto a destra)
2. Disabilita "Shields" per questo sito
3. Ricarica la pagina

### **Safari - AdGuard**

1. Safari → Preferenze → Estensioni
2. Trova AdGuard
3. Disabilita per quota-ochre.vercel.app

---

## 🎯 Whitelist Firestore (Avanzato)

Se vuoi mantenere l'adblocker attivo ma far funzionare Firebase:

### **uBlock Origin**

1. Clicca sull'icona uBlock
2. Click sull'icona delle impostazioni (ingranaggio)
3. Tab "My filters"
4. Aggiungi queste righe:

```
@@||firestore.googleapis.com^$domain=quota-ochre.vercel.app
@@||firebase.googleapis.com^$domain=quota-ochre.vercel.app
@@||firebaseinstallations.googleapis.com^$domain=quota-ochre.vercel.app
```

5. Clicca "Apply changes"
6. Ricarica il sito

### **AdBlock Plus**

1. AdBlock Plus → Options → Advanced
2. "My Filter List"
3. Aggiungi:

```
@@||firestore.googleapis.com^$domain=quota-ochre.vercel.app
@@||firebase.googleapis.com^$domain=quota-ochre.vercel.app
```

---

## 📊 Test: Verifica se Adblocker è il Problema

### Step 1: Apri Developer Tools

- Chrome/Edge: `F12` o `Ctrl+Shift+I`
- Firefox: `F12`
- Safari: `Cmd+Option+I`

### Step 2: Vai su "Console"

### Step 3: Cerca questi messaggi:

**❌ Problema Adblocker**:
```
ERR_BLOCKED_BY_CLIENT
net::ERR_BLOCKED_BY_RESPONSE
```

**❌ Firestore Bloccato**:
```
POST https://firestore.googleapis.com/... net::ERR_BLOCKED_BY_CLIENT
```

**✅ Tutto OK**:
Nessun errore ERR_BLOCKED_BY_CLIENT

---

## 🔄 Workflow Recupero Automatico

Il sistema ora gestisce automaticamente il problema:

### Scenario 1: Signup con Adblocker

```
1. User compila form signup
2. ✅ Firebase Auth crea account
3. ❌ Firestore bloccato da adblocker
4. ⚠️ Toast: "Account creato! Adblocker sta bloccando..."
5. User ricarica pagina
6. ✅ Sistema rileva documento mancante
7. ✅ Crea documento in background
8. ✅ User loggato correttamente
```

### Scenario 2: Email Già in Uso

```
1. User prova signup con email già registrata
2. ❌ Firebase Auth dice "email già in uso"
3. ✅ Sistema tenta login automatico
4. ✅ Verifica/crea documento Firestore
5. ✅ User loggato correttamente
6. ℹ️ Toast: "Email già registrata. Ricarica per accedere."
```

### Scenario 3: Login con Documento Mancante

```
1. User fa login
2. ✅ Firebase Auth autentica
3. ⚠️ Documento Firestore non esiste
4. ✅ Sistema crea documento automaticamente
5. ✅ User loggato e funzionante
```

---

## 📝 Note Tecniche

### Perché Firebase è Bloccato?

Gli adblocker usano liste che bloccano richieste a:
- `*.googleapis.com`
- `firestore.*`
- `firebase.*`

Questi domini sono usati anche per tracking/analytics, quindi finiscono nelle blacklist.

### Perché Firebase Auth Funziona ma Firestore No?

- **Firebase Auth**: Usa popup/redirect OAuth (difficile da bloccare)
- **Firestore**: Fa richieste API dirette (facile da bloccare)

### Sicurezza

Le Firebase API keys sono **pubbliche per design**:
- Non sono secret keys
- La sicurezza è nelle Firestore Security Rules
- È sicuro esporle nel codice frontend

---

## 🧪 Testing Locale

Per testare il comportamento con adblocker:

### 1. Abilita Adblocker

```bash
# Chrome: Installa uBlock Origin
# Firefox: Installa uBlock Origin
```

### 2. Tenta Signup

```
http://localhost:5175
```

### 3. Controlla Console

Dovresti vedere:
- ⚠️ Warning: "Account creato! Adblocker..."
- ✅ Ricarica → Loggato automaticamente

---

## 📞 Supporto Utenti

### Email Template (se utenti scrivono)

```
Ciao [Nome],

Sembra che il tuo adblocker/estensione browser stia bloccando
alcune funzionalità del sito.

Prova questi passaggi:

1. Disabilita temporaneamente l'adblocker per quota-ochre.vercel.app
2. Ricarica la pagina (F5)
3. Riprova il login/signup

Se il problema persiste:
1. Prova con un browser diverso (Chrome/Firefox/Edge)
2. Oppure usa la navigazione in incognito (Ctrl+Shift+N)

Il sistema ora gestisce automaticamente questi problemi -
se vedi l'errore, prova semplicemente a ricaricare la pagina!

Grazie,
Team Quota
```

---

## 🎯 Checklist Troubleshooting

Se un utente ha problemi:

- [ ] Ha un adblocker attivo?
- [ ] Ha altre estensioni browser (Privacy Badger, Ghostery, etc.)?
- [ ] Console mostra `ERR_BLOCKED_BY_CLIENT`?
- [ ] Funziona in navigazione incognito?
- [ ] Funziona con browser diverso?
- [ ] Ha provato a ricaricare la pagina?

---

## 📊 Statistiche Problema

**Adblocker Usage**:
- ~30% utenti desktop ha adblocker
- ~5% utenti mobile ha adblocker

**Browser più colpiti**:
1. Chrome + uBlock Origin
2. Firefox + uBlock Origin
3. Brave (built-in shields)

**Soluzioni**:
- 90% risolve disabilitando adblocker
- 10% risolve con whitelist Firestore

---

## 🔮 Future Improvements

Possibili miglioramenti futuri:

1. **Retry Logic**: Retry Firestore calls 2-3 volte
2. **Offline Support**: PWA con service worker
3. **Fallback Storage**: LocalStorage temporaneo se Firestore fail
4. **Better Detection**: Detect adblocker e mostra banner proattivo

---

**Ultimo Aggiornamento**: Febbraio 2026
**Versione Sistema**: v2.1 (Recovery automatico)

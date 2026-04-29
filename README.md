# Soprannomi Osteria Contemporanea - Sito Web

Sito statico (HTML + CSS + JS vanilla, TailwindCSS via CDN) per Soprannomi Osteria Contemporanea (Bari).
Tracking conversioni Google Ads via Google Tag Manager + Consent Mode v2.

## Struttura

```
soprannomi_site/
├── index.html          # Home
├── menu.html           # Menu
├── chi-siamo.html      # Chi siamo / Chef
├── contatti.html       # Contatti + mappa
├── prenota.html        # Form prenotazione (apre WhatsApp precompilato)
├── 404.html            # Pagina errore
├── css/
│   └── styles.css
├── js/
│   ├── tracking.js     # Eventi GTM (phone, whatsapp, map, menu, reservation)
│   └── main.js         # Mobile menu + cookie consent (Consent Mode v2)
├── images/
│   └── favicon.svg     # Favicon (placeholder, da sostituire)
├── robots.txt
├── sitemap.xml
├── manifest.json
├── _headers            # Cache + security (Cloudflare Pages / Netlify)
├── _redirects          # URL rewrite (Cloudflare Pages / Netlify)
└── README.md
```

## Setup iniziale (cosa devi sostituire)

### 1) GTM Container ID
Cerca e sostituisci `GTM-XXXXXXX` in **tutti i file HTML** con il tuo ID (es. `GTM-AB12CDE`).
Comando rapido (Bash/Linux/macOS):
```bash
sed -i 's/GTM-XXXXXXX/GTM-TUO-ID/g' *.html
```
Su Windows con PowerShell:
```powershell
Get-ChildItem *.html | ForEach-Object { (Get-Content $_) -replace 'GTM-XXXXXXX','GTM-TUO-ID' | Set-Content $_ }
```

### 2) Numero di telefono / WhatsApp
Tutto e' gia' impostato a `+39 329 858 6462` / `393298586462`. Se cambia, fai find/replace.

### 3) Indirizzo
Tutto gia' su `Via Giuseppe Re David 14, Bari`.

### 4) Immagini
Le immagini in homepage/menu/chi-siamo sono placeholder da Unsplash. Per produzione:
- Genera le immagini AI usando i prompt in `../soprannomi_ads/pmax_ai_image_prompts.md`.
- Salvale in `images/` come `hero.jpg`, `pasta-orecchiette.jpg`, `chef-fasano.jpg`, ecc.
- Aggiorna gli `<img src="...">` nei file HTML.

### 5) Favicon e Open Graph
- `images/favicon.svg` e' un placeholder. Sostituisci con il logo definitivo.
- `images/og-image.jpg` (1200x630px) per Open Graph: caricala manualmente.

### 6) Privacy / Cookie pages
Crea `privacy.html` e `cookie.html` (mancano dal pacchetto: testi legali da chiedere a un avvocato/consulente).

## Configurazione GTM (passi nell'interfaccia)

Vai in **https://tagmanager.google.com/**, crea un container web per il dominio.

### Variabili da creare
- `Conv ID Google Ads` (Costante): valore = `AW-XXXXXXXXXX`

### Trigger
1. **Custom Event**: `phone_click`
2. **Custom Event**: `whatsapp_click`
3. **Custom Event**: `map_click`
4. **Custom Event**: `menu_engagement`
5. **Custom Event**: `reservation_submit`

### Tag (Google Ads Conversion Tracking)
Per ognuno dei trigger sopra, crea un tag tipo "Google Ads Conversion Tracking":
- Conversion ID: `{{Conv ID Google Ads}}`
- Conversion Label: dal Google Ads (uno per ogni azione di conversione)
- (Opzionale) Conversion Value: 25 / 20 / 5 / 3 / 30 EUR a seconda dell'azione

### Consent Mode v2
I tag di conversione si attivano SOLO con consenso. Configurali con:
- Built-in consent checks: Required = `ad_storage`, `analytics_storage`

Pubblica il container.

## Form prenotazione

Il form non manda email: costruisce un messaggio WhatsApp precompilato e apre `wa.me/393298586462?text=...`. Quando l'utente preme invio in WhatsApp, ti arriva il messaggio direttamente sul telefono del ristorante.

Vantaggi:
- Niente backend / server / database
- Nessuna privacy data leak (niente email salvata)
- L'utente conferma in 1 click su WhatsApp (canale familiare)
- Si traccia automaticamente come conversione `reservation_submit` + `whatsapp_click`

Se in futuro vuoi raccogliere le richieste anche via email, puoi integrare:
- **Formspree** (`https://formspree.io`) - 50 invii/mese gratis
- **Web3Forms** (`https://web3forms.com`) - 250/mese gratis
- **Netlify Forms** se hosti su Netlify - 100/mese gratis

## Deploy su Cloudflare Pages (consigliato)

1. Crea repo Git (GitHub/GitLab/Bitbucket) con questi file.
2. Vai su **https://dash.cloudflare.com/?to=/:account/pages**.
3. **Create a project** -> **Connect to Git** -> seleziona repo.
4. Configurazione build:
   - Build command: *(lascia vuoto)*
   - Build output directory: `/`
5. Deploy. Avrai un URL `<project>.pages.dev`.
6. Dominio custom: in Pages -> Custom domains -> aggiungi `www.soprannomiosteriacontemporanea.it` (richiede modifica DNS).

## Deploy su Netlify

1. **https://app.netlify.com/start** -> Drag & drop la cartella `soprannomi_site/`.
2. Oppure connetti repo Git.
3. Stesse istruzioni: niente build command, output `/`.

## Deploy via FTP (hosting tradizionale)

Carica tutti i file mantenendo la struttura nella root del dominio (`public_html/` o equivalente).

## Test pre-lancio

- [ ] Naviga tutte le pagine da mobile e desktop
- [ ] Click su tel: -> apre app telefono
- [ ] Click su WhatsApp -> apre WhatsApp con messaggio
- [ ] Click su mappa -> apre Google Maps
- [ ] Form prenotazione -> apre WhatsApp con dati precompilati
- [ ] Lighthouse score: tutte le pagine ≥ 90 (Performance, Accessibility, SEO)
- [ ] Cookie banner: accetta -> verifica che gli eventi GTM passino in `granted`
- [ ] Tag Assistant Companion (Chrome ext): tutti gli eventi `dataLayer.push` visibili
- [ ] Schema.org Restaurant valida su https://validator.schema.org/

## Performance

Stack ottimizzato:
- **Tailwind via CDN**: ~30kb gzip (vs WordPress 200kb+ minimo)
- **Niente framework JS**: vanilla
- **Font Google preconnessi**: woff2
- **Lazy loading immagini**: nativo
- **Cache headers aggressivi** (1 anno per asset statici)

Lighthouse atteso: 95+ su tutte le metriche (con immagini ottimizzate <200kb cad).

## Manutenzione

- Cambio menu: modifica `menu.html` direttamente, ricarica.
- Cambio orari: modifica i 4 file (footer + contatti + Schema.org JSON-LD in `index.html`).
- Per evitare modifiche in 4 file: considera migrazione futura ad **Astro** (componenti riutilizzabili).

# BLP Backend — API + Database

Yeh backend aapke `blp-homepage-enhanced.html` ke teeno live forms ko real data se jodta hai:

| Frontend section        | Endpoint                    | Kaam                              |
|--------------------------|------------------------------|------------------------------------|
| "Join Us" member card    | `POST /api/members`         | Naya member save karta hai, `memberId` return karta hai |
| "People's Desk"          | `POST /api/desk`             | Problem/Suggestion/Grievance save karta hai |
| Footer Newsletter        | `POST /api/newsletter`       | Email subscribe karta hai |
| Impact strip counters    | `GET /api/stats/overview`    | Real counts frontend par dikhane ke liye |

**Database:** SQLite (`data/blp.db` file — ek chhoti party website ke liye bilkul kaafi hai, aur zero-cost hai). Chaho to baad me Postgres pe switch kar sakte ho — schema `db.js` me hi hai.

---

## 1. Local par chalana

```bash
cd blp-backend
npm install
cp .env.example .env      # phir .env kholke ADMIN_KEY change kar do
npm start
```

Server `http://localhost:4000` par chalega. Test karo:

```bash
curl http://localhost:4000/api/health
```

`ALLOWED_ORIGINS` me apni frontend URL daalna mat bhoolo (local test ke liye `http://localhost:5500` jaisa kuch, jahan aap HTML file open kar rahe ho — VS Code ke "Live Server" extension se).

---

## 2. Admin endpoints (submissions dekhne ke liye)

In endpoints ke liye `x-admin-key` header chahiye (`.env` me set kiya wahi):

```bash
curl -H "x-admin-key: YOUR_ADMIN_KEY" http://localhost:4000/api/members
curl -H "x-admin-key: YOUR_ADMIN_KEY" http://localhost:4000/api/desk
curl -H "x-admin-key: YOUR_ADMIN_KEY" http://localhost:4000/api/newsletter
```

Abhi ke liye yeh simple curl/Postman se dekhne ke liye hai. Baad me chaho to ek chhota admin dashboard page bhi bana sakte hain.

---

## 3. Hosting par deploy karna (free tier options)

Ye backend kisi bhi Node.js hosting par chal jayega. Do aasaan (free-tier) options:

### Option A — Render.com
1. Is `blp-backend` folder ko GitHub repo me push karo.
2. Render.com par "New → Web Service" → apna repo connect karo.
3. Build command: `npm install`, Start command: `npm start`.
4. Environment tab me `.env` ki saari variables daal do (`PORT` Render khud set karta hai, baaki teeno daalo).
5. Deploy hone ke baad aapko ek URL milega jaisे `https://blp-backend.onrender.com`.

### Option B — Railway.app
Same process — repo connect karo, env vars daalo, deploy. Railway bhi free starter tier deta hai.

**Note:** SQLite file disk par rehti hai. Render/Railway ke free tier me disk ephemeral ho sakti hai (restart pe data reset ho sakta hai) — production ke liye unka **persistent disk / volume** add-on use karna, ya phir Postgres pe switch karna behtar rahega jab traffic badhe.

---

## 4. Domain kaise lein aur connect karein

### Step 1 — Domain kharido
India ke liye popular registrars: **BigRock, Namecheap, GoDaddy, Google Domains (ab Squarespace)**. `.org` political party ke liye common choice hai (jaise humne placeholder `blp.example.org` use kiya tha), `.in` bhi accha option hai.
- Approx cost: `.in` ~₹500-800/year, `.org` ~₹900-1200/year.

### Step 2 — Frontend host karo
HTML file ko kisi static hosting par daalo — **Netlify, Vercel, ya Cloudflare Pages** (sab free tier dete hain, aur custom domain bhi free me attach hota hai).
1. Netlify/Vercel par naya project banao, HTML file (ya poora repo) upload/connect karo.
2. Unke "Domain settings" me apna kharida hua domain add karo.
3. Woh aapko DNS records denge (usually ek `A` record ya `CNAME`) — inhe apne domain registrar (BigRock/Namecheap) ke DNS panel me jaake add kar do.
4. DNS propagate hone me 15 min se 24 ghante lag sakte hain. SSL (https) automatically free milta hai (Let's Encrypt).

### Step 3 — Backend ko subdomain do
Backend ko alag se host kiya hai (Render/Railway), toh usko ek subdomain do jaise `api.blpindia.org`:
1. Render/Railway ke "Custom Domain" settings me `api.blpindia.org` add karo.
2. Woh ek `CNAME` target denge — usko apne domain registrar ke DNS panel me `api` subdomain ke against add kar do.
3. Backend ke `.env` me `ALLOWED_ORIGINS=https://blpindia.org,https://www.blpindia.org` update karo.
4. Frontend HTML me `API_BASE` ko `https://api.blpindia.org` set kar do (neeche section 5 dekho).

Final setup:
```
https://blpindia.org        →  Frontend (Netlify/Vercel)
https://api.blpindia.org    →  Backend (Render/Railway) + SQLite DB
```

---

## 5. Frontend ko backend se connect karna

Maine aapki HTML file me already yeh badlaav kar diye hain (dekhein `blp-homepage-enhanced__with-backend.html`):
- Top par ek `API_BASE` variable add kiya hai — deploy karte waqt isko apne backend URL se replace kar dena (`http://localhost:4000` se `https://api.blpindia.org`).
- "Join Us" form ab `POST /api/members` call karta hai aur real `memberId` backend se leta hai.
- "People's Desk" form ab `POST /api/desk` call karta hai.
- Newsletter form ab `POST /api/newsletter` call karta hai.
- Impact strip ka "People's Desk submissions" counter page load par real number `GET /api/stats/overview` se lekar update ho jata hai.

Bas file me `API_BASE` change karke deploy kar dena — baaki sab already wired hai.

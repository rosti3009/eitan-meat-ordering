# 🥩 איתן מעדני בשר – WhatsApp Ordering System

A mobile-first web ordering system for Eitan Meat Delicacies, Eilat.

---

## 📂 File Structure

```
eitan-meat/
├── index.html          ← Main app (HTML + CSS + JS in one file)
├── manifest.json       ← PWA manifest (Add to Home Screen)
├── data/
│   └── products.js     ← ✏️ Edit products, prices here
└── README.md
```

---

## ⚙️ Configuration (Before Going Live)

### 1. Set WhatsApp Number
Open `data/products.js` and edit:
```js
const BUSINESS_CONFIG = {
  phone: "972504340274",  // ← Replace with real number (no +, no spaces)
  ...
};
```
Format: `972` + number without leading 0.
Example: `050-1234567` → `"972501234567"`

### 2. Set Order Cutoff Time
```js
orderCutoffDay: 2,   // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
orderCutoffHour: 12, // 12 = noon
deliveryDay: "חמישי",
```

### 3. Edit Products
Each product in `data/products.js`:
```js
{
  id: "unique-id",
  category: "beef",       // beef | chicken | kabab | deals | bundles
  name: "שם המוצר",
  description: "תיאור קצר",
  price: 189,             // Price in ILS
  unit: "ק\"ג",           // ק"ג / יחידה / חבילה / מארז
  image: "URL",           // Direct image URL
  vip: true,              // Shows VIP badge
  badge: "💥 מבצע",       // Optional promo badge (null to hide)
}
```

---

## 🖥️ Run Locally

### Option A – Open directly
Just double-click `index.html` in your browser. That's it.

### Option B – Local server (recommended)
```bash
# With Python
cd eitan-meat
python3 -m http.server 8080
# Open: http://localhost:8080

# With Node.js
npx serve .
# Open shown URL
```

---

## 🚀 Deploy Online (Free)

### Vercel (Recommended – Fastest)
1. Go to https://vercel.com → Sign up (free)
2. Install CLI: `npm i -g vercel`
3. In the `eitan-meat` folder: run `vercel`
4. Follow prompts → get a live URL like `https://eitan-meat.vercel.app`

### Netlify (Drag & Drop)
1. Go to https://app.netlify.com/drop
2. Drag the entire `eitan-meat` folder onto the page
3. Get instant live URL

### GitHub Pages
1. Push folder to GitHub repo
2. Go to repo Settings → Pages → Source: main branch / root
3. Live at `https://yourusername.github.io/eitan-meat/`

---

## 📱 PWA – Add to Home Screen

The app supports "Add to Home Screen" on iOS and Android:
- iOS: Safari → Share button → "Add to Home Screen"
- Android: Chrome → Menu → "Add to Home Screen"

To update the PWA icon, replace the placeholder URLs in `manifest.json` with real 192×192 and 512×512 PNG icons.

---

## 📋 How the WhatsApp Order Works

1. Customer browses products → adds to cart
2. Taps "לפרטי ההזמנה" → fills name, phone, city, order type
3. Taps "שלח הזמנה בוואטסאפ"
4. WhatsApp opens with a pre-filled formatted message
5. Customer sends → you receive the order on your phone

---

## 🔧 Common Edits

| What to change | Where |
|---|---|
| WhatsApp number | `data/products.js` → `BUSINESS_CONFIG.phone` |
| Products & prices | `data/products.js` → `PRODUCTS` array |
| Categories | `data/products.js` → `CATEGORIES` array |
| Order cutoff day/time | `data/products.js` → `BUSINESS_CONFIG` |
| Business name | `index.html` → search "איתן מעדני בשר" |
| Hero image | `index.html` → `#hero-img` src attribute |
| Color scheme | `index.html` → `:root` CSS variables |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary background | `#080808` |
| Deep red | `#8b1a1a` |
| Gold accent | `#c9983a` |
| Off-white text | `#f5f0e8` |
| Display font | Frank Ruhl Libre (Hebrew serif) |
| Body font | Heebo (Hebrew sans-serif) |

# HomeBuddy React (Frontend)

Next.js (App Router) frontend för HomeBuddy e‑handel. Innehåller både kundsidor och admin‑UI.

## Snabbstart (lokalt)

1. Installera dependencies:

```bash
npm install
```

2. Sätt API‑URL (exempel):
- `NEXT_PUBLIC_API_URL=https://localhost:7039`

3. Kör:

```bash
npm run dev
```

## Hur det fungerar (simpelt, tekniskt)

### Dataflöde
- Frontend anropar backend via `apiClient` som automatiskt skickar `Authorization: Bearer <token>` när token finns.
- Produktsidor/listningar använder publika endpoints (`/api/products`, `/api/groups/...`, `/api/categories`).

### Auth (kund + admin)
- Login/register via `/api/auth/*`.
- Token sparas i `localStorage`.
- **Sessionvalidering**: `authService.checkAuth()` anropar **`GET /api/auth/me`** (server‑validerad identitet), inte bara lokal JWT‑decode.
- Admin-login via `/admin/login` ger Admin‑roll i JWT.

### Forgot/Reset password (förberett för e‑post)
- `/forgot-password` → `POST /api/auth/forgot-password`. I development kan token returneras för test (utan e‑posttjänst).
- `/reset-password` → `POST /api/auth/reset-password` med `email + token + newPassword`.

### Cookie consent & Analytics
- Cookie policy + banner finns.
- Google Analytics laddas **först efter** att användaren accepterat cookies (via `AnalyticsGate`).

### Shop, sök och filter
- `/shop` och `/shop/[category]` använder backend‑filter (Search/Category/Color/Size/MinPrice/MaxPrice) + sortering.
- `/shop/[category]/[product]` visar produktgrupp, varianter, recensioner och variant‑selector.

### Deals / Rabatter
- `/deals` visar rabatterade varor (backend: `ListPrice > Price`).
- UI visar ordinarie pris överstruket + rabatt‑badge.

### Kundvagn & checkout
- Cart drawer: lägg till/ta bort, uppdatera antal.
- Checkout: sammanfattning + landval (för moms).
  - **Obs:** betalning är UI‑mässig; riktig betalningsleverantör är inte integrerad än.

### Profil
- `/profile`: orderhistorik, favoriter, adressbok, kontoinställningar, konto‑radering.

### Favoriter (wishlist)
- `/favorites` + favoritknappar använder backend favorites‑endpoints (kräver User‑JWT).

### Adminpanel
- `/admin`: admin‑dashboard med sektioner för Admins, Users, Reviews, Orders, Product Groups, Variants (lager), Categories och **Kampanjer** (grupprabatter).

## Kravspec – uppfyllelse (kort)

✅ Finns i kod:
- Registrering/inloggning med JWT + roller (User/Admin)
- Produktlistning + produktsida + sök/filter
- Kundvagn + checkout‑flöde + orderbekräftelse (orderNo) i UI
- Mitt konto + orderhistorik + favoriter + recensioner
- Adminpanel för katalog, orders, users, dashboard och kampanjer (grupprabatter)

⚠️ Delvis:
- Tillgänglighet (WCAG) och full compliance‑arbete återstår (audit + åtgärder).

❌ Kräver externa integrationer:
- Betalningsleverantör (Stripe/Klarna) + orderbekräftelse via e‑post
- Frakt/tracking/returer/återbetalningar

## Länk

`https://homebuddy-react-aedac9f5ckbbfmcm.norwayeast-01.azurewebsites.net/`

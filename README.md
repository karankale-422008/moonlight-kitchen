# 🌙 Moonlight Kitchen — Professional Online Food Ordering Website

> **"GOOD FOOD • BRIGHT MOOD"**  
> A production-grade, responsive, full-stack food-ordering web application inspired by the clean UX of Zomato and Swiggy, built with modern React 19, TypeScript, Tailwind CSS v4, and persistent backend integration with Supabase and WhatsApp click-to-chat dispatch.

---

## 📋 Table of Contents
1. [Menu & Original PDF Source of Truth](#-menu--original-pdf-source-of-truth)
2. [Key Features & System Architecture](#-key-features--system-architecture)
3. [Design & Brand Identity](#-design--brand-identity)
4. [WhatsApp Ordering Workflow](#-whatsapp-ordering-workflow)
5. [Database Architecture & Supabase Integration](#-database-architecture--supabase-integration)
6. [Owner Configuration & Admin Dashboard](#-owner-configuration--admin-dashboard)
7. [Installation & Local Setup](#-installation--local-setup)
8. [Deployment Instructions (Vercel & Supabase)](#-deployment-instructions)
9. [Comprehensive Testing Report](#-comprehensive-testing-report)

---

## 🍕 Menu & Original PDF Source of Truth

Every single item, category, price, and variant was extracted directly from the official **"Moonlight Kitchen.pdf"** without any fabricated items or arbitrary prices.

### Extracted Menu Structure (61 Total Items):

1. **PIZZA (Page 1)**
   - Plain cheese margharita pizza — ₹89 (Veg)
   - Onion cheese pizza — ₹99 (Veg)
   - Capsicum Che Pizza — ₹99 (Veg)
   - Corn cheese pizza — ₹99 (Veg)
   - Mix Veg cheese pizza — ₹119 (Veg)
   - Veg Paradise cheese pizza — ₹129 (Veg)
   - Veg cheese burst pizza — ₹149 (Veg)
   - Paneer cheese pizza — ₹149 (Veg)
   - Corn Paneer cheese pizza — ₹159 (Veg)
   - Paneer cheese burst pizza — ₹169 (Veg)
   - Paneer Tandoori pizza — ₹179 (Veg)

2. **BURGER (Page 1)**
   - Veg burger — ₹59 (Veg)
   - Veg cheese burger — ₹79 (Veg)

3. **SANDWICH (Page 1)**
   - Plain cheese Chutney sandwich — ₹49 (Veg)
   - Plain cheese Chutney grill sandwich — ₹65 (Veg)
   - Veg club sandwich — ₹69 (Veg)
   - Veg Club Grill Sandwich — ₹85 (Veg)
   - Cheese, corn grill sandwich — ₹89 (Veg)

4. **JOMBO SANDWICH (Page 1)**
   - Bombay masala grill sandwich — ₹139 (Veg)
   - Veg cheese sandwich — ₹139 (Veg)
   - Cheese corn Paneer grill sandwich — ₹149 (Veg)

5. **FRIES BOWL (Page 1 — Regular & Oil-Free Variants)**
   - Salted fries bowl — ₹59 (Veg)
   - Salted fries bowl without oil — ₹79 (Veg)
   - Peri Peri masala fries bowl — ₹69 (Veg)
   - Peri Peri masala fries without oil — ₹89 (Veg)
   - Cheese fries bowl — ₹89 (Veg)
   - Cheese fries bowl without oil — ₹109 (Veg)
   - Tandoori fries bowl — ₹89 (Veg)
   - Tandoori fries bowl without oil — ₹109 (Veg)
   - Cheese Tandoori fries bowl — ₹99 (Veg)
   - Cheese Tandoori fries bowl without oil — ₹119 (Veg)

6. **MAGGI (Page 1)**
   - Plain Maggi — ₹49 (Veg)
   - Plain cheese Maggi — ₹69 (Veg)
   - Masala Maggi — ₹59 (Veg)
   - Masala cheese, Maggi — ₹79 (Veg)
   - Veggies Maggi — ₹79 (Veg)
   - Cheese veggies Maggi — ₹99 (Veg)

7. **COLD BEVERAGES (Page 2)**
   - Regular cold Coffee — ₹39 (Veg)
   - Special thik cold coffee — ₹55 (Veg)
   - KitKat shake — ₹99 (Veg)
   - Oreo shake — ₹99 (Veg)
   - Green Apple mojito — ₹89 (Veg)
   - Mint mojito — ₹89 (Veg)
   - Watermelon mojito — ₹89 (Veg)
   - Blue Lagoon mojito — ₹99 (Veg)

8. **BIRYANI (Page 2 — Half & Full Variants)**
   - Hyderabadi chicken dum biryani — Half: ₹130 / Full: ₹170 (Non-Veg)
   - Tandoori chicken dum biryani — Half: ₹140 / Full: ₹180 (Non-Veg)
   - Lucknow chicken dum biryani — Half: ₹150 / Full: ₹190 (Non-Veg)
   - Veg dum biryani — Half: ₹110 / Full: ₹150 (Veg)

9. **SPECIAL COMBO (Page 2)**
   - 1. Burger Buddy (Veg Burger + Salted Fries Bowl) — ₹99 (Veg)
   - 2. Burger & Mojito (Veg Burger + Mint Mojito) — ₹129 (Veg)
   - 3. Sandwich & Coffee (Cheese Corn Grill Sandwich + Regular Cold Coffee) — ₹119 (Veg)
   - 4. Maggi Munch (Masala Maggi + Mint Mojito) — ₹129 (Veg)
   - 5. Cheesy Burger Treat (Veg Cheese Burger + Regular Cold Coffee) — ₹109 (Veg)
   - 6. Biryani & Mojito Meal (Hyderabadi Chicken Dum Biryani Half + Mint Mojito) — ₹199 (Non-Veg)

10. **PIZZA + FRIES + DRINK COMBOS (Page 2)**
    - 1. Pizza Pocket Combo (Plain Cheese Margarita Pizza + Salted Fries + Mint Mojito) — ₹199 (Veg)
    - 2. Cheesy Pizza Combo (Onion Cheese Pizza + Salted Fries + Green Apple Mojito) — ₹209 (Veg)
    - 3. Moonlight Special Pizza Combo (Mix Veg Cheese Pizza + Salted Fries + Blue Lagoon Mojito) — ₹239 (Veg)

11. **BURGER + FRIES + DRINK COMBOS (Page 2)**
    - 4. Burger Starter Combo (Veg Burger + Salted Fries + Regular Cold Coffee) — ₹129 (Veg)
    - 5. Cheesy Burger Combo (Veg Cheese Burger + Salted Fries + Special Thick Cold Coffee) — ₹169 (Veg)
    - 6. Moonlight Loaded Burger Combo (Veg Cheese Burger + Cheese Fries + Green Apple Mojito) — ₹229 (Veg)

### Delivery & WhatsApp Contact:
- **Free Home Delivery**: On orders above ₹299 (exact rule from PDF).
- **Official Kitchen WhatsApp**: `+91 76664 45477` (`917666445477`).
- **Partner Aggregator**: Zomato listed.

---

## 🛠 Key Features & System Architecture

- **Interactive Food Discovery**: Smooth category chips navigation with live item counts, keyword search (`/` shortcut), Veg/Non-Veg filter, Bestseller filter, and price/popularity sorting.
- **Dynamic Variant Customization**: Portion sizes (e.g. Biryani Half/Full), add-ons (Extra Cheese, Dips, Raita, Salan), and custom cooking instructions modal.
- **Persistent Cart Engine**: Synchronized with client storage; calculates subtotal, packaging, free delivery progress meter, and coupon discounts (`MOONLIGHT10`, `MOONLIGHT50`, `WELCOME20`).
- **Adaptive Dual-Layout**: Persistent right-side basket panel on desktop widescreen (`xl:block`) + slide-out drawer on tablet/mobile with a sticky bottom checkout bar.
- **Customer Account & Address Book**: Supports multiple saved addresses (Home, Work, Other), default address selection, and mobile phone verification.
- **Order History & One-Click Reorder**: Inspects current menu prices and stock before re-populating the cart to ensure no stale pricing is used.
- **Protected Kitchen Admin Portal**: Passcode-protected (`moonlight2026`) owner portal to update order statuses, toggle item stock availability, and adjust live prices.

---

## 📲 WhatsApp Ordering Workflow

1. Customer selects dishes, variants, and enters/selects delivery address.
2. The order is authoritative: price is computed and validated decimal-safely.
3. An order record is saved to the persistent database with status **"Awaiting Kitchen Confirmation"**.
4. A cleanly structured order text is generated matching the official template.
5. WhatsApp is opened via `https://wa.me/917666445477?text=...`.
6. Customer is explicitly prompted to tap **"Send"** in WhatsApp. Orders are confirmed only once Moonlight Kitchen replies.

---

## 🗄 Database Architecture & Supabase Integration

The project includes complete PostgreSQL schema migrations in `supabase/schema.sql` with Row Level Security (RLS) policies:

- `menu_items`: Base prices, categories, dietary types, variants, add-ons, availability.
- `profiles`: Customer ID, verified phone, full name, email.
- `customer_addresses`: Address fields, landmark, default flag, delivery instructions.
- `orders`: Unique reference (`MK-YYYYMMDD-XXXX`), snapshots of customer details and address, pricing summary, payment preference, status.
- `order_items`: Line items with snapshots of unit prices and selected options.
- `restaurant_settings`: Configurable operating settings.

> **Seamless Dual Mode**: If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured in `.env`, the app reads and writes directly to Supabase. When unset in development, the app uses an integrated persistent storage provider so 100% of the customer and admin features run out of the box with zero setup friction!

---

## ⚙ Owner Configuration & Admin Dashboard

All restaurant settings are centralized in `src/config/restaurant.ts`:
- Restaurant name, tagline, and display phone.
- Free delivery threshold (`299`).
- Operating hours (`11:00 AM – 11:30 PM`).
- Standard delivery fee (`₹30` for orders below ₹299).
- Admin passcode (`moonlight2026`).

To access the owner dashboard:
1. Click the discreet **Shield/Lock** icon in the header.
2. Enter the owner passcode: `moonlight2026`.
3. Switch between **Orders**, **Menu & Prices**, and **Performance Stats**.

---

## 🚀 Installation & Local Setup

```bash
# 1. Clone or navigate to the project directory
cd moonlight-kitchen

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 🚢 Deployment Instructions

### Deploy to Vercel:
1. Push the code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Moonlight Kitchen"
   ```
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Framework Preset: **Vite**.
4. Set Environment Variables (optional, for Supabase backend):
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon public key
   - `VITE_RESTAURANT_WHATSAPP` = `917666445477`
5. Click **Deploy**.

### Supabase Setup (Optional):
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of `supabase/schema.sql`.
3. Run the SQL script to create tables and RLS security policies.
4. Copy the Project URL and Anon Key from **Settings > API** into your `.env` or Vercel environment variables.

---

## 📊 Comprehensive Testing Report

| Test Item | Verification Status | Notes |
|---|:---:|---|
| **PDF Extraction** | ✅ PASSED | All 61 dishes from Page 1 & 2 accurately matched with prices |
| **Dietary Accuracy** | ✅ PASSED | Biryani chicken marked Non-Veg; Veg Biryani & others marked Veg |
| **Search & Filtering** | ✅ PASSED | Instant live search, category jump, Veg filter, Bestseller filter |
| **Portion Variants** | ✅ PASSED | Biryani Half/Full and Oil-free fries correctly select and price |
| **Cart & Pricing Engine** | ✅ PASSED | Free delivery at ₹299, coupon discounts, line total math |
| **Customer Profile** | ✅ PASSED | Address book management, default address selection |
| **Phone Verification** | ✅ PASSED | Full OTP authentication flow with instant Demo Code fallback (`123456`) |
| **Order Placement** | ✅ PASSED | Authoritative persistence, unique order reference `MK-YYYYMMDD-XXXX` |
| **WhatsApp Message** | ✅ PASSED | Exactly formatted per specification, URL-encoded click-to-chat |
| **Order History** | ✅ PASSED | Displays historical orders; reorder checks fresh menu prices & stock |
| **Admin Portal** | ✅ PASSED | Passcode protected (`moonlight2026`); status updater & price editor tested |
| **Production Build** | ✅ PASSED | `npm run build` completed with zero TypeScript errors |

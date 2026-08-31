# Sales & Inventory Tracking System (RBMS)

**Course:** Software Engineering and Information System Design Lab (CSTE 3208)  
**Institution:** Department of Computer Science & Telecommunication Engineering (CSTE), Noakhali Science and Technology University (NSTU)  
**Project Group:** 07  
**Submitted By:** Md. Yeasin Arafat (ASH2201017M), Ahosan Habib (ASH2201042M)  
**Supervised By:** Dr. Nazia Majadi, Professor, Dept. of CSTE, NSTU  

---

## 🌟 Key Features

1. **Multi-Role RBAC Authentication**:
   - **Administrator**: Full governance, applicant approval, user promotion/demotion, financial auditing.
   - **Inventory Manager**: Stock adjustments (Stock In/Out/Correction), warehouse audits, low-stock threshold triggers.
   - **Purchase Manager**: Supplier directory, purchase orders, goods receiving, accounts payable & supplier dues ledger.
   - **Cashier**: Ultra-fast Point of Sale (POS) billing, barcode scanning, discounts, thermal receipt (80mm) & A4 tax invoice generation.
   - **Registration Card & Approval Flow**: New applicants submit requested role; Administrators approve/reject or promote/demote.
   - **1-Click Demo Login**: Instantly test all 4 roles with pre-configured accounts.

2. **Ultra-Fast POS Terminal**:
   - Sub-50ms responsive interactions.
   - Barcode laser simulation and fast search.
   - **Payment Modes**:
     - **Cash**: Automated tendered amount and change calculator.
     - **bKash**: Interactive mobile wallet OTP & PIN authentication with TrxID generation.
     - **Nagad**: Direct mobile financial service verification.
     - **Card**: Contactless/Chip Visa & Mastercard authorization.
     - **Split Payment**: Split cash and mobile banking payments.
   - **Receipts**: Printable/downloadable 80mm thermal receipt & A4 tax invoices with barcodes.

3. **Products & Catalog Management**:
   - Product titles, SKU, barcodes, categories, cost & selling prices, **product discounts**, stock levels, and supplier links.
   - Barcode sticker sheet generator for shelves and products.

4. **Suppliers & Purchase Order Management**:
   - Supplier product catalog viewer.
   - Multi-product purchase order creation.
   - Flexible payment terms: **Full Payment**, **Partial Advance**, or **Credit / Due**.
   - **Supplier Payment Receipts**: Generates money receipts with previous payment history, transaction date, and remaining due balances.

5. **Customer Returns & Refund Management**:
   - Return logging, instant restocking, refund calculations, and return rate metrics.

6. **Executive Reports & Analytics**:
   - Sales trends, gross profit margins, cost of goods sold (COGS), inventory asset valuations, top velocity products, and CSV export.

7. **Project Report & Architecture Showcase Tab**:
   - Interactive viewer for Use Case diagrams, DFDs (Level 0, 1, 2), ERD, Class Diagrams, CPM Network Schedule, and COCOMO metrics.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production & Vercel
```bash
npm run build
npm run start
```

### 4. Deploy to Vercel
1. Push this repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. (Optional) Set `POSTGRES_URL` environment variable if connecting to Neon, Supabase, or Vercel Postgres.
4. Click **Deploy**!

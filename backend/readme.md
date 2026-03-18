line_items
   │
   ├── price_data
   │     ├── currency → inr
   │     ├── product_data
   │     │       └── name → Appointment - Chayan
   │     └── unit_amount → 50000
   │
   └── quantity → 1


   ## Stripe payment flow
   User → Backend → Stripe Session Created
           ↓
      Save in DB (Pending)
           ↓
     Send checkout URL
           ↓
User → Stripe Payment Page
           ↓
Success → Redirect → /success
           ↓
Webhook → Update payment = Paid
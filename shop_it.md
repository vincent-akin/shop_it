# PRD --- Production-Grade E-Commerce Shop

**Project:** Shop_It
**Document:** Product Requirements Document (PRD)\
**Version:** 1.0\
**Status:** Ready for implementation\
**Primary Goal:** Build and deploy a production-grade online shop with
product browsing, cart, checkout, order persistence, customer
authentication, Google OAuth, confirmation emails, and an admin area.

---

## 1. Product Overview

The product is a full-stack e-commerce website for a real retail
business. It must be suitable for actual customers and not merely
satisfy a classroom/demo assignment.

Customers should be able to:

- Browse products.
- Search and filter products.
- View detailed product information.
- Add products to a shopping cart.
- Update quantities and remove items.
- Sign in/sign up with Google.
- Enter checkout and delivery information.
- Review an order before submission.
- Complete an order/payment where a payment provider is configured.
- Receive an order confirmation email.
- View their previous orders and order details.

The business owner should be able to:

- Manage products.
- Manage inventory.
- View and manage orders.
- Update order status.
- View customers.
- Manage store settings.
- Monitor basic sales and operational metrics.

The system must persist business data in PostgreSQL using **Supabase or
Neon** and send transactional emails through **Mailgun**.

---

# 2. Problem Statement

The shop needs a reliable online presence where customers can discover
products and place orders without relying entirely on social media, chat
messages, or manual order processing.

A production implementation must solve:

1.  Product discovery.
2.  Shopping cart persistence.
3.  Secure customer authentication.
4.  Reliable checkout.
5.  Order and customer data persistence.
6.  Inventory tracking.
7.  Transactional order notifications.
8.  Administrative order management.
9.  Security and abuse prevention.
10. Mobile-friendly shopping.
11. SEO and shareability.
12. Error handling and operational visibility.

---

# 3. Product Goals

## 3.1 Primary Goals

- Provide a polished online storefront.
- Allow customers to complete an order from product discovery to
  confirmation.
- Persist all important business data in PostgreSQL.
- Support Google authentication.
- Send reliable order confirmation emails.
- Give the owner an admin interface for managing products and orders.
- Make the application deployable and maintainable in production.
- Protect customer and business data.
- Provide a responsive experience on mobile, tablet, and desktop.

## 3.2 Secondary Goals

- Improve product discoverability through SEO.
- Reduce manual order processing.
- Provide a foundation for future payments, promotions, analytics, and
  additional sales channels.
- Make the codebase maintainable enough for continued development
  after the initial release.

---

# 4. Non-Goals for MVP

The following are not required for the first production release unless
explicitly added during implementation:

- Multi-vendor marketplace functionality.
- Seller accounts.
- Affiliate management.
- Loyalty/rewards program.
- Subscription products.
- Advanced recommendation engine.
- Native mobile applications.
- Multi-country tax engine.
- Multi-currency accounting system.
- Warehouse management system.
- Complex ERP integration.

The architecture should not prevent these features from being added
later.

---

# 5. Target Users

## 5.1 Customers

People who want to discover and purchase products from the shop.

### Customer needs

- Quickly understand what the shop sells.
- Find products easily.
- See accurate prices and availability.
- Understand product details before ordering.
- Complete checkout with minimal friction.
- Receive proof that the order was successfully placed.
- Access their order history.

## 5.2 Store Owner/Admin

The person operating the shop.

### Admin needs

- Add and edit products.
- Control product availability.
- Track stock.
- View incoming orders.
- Update order statuses.
- See customer information related to orders.
- Manage store information.

---

# 6. Product Scope

The MVP consists of:

1.  Public storefront.
2.  Product catalog.
3.  Product detail pages.
4.  Search and filtering.
5.  Shopping cart.
6.  Customer authentication.
7.  Google OAuth.
8.  Checkout.
9.  Order creation.
10. Payment integration boundary.
11. Order confirmation.
12. Mailgun transactional email.
13. Customer account.
14. Order history.
15. Admin dashboard.
16. Product management.
17. Inventory management.
18. Order management.
19. Basic reporting.
20. Security, monitoring, validation, and error handling.

---

# 7. Recommended Technology Architecture

## 7.1 Frontend

Recommended:

- Next.js
- TypeScript
- Tailwind CSS
- Server-side rendering/static generation where appropriate
- Responsive design
- Accessible UI components

The storefront should prioritize fast page loads, SEO, and mobile
shopping.

## 7.2 Backend

The application may use Next.js server-side functionality/API routes or
a dedicated Node.js API depending on implementation preference.

Business logic must be separated from UI components.

Recommended logical layers:

```text
Presentation
    ↓
API / Server Actions
    ↓
Application Services
    ↓
Repositories / Data Access
    ↓
PostgreSQL
```

## 7.3 Database

Primary database:

- PostgreSQL
- Supabase PostgreSQL OR Neon PostgreSQL

Recommended production choice for this project:

**Supabase PostgreSQL + Supabase Auth**

This reduces the amount of custom authentication infrastructure required
while still providing PostgreSQL as the application database.

Neon can also be used if authentication is implemented separately with
an appropriate production authentication solution.

## 7.4 Authentication

Google OAuth.

Recommended implementation:

```text
Customer
   ↓
Google
   ↓
Authentication Provider
   ↓
Application Session
   ↓
Customer Account
```

Google OAuth credentials must never be committed to source control.

## 7.5 Email

Mailgun for transactional emails.

Initial transactional emails:

- Order confirmation.
- Order status update.
- Optional welcome/account email.

Email sending must happen server-side.

## 7.6 Payment

The checkout architecture must support a payment provider even if
payment is initially disabled for the assignment.

For a Nigeria-focused deployment, a provider such as Paystack or
Flutterwave can be integrated later or during the payment phase.

Payment confirmation must be verified server-side through the provider's
trusted mechanism/webhook rather than trusting a client-side success
response.

---

# 8. High-Level System Architecture

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    │ Mobile / Desktop    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Next.js App      │
                    │ Storefront + Admin   │
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
          ┌───────────────┐        ┌────────────────┐
          │ Auth Provider │        │ Application API│
          │ Google OAuth  │        │ / Server Logic │
          └───────────────┘        └───────┬────────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                         ▼                 ▼                 ▼
                   PostgreSQL          Mailgun          Payment Provider
                   Supabase/Neon       Email API        Optional/Required
```

---

# 9. Functional Requirements

## 9.1 Homepage

The homepage must include:

- Shop branding/logo.
- Navigation.
- Hero section.
- Featured products.
- Product categories.
- Promotional content where applicable.
- Shop/about section.
- Contact information.
- Footer.
- Cart access.
- Account/authentication access.

### Acceptance Criteria

- Homepage loads successfully on mobile and desktop.
- Product links navigate to valid product pages.
- Navigation works on mobile.
- Images are optimized.
- Important content is indexable by search engines.
- No broken links are present.

---

# 10. Product Catalog

Products must have at minimum:

- Product ID.
- Name.
- Slug.
- Description.
- Price.
- Currency.
- Images.
- Category.
- SKU.
- Inventory quantity.
- Availability status.
- Created timestamp.
- Updated timestamp.

Optional fields:

- Compare-at price.
- Brand.
- Tags.
- Product variants.
- Size.
- Color.
- Weight.
- Dimensions.
- Featured flag.

### Product states

```text
DRAFT
ACTIVE
OUT_OF_STOCK
ARCHIVED
```

Only ACTIVE products should normally be visible for purchase.

---

# 11. Product Listing

Customers must be able to:

- View products.
- Search products.
- Filter by category.
- Sort products.
- Open product details.
- See price.
- See availability.
- Add products to cart.

Recommended sorting:

- Featured.
- Newest.
- Price low to high.
- Price high to low.
- Name A-Z.

---

# 12. Product Details

Each product page must display:

- Product name.
- Product images.
- Price.
- Description.
- Availability.
- Quantity selector.
- Add-to-cart button.
- SKU where appropriate.
- Product category.
- Relevant variants.

The page should provide clear feedback after adding an item to the cart.

---

# 13. Shopping Cart

The cart must support:

- Add product.
- Remove product.
- Increase quantity.
- Decrease quantity.
- Manual quantity changes where appropriate.
- Cart subtotal.
- Shipping estimate/fee where applicable.
- Total.
- Checkout button.

The application must validate inventory before creating an order.

### Cart Persistence

For guests:

- Persist cart in a secure client-side mechanism such as an
  HTTP-only/session strategy where appropriate.

For authenticated customers:

- Cart may be persisted server-side.

When a guest signs in, the application should merge the guest cart with
the customer's existing cart without creating duplicate quantities
beyond available inventory.

---

# 14. Authentication

The system must support:

- Google sign-in.
- Sign-out.
- Session persistence.
- Protected customer account pages.
- Protected admin pages.

The application must not store Google passwords.

Authentication sessions must use secure, appropriately configured
cookies/tokens.

---

# 15. Google OAuth

Google authentication must be configured through Google Cloud Console.

Required configuration:

- Google Cloud project.
- OAuth consent configuration.
- OAuth client.
- Authorized JavaScript origins where required.
- Authorized redirect URI.
- Production redirect URI.
- Development redirect URI.

Secrets:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

must be stored in environment variables/secrets management.

The system must reject invalid OAuth callbacks and must not expose
client secrets to the browser.

---

# 16. Customer Account

Authenticated customers should have:

- Profile information.
- Email.
- Name.
- Profile image where supplied by Google.
- Order history.
- Order details.

Customers must only be able to access their own orders.

---

# 17. Checkout

Checkout is a critical workflow.

### Required checkout information

- Customer name.
- Email.
- Phone number.
- Delivery address.
- City.
- State/region.
- Country.
- Delivery notes where applicable.

Optional:

- Company.
- Apartment/unit.
- Landmark.

### Checkout flow

```text
Cart
  ↓
Checkout
  ↓
Customer Information
  ↓
Delivery Information
  ↓
Order Review
  ↓
Payment / Order Submission
  ↓
Server Validation
  ↓
Create Order
  ↓
Confirmation
  ↓
Send Email
```

---

# 18. Order Creation

Order creation must be transactional and server-controlled.

The client must never be trusted to determine:

- Final product price.
- Inventory availability.
- Order total.
- Discount amount.
- Payment status.

The server must retrieve product information from the database and
calculate the authoritative order total.

An order should store an immutable snapshot of purchased product
information so that historical orders remain accurate even if a product
is later edited.

Example order item snapshot:

```text
productId
productName
sku
unitPrice
quantity
subtotal
variant
```

---

# 19. Order Status

Recommended order states:

```text
PENDING
CONFIRMED
PROCESSING
READY_FOR_DELIVERY
SHIPPED
DELIVERED
CANCELLED
REFUNDED
```

Payment status should be tracked independently:

```text
PENDING
PAID
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

This separation prevents order workflow and payment workflow from
becoming tightly coupled.

---

# 20. Inventory

Inventory must be tracked at the product/variant level.

Minimum requirements:

- Current stock quantity.
- Low-stock threshold.
- Out-of-stock state.
- Inventory adjustment.
- Stock decrement when an order is successfully created according to
  the chosen payment/order strategy.

The implementation must protect against overselling caused by concurrent
checkout requests.

For paid orders, stock reservation/confirmation rules must be explicitly
defined with the payment provider integration.

---

# 21. Payment Requirements

Payment is a production concern even if the initial assignment can
operate without a live payment gateway.

The system must support:

```text
Order Created
     ↓
Payment Initialized
     ↓
Customer Pays
     ↓
Provider Callback/Webhook
     ↓
Server Verifies Payment
     ↓
Payment Marked PAID
     ↓
Order Confirmed
     ↓
Confirmation Email
```

Never mark an order as paid solely because the browser reports success.

Webhook processing must be:

- Authenticated/verified.
- Idempotent.
- Logged.
- Safe to retry.

---

# 22. Email Requirements

Mailgun will be used for transactional emails.

## 22.1 Order Confirmation Email

After successful order creation/payment confirmation, send:

- Customer name.
- Order number.
- Items.
- Quantities.
- Prices.
- Subtotal.
- Shipping fee.
- Total.
- Delivery address.
- Order status.
- Support/contact information.

## 22.2 Order Status Email

When configured, customers should receive an email when their order
status changes materially.

Example:

```text
Order confirmed
Order processing
Order shipped
Order delivered
Order cancelled
```

## 22.3 Email Reliability

Email sending must not cause the customer request to fail merely because
Mailgun is temporarily unavailable.

Recommended approach:

```text
Order Transaction
      ↓
Persist Order
      ↓
Queue/Background Email Job
      ↓
Mailgun
```

At minimum, email failures must be logged and retryable.

---

# 23. Admin Dashboard

Admin routes must be protected.

Example:

```text
/admin
/admin/products
/admin/products/new
/admin/orders
/admin/customers
/admin/settings
```

Dashboard should show:

- Total orders.
- Pending orders.
- Revenue where payment data is available.
- Product count.
- Low-stock products.
- Recent orders.

The dashboard does not need advanced BI analytics for MVP.

---

# 24. Admin Product Management

Admin must be able to:

- Create product.
- Edit product.
- Archive product.
- Change price.
- Update stock.
- Upload/manage images.
- Change category.
- Set product visibility.
- Mark product as featured.

Dangerous operations such as deletion should require confirmation.

Prefer archive/soft-delete over permanent deletion for products
associated with historical orders.

---

# 25. Admin Order Management

Admin must be able to:

- View orders.
- Search orders.
- Filter orders by status.
- Open order details.
- View customer information.
- Update order status.
- View payment status.
- View delivery information.

All significant status changes should be recorded in an order
history/audit trail.

---

# 26. Order Number

Orders should have a customer-friendly order number separate from the
internal database ID.

Example:

```text
ORD-2026-000001
```

The format may be changed during implementation.

Order numbers must be unique.

---

# 27. Database Requirements

The database should contain at minimum the following logical entities:

```text
users
customers/profiles
products
categories
product_images
carts
cart_items
orders
order_items
payments
order_status_history
addresses
```

Optional:

```text
product_variants
inventory_movements
coupons
audit_logs
email_events
store_settings
```

### Core relationships

```text
User
 └── Customer Profile
       ├── Addresses
       ├── Cart
       └── Orders
              └── Order Items
                     └── Product

Product
 ├── Category
 ├── Images
 └── Inventory

Order
 ├── Payment
 └── Status History
```

---

# 28. Data Integrity

The system must enforce:

- Unique product slugs.
- Unique SKUs where SKUs are used.
- Unique order numbers.
- Valid foreign-key relationships.
- Non-negative prices.
- Non-negative inventory.
- Positive order quantities.
- Valid order totals.
- Valid email addresses.
- Required checkout fields.
- Server-side authorization.

Database constraints should be used in addition to application-level
validation.

---

# 29. Security Requirements

Security is mandatory because this is intended for real customers.

## 29.1 Authentication Security

- Secure sessions.
- HTTP-only cookies where applicable.
- Secure cookies in production.
- Appropriate SameSite configuration.
- OAuth state/PKCE protections provided by the chosen auth solution.
- No authentication secrets in frontend code.

## 29.2 Authorization

Admin functionality must be server-side protected.

Never rely solely on:

```text
if (user.isAdmin)
```

in frontend JavaScript.

The backend/server must independently enforce authorization.

## 29.3 Input Validation

Validate all external input:

- Query parameters.
- Request bodies.
- Path parameters.
- Checkout forms.
- Admin forms.
- Webhook payloads.

Recommended validation library:

- Zod or equivalent.

## 29.4 Rate Limiting

Apply rate limiting to sensitive endpoints:

- Authentication.
- Checkout.
- Order creation.
- Password/auth operations if any.
- Contact forms.
- Webhooks where appropriate.

## 29.5 Secrets

Never commit:

```text
DATABASE_URL
GOOGLE_CLIENT_SECRET
MAILGUN_API_KEY
PAYMENT_SECRET
AUTH_SECRET
```

Use environment variables/secrets management.

Provide `.env.example` with names only.

## 29.6 Database Security

If Supabase is used:

- Configure Row Level Security where appropriate.
- Never expose privileged service-role credentials to the browser.
- Use server-side privileged operations only when required.

---

# 30. Error Handling

The application must provide user-friendly errors without leaking
sensitive implementation details.

Example:

```text
User-facing:
"Something went wrong while placing your order. Please try again."

Server log:
ORDER_CREATION_FAILED
requestId=...
userId=...
error=...
```

Never expose:

- Database connection strings.
- Stack traces.
- API keys.
- Internal SQL.
- Authentication secrets.

---

# 31. Observability

Production deployment should include:

- Structured application logs.
- Request IDs/correlation IDs.
- Error tracking.
- Database error monitoring.
- Payment webhook logging.
- Email delivery logging.
- Authentication failure logging.

Recommended optional service:

- Sentry or equivalent.

---

# 32. SEO Requirements

Public storefront pages should support:

- Meaningful page titles.
- Meta descriptions.
- Canonical URLs.
- Open Graph metadata.
- Twitter/X card metadata where appropriate.
- Product structured data.
- Sitemap.
- Robots configuration.
- Clean product URLs.

Example:

```text
/products/product-name
/categories/category-name
```

Avoid exposing database IDs in public URLs where possible.

---

# 33. Performance Requirements

Target:

- Fast first load.
- Optimized product images.
- Lazy loading for below-the-fold images.
- Minimal client-side JavaScript.
- Server-rendered/static content where beneficial.
- Database indexes for frequent queries.
- Pagination for product/order lists.

Product listing pages must not load the entire product catalog into the
browser.

---

# 34. Accessibility

The application should follow WCAG-oriented accessibility practices.

Requirements include:

- Keyboard navigation.
- Visible focus states.
- Semantic HTML.
- Accessible form labels.
- Alt text for product images.
- Sufficient text contrast.
- Error messages associated with inputs.
- Accessible dialogs/modals.
- No critical functionality requiring mouse-only interaction.

---

# 35. Responsive Design

Supported viewport categories:

- Mobile.
- Tablet.
- Desktop.
- Large desktop.

The mobile experience is particularly important because many customers
may access the store from phones.

Critical workflows must work on mobile:

```text
Browse → Product → Cart → Checkout → Confirmation
```

---

# 36. Admin UX

The admin area should prioritize operational efficiency rather than
marketing design.

Recommended layout:

```text
Sidebar
 ├── Dashboard
 ├── Products
 ├── Orders
 ├── Customers
 └── Settings
```

Tables should support:

- Pagination.
- Search.
- Filters.
- Sorting.
- Loading states.
- Empty states.
- Error states.

---

# 37. Loading and Empty States

Every major data-driven page must define:

### Loading

Display skeletons or meaningful loading indicators.

### Empty

Examples:

```text
Your cart is empty.
No products found.
You have no orders yet.
No pending orders.
```

### Error

Provide a clear recovery action:

```text
Try again
Return home
Continue shopping
```

---

# 38. Cart and Checkout Edge Cases

The system must handle:

- Product becomes unavailable while in cart.
- Product price changes after being added to cart.
- Requested quantity exceeds stock.
- Product is archived while in cart.
- Duplicate checkout requests.
- Browser refresh during checkout.
- Payment succeeds but redirect fails.
- Payment webhook arrives multiple times.
- Mailgun is unavailable.
- Customer loses network connection.
- Session expires.
- Order creation partially fails.

The server must be authoritative for final prices and inventory.

---

# 39. Idempotency

Order/payment operations must protect against duplicate submissions.

Example:

```text
POST /checkout
Idempotency-Key: <unique-request-key>
```

Repeated requests with the same idempotency key must not create
duplicate orders.

Payment webhooks must also be idempotent.

---

# 40. API Requirements

If a separate API layer is used, minimum logical endpoints include:

## Public

```text
GET    /api/products
GET    /api/products/:slug
GET    /api/categories
```

## Cart

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
```

## Checkout

```text
POST   /api/checkout/validate
POST   /api/orders
GET    /api/orders/:orderNumber
```

## Customer

```text
GET    /api/me
GET    /api/me/orders
GET    /api/me/orders/:orderNumber
```

## Admin

```text
GET    /api/admin/products
POST   /api/admin/products
PATCH  /api/admin/products/:id
POST   /api/admin/products/:id/archive

GET    /api/admin/orders
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status

GET    /api/admin/customers
```

## Payment

```text
POST   /api/payments/initialize
POST   /api/webhooks/payment
```

Exact routes may change during implementation.

---

# 41. API Response Standards

Use consistent response structures.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": {}
  },
  "requestId": "..."
}
```

Do not expose internal exception messages to customers.

---

# 42. Authorization Model

Minimum roles:

```text
CUSTOMER
ADMIN
```

Potential future role:

```text
SUPER_ADMIN
```

Permissions should be capability-based internally where practical.

Example:

```text
products.read
products.write
inventory.write
orders.read
orders.write
customers.read
settings.write
```

---

# 43. Audit Logging

Administrative actions should be auditable.

Record:

- Actor.
- Action.
- Resource.
- Resource ID.
- Timestamp.
- Relevant before/after values where appropriate.
- Request ID/IP metadata where legally and operationally appropriate.

Examples:

```text
PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_ARCHIVED
INVENTORY_UPDATED
ORDER_STATUS_CHANGED
ADMIN_LOGIN
```

---

# 44. Privacy

Customer information must be treated as private business data.

The system should minimize collection of unnecessary personal
information.

Customer data should not be exposed publicly.

Production deployment should include:

- Privacy policy.
- Terms of service.
- Contact/support information.
- Cookie disclosure/consent where legally required.
- Data retention policy appropriate to the business.

---

# 45. Backup and Recovery

Production database must have backups enabled through the selected
PostgreSQL provider.

The deployment plan must define:

- Backup frequency.
- Retention.
- Recovery procedure.
- Production database access policy.

The owner should not depend on a developer's local machine as the only
copy of business data.

---

# 46. Environment Configuration

Minimum environments:

```text
development
production
```

Recommended:

```text
development
staging
production
```

Example `.env.example`:

```env
DATABASE_URL=

NEXT_PUBLIC_APP_URL=

AUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=

PAYMENT_SECRET=
PAYMENT_PUBLIC_KEY=
PAYMENT_WEBHOOK_SECRET=
```

Never place actual secrets in Git.

---

# 47. Deployment Requirements

The application must be deployable to a production hosting platform.

Recommended architecture:

```text
Frontend/Application
        │
        ├── Production Hosting
        │
        ├── Supabase/Neon PostgreSQL
        │
        ├── Google OAuth
        │
        ├── Mailgun
        │
        └── Payment Provider
```

The deployment must support:

- HTTPS.
- Production environment variables.
- Custom domain.
- Secure cookies.
- Database migrations.
- Error monitoring.
- Logs.
- Automatic deployment from the production branch where appropriate.

---

# 48. Domain Requirements

Production should use a real business domain.

Example:

```text
https://shop.example.com
```

or:

```text
https://example.com
```

All OAuth redirect URLs, email links, canonical URLs, and payment
callbacks must use the production domain.

---

# 49. Email Domain Setup

Mailgun production email should use a verified sending domain.

The domain must be configured with the required DNS records.

Recommended:

```text
SPF
DKIM
DMARC
```

The application should send from a professional address such as:

```text
orders@example.com
```

rather than a personal mailbox.

---

# 50. Analytics

Basic analytics should be supported.

Potential metrics:

- Product views.
- Add-to-cart events.
- Checkout starts.
- Orders.
- Revenue.
- Conversion rate.

Analytics must not be allowed to block the core shopping experience.

---

# 51. Admin Dashboard Metrics

Initial dashboard:

```text
Total Orders
Pending Orders
Completed Orders
Total Revenue
Products
Low Stock
```

Time filters:

```text
Today
7 Days
30 Days
Custom
```

Revenue metrics must be based on valid payment/order data rather than
client-side analytics.

---

# 52. Notifications

The system should support:

### Customer

- Order confirmation.
- Order status update.
- Payment failure where appropriate.

### Admin

Optional:

- New order notification.
- Payment issue notification.
- Low-stock notification.

Email notifications should be configurable.

---

# 53. Product Image Requirements

Product images should:

- Be optimized.
- Have appropriate dimensions.
- Have descriptive alt text.
- Use modern formats where supported.
- Use lazy loading when appropriate.
- Avoid massive original files being served directly.

A proper image storage/CDN solution should be used rather than storing
large binary images directly in PostgreSQL.

---

# 54. Search

MVP search should support:

- Product name.
- SKU.
- Category/tags where applicable.

For a small catalog, PostgreSQL search is sufficient.

A dedicated search engine should only be introduced if the catalog grows
enough to justify it.

---

# 55. Pagination

Public products:

```text
GET /api/products?page=1&limit=20
```

Admin orders/products must also be paginated.

Never return unlimited database records in production endpoints.

Maximum page size should be enforced server-side.

---

# 56. Database Indexing

Indexes should be created for common access patterns.

Examples:

```text
products.slug
products.sku
products.category_id
products.status
orders.order_number
orders.customer_id
orders.status
orders.created_at
order_items.order_id
```

Exact indexes should be determined from the final schema and query
patterns.

---

# 57. Transaction Requirements

Database transactions should be used where multiple writes must succeed
or fail together.

Examples:

- Creating an order and its order items.
- Updating inventory together with an order where applicable.
- Recording payment state and related order state.
- Complex cart merge operations.

The implementation must avoid leaving partially-created orders.

---

# 58. Production Testing

The application must include automated tests at appropriate levels.

## Unit Tests

Test:

- Price calculations.
- Cart calculations.
- Inventory validation.
- Order status transitions.
- Validation.
- Authorization logic.

## Integration Tests

Test:

- Database operations.
- Authentication.
- Order creation.
- Payment webhook processing.
- Email event creation.

## End-to-End Tests

Critical flow:

```text
Homepage
  ↓
Product
  ↓
Add to Cart
  ↓
Checkout
  ↓
Authentication
  ↓
Order Submission
  ↓
Confirmation
```

Admin flow:

```text
Admin Login
  ↓
Create Product
  ↓
Update Inventory
  ↓
View Order
  ↓
Update Order Status
```

---

# 59. Definition of Done

A feature is not complete merely because it works locally.

A production-ready feature must have:

- Functional implementation.
- Validation.
- Authorization.
- Error handling.
- Loading state.
- Empty state where applicable.
- Mobile responsiveness.
- Database persistence.
- Appropriate tests.
- Logging where relevant.
- Security review.
- No hardcoded secrets.
- Production environment configuration.
- Documentation.

---

# 60. Acceptance Criteria

## Storefront

- [ ] Customer can open the homepage.
- [ ] Customer can browse products.
- [ ] Customer can search/filter products.
- [ ] Customer can view product details.
- [ ] Customer can add/remove products from cart.
- [ ] Cart totals are correct.
- [ ] Inventory availability is respected.

## Authentication

- [ ] Customer can authenticate with Google.
- [ ] Customer session persists correctly.
- [ ] Customer can sign out.
- [ ] Protected customer routes require authentication.
- [ ] Admin routes require admin authorization.

## Checkout

- [ ] Customer can enter delivery details.
- [ ] Server validates checkout data.
- [ ] Server calculates authoritative totals.
- [ ] Server validates current inventory.
- [ ] Duplicate order submissions are prevented.
- [ ] Order is persisted.
- [ ] Customer receives confirmation.

## Database

- [ ] Products persist.
- [ ] Customers persist.
- [ ] Orders persist.
- [ ] Order items persist.
- [ ] Payment state persists.
- [ ] Order status history persists.
- [ ] Appropriate indexes exist.
- [ ] Database backups are enabled.

## Email

- [ ] Mailgun domain is verified.
- [ ] Order confirmation email is sent.
- [ ] Email failure is logged.
- [ ] Email delivery does not corrupt the order transaction.

## Admin

- [ ] Admin can manage products.
- [ ] Admin can manage inventory.
- [ ] Admin can view orders.
- [ ] Admin can update order status.
- [ ] Admin can view relevant customer information.
- [ ] Administrative actions are protected and auditable.

## Production

- [ ] HTTPS is enabled.
- [ ] Production secrets are not committed.
- [ ] Error monitoring is configured.
- [ ] Logs are available.
- [ ] Database backups are configured.
- [ ] Production domain is configured.
- [ ] OAuth production callback is configured.
- [ ] Mailgun production domain is configured.
- [ ] Payment webhook is configured if payments are enabled.
- [ ] Critical E2E flows pass.

---

# 61. Suggested Implementation Phases

## Phase 1 --- Project Foundation

- Initialize repository.
- Configure Next.js/TypeScript.
- Configure styling.
- Configure linting/formatting.
- Configure environment management.
- Configure database.
- Configure migrations/schema.
- Establish application architecture.

## Phase 2 --- Authentication

- Configure auth.
- Configure Google Cloud Console OAuth.
- Implement Google sign-in.
- Implement sessions.
- Implement customer profiles.
- Implement admin authorization.

## Phase 3 --- Catalog

- Product schema.
- Categories.
- Product images.
- Product listing.
- Product detail pages.
- Search/filtering.
- Admin product CRUD.

## Phase 4 --- Cart

- Cart schema/state.
- Add/remove/update quantity.
- Persistence.
- Cart merge.
- Inventory validation.

## Phase 5 --- Checkout

- Checkout UI.
- Address handling.
- Server-side validation.
- Order creation.
- Order item snapshots.
- Inventory handling.
- Idempotency.

## Phase 6 --- Payments

- Payment provider integration.
- Payment initialization.
- Payment verification.
- Webhooks.
- Idempotent webhook handling.
- Payment/order state synchronization.

## Phase 7 --- Email

- Mailgun configuration.
- Email templates.
- Order confirmation.
- Status notifications.
- Retry/failure handling.

## Phase 8 --- Admin

- Dashboard.
- Order management.
- Inventory management.
- Customer view.
- Audit logging.

## Phase 9 --- Production Hardening

- Rate limiting.
- Security headers.
- Input validation audit.
- Authorization audit.
- Error tracking.
- Logging.
- Performance optimization.
- SEO.
- Accessibility.
- Backup/recovery validation.

## Phase 10 --- Testing and Deployment

- Unit tests.
- Integration tests.
- E2E tests.
- Production environment setup.
- Domain configuration.
- OAuth production configuration.
- Mailgun production configuration.
- Payment webhook configuration.
- Final QA.
- Production deployment.

---

# 62. Recommended Repository Structure

```text
shop/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── account/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   └── settings/
│   │
│   └── api/
│
├── components/
├── features/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   └── admin/
│
├── lib/
│   ├── db/
│   ├── auth/
│   ├── mail/
│   ├── payments/
│   ├── validation/
│   └── security/
│
├── tests/
├── public/
├── migrations/
├── .env.example
└── README.md
```

The exact structure may change based on the selected framework
conventions.

---

# 63. Key Business Rules

1.  Customers cannot purchase inactive products.
2.  Customers cannot purchase more units than available stock.
3.  Product prices must be calculated server-side during checkout.
4.  Historical order prices must not change when the product price
    changes.
5.  Customers can only view their own orders.
6.  Only authorized admins can manage products and orders.
7.  An order must have at least one valid order item.
8.  Order totals must be calculated from trusted database values.
9.  Payment status cannot be changed from the browser.
10. Payment webhooks must be verified.
11. Duplicate checkout requests must not create duplicate orders.
12. Duplicate payment webhooks must not create duplicate state changes.
13. Product deletion should not destroy historical order data.
14. Email failure must not silently lose a valid order.
15. Sensitive credentials must never be exposed to the client.

---

# 64. Risks and Mitigations

---

Risk Impact Mitigation

---

Overselling High Server-side inventory
checks +
transactions/reservations

Duplicate orders High Idempotency keys

Fake payment Critical Server-side payment
confirmation verification/webhooks

OAuth misconfiguration High Separate
development/production
callback configuration

Email failure Medium Async/retryable email
processing

Database failure Critical Managed PostgreSQL +
backups

Admin privilege abuse High Server-side RBAC + audit
logs

Secret leakage Critical Environment secrets +
secret scanning

Slow catalog Medium Indexing + pagination +
image optimization

Broken mobile checkout High Mobile-first QA + E2E
testing

Product deletion High Archive/soft-delete
affecting orders

Webhook duplication High Idempotent event processing

---

---

# 65. Future Roadmap

Potential post-MVP capabilities:

- Discount/coupon codes.
- Product reviews.
- Wishlist.
- Abandoned cart recovery.
- WhatsApp order notifications.
- SMS notifications.
- Advanced analytics.
- Multiple payment methods.
- Delivery partner integrations.
- Customer loyalty.
- Gift cards.
- Referral program.
- Multiple admin roles.
- Inventory movement reporting.
- Bulk product import/export.
- Product variants.
- Multi-currency.
- Multi-language.
- PWA/mobile app.
- AI product recommendations.

---

# 66. Success Metrics

The initial production release should track:

### Commerce

- Orders created.
- Successfully paid orders.
- Revenue.
- Average order value.
- Cart abandonment.
- Checkout completion.

### Product

- Product views.
- Add-to-cart rate.
- Product conversion rate.
- Out-of-stock frequency.

### Operations

- Average order processing time.
- Cancelled orders.
- Failed payments.
- Failed email notifications.

### Technical

- Application error rate.
- API latency.
- Checkout failure rate.
- Authentication failure rate.
- Payment webhook failure rate.

---

# 67. Production Launch Checklist

## Application

- [ ] Production build succeeds.
- [ ] No development secrets are present.
- [ ] No debug endpoints are exposed.
- [ ] Error pages are configured.
- [ ] Security headers configured.
- [ ] Rate limiting configured.
- [ ] Logging configured.

## Database

- [ ] Production database created.
- [ ] Migrations applied.
- [ ] Indexes verified.
- [ ] Backups enabled.
- [ ] Database credentials secured.

## Google OAuth

- [ ] Google Cloud project configured.
- [ ] OAuth consent screen configured.
- [ ] Production redirect URI configured.
- [ ] Client secret stored securely.
- [ ] Google sign-in tested in production.

## Mailgun

- [ ] Sending domain verified.
- [ ] DNS records configured.
- [ ] SPF configured.
- [ ] DKIM configured.
- [ ] DMARC configured.
- [ ] Production sender configured.
- [ ] Order email tested.

## Payments

- [ ] Production payment account configured if enabled.
- [ ] Production API credentials configured.
- [ ] Webhook URL configured.
- [ ] Webhook signature verification tested.
- [ ] Duplicate webhook handling tested.
- [ ] Failed payment handling tested.

## Store

- [ ] Real products entered.
- [ ] Product images optimized.
- [ ] Prices verified.
- [ ] Inventory verified.
- [ ] Contact information verified.
- [ ] Delivery policy verified.
- [ ] Refund/return policy published.
- [ ] Terms/privacy pages published.

## QA

- [ ] Mobile tested.
- [ ] Desktop tested.
- [ ] Google login tested.
- [ ] Product browsing tested.
- [ ] Cart tested.
- [ ] Checkout tested.
- [ ] Order creation tested.
- [ ] Email tested.
- [ ] Admin tested.
- [ ] Payment flow tested.
- [ ] Error scenarios tested.

---

# 68. Final Product Definition

The completed product is a real e-commerce application rather than a
classroom mockup.

A successful release must allow a real customer to:

```text
Visit Store
    ↓
Discover Product
    ↓
View Product
    ↓
Add to Cart
    ↓
Sign in with Google
    ↓
Checkout
    ↓
Submit/Pay for Order
    ↓
Receive Confirmation
    ↓
Track/View Order
```

At the same time, the store owner must be able to:

```text
Sign in as Admin
    ↓
Manage Products
    ↓
Manage Inventory
    ↓
Receive/View Orders
    ↓
Process Orders
    ↓
Update Order Status
    ↓
Monitor Store Activity
```

The implementation must prioritize **security, reliability,
maintainability, data integrity, mobile usability, SEO, and production
deployment readiness** rather than only satisfying the visible
requirements in the assignment.

---

# 69. MVP Technology Decision Summary

---

Area Decision

---

Frontend Next.js + TypeScript

Styling Tailwind CSS

Database PostgreSQL

DB Platform Supabase or Neon

Recommended DB Platform Supabase

Authentication Google OAuth

Recommended Auth Supabase Auth

Email Mailgun

Payment Payment-provider abstraction;
Paystack/Flutterwave can be used
for Nigeria

Hosting Production Next.js-compatible host

Image Storage Object/image storage, not
PostgreSQL

Validation Zod or equivalent

Monitoring Sentry or equivalent

API Next.js server/API layer or
dedicated Node API

Testing Unit + integration + E2E

Deployment HTTPS + environment secrets +
managed PostgreSQL

---

---

# 70. Deliverables

The project should ultimately contain:

1.  Production-ready storefront.
2.  Responsive product catalog.
3.  Product detail pages.
4.  Shopping cart.
5.  Checkout.
6.  Google OAuth authentication.
7.  Customer account/order history.
8.  PostgreSQL database.
9.  Admin dashboard.
10. Product management.
11. Inventory management.
12. Order management.
13. Mailgun email integration.
14. Payment integration boundary or live payment integration.
15. Automated tests.
16. Environment configuration.
17. Database migrations.
18. Security configuration.
19. SEO configuration.
20. Deployment documentation.
21. Production launch checklist.
22. README with setup and operational instructions.

---

## Product Principle

> **Build it as a real business system first and an assignment second.**

The assignment requirements are the minimum scope. Production-grade
security, data integrity, reliability, customer experience,
maintainability, and operational readiness are mandatory parts of the
product.

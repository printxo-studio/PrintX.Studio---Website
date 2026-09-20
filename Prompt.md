Build a complete, deployment-ready full-stack e-commerce website for my 3D printing business, “PrintXO Studio.” Use the attached logo prominently and preserve its premium red, black, silver, and white visual identity.

Create a polished, modern, mobile-first website with two secure roles: Customer and Admin.

Business focus:
- Ready-made 3D printed products
- Custom 3D print requests, including uploading STL/OBJ/3MF files
- Browsing products by category
- Order placement and order management

Design direction:
- Premium, futuristic maker-studio aesthetic
- Dark charcoal/black base, vivid red accents matching the logo, silver/white typography
- Clean product cards, subtle 3D-inspired gradients, smooth but restrained animations
- Excellent readability, accessibility, responsive design, and fast loading
- Do not use generic template-looking layouts
- Include polished empty states, loading states, form validation, toast notifications, and error states

Use this production stack:
- Frontend: Next.js latest with TypeScript, App Router, Tailwind CSS, shadcn/ui, Lucide icons
- Backend: Next.js API routes/server actions or a clean Node.js backend within the same repository
- Database: PostgreSQL with Prisma ORM
- Authentication: Auth.js / NextAuth with email-password login, secure password hashing, role-based access control
- File uploads: Cloudinary or S3-compatible storage for product images and customer 3D files
- Payments: Stripe integration with a clean abstraction that can later support Razorpay
- Email: Resend or equivalent transactional email service
- Deployment: Vercel for the application and Neon/Supabase PostgreSQL for the database
- Provide Docker support for local deployment if practical

Customer experience requirements:

1. Public storefront
- Home page with hero section, attached PrintXO Studio logo, strong call-to-action buttons: “Shop Products” and “Request a Custom Print”
- Featured products
- Product categories such as Home & Decor, Miniatures, Gaming, Desk Accessories, Keychains, Prototypes, Replacement Parts, and Custom Designs
- “How it works” section explaining the custom-print process
- Benefits section: quality materials, custom designs, reliable delivery
- Testimonials placeholder section
- Footer with contact details, social links, FAQs, shipping, returns, privacy policy, and terms

2. Product listings
- Product grid with images, title, price, rating placeholder, category, stock status, and quick add-to-cart
- Search bar
- Filters: category, price range, material, color, availability
- Sorting: newest, price low-to-high, price high-to-low, most popular
- Pagination or infinite scrolling
- Responsive filter drawer on mobile

3. Product detail page
- Image gallery with zoom
- Product name, price, description, material, available colors, dimensions, production time, stock status
- Quantity selector and add-to-cart button
- Optional personalization field where relevant
- Related products section
- Reviews structure, even if review submission is initially disabled

4. Cart and checkout
- Persistent shopping cart
- Cart editing, quantity updates, removal, subtotal, shipping estimate, tax estimate, discount-code support
- Guest checkout plus logged-in customer checkout
- Address collection and delivery method selection
- Stripe payment flow
- Order confirmation page and confirmation email
- Clear checkout validation and payment-failure handling

5. Customer account dashboard
- Sign up, sign in, reset password, profile management
- Saved addresses
- Order history and detailed order tracking timeline
- Download invoices/receipts
- Saved wishlist
- Custom-print request history and status tracking
- Ability to respond to admin messages for a custom request

6. Custom 3D print request workflow
- Dedicated “Custom Print” page
- Form fields: project title, description, intended use, quantity, dimensions, preferred material, preferred color, finish, target budget, deadline, delivery address, and optional notes
- Upload STL, OBJ, and 3MF files; also accept reference images/PDFs
- Validate file type and size securely
- Clearly state that an administrator will review the design and send a quote
- Customer can view statuses: Submitted, Under Review, Quote Sent, Approved, In Production, Shipped, Completed, Rejected
- Customer can accept/reject a quote and pay once approved
- Make quote-to-order conversion possible

Admin requirements:

1. Secure admin dashboard
- Admin-only protected routes
- Dashboard cards for total sales, orders, pending custom-print requests, low-stock products, and recent activity
- Sales chart and order-status overview
- Quick actions for adding products and reviewing requests

2. Product and category management
- Full CRUD for products
- Product fields: name, slug, short description, full description, SKU, category, price, sale price, cost, stock quantity, low-stock threshold, material, color options, dimensions, production time, featured status, images, SEO metadata, active/draft status
- Multi-image upload with image sorting and deletion
- Full CRUD for categories
- Bulk product actions: activate/deactivate, category update, stock update, delete with confirmation

3. Order management
- View all orders with search, filters, and sorting
- Order detail screen with customer data, items, payment information, shipping address, status history, and notes
- Order statuses: Pending Payment, Paid, Confirmed, In Production, Quality Check, Shipped, Delivered, Cancelled, Refunded
- Update order status and automatically notify customer by email
- Add internal admin notes
- Generate/download invoice
- Refund workflow placeholder connected to Stripe where possible

4. Custom-print request management
- Review uploaded 3D files and reference assets
- View all request details
- Add internal notes
- Send a detailed quote including unit price, quantity, shipping cost, estimated production time, expiration date, and customer-facing message
- Change request status
- Convert approved quote into a payable order
- Message thread between admin and customer
- Download uploaded files securely for admin only

5. Additional admin features
- Customer management: list customers, view purchase history, order count, and custom requests
- Inventory alerts for low-stock products
- Discount/coupon CRUD: percentage or fixed amount, usage limits, expiration dates, minimum cart value
- Basic analytics: revenue by period, best-selling products, order conversion placeholders, popular categories
- Site settings: business contact information, shipping charges, free-shipping threshold, tax rate, homepage featured products
- Admin activity log for important actions
- SEO controls for products and category pages

Database design:
Create Prisma models and migrations for:
- User
- Account/session if required by authentication
- Address
- Category
- Product
- ProductImage
- ProductVariant if needed
- Cart and CartItem
- WishlistItem
- Order and OrderItem
- Payment
- Shipment / tracking data
- CustomPrintRequest
- CustomPrintFile
- CustomPrintQuote
- CustomPrintMessage
- Coupon
- Review-ready model
- Notification
- AdminActivityLog
- SiteSettings

Technical and security requirements:
- TypeScript throughout
- Role-based authorization enforced server-side, not only in the UI
- Input validation using Zod
- Secure passwords using bcrypt or Argon2
- Protect upload endpoints, validate MIME types/file sizes, and use signed URLs where appropriate
- Rate limit authentication and sensitive forms
- Avoid exposing secrets to the browser
- Use environment variables and provide a complete `.env.example`
- SEO metadata, Open Graph images, sitemap, robots.txt, canonical URLs
- Accessible semantic HTML, keyboard navigation, color contrast, labels, and alt text
- Use optimized images and Next.js performance best practices
- Add structured data for products where appropriate
- Handle errors gracefully with useful user-facing messages and server-side logging
- Include seed data with realistic 3D printing products and categories
- Use INR currency by default, but keep currency configuration flexible

Deliverables:
1. A complete runnable repository with clean, modular folder structure
2. README containing exact local setup, database setup, migration, seed, Stripe configuration, Cloudinary/S3 configuration, email configuration, and Vercel deployment steps
3. `.env.example`
4. Prisma schema, migrations, and seed script
5. Responsive customer storefront and admin dashboard
6. Authentication and role-based authorization
7. Functional product CRUD, cart, checkout, order management, custom print upload/quote flow, and admin request management
8. Sample admin account creation instructions
9. Tests for essential flows: authentication, authorization, product CRUD, cart/order flow, and custom quote approval
10. Final deployment checklist

Before writing code, first output:
- proposed architecture
- database schema overview
- route/page map
- API/server action map
- environment variables required
- implementation plan

Then generate the complete application in logical phases. Do not leave core features as visual mockups; implement the main flows end-to-end. Use reusable components, professional code quality, and include comments only where they add genuine value.
# Live Streaming Platform - Admin Feature Architecture

This document serves as the authoritative, frozen architectural specification for the Live Streaming Admin Panel, NestJS Backend API, and Flutter Mobile Application. It details the complete module hierarchy, data models, UI components, API contracts, RBAC permissions, and global system strategies.

---

## 1. Global Architectural Conventions

### API Base Envelope Structure (NestJS Standard)
- **Success Single Item Response:**
  ```json
  {
    "success": true,
    "message": "Resource fetched successfully",
    "data": { ... }
  }
  ```
- **Paginated List Response:**
  ```json
  {
    "success": true,
    "message": "Resources fetched successfully",
    "data": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Validation failed",
    "error": "Bad Request",
    "timestamp": "2026-07-29T15:30:00.000Z",
    "path": "/api/v1/users"
  }
  ```

---

## 2. Comprehensive Module Architectural Specifications

---

### GROUP 1: CORE DASHBOARD & AUTHENTICATION

#### 1. Dashboard Module
- **1. Purpose:** High-level platform health, live stream traffic monitoring, revenue metrics, and pending moderation alerts.
- **2. Sidebar Location:** Main -> Dashboard (`/dashboard`)
- **3. Route:** `/dashboard`
- **4. Page Structure:** PageHeader -> StatsCard Grid (8 cards) -> QuickActions Grid -> 2-Column Split (Live Streams + Activity Log) -> 2-Column Split (Transactions + Moderation Queue).
- **5. Components:** `PageHeader`, `StatsCard`, `QuickActions`, `LatestStreamsTable`, `RecentActivityList`, `RecentTransactionsTable`, `PendingReportsList`.
- **6. Filters:** Time Range Selector (`Today`, `7 Days`, `30 Days`, `Year to Date`).
- **7. Table Columns:** N/A (Embedded preview tables use respective module columns).
- **8. Row Actions:** N/A.
- **9. Bulk Actions:** N/A.
- **10. Dashboard Cards:** Total Users, Verified Creators, Live Streams, Today's Revenue, Coin Sales, Pending Withdrawals, Reports, Online Users.
- **11. Detail Page:** N/A (Navigates to individual feature detail pages).
- **12. Create Form:** N/A.
- **13. Edit Form:** N/A.
- **14. Required Permissions:** `dashboard:read`
- **15. Future API Endpoints:**
  - `GET /api/v1/admin/dashboard/stats`
  - `GET /api/v1/admin/dashboard/activity`
- **16. Future Database Models:** Views over `users`, `streams`, `transactions`, `reports`.
- **17. Relationships:** Aggregates data from Users, Creators, Streams, Finance, and Moderation modules.

#### 2. Authentication Module
- **1. Purpose:** Admin user session entry, JWT authentication, access refresh, and credential recovery.
- **2. Sidebar Location:** N/A (Unauthenticated route)
- **3. Route:** `/login`, `/forgot-password`, `/reset-password`
- **4. Page Structure:** Split Layout (Left: Brand Illustration + Metrics preview; Right: Centered Auth Card).
- **5. Components:** `PublicRoute`, `LoginCard`, `LoginForm`, `PasswordInput`, `RememberMe`, `LoginIllustration`.
- **6. Filters:** N/A.
- **7. Table Columns:** N/A.
- **8. Row Actions:** N/A.
- **9. Bulk Actions:** N/A.
- **10. Dashboard Cards:** N/A.
- **11. Detail Page:** N/A.
- **12. Create Form:** N/A.
- **13. Edit Form:** Reset Password Form (`password`, `confirmPassword`).
- **14. Required Permissions:** `Public`
- **15. Future API Endpoints:**
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/refresh`
  - `GET /api/v1/auth/me`
- **16. Future Database Models:** `User`, `UserSession`, `RefreshToken`.
- **17. Relationships:** Links to Users and Audit Logs modules.

---

### GROUP 2: ADMINISTRATION & ACCESS CONTROL (RBAC)

#### 3. Admins Module
- **1. Purpose:** Management of internal platform administrators, role assignments, and account statuses.
- **2. Sidebar Location:** Administration -> Admins (`/admin/users`)
- **3. Route:** `/admin/users`
- **4. Page Structure:** PageHeader -> StatsCards (3 cards) -> Filter & Search Toolbar -> Admins DataTable -> Pagination.
- **5. Components:** `PageHeader`, `DataTable`, `AdminCreateDialog`, `AdminEditDialog`, `StatusBadge`, `AvatarCell`.
- **6. Filters:** Role (`Super Admin`, `Moderator`, `Finance Admin`), Status (`Active`, `Suspended`), 2FA Enabled.
- **7. Table Columns:** Admin (`Avatar` + `Name` + `Email`), Role Badge, Assigned Permissions Count, Last Login, Status, Created At, Actions.
- **8. Row Actions:** Edit Admin, Change Role, Reset 2FA, Suspend/Activate, Delete.
- **9. Bulk Actions:** Bulk Suspend, Bulk Role Assignment.
- **10. Dashboard Cards:** Total Admins, Super Admins, Active Sessions.
- **11. Detail Page:** `/admin/users/[id]` (Activity history, granted permissions breakdown).
- **12. Create Form:** `name`, `email`, `password`, `roleId`, `avatarUrl`.
- **13. Edit Form:** `name`, `email`, `roleId`, `status`.
- **14. Required Permissions:** `admins:read`, `admins:create`, `admins:update`, `admins:delete`
- **15. Future API Endpoints:**
  - `GET /api/v1/admin/users`
  - `POST /api/v1/admin/users`
  - `GET /api/v1/admin/users/:id`
  - `PATCH /api/v1/admin/users/:id`
  - `DELETE /api/v1/admin/users/:id`
- **16. Future Database Models:** `User` (where `isStaff = true`), `Role`.
- **17. Relationships:** Many-to-One with Roles, One-to-Many with Audit Logs.

#### 4. Roles & Permissions Module
- **1. Purpose:** Dynamic Role-Based Access Control (RBAC) matrix configuration.
- **2. Sidebar Location:** Administration -> Roles (`/admin/roles`)
- **3. Route:** `/admin/roles`
- **4. Page Structure:** PageHeader -> Roles Grid / Cards -> Permission Matrix Table -> Edit Role Sheet.
- **5. Components:** `PageHeader`, `RoleCard`, `PermissionMatrixTable`, `RoleFormSheet`.
- **6. Filters:** Module Category Filter (`Users`, `Streams`, `Finance`, `Settings`).
- **7. Table Columns:** Role Name, System Key, Assigned Admins Count, Permissions Count, Is System Default, Actions.
- **8. Row Actions:** Edit Permissions, Duplicate Role, Delete Role (if non-system).
- **9. Bulk Actions:** N/A.
- **10. Dashboard Cards:** Total Roles, System Roles, Custom Roles.
- **11. Detail Page:** `/admin/roles/[id]` (Permission checklist tree per domain).
- **12. Create Form:** `name`, `description`, `permissions[]`.
- **13. Edit Form:** `name`, `description`, `permissions[]`.
- **14. Required Permissions:** `roles:read`, `roles:create`, `roles:update`, `roles:delete`
- **15. Future API Endpoints:**
  - `GET /api/v1/admin/roles`
  - `POST /api/v1/admin/roles`
  - `GET /api/v1/admin/roles/:id`
  - `PATCH /api/v1/admin/roles/:id`
  - `DELETE /api/v1/admin/roles/:id`
- **16. Future Database Models:** `Role`, `Permission`, `RolePermission`.
- **17. Relationships:** Many-to-Many with Users and Permissions.

---

### GROUP 3: USER MANAGEMENT & CREATORS

#### 5. Users Module
- **1. Purpose:** Overview and management of all registered platform viewers and stream consumers.
- **2. Sidebar Location:** Management -> Users (`/users`)
- **3. Route:** `/users`
- **4. Page Structure:** PageHeader -> StatsCards (4 cards) -> Search/Filter Bar -> Users DataTable -> Pagination.
- **5. Components:** `PageHeader`, `StatsCard`, `DataTable`, `UserStatusBadge`, `CoinBalanceCell`, `UserDetailDrawer`.
- **6. Filters:** Account Status (`Active`, `Banned`, `Unverified`), Verification Status, Registration Date Range.
- **7. Table Columns:** User (`Avatar` + `Name` + `Username`), Email/Phone, Coin Balance, Total Spent ($), Status, Joined Date, Actions.
- **8. Row Actions:** View Profile, Adjust Coin Balance, Ban User, Unban User, Reset Password.
- **9. Bulk Actions:** Bulk Ban, Bulk Export CSV, Send Mass Notification.
- **10. Dashboard Cards:** Total Users, Active Today, Banned Users, New This Week.
- **11. Detail Page:** `/users/[id]` (Tabs: Overview, Stream History, Coin Transactions, Gift Received/Sent, Moderation Logs).
- **12. Create Form:** `name`, `username`, `email`, `phone`, `password`.
- **13. Edit Form:** `name`, `username`, `email`, `status`, `coinBalance`.
- **14. Required Permissions:** `users:read`, `users:create`, `users:update`, `users:ban`
- **15. Future API Endpoints:**
  - `GET /api/v1/users`
  - `POST /api/v1/users`
  - `GET /api/v1/users/:id`
  - `PATCH /api/v1/users/:id`
  - `POST /api/v1/users/:id/ban`
  - `POST /api/v1/users/:id/adjust-balance`
- **16. Future Database Models:** `User`, `Wallet`, `StreamRecord`.
- **17. Relationships:** One-to-One with Wallet, One-to-Many with Streams, Purchases, Gifts, Reports.

#### 6. Creator Applications Module
- **1. Purpose:** Verification and review queue for users applying to become official Stream Creators.
- **2. Sidebar Location:** Management -> Creator Apps (`/creators/applications`)
- **3. Route:** `/creators/applications`
- **4. Page Structure:** PageHeader -> StatsCards (3 cards) -> Status Tabs (`Pending`, `Approved`, `Rejected`) -> Applications DataTable.
- **5. Components:** `PageHeader`, `DataTable`, `KycDocumentViewer`, `ApplicationReviewModal`.
- **6. Filters:** Application Status, ID Verification Type (`Passport`, `Driver License`, `ID Card`).
- **7. Table Columns:** Applicant (`Avatar` + `Name`), Social Channels, ID Document Status, Application Date, Status Badge, Actions.
- **8. Row Actions:** Review Application, Approve Creator, Reject Application (with reason).
- **9. Bulk Actions:** Bulk Approve, Bulk Reject.
- **10. Dashboard Cards:** Pending Applications, Approved Today, Rejected Today.
- **11. Detail Page:** `/creators/applications/[id]` (Government ID previews, selfie verification, bio, social media verification).
- **12. Create Form:** N/A (Submitted via Flutter App/Client).
- **13. Edit Form:** Review Form (`status`, `rejectionReason`, `adminNotes`).
- **14. Required Permissions:** `creator_apps:read`, `creator_apps:review`
- **15. Future API Endpoints:**
  - `GET /api/v1/creators/applications`
  - `GET /api/v1/creators/applications/:id`
  - `POST /api/v1/creators/applications/:id/approve`
  - `POST /api/v1/creators/applications/:id/reject`
- **16. Future Database Models:** `CreatorApplication`, `User`, `KycDocument`.
- **17. Relationships:** Belongs to User; updates User role to `creator`.

#### 7. Creators Module
- **1. Purpose:** Performance management, commission tiering, and analytics for onboarded Live Stream Creators.
- **2. Sidebar Location:** Management -> Creators (`/creators`)
- **3. Route:** `/creators`
- **4. Page Structure:** PageHeader -> StatsCards (4 cards) -> Creator Search/Filter -> Creators DataTable.
- **5. Components:** `PageHeader`, `StatsCard`, `DataTable`, `CommissionBadge`, `StreamTimeCell`.
- **6. Filters:** Commission Tier, Live Status (`Live Now`, `Offline`), Total Earnings Bracket.
- **7. Table Columns:** Creator (`Avatar` + `Channel Name`), Followers Count, Total Live Hours, Earned Coins, Payout Split %, Status, Actions.
- **8. Row Actions:** View Channel Analytics, Adjust Commission Split %, Suspend Creator Privileges, View Payout History.
- **9. Bulk Actions:** Bulk Commission Adjustment, Bulk Export.
- **10. Dashboard Cards:** Verified Creators, Active Streamers, Total Creator Earnings ($), Average Stream Hours.
- **11. Detail Page:** `/creators/[id]` (Tabs: Stream Analytics, Earnings Breakdown, Payout Accounts, Moderation History).
- **12. Create Form:** Direct Onboarding Form (`userId`, `channelName`, `commissionRate`).
- **13. Edit Form:** `channelName`, `bio`, `commissionRate`, `isFeatured`.
- **14. Required Permissions:** `creators:read`, `creators:update`, `creators:manage_payout`
- **15. Future API Endpoints:**
  - `GET /api/v1/creators`
  - `GET /api/v1/creators/:id`
  - `PATCH /api/v1/creators/:id`
  - `GET /api/v1/creators/:id/analytics`
- **16. Future Database Models:** `Creator`, `User`, `StreamRecord`, `Payout`.
- **17. Relationships:** One-to-One with User, One-to-Many with Stream, Withdrawal.

---

### GROUP 4: LIVE STREAMING & CONTENT MANAGEMENT

#### 8. Live Streams Module
- **1. Purpose:** Real-time monitoring, bitrate telemetry, and live moderation (kill stream / mute / ban) of ongoing broadcasts.
- **2. Sidebar Location:** Management -> Live Streams (`/streams`)
- **3. Route:** `/streams`
- **4. Page Structure:** PageHeader -> StatsCards (4 cards) -> Stream Grid / Table View -> Moderation Video Player Modal.
- **5. Components:** `PageHeader`, `StreamCard`, `LiveBadge`, `BitrateIndicator`, `StreamModerationPlayer`.
- **6. Filters:** Stream Status (`LIVE`, `ENDED`, `BLOCKED`), Category, Health Status (`Good`, `Poor Bitrate`).
- **7. Table Columns:** Stream (`Thumbnail` + `Title`), Creator, Category, Viewers Count, Peak Viewers, Bitrate (kbps), Duration, Actions.
- **8. Row Actions:** Watch Stream, Terminate Stream (Kill Switch), Mute Stream Audio, Warn Creator, Ban Creator.
- **9. Bulk Actions:** Bulk Terminate Selected Streams.
- **10. Dashboard Cards:** Streams Live Now, Concurrent Viewers, Total Bandwidth Consumption, Flagged Streams.
- **11. Detail Page:** `/streams/[id]` (HLS video preview, real-time Socket.IO chat feed, viewer count graph, technical WebRTC/RTMP stats).
- **12. Create Form:** N/A (Created dynamically via OBS / WebRTC / Mobile App).
- **13. Edit Form:** `title`, `categoryId`, `tags`, `isPrivate`.
- **14. Required Permissions:** `streams:read`, `streams:terminate`, `streams:moderate`
- **15. Future API Endpoints:**
  - `GET /api/v1/streams`
  - `GET /api/v1/streams/:id`
  - `POST /api/v1/streams/:id/terminate`
  - `GET /api/v1/streams/:id/chat-logs`
- **16. Future Database Models:** `Stream`, `Creator`, `Category`, `ChatMessage`.
- **17. Relationships:** Belongs to Creator & Category, One-to-Many with ChatMessage & Reports.

#### 9. Scheduled Streams Module
- **1. Purpose:** Management of upcoming event streams and stream calendar bookings.
- **2. Sidebar Location:** Management -> Scheduled Streams (`/streams/scheduled`)
- **3. Route:** `/streams/scheduled`
- **4. Page Structure:** PageHeader -> Calendar / Table Toggle -> Scheduled Streams Table.
- **5. Components:** `PageHeader`, `ScheduledStreamTable`, `EventCalendarView`, `StreamScheduleModal`.
- **6. Filters:** Category, Date Range, Notification Sent Status.
- **7. Table Columns:** Event Title, Creator, Category, Scheduled Time, Subscriptions/RSVP Count, Status, Actions.
- **8. Row Actions:** Edit Schedule, Cancel Event, Send Reminder Notification.
- **9. Bulk Actions:** Bulk Cancel.
- **10. Dashboard Cards:** Upcoming Streams Today, Total RSVPs, Featured Events.
- **11. Detail Page:** `/streams/scheduled/[id]` (RSVP user list, event details).
- **12. Create Form:** `creatorId`, `title`, `description`, `categoryId`, `scheduledAt`, `bannerUrl`.
- **13. Edit Form:** `title`, `description`, `scheduledAt`, `bannerUrl`.
- **14. Required Permissions:** `streams:schedule_read`, `streams:schedule_write`
- **15. Future API Endpoints:**
  - `GET /api/v1/streams/scheduled`
  - `POST /api/v1/streams/scheduled`
  - `PATCH /api/v1/streams/scheduled/:id`
  - `DELETE /api/v1/streams/scheduled/:id`
- **16. Future Database Models:** `ScheduledStream`, `UserRsvp`.
- **17. Relationships:** Belongs to Creator & Category.

#### 10. Categories Module
- **1. Purpose:** Management of stream categories (e.g. Gaming, Music, Just Chatting, Esports).
- **2. Sidebar Location:** Content -> Categories (`/categories`)
- **3. Route:** `/categories`
- **4. Page Structure:** PageHeader -> Categories Grid/Table -> Category Modal.
- **5. Components:** `PageHeader`, `CategoryCard`, `CategoryModal`, `IconPicker`.
- **6. Filters:** Status (`Active`, `Disabled`).
- **7. Table Columns:** Icon/Image, Category Name, Slug, Active Streams Count, Total Viewers, Status, Actions.
- **8. Row Actions:** Edit Category, Toggle Active Status, Delete Category.
- **9. Bulk Actions:** Bulk Enable/Disable.
- **10. Dashboard Cards:** Total Categories, Most Popular Category, Active Categories.
- **11. Detail Page:** `/categories/[id]` (Category performance metrics, active streams list).
- **12. Create Form:** `name`, `slug`, `iconUrl`, `bannerUrl`, `description`, `isFeatured`.
- **13. Edit Form:** `name`, `slug`, `iconUrl`, `bannerUrl`, `description`, `isFeatured`.
- **14. Required Permissions:** `categories:read`, `categories:write`
- **15. Future API Endpoints:**
  - `GET /api/v1/categories`
  - `POST /api/v1/categories`
  - `PATCH /api/v1/categories/:id`
  - `DELETE /api/v1/categories/:id`
- **16. Future Database Models:** `Category`, `Stream`.
- **17. Relationships:** One-to-Many with Stream.

#### 11. Tags Module
- **1. Purpose:** Taxonomy tags for content discoverability and stream filtering.
- **2. Sidebar Location:** Content -> Tags (`/tags`)
- **3. Route:** `/tags`
- **4. Page Structure:** PageHeader -> Tags DataTable -> Add Tag Drawer.
- **5. Components:** `PageHeader`, `DataTable`, `TagFormDialog`.
- **6. Filters:** Usage Count Bracket.
- **7. Table Columns:** Tag Name, Slug, Usage Count, Created At, Actions.
- **8. Row Actions:** Edit Tag, Delete Tag.
- **9. Bulk Actions:** Bulk Delete.
- **10. Dashboard Cards:** Total Tags, Top Trending Tag.
- **11. Detail Page:** N/A.
- **12. Create Form:** `name`, `slug`.
- **13. Edit Form:** `name`, `slug`.
- **14. Required Permissions:** `tags:read`, `tags:write`
- **15. Future API Endpoints:**
  - `GET /api/v1/tags`
  - `POST /api/v1/tags`
  - `PATCH /api/v1/tags/:id`
  - `DELETE /api/v1/tags/:id`
- **16. Future Database Models:** `Tag`, `StreamTag`.
- **17. Relationships:** Many-to-Many with Stream.

---

### GROUP 5: MONETIZATION & VIRTUAL ECONOMY

#### 12. Coin Packages Module
- **1. Purpose:** Virtual currency price packages, bonus coin promotions, and IAP store configuration.
- **2. Sidebar Location:** Finance -> Coin Packages (`/finance/coins`)
- **3. Route:** `/finance/coins`
- **4. Page Structure:** PageHeader -> Package Grid -> Package Form Modal.
- **5. Components:** `PageHeader`, `CoinPackageCard`, `CoinPackageModal`.
- **6. Filters:** Status (`Active`, `Inactive`), Platform (`iOS App Store`, `Google Play`, `Web Stripe`).
- **7. Table Columns:** Package Name, Coin Amount, Bonus Coins, Price ($), Store Product ID, Status, Actions.
- **8. Row Actions:** Edit Package, Toggle Status, Delete.
- **9. Bulk Actions:** Bulk Activate/Deactivate.
- **10. Dashboard Cards:** Active Packages, Best Seller Package, Total Coin Sales.
- **11. Detail Page:** N/A.
- **12. Create Form:** `name`, `coinAmount`, `bonusCoins`, `price`, `appleProductId`, `googleProductId`, `badgeTag`.
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `coins:read`, `coins:write`
- **15. Future API Endpoints:**
  - `GET /api/v1/coins/packages`
  - `POST /api/v1/coins/packages`
  - `PATCH /api/v1/coins/packages/:id`
  - `DELETE /api/v1/coins/packages/:id`
- **16. Future Database Models:** `CoinPackage`, `CoinPurchase`.
- **17. Relationships:** One-to-Many with CoinPurchase.

#### 13. Coin Purchases Module
- **1. Purpose:** Audit log of all real-money virtual coin purchases across In-App Purchases (IAP) & Stripe.
- **2. Sidebar Location:** Finance -> Purchases (`/finance/purchases`)
- **3. Route:** `/finance/purchases`
- **4. Page Structure:** PageHeader -> StatsCards (3 cards) -> Filter Bar -> Purchases DataTable.
- **5. Components:** `PageHeader`, `StatsCard`, `DataTable`, `PaymentGatewayBadge`.
- **6. Filters:** Payment Gateway (`Stripe`, `Apple IAP`, `Google Play`), Status (`Success`, `Pending`, `Refunded`), Date Range.
- **7. Table Columns:** Transaction Ref, User, Package, Price ($), Coins Awarded, Gateway, Date, Status, Actions.
- **8. Row Actions:** View Invoice/Receipt, Trigger Refund (Admin override).
- **9. Bulk Actions:** Export CSV Audit.
- **10. Dashboard Cards:** Gross Coin Revenue, Total Coins Issued, Refunded Amount.
- **11. Detail Page:** `/finance/purchases/[id]` (Payment gateway payload, user transaction history).
- **12. Create Form:** N/A (Generated via payment webhooks).
- **13. Edit Form:** N/A.
- **14. Required Permissions:** `purchases:read`, `purchases:refund`
- **15. Future API Endpoints:**
  - `GET /api/v1/finance/purchases`
  - `GET /api/v1/finance/purchases/:id`
  - `POST /api/v1/finance/purchases/:id/refund`
- **16. Future Database Models:** `CoinPurchase`, `User`, `CoinPackage`.
- **17. Relationships:** Belongs to User & CoinPackage.

#### 14. Gifts Module
- **1. Purpose:** Virtual gift items catalog (stickers, 3D animations, sound effects) sent during live streams.
- **2. Sidebar Location:** Engagement -> Gifts (`/gifts`)
- **3. Route:** `/gifts`
- **4. Page Structure:** PageHeader -> Gift Items Grid -> Gift Form Modal.
- **5. Components:** `PageHeader`, `GiftCard`, `GiftAnimationPreview`, `GiftModal`.
- **6. Filters:** Gift Category, SVGA / Lottie Animation Type, Status.
- **7. Table Columns:** Icon/Preview, Gift Name, Category, Coin Price, Animation Type, Times Sent, Status, Actions.
- **8. Row Actions:** Preview Animation, Edit Gift, Toggle Active Status, Delete.
- **9. Bulk Actions:** Bulk Enable/Disable.
- **10. Dashboard Cards:** Total Gifts, Most Sent Gift, Highest Value Gift.
- **11. Detail Page:** N/A.
- **12. Create Form:** `name`, `categoryId`, `coinPrice`, `iconUrl`, `animationUrl`, `animationType` (`SVGA`, `LOTTIE`, `PNG`).
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `gifts:read`, `gifts:write`
- **15. Future API Endpoints:**
  - `GET /api/v1/gifts`
  - `POST /api/v1/gifts`
  - `PATCH /api/v1/gifts/:id`
  - `DELETE /api/v1/gifts/:id`
- **16. Future Database Models:** `Gift`, `GiftCategory`, `GiftTransaction`.
- **17. Relationships:** Belongs to GiftCategory, One-to-Many with GiftTransaction.

#### 15. Gift Categories Module
- **1. Purpose:** Categorization of gifts (e.g. Popular, Luxury, Super Cars, Mini).
- **2. Sidebar Location:** Engagement -> Gift Categories (`/gifts/categories`)
- **3. Route:** `/gifts/categories`
- **4. Page Structure:** PageHeader -> Gift Categories Table -> Form Dialog.
- **5. Components:** `PageHeader`, `DataTable`, `GiftCategoryModal`.
- **6. Filters:** Status.
- **7. Table Columns:** Name, Display Order, Gifts Count, Status, Actions.
- **8. Row Actions:** Reorder, Edit, Delete.
- **9. Bulk Actions:** Bulk Delete.
- **10. Dashboard Cards:** Total Gift Categories.
- **11. Detail Page:** N/A.
- **12. Create Form:** `name`, `displayOrder`, `isActive`.
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `gifts:category_manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/gifts/categories`
  - `POST /api/v1/gifts/categories`
  - `PATCH /api/v1/gifts/categories/:id`
  - `DELETE /api/v1/gifts/categories/:id`
- **16. Future Database Models:** `GiftCategory`, `Gift`.
- **17. Relationships:** One-to-Many with Gift.

#### 16. Subscriptions Module
- **1. Purpose:** Viewer subscriptions to channel creators (Monthly channel VIP memberships).
- **2. Sidebar Location:** Finance -> Subscriptions (`/finance/subscriptions`)
- **3. Route:** `/finance/subscriptions`
- **4. Page Structure:** PageHeader -> StatsCards (3 cards) -> Subscriptions Table.
- **5. Components:** `PageHeader`, `DataTable`, `SubscriptionBadge`.
- **6. Filters:** Status (`Active`, `Cancelled`, `Expired`), Plan Tier.
- **7. Table Columns:** Subscriber, Creator Channel, Tier Plan, Monthly Price, Auto-Renew Status, Expiry Date, Actions.
- **8. Row Actions:** Cancel Subscription, Extend Subscription, View Invoice.
- **9. Bulk Actions:** Export CSV.
- **10. Dashboard Cards:** Active Subscriptions, Monthly Recurring Revenue (MRR), Churn Rate %.
- **11. Detail Page:** `/finance/subscriptions/[id]` (Recurring billing history).
- **12. Create Form:** Admin Manual Grant (`userId`, `creatorId`, `planId`, `durationMonths`).
- **13. Edit Form:** `status`, `expiresAt`.
- **14. Required Permissions:** `subscriptions:read`, `subscriptions:manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/finance/subscriptions`
  - `POST /api/v1/finance/subscriptions`
  - `POST /api/v1/finance/subscriptions/:id/cancel`
- **16. Future Database Models:** `Subscription`, `User`, `Creator`, `SubscriptionPlan`.
- **17. Relationships:** Belongs to User, Creator, SubscriptionPlan.

#### 17. Subscription Plans Module
- **1. Purpose:** Configuration of subscription tiers (Tier 1, Tier 2, Tier 3) and viewer perk configs.
- **2. Sidebar Location:** Finance -> Sub Plans (`/finance/subscription-plans`)
- **3. Route:** `/finance/subscription-plans`
- **4. Page Structure:** PageHeader -> Plan Cards Grid -> Form Modal.
- **5. Components:** `PageHeader`, `PlanCard`, `PlanModal`.
- **6. Filters:** Status.
- **7. Table Columns:** Plan Name, Tier Level, Price ($), Creator Revenue Share %, Custom Badges Allowed, Status, Actions.
- **8. Row Actions:** Edit Plan, Toggle Active.
- **9. Bulk Actions:** N/A.
- **10. Dashboard Cards:** Active Tiers.
- **11. Detail Page:** N/A.
- **12. Create Form:** `name`, `tierLevel`, `price`, `creatorSharePercent`, `perksDescription[]`.
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `subscriptions:plan_manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/finance/subscription-plans`
  - `POST /api/v1/finance/subscription-plans`
  - `PATCH /api/v1/finance/subscription-plans/:id`
- **16. Future Database Models:** `SubscriptionPlan`, `Subscription`.
- **17. Relationships:** One-to-Many with Subscription.

#### 18. Transactions Module
- **1. Purpose:** Complete double-entry ledger audit log of all coin flow, gift transfers, payouts, and purchases.
- **2. Sidebar Location:** Finance -> Transactions (`/finance/transactions`)
- **3. Route:** `/finance/transactions`
- **4. Page Structure:** PageHeader -> StatsCards (4 cards) -> Advanced Filter Toolbar -> Transactions Table.
- **5. Components:** `PageHeader`, `StatsCard`, `DataTable`, `TransactionTypeBadge`.
- **6. Filters:** Transaction Type (`COIN_PURCHASE`, `GIFT_SENT`, `PAYOUT`, `SUBSCRIPTION`), Date Range, Amount Range.
- **7. Table Columns:** Transaction ID, Sender / User, Receiver / Creator, Type, Amount (Coins / $), Status, Date, Actions.
- **8. Row Actions:** View Transaction Receipt, View Ledger Pair.
- **9. Bulk Actions:** Bulk Audit Export.
- **10. Dashboard Cards:** Total Transaction Volume, Total Coins Transferred, System Commission Fee Revenue.
- **11. Detail Page:** `/finance/transactions/[id]` (JSON payload, wallet debit/credit snapshots).
- **12. Create Form:** N/A (Ledger generated system-wide).
- **13. Edit Form:** N/A (Read-only immutable ledger).
- **14. Required Permissions:** `transactions:read`, `transactions:export`
- **15. Future API Endpoints:**
  - `GET /api/v1/finance/transactions`
  - `GET /api/v1/finance/transactions/:id`
  - `GET /api/v1/finance/transactions/export`
- **16. Future Database Models:** `Transaction`, `Wallet`.
- **17. Relationships:** Links User, Creator, CoinPackage, Gift, Payout.

#### 19. Withdrawals Module
- **1. Purpose:** Review, approval, processing, and bank payout of creator earned earnings.
- **2. Sidebar Location:** Finance -> Withdrawals (`/finance/withdrawals`)
- **3. Route:** `/finance/withdrawals`
- **4. Page Structure:** PageHeader -> StatsCards (3 cards) -> Status Tabs (`Pending`, `Approved`, `Rejected`, `Paid`) -> Withdrawals Table.
- **5. Components:** `PageHeader`, `StatsCard`, `DataTable`, `PayoutModal`, `BankDetailsCell`.
- **6. Filters:** Status, Payment Method (`Bank Transfer`, `PayPal`, `Stripe Connect`).
- **7. Table Columns:** Request ID, Creator, Requested Amount ($), Coins Converted, Payment Account Info, Date, Status, Actions.
- **8. Row Actions:** Approve Request, Process Bank Transfer, Reject (with reason), View Bank Details.
- **9. Bulk Actions:** Bulk Approve Payouts.
- **10. Dashboard Cards:** Pending Withdrawal Requests, Pending Amount ($), Paid This Month.
- **11. Detail Page:** `/finance/withdrawals/[id]` (Bank account numbers, payout history, verification status).
- **12. Create Form:** N/A.
- **13. Edit Form:** Payout Review Form (`status`, `transactionReference`, `rejectionReason`, `adminNotes`).
- **14. Required Permissions:** `withdrawals:read`, `withdrawals:approve`, `withdrawals:process`
- **15. Future API Endpoints:**
  - `GET /api/v1/finance/withdrawals`
  - `GET /api/v1/finance/withdrawals/:id`
  - `POST /api/v1/finance/withdrawals/:id/approve`
  - `POST /api/v1/finance/withdrawals/:id/reject`
  - `POST /api/v1/finance/withdrawals/:id/mark-paid`
- **16. Future Database Models:** `Withdrawal`, `Creator`, `BankAccount`.
- **17. Relationships:** Belongs to Creator.

#### 20. Revenue Module
- **1. Purpose:** High-level platform financial reporting, coin margin analytics, and platform profit breakdowns.
- **2. Sidebar Location:** Finance -> Revenue Analytics (`/finance/revenue`)
- **3. Route:** `/finance/revenue`
- **4. Page Structure:** PageHeader -> Financial Overview Stats -> Revenue Breakdown Grid (Coin Revenue, Subscriptions, Platform Fees).
- **5. Components:** `PageHeader`, `StatsCard`, `RevenueReportTable`.
- **6. Filters:** Date Range Picker, Revenue Source (`Coin Sales`, `Gift Margin`, `Sub Net`).
- **7. Table Columns:** Date/Month, Gross Revenue, Payout Expense, Platform Net Commission, Net Profit, Actions.
- **8. Row Actions:** Download Monthly Statement.
- **9. Bulk Actions:** Export Financial Audit Report.
- **10. Dashboard Cards:** Total Platform Gross, Total Creator Payouts, Net Platform Profit, Profit Margin %.
- **11. Detail Page:** N/A.
- **12. Create Form:** N/A.
- **13. Edit Form:** N/A.
- **14. Required Permissions:** `revenue:read`, `revenue:export`
- **15. Future API Endpoints:**
  - `GET /api/v1/finance/revenue/summary`
  - `GET /api/v1/finance/revenue/report`
- **16. Future Database Models:** Aggregate SQL views over `Transaction` & `Withdrawal`.
- **17. Relationships:** Summarizes Transactions, Purchases, Withdrawals.

---

### GROUP 6: MODERATION & SUPPORT

#### 21. Reports Module
- **1. Purpose:** Moderation queue handling user reports on streams, chat comments, and user profiles.
- **2. Sidebar Location:** Engagement -> Reports (`/reports`)
- **3. Route:** `/reports`
- **4. Page Structure:** PageHeader -> StatsCards (3 cards) -> Severity & Status Tabs -> Reports DataTable.
- **5. Components:** `PageHeader`, `StatsCard`, `DataTable`, `ReportSeverityBadge`, `ReportActionModal`.
- **6. Filters:** Report Type (`Stream`, `User Profile`, `Chat Comment`), Status (`Pending`, `Resolved`, `Dismissed`), Severity.
- **7. Table Columns:** Report ID, Reported Target, Reporter, Reason, Severity, Timestamp, Status, Actions.
- **8. Row Actions:** Inspect Reported Content, Resolve (Ban Target / Remove Stream), Dismiss Report.
- **9. Bulk Actions:** Bulk Dismiss, Bulk Resolve.
- **10. Dashboard Cards:** Pending Reports, High Severity Reports, Resolved Today.
- **11. Detail Page:** `/reports/[id]` (Evidence snapshot, chat message context snippet, video playback clip).
- **12. Create Form:** N/A (Generated by viewers/users).
- **13. Edit Form:** Resolution Form (`actionTaken`, `notes`, `status`).
- **14. Required Permissions:** `reports:read`, `reports:resolve`
- **15. Future API Endpoints:**
  - `GET /api/v1/reports`
  - `GET /api/v1/reports/:id`
  - `POST /api/v1/reports/:id/resolve`
  - `POST /api/v1/reports/:id/dismiss`
- **16. Future Database Models:** `Report`, `User`, `Stream`, `ChatMessage`.
- **17. Relationships:** Links Reporter (User) & Reported Entity.

#### 22. Support Tickets Module
- **1. Purpose:** Customer support ticketing desk for user and creator inquiries.
- **2. Sidebar Location:** Moderation -> Support Tickets (`/support/tickets`)
- **3. Route:** `/support/tickets`
- **4. Page Structure:** PageHeader -> Status Tabs -> Tickets DataTable -> Ticket Conversation View.
- **5. Components:** `PageHeader`, `DataTable`, `TicketPriorityBadge`, `TicketChatThread`.
- **6. Filters:** Priority (`Urgent`, `High`, `Normal`), Status (`Open`, `In Progress`, `Closed`), Category.
- **7. Table Columns:** Ticket ID, User, Subject, Category, Priority, Assigned Admin, Last Reply, Status, Actions.
- **8. Row Actions:** Open Conversation, Assign to Admin, Close Ticket.
- **9. Bulk Actions:** Bulk Assign, Bulk Close.
- **10. Dashboard Cards:** Open Tickets, Urgent Tickets, Average Resolution Time.
- **11. Detail Page:** `/support/tickets/[id]` (Full thread with rich text reply box, internal admin notes).
- **12. Create Form:** Internal Admin Ticket Form (`userId`, `subject`, `category`, `message`).
- **13. Edit Form:** `status`, `priority`, `assignedAdminId`.
- **14. Required Permissions:** `support:read`, `support:reply`, `support:manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/support/tickets`
  - `GET /api/v1/support/tickets/:id`
  - `POST /api/v1/support/tickets/:id/reply`
  - `PATCH /api/v1/support/tickets/:id`
- **16. Future Database Models:** `SupportTicket`, `TicketMessage`, `User`.
- **17. Relationships:** Belongs to User & Assigned Admin.

---

### GROUP 7: CONTENT & SYSTEM COMMUNICATIONS

#### 23. Notifications Module
- **1. Purpose:** In-app notification center logs and message distribution settings.
- **2. Sidebar Location:** Engagement -> Notifications (`/notifications`)
- **3. Route:** `/notifications`
- **4. Page Structure:** PageHeader -> Notification History Table.
- **5. Components:** `PageHeader`, `DataTable`, `NotificationFormModal`.
- **6. Filters:** Target Audience (`All Users`, `Creators Only`, `Specific User`).
- **7. Table Columns:** Title, Message Snippet, Target Group, Sent At, Read Rate %, Actions.
- **8. Row Actions:** View Details, Resend.
- **9. Bulk Actions:** Bulk Delete.
- **10. Dashboard Cards:** Total Sent Notifications, Average Open Rate %.
- **11. Detail Page:** N/A.
- **12. Create Form:** `title`, `body`, `targetType`, `targetUserIds[]`, `deepLinkUrl`.
- **13. Edit Form:** N/A.
- **14. Required Permissions:** `notifications:read`, `notifications:send`
- **15. Future API Endpoints:**
  - `GET /api/v1/notifications`
  - `POST /api/v1/notifications/send`
- **16. Future Database Models:** `Notification`, `UserNotification`.
- **17. Relationships:** Many-to-Many with User.

#### 24. Push Notifications Module
- **1. Purpose:** Firebase FCM / APNS broadcast push notification trigger tool.
- **2. Sidebar Location:** Engagement -> Push Broadcast (`/notifications/push`)
- **3. Route:** `/notifications/push`
- **4. Page Structure:** PageHeader -> Broadcast Composer Form -> Past Broadcasts List.
- **5. Components:** `PageHeader`, `PushComposerForm`, `BroadcastHistoryTable`.
- **6. Filters:** Device OS (`iOS`, `Android`, `All`).
- **7. Table Columns:** Push Title, Message, Sent Time, Delivered Count, Click Count, Actions.
- **8. Row Actions:** View Performance.
- **9. Bulk Actions:** N/A.
- **10. Dashboard Cards:** Total Push Sent, Open Rate %.
- **11. Detail Page:** N/A.
- **12. Create Form:** `title`, `body`, `imageUrl`, `segment`, `scheduleTime`.
- **13. Edit Form:** N/A.
- **14. Required Permissions:** `push:broadcast`
- **15. Future API Endpoints:**
  - `POST /api/v1/notifications/push/broadcast`
  - `GET /api/v1/notifications/push/history`
- **16. Future Database Models:** `PushBroadcast`.
- **17. Relationships:** Interacts with User Device Tokens.

#### 25. Banners Module
- **1. Purpose:** Mobile App home screen slider promotional banners & stream highlights.
- **2. Sidebar Location:** Content -> Banners (`/content/banners`)
- **3. Route:** `/content/banners`
- **4. Page Structure:** PageHeader -> Banner Grid -> Banner Modal.
- **5. Components:** `PageHeader`, `BannerCard`, `BannerModal`.
- **6. Filters:** Target Placement (`Home Slider`, `Category Top`, `Stream Loading`), Status.
- **7. Table Columns:** Image Preview, Title, Action URL / Stream ID, Display Order, Status, Actions.
- **8. Row Actions:** Edit Banner, Reorder, Delete.
- **9. Bulk Actions:** Bulk Delete.
- **10. Dashboard Cards:** Active Banners, Total Banner Clicks.
- **11. Detail Page:** N/A.
- **12. Create Form:** `title`, `imageUrl`, `actionType` (`EXTERNAL_URL`, `STREAM`, `CATEGORY`), `actionValue`, `displayOrder`, `isActive`.
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `banners:manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/content/banners`
  - `POST /api/v1/content/banners`
  - `PATCH /api/v1/content/banners/:id`
  - `DELETE /api/v1/content/banners/:id`
- **16. Future Database Models:** `Banner`.
- **17. Relationships:** Independent.

#### 26. CMS Pages Module
- **1. Purpose:** Static content pages management (Privacy Policy, Terms of Service, Community Guidelines).
- **2. Sidebar Location:** Content -> CMS Pages (`/content/cms`)
- **3. Route:** `/content/cms`
- **4. Page Structure:** PageHeader -> CMS Pages List -> Rich Text Editor View.
- **5. Components:** `PageHeader`, `RichTextEditor`, `CmsPageTable`.
- **6. Filters:** Status.
- **7. Table Columns:** Page Title, Slug, Last Updated, Published Status, Actions.
- **8. Row Actions:** Edit Page Content, View Live Page.
- **9. Bulk Actions:** N/A.
- **10. Dashboard Cards:** Total CMS Pages.
- **11. Detail Page:** `/content/cms/[id]` (Full Markdown / HTML editor).
- **12. Create Form:** `title`, `slug`, `contentHtml`, `metaDescription`.
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `cms:manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/content/cms`
  - `POST /api/v1/content/cms`
  - `PATCH /api/v1/content/cms/:id`
- **16. Future Database Models:** `CmsPage`.
- **17. Relationships:** Independent.

#### 27. FAQs Module
- **1. Purpose:** Frequently Asked Questions management for mobile app help section.
- **2. Sidebar Location:** Content -> FAQs (`/content/faqs`)
- **3. Route:** `/content/faqs`
- **4. Page Structure:** PageHeader -> FAQ Accordion List -> FAQ Form Dialog.
- **5. Components:** `PageHeader`, `FaqAccordionTable`, `FaqModal`.
- **6. Filters:** Category (`Account`, `Coins`, `Streaming`, `Payments`).
- **7. Table Columns:** Question, Category, Order, Status, Actions.
- **8. Row Actions:** Edit FAQ, Delete FAQ.
- **9. Bulk Actions:** Bulk Delete.
- **10. Dashboard Cards:** Total FAQs.
- **11. Detail Page:** N/A.
- **12. Create Form:** `question`, `answer`, `category`, `displayOrder`.
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `faqs:manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/content/faqs`
  - `POST /api/v1/content/faqs`
  - `PATCH /api/v1/content/faqs/:id`
  - `DELETE /api/v1/content/faqs/:id`
- **16. Future Database Models:** `Faq`.
- **17. Relationships:** Independent.

#### 28. Announcements Module
- **1. Purpose:** In-app popup announcements & global site banner alerts.
- **2. Sidebar Location:** Content -> Announcements (`/content/announcements`)
- **3. Route:** `/content/announcements`
- **4. Page Structure:** PageHeader -> Announcements Table -> Form Dialog.
- **5. Components:** `PageHeader`, `DataTable`, `AnnouncementModal`.
- **6. Filters:** Status (`Active`, `Expired`).
- **7. Table Columns:** Title, Type (`POPUP`, `HEADER_BAR`), Start Date, End Date, Status, Actions.
- **8. Row Actions:** Edit, Expire Now, Delete.
- **9. Bulk Actions:** Bulk Expire.
- **10. Dashboard Cards:** Active Announcements.
- **11. Detail Page:** N/A.
- **12. Create Form:** `title`, `content`, `type`, `startDate`, `endDate`, `isDismissible`.
- **13. Edit Form:** Same as Create Form.
- **14. Required Permissions:** `announcements:manage`
- **15. Future API Endpoints:**
  - `GET /api/v1/content/announcements`
  - `POST /api/v1/content/announcements`
  - `PATCH /api/v1/content/announcements/:id`
- **16. Future Database Models:** `Announcement`.
- **17. Relationships:** Independent.

---

### GROUP 8: SYSTEM AUDIT & PLATFORM SETTINGS

#### 29. Audit Logs Module
- **1. Purpose:** Immutable security audit log tracking every administrative action taken on the panel.
- **2. Sidebar Location:** Administration -> Audit Logs (`/admin/audit-logs`)
- **3. Route:** `/admin/audit-logs`
- **4. Page Structure:** PageHeader -> Filter Bar -> Audit Logs Table -> Payload Inspector Drawer.
- **5. Components:** `PageHeader`, `DataTable`, `JsonPayloadViewer`, `IpAddressBadge`.
- **6. Filters:** Admin User, Action Type (`USER_BAN`, `WITHDRAWAL_APPROVE`, `STREAM_KILL`), Date Range.
- **7. Table Columns:** Timestamp, Admin User, Action Performed, Target Resource, IP Address, Status, Actions.
- **8. Row Actions:** View Full JSON Request/Response Payload.
- **9. Bulk Actions:** Export Audit CSV.
- **10. Dashboard Cards:** Total Actions Logged Today, Critical Actions.
- **11. Detail Page:** `/admin/audit-logs/[id]` (Complete request headers, diff view of before/after state).
- **12. Create Form:** N/A (Automated backend interceptor).
- **13. Edit Form:** N/A (Strictly read-only & immutable).
- **14. Required Permissions:** `audit:read`, `audit:export`
- **15. Future API Endpoints:**
  - `GET /api/v1/admin/audit-logs`
  - `GET /api/v1/admin/audit-logs/:id`
  - `GET /api/v1/admin/audit-logs/export`
- **16. Future Database Models:** `AuditLog`, `User`.
- **17. Relationships:** Belongs to Admin User.

#### 30. App Settings (General, Storage, Payment, Streaming, Moderation) Modules
- **1. Purpose:** Master system configuration portal for global platform thresholds and third-party keys.
- **2. Sidebar Location:** Administration -> Settings (`/settings`)
- **3. Route:** `/settings` (Tabs: `General`, `Storage`, `Payments`, `Streaming`, `Moderation`)
- **4. Page Structure:** PageHeader -> Settings Tab Bar -> Setting Form Cards -> Save Bar.
- **5. Components:** `PageHeader`, `SettingsTabs`, `GeneralSettingsForm`, `StorageSettingsForm`, `PaymentSettingsForm`, `StreamingSettingsForm`, `ModerationSettingsForm`.
- **6. Filters:** N/A.
- **7. Table Columns:** N/A.
- **8. Row Actions:** N/A.
- **9. Bulk Actions:** N/A.
- **10. Dashboard Cards:** N/A.
- **11. Detail Page:** N/A.
- **12. Create Form:** N/A.
- **13. Edit Form:**
  - **General:** `appName`, `contactEmail`, `supportPhone`, `maintenanceMode`.
  - **Storage:** `s3Bucket`, `s3Region`, `cdnDomain`, `maxUploadSizeMb`.
  - **Payments:** `stripePublicKey`, `currency`, `commissionRatePercentage`, `minWithdrawalAmount`.
  - **Streaming:** `rtmpServerUrl`, `hlsOutputUrl`, `maxBitrateKbps`, `maxStreamDurationHours`.
  - **Moderation:** `autoBanWordList[]`, `enableAiChatModeration`, `aiConfidenceThreshold`.
- **14. Required Permissions:** `settings:read`, `settings:update`
- **15. Future API Endpoints:**
  - `GET /api/v1/settings`
  - `PATCH /api/v1/settings`
- **16. Future Database Models:** `AppSetting` (`key-value` store).
- **17. Relationships:** Global application state.

---

## 3. Standardized Page Layout Contract

Every feature list page in the Admin Panel follows a unified UI contract:

```
┌────────────────────────────────────────────────────────────────────────┐
│ PageHeader (Title, Subtitle, [Primary Action Button])                  │
├────────────────────────────────────────────────────────────────────────┤
│ StatsCard Grid (3 or 4 metric cards)                                   │
├────────────────────────────────────────────────────────────────────────┤
│ Filter Toolbar: [Search Input ⌘K] [Dropdown Filters] [Date Range]      │
├────────────────────────────────────────────────────────────────────────┤
│ DataTable (Checkboxes, Columns, Badges, Row Action Dropdowns)          │
├────────────────────────────────────────────────────────────────────────┤
│ Footer Toolbar: [Bulk Actions Dropdown] ─────── [Pagination Controls] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Global Cross-Cutting System Strategies

### A. Global Search Strategy
- **Keyboard Shortcut:** `⌘K` or `Ctrl+K` opens global command palette.
- **Scope:** Searches across Users (Name/Email), Streams (Title), Creators (Channel), and Transactions (ID).
- **API Endpoint:** `GET /api/v1/admin/global-search?q={query}`

### B. Global Filters & Sorting Strategy
- Query param structure for all list endpoints:
  `?page=1&limit=20&sort=createdAt:desc&search=alex&status=ACTIVE`

### C. Global Pagination Strategy
- Default page size: 20 records. Selectable: `10`, `20`, `50`, `100`.
- Standard response format includes `pagination` object (`page`, `limit`, `total`, `totalPages`).

### D. RBAC Strategy
- Admin roles evaluated at:
  1. Next.js Client Route Level (`ProtectedRoute` with permissions check).
  2. NestJS Guard Level (`@Roles('super_admin')` & `@Permissions('users:ban')`).

### E. File Upload & Media Library Strategy
- Presigned S3 / Cloud Storage Upload URL flow:
  1. Admin requests upload token: `POST /api/v1/media/presigned-url` with `{ fileName, fileType }`.
  2. NestJS returns AWS S3 presigned PUT URL.
  3. Client uploads binary directly to S3 bucket.

### F. Audit Strategy
- NestJS `AuditInterceptor` automatically logs all HTTP `POST`, `PATCH`, `DELETE` requests performed by admin users into `AuditLog` table.

---

## 5. Feature Development Order & Phase Roadmap

Below is the strict dependency-based build sequence:

```
Phase 1: Foundation (COMPLETED)
  └── Layout, Auth Infrastructure, Axios Client, Dashboard Shell

Phase 2: Access & Identity (Next Step)
  ├── 1. Roles & Permissions Module (Required for RBAC guards)
  └── 2. Admins Module (Required to assign internal roles)

Phase 3: Core User & Creator Management
  ├── 3. Users Module
  ├── 4. Creator Applications Module
  └── 5. Creators Module

Phase 4: Live Streaming Engine
  ├── 6. Categories & Tags Modules
  ├── 7. Live Streams Module (Monitoring & Killswitch)
  └── 8. Scheduled Streams Module

Phase 5: Virtual Economy & Monetization
  ├── 9. Coin Packages & Purchases Modules
  ├── 10. Gifts & Gift Categories Modules
  ├── 11. Subscriptions & Plans Modules
  └── 12. Withdrawals & Revenue Analytics Modules

Phase 6: Moderation, Communications & Settings
  ├── 13. Reports & Support Tickets Modules
  ├── 14. Notifications & Banners Modules
  └── 15. System Settings & Audit Logs Modules
```

### Why Phase 2 (Roles & Admins) Must Be Built First:
1. **RBAC Guard Dependency:** All downstream modules (`Users`, `Streams`, `Withdrawals`) require specific permission keys (`users:ban`, `withdrawals:approve`).
2. **Audit Logging:** Every action taken in subsequent modules relies on the Admin identity context.

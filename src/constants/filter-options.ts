export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  description?: string;
  disabled?: boolean;
}

// User Account Status Filter Options
export const USER_STATUS_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
];

// User Verification Status Filter Options
export const VERIFICATION_STATUS_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Verifications" },
  { value: "NONE", label: "None" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
];

// User Auth Provider Filter Options
// Values MUST match backend AuthProvider enum (backend/src/common/enums/auth-provider.enum.ts)
export const AUTH_PROVIDER_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Providers" },
  { value: "LOCAL", label: "Email / Password" },
  { value: "GOOGLE", label: "Google" },
  { value: "PHONE", label: "Phone (OTP)" },
];

// User Onboarding Status Filter Options
// Values MUST match backend OnboardingStatus enum (backend/src/common/enums/onboarding-status.enum.ts)
export const ONBOARDING_STATUS_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Onboarding" },
  { value: "ACCOUNT_CREATED", label: "Account Created" },
  { value: "PROFILE_COMPLETED", label: "Profile Completed" },
  { value: "INTERESTS_SELECTED", label: "Interests Selected" },
  { value: "EMAIL_VERIFIED", label: "Email Verified" },
  { value: "READY", label: "Ready" },
];

// User List Sort Options (values MUST match backend AdminUserQueryDto sort whitelist)
export const USER_SORT_OPTIONS: FilterOption[] = [
  { value: "createdAt:desc", label: "Newest First" },
  { value: "createdAt:asc", label: "Oldest First" },
  { value: "lastLoginAt:desc", label: "Last Login" },
  { value: "lastSeenAt:desc", label: "Last Seen" },
  { value: "username:asc", label: "Username A–Z" },
  { value: "email:asc", label: "Email A–Z" },
  { value: "onboardingStatus:asc", label: "Onboarding Progress" },
];

// Moderation Event Action Options
// Values MUST match backend ModerationAction enum (backend/src/common/enums/moderation-action.enum.ts)
export const MODERATION_ACTION_OPTIONS: FilterOption[] = [
  { value: "WARN", label: "Warning" },
  { value: "SUSPEND", label: "Suspension" },
  { value: "BAN", label: "Ban" },
  { value: "ACTIVATE", label: "Activation" },
  { value: "DELETE", label: "Deletion" },
  { value: "DEACTIVATE", label: "Deactivation" },
];

// Admin Account Status Filter Options
export const ADMIN_STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "INACTIVE", label: "Inactive" },
];

// Admin Login History Status Filter Options
export const LOGIN_STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "All Statuses" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
];

// Audit Log HTTP Method Filter Options
export const HTTP_METHOD_OPTIONS: FilterOption[] = [
  { value: "", label: "All HTTP Methods" },
  { value: "POST", label: "POST" },
  { value: "PATCH", label: "PATCH" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
];

// Stream Session Status Filter Options
export const STREAM_STATUS_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Stream Statuses" },
  { value: "LIVE", label: "Live Streaming" },
  { value: "ENDED", label: "Ended" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "INTERRUPTED", label: "Interrupted" },
];

// Role Filter Options
export const ROLE_FILTER_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Roles" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "SUPPORT", label: "Support" },
];

// Payment / Transaction Status Filter Options
export const PAYMENT_STATUS_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Payment Statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

// Coin Purchase Payment Status Filter Options
// Values MUST match backend PaymentStatus enum (backend/src/common/enums/payment-status.enum.ts)
export const PURCHASE_STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "All Payment Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "SETTLED", label: "Settled" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Wallet Account Status Filter Options
export const WALLET_STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "All Wallet Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "FROZEN", label: "Fully Frozen" },
  { value: "PARTIALLY_FROZEN", label: "Partially Frozen" },
];

// Financial Transaction Type Filter Options
// Values MUST match backend TransactionType enum (backend/src/common/enums/transaction-type.enum.ts)
export const TRANSACTION_TYPE_OPTIONS: FilterOption[] = [
  { value: "", label: "All Transaction Types" },
  { value: "COIN_PURCHASE", label: "Coin Purchase" },
  { value: "GIFT_SEND", label: "Gift Send" },
  { value: "CREATOR_EARNING", label: "Creator Earning" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
  { value: "ADMIN_ADJUSTMENT", label: "Admin Adjustment" },
  { value: "REFUND", label: "Refund" },
  { value: "CHARGEBACK", label: "Chargeback" },
  { value: "PROMO_BONUS", label: "Promo Bonus" },
  { value: "REFERRAL_REWARD", label: "Referral Reward" },
  { value: "SUBSCRIPTION_PAYMENT", label: "Subscription Payment" },
  { value: "PENALTY", label: "Penalty" },
];

// Financial Transaction Status Filter Options
export const TRANSACTION_STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Payment Provider Filter Options
export const PAYMENT_PROVIDER_OPTIONS: FilterOption[] = [
  { value: "", label: "All Payment Providers" },
  { value: "STRIPE", label: "Stripe" },
  { value: "RAZORPAY", label: "Razorpay" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "SYSTEM_INTERNAL", label: "System Internal" },
];

// Gift Category Filter Options
export const GIFT_CATEGORY_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Categories" },
  { value: "POPULAR", label: "Popular" },
  { value: "SPECIAL", label: "Special Effects" },
  { value: "PREMIUM", label: "Premium" },
  { value: "EVENT", label: "Event / Seasonal" },
];

// Chart / Analytics Time Range Options
export const TIME_RANGE_OPTIONS: FilterOption[] = [
  { value: "90d", label: "Last 3 months" },
  { value: "30d", label: "Last 30 days" },
  { value: "7d", label: "Last 7 days" },
];

// Creator Channel Status Filter Options
export const CREATOR_STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

// Creator Application Status Filter Options
export const APPLICATION_STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "MORE_INFO_REQUIRED", label: "More Info Required" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "EXPIRED", label: "Expired" },
];

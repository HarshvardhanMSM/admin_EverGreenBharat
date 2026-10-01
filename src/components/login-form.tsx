"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/toast";
import { Loader2, ArrowLeft, CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { settingsService, PlatformGeneralSettings } from "@/services/api/settings-service";

type AuthMode = "login" | "request-otp" | "verify-otp" | "success";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const router = useRouter();

  // Branding state loaded from settings
  const [branding, setBranding] = useState<PlatformGeneralSettings>(() =>
    settingsService.getPlatformSettings()
  );

  useEffect(() => {
    setBranding(settingsService.getPlatformSettings());
  }, []);

  // Auth state
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.add({
        type: "success",
        description: "Welcome back! Login successful.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Invalid email or password";
      toast.add({
        type: "error",
        description: message,
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Request OTP (Send Email)
  const handleRequestOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.add({
        type: "warning",
        description: "Please enter a valid email address",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.add({
        type: "success",
        description: `OTP code has been sent to ${email}`,
      });
      setMode("verify-otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      toast.add({
        type: "error",
        description: message,
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Verify OTP & Reset Password
  const handleVerifyOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp || otp.trim().length < 4) {
      toast.add({
        type: "warning",
        description: "Please enter a valid OTP code",
      });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.add({
        type: "warning",
        description: "Password must be at least 8 characters long",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.add({
        type: "error",
        description: "Passwords do not match",
        priority: "high",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.add({
        type: "success",
        description: "Your password has been reset successfully.",
      });
      setMode("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired OTP. Please try again.";
      toast.add({
        type: "error",
        description: message,
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border/60 shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Dynamic Form Panel */}
          <div className="p-6 md:p-8 flex flex-col justify-center min-h-[440px]">
            {/* Step 1: Login Form */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-400/40 mb-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-emerald-100"
                      >
                        <path
                          d="M12 22C12 22 20 18 20 10C20 4.5 15.5 2 12 2C8.5 2 4 4.5 4 10C4 18 12 22 12 22Z"
                          fill="currentColor"
                          fillOpacity="0.28"
                        />
                        <path d="M12 22V6" />
                        <path d="M12 14C14.5 12 16.5 11.5 18 12" />
                        <path d="M12 17C9.5 15 7.5 14.5 6 15" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                      {branding.projectName.split(" ").slice(0, -1).join(" ") || "Ever Green"}{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {branding.projectName.split(" ").slice(-1)[0] || "Bharat"}
                      </span>
                    </h1>
                    <p className="text-balance text-xs text-muted-foreground">
                      Sign in to {branding.projectName || "Ever Green Bharat"} Admin Console
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="email">Admin Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@nursery.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer focus:outline-hidden"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </Field>

                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Forgot your password?
                  </FieldSeparator>

                  <Field className="grid grid-cols-1 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleSwitchMode("request-otp")}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Forgot your password?</span>
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}

            {/* Step 2: Request OTP */}
            {mode === "request-otp" && (
              <form onSubmit={handleRequestOtpSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                      Enter your email address and we&apos;ll send you an OTP code to reset your password.
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="reset-email">Email Address</FieldLabel>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="admin@stream.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </Field>

                  <Field>
                    <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </Field>

                  <FieldDescription className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleSwitchMode("login")}
                      className="inline-flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to login
                    </button>
                  </FieldDescription>
                </FieldGroup>
              </form>
            )}

            {/* Step 3: Verify OTP */}
            {mode === "verify-otp" && (
              <form onSubmit={handleVerifyOtpSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Verify OTP</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                      Enter the OTP code sent to <span className="font-semibold text-foreground">{email}</span> and set your new password.
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="otp-code">OTP Code</FieldLabel>
                    <Input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      className="tracking-widest font-mono text-center text-base"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer focus:outline-hidden"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer focus:outline-hidden"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field>
                    <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </Field>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleRequestOtpSubmit(e as any)}
                      className="hover:text-foreground hover:underline"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode("login")}
                      className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to login
                    </button>
                  </div>
                </FieldGroup>
              </form>
            )}

            {/* Step 4: Success Message */}
            {mode === "success" && (
              <div className="flex flex-col items-center gap-4 text-center py-4">
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">Password Reset Complete</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Your password has been successfully updated. You can now log in with your new credentials.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    handleSwitchMode("login");
                  }}
                  className="w-full font-semibold mt-2"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>

          {/* Right Side Cover Panel: Platform Branding Showcase */}
          <div className="relative hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-8 text-white md:flex flex-col justify-between overflow-hidden">
            {/* Ambient botanical background patterns */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold backdrop-blur-xs">
                {branding.badgeText || "🌱 Unified Green Platform"}
              </span>
            </div>

            {/* Middle Value Proposition */}
            <div className="relative z-10 space-y-4 my-auto">
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                {branding.projectName.split(" ").slice(0, -1).join(" ") || "Ever Green"} <br />
                <span className="text-emerald-400">{branding.projectName.split(" ").slice(-1)[0] || "Bharat"}</span>
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xs">
                {branding.projectDescription || "Empowering nursery growers, landscape creators, and millions of urban gardeners across India."}
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5 pt-2 text-xs text-emerald-100/80 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{branding.bullet1 || "Standardized Botanical Taxonomy & Care Autosuggest"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{branding.bullet2 || "Secure Doorstep Delivery OTP Verification"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{branding.bullet3 || "Institutional B2B Bulk Greenery Inquiries"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{branding.bullet4 || "Green Army Community & Plant Creator Ecosystem"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Quote */}
            <div className="relative z-10 border-t border-emerald-700/50 pt-4 flex items-center justify-between text-[11px] text-emerald-300/80">
              <span>{branding.footerVersion || "Operational Console v2.0"}</span>
              <span>{branding.footerMadeWith || "Made with 💚 for India"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#" className="underline underline-offset-2 hover:text-foreground">Terms of Service</a>{" "}
        and <a href="#" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

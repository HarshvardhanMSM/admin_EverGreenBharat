import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/layout/Logo";

export function LoginCard() {
  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-3 text-center pb-4">
        <div className="flex justify-center lg:hidden mb-2">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your administrative credentials to access the console
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <div className="border-t border-border/40 pt-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            Protected by enterprise encryption &amp; role-based access control.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

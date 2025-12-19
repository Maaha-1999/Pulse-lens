import { useState } from "react";
import { useNavigate } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user is authorized (whitelist check)
        const { data: authData, error: checkError } = await supabase
          .from("authorized_users")
          .select("*")
          .eq("email", email)
          .single();

        if (checkError || !authData) {
          // User not in whitelist, sign them out
          await supabase.auth.signOut();
          setError("Your account is not authorized to access this application.");
          setLoading(false);
          return;
        }

        // User is authorized, redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-border/50 bg-secondary/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Pulse Lens</CardTitle>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="bg-secondary/40 border-border/50 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-secondary/40 border-border/50 focus:border-primary/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Contact your administrator for login credentials.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

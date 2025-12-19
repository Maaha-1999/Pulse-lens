import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

interface AuthorizedUser {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch authorized users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("authorized_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    try {
      setAdding(true);

      // Check if user already exists
      const { data: existing } = await supabase
        .from("authorized_users")
        .select("id")
        .eq("email", newEmail)
        .single();

      if (existing) {
        setError("This email is already authorized");
        return;
      }

      // Add to authorized_users table
      const { error: insertError } = await supabase
        .from("authorized_users")
        .insert({ email: newEmail });

      if (insertError) throw insertError;

      setSuccess(`${newEmail} has been authorized`);
      setNewEmail("");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setAdding(false);
    }
  };

  const removeUser = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email}?`)) return;

    try {
      const { error: deleteError } = await supabase
        .from("authorized_users")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setSuccess(`${email} has been removed`);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user");
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Admin Panel</h1>
          <p className="text-muted-foreground">Manage authorized users</p>
        </div>

        {/* Add User Form */}
        <Card className="glass-card border-border/50 bg-secondary/20">
          <CardHeader>
            <CardTitle>Authorize New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addUser} className="flex gap-2">
              <Input
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={adding}
                className="bg-secondary/40 border-border/50 focus:border-primary/50"
              />
              <Button
                type="submit"
                disabled={adding}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
            <AlertCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">{success}</p>
          </div>
        )}

        {/* Users Table */}
        <Card className="glass-card border-border/50 bg-secondary/20">
          <CardHeader>
            <CardTitle>Authorized Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No authorized users yet</p>
            ) : (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Email</TableHead>
                      <TableHead>Authorized Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-white/5 border-border/50">
                        <TableCell className="font-mono text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUser(user.id, user.email)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

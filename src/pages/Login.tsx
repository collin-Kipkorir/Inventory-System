import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  // Start with empty fields - user must enter credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      toast.success("Login successful!");
      // Clear fields after successful login
      setUsername("");
      setPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-slate-700 bg-slate-950">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/favicon.png" 
                alt="Inventory Management System Logo" 
                className="w-16 h-16 rounded-lg shadow-lg"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white">IMS</CardTitle>
            <CardDescription className="text-slate-400">Admin Login</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-slate-200">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-sm text-slate-400">
                Contact your administrator for credentials
              </p>
            </div>
          </CardContent>
          <div className="bg-slate-900/50 px-6 py-3 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              Developed by <span className="font-semibold text-slate-400">Metacode Solutions</span>
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}

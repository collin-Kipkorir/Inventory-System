import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import LPOs from "./pages/LPOs";
import Deliveries from "./pages/Deliveries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="" element={<Dashboard />} />
                      <Route path="companies" element={<Companies />} />
                      <Route path="companies/:id" element={<CompanyDetail />} />
                      <Route path="products" element={<Products />} />
                      <Route path="payments" element={<Payments />} />
                      <Route path="lpos" element={<LPOs />} />
                      <Route path="deliveries" element={<Deliveries />} />
                      <Route path="invoices" element={<Invoices />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

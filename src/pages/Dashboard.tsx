import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Building2, Package, FileText, DollarSign, AlertCircle } from "lucide-react";
import { getCompanies, getProducts, getInvoices, getPayments } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalPayments: 0,
    totalOutstanding: 0,
  });
  const [topCompanies, setTopCompanies] = useState<Array<{ name: string; balance: number }>>([]);

  useEffect(() => {
    const companies = getCompanies();
    const products = getProducts();
    const invoices = getInvoices();
    const payments = getPayments();

    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);

    // Calculate balances per company
    const companyBalances = companies.map((company) => {
      const companyInvoices = invoices.filter((inv) => inv.companyId === company.id);
      const balance = companyInvoices.reduce((sum, inv) => sum + inv.balance, 0);
      return { name: company.name, balance };
    });

    const topFive = companyBalances
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    setStats({
      totalCompanies: companies.length,
      totalProducts: products.length,
      totalInvoices: invoices.length,
      totalPayments: payments.length,
      totalOutstanding,
    });

    setTopCompanies(topFive);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your supply management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={Building2}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={FileText}
        />
        <StatCard
          title="Total Payments"
          value={stats.totalPayments}
          icon={DollarSign}
        />
        <StatCard
          title="Outstanding Balance"
          value={`KES ${stats.totalOutstanding.toLocaleString()}`}
          icon={AlertCircle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Companies with Outstanding Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {topCompanies.length > 0 ? (
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{company.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">KES {company.balance.toLocaleString()}</p>
                    <StatusBadge status="unpaid" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No outstanding balances</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

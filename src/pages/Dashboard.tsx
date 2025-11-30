import { useEffect, useState, useCallback } from "react";
import { StatCard } from "@/components/StatCard";
import { Building2, Package, FileText, DollarSign, AlertCircle } from "lucide-react";
import { listCompanies, listProducts, listInvoices, listPayments, listLpos } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Company, Invoice, LPO } from "@/types";
import { responsiveTypography, responsiveSpacing } from "@/lib/responsive";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalPayments: 0,
    totalOutstanding: 0,
  });
  const [topCompanies, setTopCompanies] = useState<Array<{ name: string; balance: number; lpoBalance: number }>>([]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Normalize invoice data to ensure all required fields are present
  const normalizeInvoice = (invoice: Record<string, unknown>): Invoice => ({
    ...(invoice as unknown as Invoice),
    balance: Number(invoice.balance) || 0,
    status: ((invoice.status as string) || "unpaid") as "paid" | "partial" | "unpaid",
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const [companies, products, invoices, payments, lpos] = await Promise.all([
        listCompanies(),
        listProducts(),
        listInvoices(),
        listPayments(),
        listLpos(),
      ]);

      const normalizedInvoices = (invoices || []).map(normalizeInvoice);
      const normalizedLpos = (lpos || []).map((lpo: Record<string, unknown>): LPO => ({
        ...(lpo as unknown as LPO),
        balance: Number(lpo.balance) || 0,
      }));

      // Filter to only unpaid and partially paid invoices
      // Note: We only show LPO balances on dashboard to avoid duplication
      // (Invoices created from LPOs are already reflected in LPO balance)
      const unpaidInvoices = normalizedInvoices.filter((inv) => inv.status === "unpaid" || inv.status === "partial");
      
      const totalLpoOutstanding = normalizedLpos.reduce((sum, l) => sum + l.balance, 0);
      const totalOutstanding = totalLpoOutstanding;

      // Calculate total balances per company (LPOs only) - to avoid duplication with invoices
      const companyBalances = (companies || []).map((company: Record<string, unknown>) => {
        const companyLpos = normalizedLpos.filter((lpo) => lpo.companyId === company.id);
        
        const lpoBalance = companyLpos.reduce((sum, lpo) => sum + lpo.balance, 0);
        const totalBalance = lpoBalance;
        
        return { 
          name: String(company.name || ""), 
          balance: totalBalance,
          lpoBalance
        };
      });

      // Only show companies with outstanding balance > 0
      const topFive = companyBalances
        .filter((c) => c.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);

      setStats({
        totalCompanies: (companies || []).length,
        totalProducts: (products || []).length,
        totalInvoices: normalizedInvoices.length,
        totalPayments: (payments || []).length,
        totalOutstanding,
      });

      setTopCompanies(topFive);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className={responsiveSpacing.pageGap}>
      <div>
        <h2 className={responsiveTypography.pageTitle}>Dashboard</h2>
        <p className={`${responsiveTypography.small} text-muted-foreground`}>Overview</p>
      </div>

      <div className="grid gap-3 sm:gap-4 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          value={`KES ${formatCurrency(stats.totalOutstanding)}`}
          icon={AlertCircle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={responsiveTypography.cardTitle}>Outstanding Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {topCompanies.length > 0 ? (
            <div className={responsiveSpacing.cardGap}>
              {topCompanies.map((company, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b last:border-0">
                  <div className="min-w-0">
                    <p className={`${responsiveTypography.body} font-medium text-foreground truncate`}>{company.name}</p>
                    <p className="text-xs text-muted-foreground">
                     LPO: KES {formatCurrency(company.lpoBalance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base md:text-lg font-bold text-foreground">KES {formatCurrency(company.balance)}</p>
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

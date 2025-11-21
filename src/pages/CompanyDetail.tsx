import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download } from "lucide-react";
import { getCompany, listInvoices, listPayments } from "@/lib/api";
import { Company, Invoice, Payment } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { generateStatementPDF } from "@/lib/pdf";
import { toast } from "sonner";
import { responsiveTypography, responsiveSpacing } from "@/lib/responsive";

interface StatementEntry {
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize invoice data to ensure all required fields are present
  const normalizeInvoice = (invoice: Record<string, unknown>): Invoice => ({
    ...(invoice as unknown as Invoice),
    totalAmount: Number(invoice.totalAmount) || 0,
    amountPaid: Number(invoice.amountPaid) || 0,
    balance: Number(invoice.balance) || 0,
    subtotal: Number(invoice.subtotal) || 0,
    vat: Number(invoice.vat) || 0,
    status: ((invoice.status as string) || "unpaid") as "paid" | "partial" | "unpaid",
  });

  // Normalize payment data to ensure all required fields are present
  const normalizePayment = (payment: Record<string, unknown>): Payment => ({
    ...(payment as unknown as Payment),
    amountPaid: Number(payment.amountPaid) || 0,
  });

  const loadCompanyData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!id) return;

      const foundCompany = await getCompany(id);
      if (!foundCompany) {
        navigate("/companies");
        return;
      }

      setCompany(foundCompany);

      const [allInvoices, allPayments] = await Promise.all([
        listInvoices(),
        listPayments(),
      ]);

      const companyInvoices = (allInvoices || [])
        .map(normalizeInvoice)
        .filter((inv) => inv.companyId === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setInvoices(companyInvoices);

      const companyPayments = (allPayments || [])
        .map(normalizePayment)
        .filter((pay) => pay.companyId === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPayments(companyPayments);
    } catch (error) {
      console.error("Failed to load company data:", error);
      toast.error("Failed to load company details");
      navigate("/companies");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const statement = useMemo(() => {
    const entries: StatementEntry[] = [];
    let runningBalance = 0;

    // Combine invoices and payments into a single array
    const transactions: Array<{ date: string; type: "invoice" | "payment"; data: Invoice | Payment }> = [
      ...invoices.map((inv) => ({ date: inv.date, type: "invoice" as const, data: inv })),
      ...payments.map((pay) => ({ date: pay.date, type: "payment" as const, data: pay })),
    ];

    // Sort by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate statement entries
    transactions.forEach((transaction) => {
      if (transaction.type === "invoice") {
        const invoice = transaction.data as Invoice;
        runningBalance += invoice.totalAmount;
        entries.push({
          date: invoice.date,
          reference: invoice.invoiceNo,
          description: `Invoice for ${invoice.items.length} item(s)`,
          debit: invoice.totalAmount,
          credit: 0,
          balance: runningBalance,
        });
      } else {
        const payment = transaction.data as Payment;
        runningBalance -= payment.amountPaid;
        entries.push({
          date: payment.date,
          reference: payment.paymentNo,
          description: `Payment - ${payment.mode}${payment.remarks ? ` (${payment.remarks})` : ""}`,
          debit: 0,
          credit: payment.amountPaid,
          balance: runningBalance,
        });
      }
    });

    // Reverse to show most recent first (like bank statements)
    return entries.reverse();
  }, [invoices, payments]);

  if (!company) {
    return null;
  }

  return (
    <div className={responsiveSpacing.pageGap}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/companies")} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="min-w-0">
          <h2 className={responsiveTypography.pageTitle}>{company.name}</h2>
          <p className={`${responsiveTypography.small} text-muted-foreground truncate`}>{company.contactPerson} • {company.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className={`${responsiveTypography.label} text-muted-foreground`}>Total Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className={responsiveTypography.statValue}>{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className={`${responsiveTypography.label} text-muted-foreground`}>Total Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className={responsiveTypography.statValue}>{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className={`${responsiveTypography.label} text-muted-foreground`}>Current Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className={responsiveTypography.statValue}>
              KES {statement.length > 0 ? statement[0].balance.toLocaleString() : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statement" className={responsiveSpacing.cardGap}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="statement" className={responsiveTypography.small}>Statement</TabsTrigger>
          <TabsTrigger value="invoices" className={responsiveTypography.small}>Invoices</TabsTrigger>
          <TabsTrigger value="payments" className={responsiveTypography.small}>Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="statement">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <CardTitle className={responsiveTypography.cardTitle}>Account Statement</CardTitle>
              {statement.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => generateStatementPDF(company, statement)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </CardHeader>
            <CardContent className="overflow-x-auto p-2 sm:p-6">
              {statement.length > 0 ? (
                <div className="min-w-full overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Date</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Reference</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Description</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Debit</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Credit</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{entry.reference}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{entry.description}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>
                          {entry.debit > 0 ? `KES ${entry.debit.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>
                          {entry.credit > 0 ? `KES ${entry.credit.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} text-right font-medium whitespace-nowrap`}>
                          KES {entry.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className={responsiveTypography.cardTitle}>Invoices</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-2 sm:p-6">
              {invoices.length > 0 ? (
                <div className="min-w-full overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Invoice No</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Date</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Total Amount</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Amount Paid</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Balance</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{invoice.invoiceNo}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {invoice.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {invoice.amountPaid.toLocaleString()}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {invoice.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No invoices yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className={responsiveTypography.cardTitle}>Payments</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-2 sm:p-6">
              {payments.length > 0 ? (
                <div className="min-w-full overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Payment No</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Date</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Invoice No</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} text-right whitespace-nowrap`}>Amount Paid</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Mode</TableHead>
                      <TableHead className={`${responsiveTypography.tableHeader} whitespace-nowrap`}>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className={`${responsiveTypography.tableCell} font-medium whitespace-nowrap`}>{payment.paymentNo}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} whitespace-nowrap`}>{payment.invoiceNo || "-"}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} text-right whitespace-nowrap`}>KES {payment.amountPaid.toLocaleString()}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} capitalize whitespace-nowrap`}>{payment.mode}</TableCell>
                        <TableCell className={`${responsiveTypography.tableCell} max-w-xs truncate`}>{payment.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <p className={`${responsiveTypography.body} text-center text-muted-foreground py-8`}>No payments yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

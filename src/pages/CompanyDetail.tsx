import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { getCompanies, getInvoices, getPayments } from "@/lib/storage";
import { Company, Invoice, Payment } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

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

  useEffect(() => {
    const companies = getCompanies();
    const foundCompany = companies.find((c) => c.id === id);
    
    if (!foundCompany) {
      navigate("/companies");
      return;
    }

    setCompany(foundCompany);
    
    const allInvoices = getInvoices();
    const companyInvoices = allInvoices.filter((inv) => inv.companyId === id);
    setInvoices(companyInvoices);

    const allPayments = getPayments();
    const companyPayments = allPayments.filter((pay) => pay.companyId === id);
    setPayments(companyPayments);
  }, [id, navigate]);

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

    return entries;
  }, [invoices, payments]);

  if (!company) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/companies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">{company.name}</h2>
            <p className="text-muted-foreground">{company.contactPerson} • {company.phone}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              KES {statement.length > 0 ? statement[statement.length - 1].balance.toLocaleString() : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statement">Statement</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="statement">
          <Card>
            <CardHeader>
              <CardTitle>Account Statement</CardTitle>
            </CardHeader>
            <CardContent>
              {statement.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.reference}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? `KES ${entry.debit.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? `KES ${entry.credit.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          KES {entry.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>KES {invoice.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>KES {invoice.amountPaid.toLocaleString()}</TableCell>
                        <TableCell>KES {invoice.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No invoices yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.paymentNo}</TableCell>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.invoiceNo || "-"}</TableCell>
                        <TableCell>KES {payment.amountPaid.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{payment.mode}</TableCell>
                        <TableCell>{payment.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No payments yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

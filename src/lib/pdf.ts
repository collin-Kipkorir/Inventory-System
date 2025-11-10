import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice, LPO, Company, Delivery } from "@/types";

interface StatementEntry {
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const generateInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Primary blue
  doc.text("INVOICE", 105, 20, { align: "center" });
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice No: ${invoice.invoiceNo}`, 20, 40);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 46);
  doc.text(`Company: ${invoice.companyName}`, 20, 52);
  
  // Status badge
  doc.setFontSize(12);
  const statusColor = invoice.status === "paid" ? [34, 197, 94] : 
                      invoice.status === "partial" ? [251, 146, 60] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(invoice.status.toUpperCase(), 170, 40);
  
  // Items table
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 65,
    head: [["Product", "Quantity", "Unit Price", "Total"]],
    body: invoice.items.map((item) => [
      item.productName,
      `${item.quantity} ${item.unit}`,
      `KES ${item.unitPrice.toLocaleString()}`,
      `KES ${item.total.toLocaleString()}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(11);
  doc.text(`Subtotal: KES ${invoice.subtotal.toLocaleString()}`, 140, finalY + 12);
  doc.text(`VAT (16%): KES ${invoice.vat.toLocaleString()}`, 140, finalY + 19);
  doc.text(`Total Amount: KES ${invoice.totalAmount.toLocaleString()}`, 140, finalY + 26);
  doc.text(`Amount Paid: KES ${invoice.amountPaid.toLocaleString()}`, 140, finalY + 33);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`Balance: KES ${invoice.balance.toLocaleString()}`, 140, finalY + 41);
  
  doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
};

export const generateLPOPDF = (lpo: LPO) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text("LOCAL PURCHASE ORDER", 105, 20, { align: "center" });
  
  // LPO Details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`LPO Number: ${lpo.lpoNumber}`, 20, 40);
  doc.text(`Date: ${new Date(lpo.date).toLocaleDateString()}`, 20, 46);
  doc.text(`Company: ${lpo.companyName}`, 20, 52);
  
  // Status badges
  doc.setFontSize(11);
  const paymentColor = lpo.paymentStatus === "paid" ? [34, 197, 94] : 
                       lpo.paymentStatus === "partial" ? [251, 146, 60] : [239, 68, 68];
  doc.setTextColor(paymentColor[0], paymentColor[1], paymentColor[2]);
  doc.text(`Payment: ${lpo.paymentStatus.toUpperCase()}`, 145, 40);
  
  const deliveryColor = lpo.status === "delivered" ? [34, 197, 94] : [251, 146, 60];
  doc.setTextColor(deliveryColor[0], deliveryColor[1], deliveryColor[2]);
  doc.text(`Delivery: ${lpo.status.toUpperCase()}`, 145, 47);
  
  // Items table
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 65,
    head: [["Product", "Quantity", "Unit Price", "Total"]],
    body: lpo.items.map((item) => [
      item.productName,
      `${item.quantity} ${item.unit}`,
      `KES ${item.unitPrice.toLocaleString()}`,
      `KES ${item.total.toLocaleString()}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(11);
  doc.text(`Subtotal: KES ${lpo.subtotal.toLocaleString()}`, 140, finalY + 12);
  doc.text(`VAT (16%): KES ${lpo.vat.toLocaleString()}`, 140, finalY + 19);
  doc.text(`Total Amount: KES ${lpo.totalAmount.toLocaleString()}`, 140, finalY + 26);
  doc.text(`Amount Paid: KES ${lpo.amountPaid.toLocaleString()}`, 140, finalY + 33);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`Balance: KES ${lpo.balance.toLocaleString()}`, 140, finalY + 41);
  
  doc.save(`LPO_${lpo.lpoNumber}.pdf`);
};

export const generateStatementPDF = (
  company: Company,
  statement: StatementEntry[]
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text("ACCOUNT STATEMENT", 105, 20, { align: "center" });
  
  // Company Details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(company.name, 20, 40);
  doc.setFontSize(10);
  doc.text(`Contact: ${company.contactPerson}`, 20, 46);
  doc.text(`Phone: ${company.phone}`, 20, 52);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 58);
  
  // Statement table
  autoTable(doc, {
    startY: 70,
    head: [["Date", "Reference", "Description", "Debit", "Credit", "Balance"]],
    body: statement.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.reference,
      entry.description,
      entry.debit > 0 ? `KES ${entry.debit.toLocaleString()}` : "-",
      entry.credit > 0 ? `KES ${entry.credit.toLocaleString()}` : "-",
      `KES ${entry.balance.toLocaleString()}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
    },
  });
  
  // Final Balance
  if (statement.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    const finalBalance = statement[statement.length - 1].balance;
    const balanceColor = finalBalance > 0 ? [239, 68, 68] : [34, 197, 94];
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.text(`Final Balance: KES ${finalBalance.toLocaleString()}`, 140, finalY + 15);
  }
  
  doc.save(`Statement_${company.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const generateDeliveryNotePDF = (delivery: Delivery): void => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(34, 197, 94); // Green for delivery
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY NOTE", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(delivery.deliveryNo, 105, 30, { align: "center" });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // Company details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Delivered To:", 15, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(delivery.companyName, 15, 58);

  // Delivery details
  doc.text(`Date: ${new Date(delivery.date).toLocaleDateString()}`, 150, 50);
  if (delivery.lpoNumber) {
    doc.text(`LPO Reference: ${delivery.lpoNumber}`, 150, 58);
  }

  // Items table
  autoTable(doc, {
    startY: 70,
    head: [["Product", "Quantity", "Unit", "Remarks"]],
    body: delivery.items.map((item) => [
      item.productName,
      item.quantity.toString(),
      item.unit,
      "Delivered",
    ]),
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 70;

  // Signature section
  doc.setFontSize(10);
  doc.text("Received By:", 15, finalY + 30);
  doc.line(15, finalY + 50, 80, finalY + 50);
  doc.text("Signature", 15, finalY + 55);

  doc.text("Delivered By:", 120, finalY + 30);
  doc.line(120, finalY + 50, 185, finalY + 50);
  doc.text("Signature", 120, finalY + 55);

  doc.save(`delivery-note-${delivery.deliveryNo}.pdf`);
};

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getDeliveries } from "@/lib/storage";
import { Delivery } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { generateDeliveryNotePDF } from "@/lib/pdf";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    const allDeliveries = getDeliveries();
    // Sort by date descending (most recent first)
    const sorted = allDeliveries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setDeliveries(sorted);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Deliveries</h2>
        <p className="text-muted-foreground">Track all goods deliveries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deliveries</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {deliveries.length > 0 ? (
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery No</TableHead>
                    <TableHead>LPO Number</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.deliveryNo}</TableCell>
                      <TableCell>{delivery.lpoNumber || "N/A"}</TableCell>
                      <TableCell>{delivery.companyName}</TableCell>
                      <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={delivery.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateDeliveryNotePDF(delivery)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Delivery Note
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No deliveries recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

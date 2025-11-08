import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDeliveries } from "@/lib/storage";
import { Delivery } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    setDeliveries(getDeliveries());
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
        <CardContent>
          {deliveries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery No</TableHead>
                  <TableHead>LPO Number</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No deliveries recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

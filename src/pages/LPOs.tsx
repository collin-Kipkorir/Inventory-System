import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLPOs } from "@/lib/storage";
import { LPO } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

export default function LPOs() {
  const [lpos, setLpos] = useState<LPO[]>([]);

  useEffect(() => {
    setLpos(getLPOs());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Local Purchase Orders</h2>
        <p className="text-muted-foreground">Manage LPOs for goods delivery</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All LPOs</CardTitle>
        </CardHeader>
        <CardContent>
          {lpos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LPO Number</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lpos.map((lpo) => (
                  <TableRow key={lpo.id}>
                    <TableCell className="font-medium">{lpo.lpoNumber}</TableCell>
                    <TableCell>{lpo.companyName}</TableCell>
                    <TableCell>{new Date(lpo.date).toLocaleDateString()}</TableCell>
                    <TableCell>KES {lpo.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={lpo.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No LPOs created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

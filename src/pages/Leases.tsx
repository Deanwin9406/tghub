
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Leases = () => {
  const [showExpired, setShowExpired] = useState(false);

  const { data: leases, isLoading } = useQuery({
    queryKey: ["leases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          property:properties(title, address),
          tenant:profiles(first_name, last_name)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const currentDate = new Date();

  const filteredLeases = leases?.filter((lease) => {
    const endDate = new Date(lease.end_date);
    return showExpired ? true : endDate >= currentDate;
  });

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lease Agreements</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowExpired(!showExpired)}
            >
              {showExpired ? "Hide Expired" : "Show Expired"}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">Loading leases...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeases?.map((lease) => (
                    <TableRow key={lease.id}>
                      <TableCell>
                        {lease.property?.title}
                        <br />
                        <span className="text-sm text-gray-500">
                          {lease.property?.address}
                        </span>
                      </TableCell>
                      <TableCell>
                        {lease.tenant?.first_name} {lease.tenant?.last_name}
                      </TableCell>
                      <TableCell>
                        {new Date(lease.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(lease.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ${Number(lease.monthly_rent).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            new Date(lease.end_date) < currentDate
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {new Date(lease.end_date) < currentDate
                            ? "Expired"
                            : "Active"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Leases;

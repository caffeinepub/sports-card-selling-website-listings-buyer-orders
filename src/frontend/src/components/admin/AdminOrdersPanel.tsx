import { useState } from 'react';
import { useSellerOrderRequests, useUpdateOrderStatus } from '../../hooks/useOrderRequests';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { OrderStatus } from '../../backend';

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'Pending',
  [OrderStatus.accepted]: 'Accepted',
  [OrderStatus.rejected]: 'Rejected',
  [OrderStatus.cancelled]: 'Cancelled',
};

const statusVariants: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [OrderStatus.pending]: 'default',
  [OrderStatus.accepted]: 'default',
  [OrderStatus.rejected]: 'destructive',
  [OrderStatus.cancelled]: 'secondary',
};

export default function AdminOrdersPanel() {
  const { data: orders, isLoading, error } = useSellerOrderRequests();
  const updateStatus = useUpdateOrderStatus();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders?.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load order requests. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Requests</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
            <SelectItem value={OrderStatus.accepted}>Accepted</SelectItem>
            <SelectItem value={OrderStatus.rejected}>Rejected</SelectItem>
            <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders && filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {filterStatus === 'all'
                ? 'No order requests yet.'
                : `No ${filterStatus} order requests.`}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredOrders?.map((order) => (
          <Card key={order.orderId}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Order #{order.orderId.slice(-8)}</h3>
                      <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Listing: {order.listingId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Buyer: {order.buyer.toString().slice(0, 20)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(Number(order.createdAt) / 1000000).toLocaleString()}
                    </p>
                  </div>
                </div>

                {(order.offerPrice !== undefined || order.message) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {order.offerPrice !== undefined && (
                        <div>
                          <p className="text-sm font-medium">Buyer's Offer:</p>
                          <p className="text-lg font-semibold text-primary">
                            ${(Number(order.offerPrice) / 100).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {order.message && (
                        <div>
                          <p className="text-sm font-medium">Message from Buyer:</p>
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                            {order.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {order.status === OrderStatus.pending && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(order.orderId, OrderStatus.accepted)}
                        disabled={updateStatus.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(order.orderId, OrderStatus.rejected)}
                        disabled={updateStatus.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

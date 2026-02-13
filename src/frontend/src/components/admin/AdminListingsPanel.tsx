import { useState } from 'react';
import { useSellerListings, useCreateListing, useMarkListingSold } from '../../hooks/useListings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';
import { ListingStatus, CardCondition } from '../../backend';
import CreateListingDialog from './CreateListingDialog';

const conditionLabels: Record<CardCondition, string> = {
  [CardCondition.mint]: 'Mint',
  [CardCondition.near_mint]: 'Near Mint',
  [CardCondition.good]: 'Good',
  [CardCondition.fair]: 'Fair',
  [CardCondition.poor]: 'Poor',
};

export default function AdminListingsPanel() {
  const { data: listings, isLoading, error } = useSellerListings();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const markSold = useMarkListingSold();

  const handleMarkSold = async (listingId: string) => {
    if (confirm('Mark this listing as sold?')) {
      try {
        await markSold.mutateAsync(listingId);
      } catch (error) {
        console.error('Failed to mark listing as sold:', error);
      }
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
        <AlertDescription>Failed to load listings. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Listings</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </div>

      {listings && listings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {listings?.map((listing) => {
          const imageUrl = listing.imageUrl || '/assets/generated/card-placeholder.dim_800x800.png';
          const isSold = listing.status === ListingStatus.sold;

          return (
            <Card key={listing.listingId}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-24 h-24 object-cover rounded border-2 border-border"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isSold ? 'destructive' : 'default'}>
                          {isSold ? 'Sold' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-lg text-primary">${Number(listing.price).toFixed(2)}</span>
                      <span className="text-muted-foreground">
                        Condition: {conditionLabels[listing.condition]}
                      </span>
                      <span className="text-muted-foreground">
                        Listed: {new Date(Number(listing.createdAt) / 1000000).toLocaleDateString()}
                      </span>
                    </div>
                    {!isSold && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkSold(listing.listingId)}
                          disabled={markSold.isPending}
                        >
                          Mark as Sold
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateListingDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

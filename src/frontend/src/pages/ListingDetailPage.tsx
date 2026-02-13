import { useParams, useNavigate } from '@tanstack/react-router';
import { useActiveListings } from '../hooks/useListings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { CardCondition, ListingStatus } from '../backend';
import OrderRequestForm from '../components/store/OrderRequestForm';

const conditionLabels: Record<CardCondition, string> = {
  [CardCondition.mint]: 'Mint',
  [CardCondition.near_mint]: 'Near Mint',
  [CardCondition.good]: 'Good',
  [CardCondition.fair]: 'Fair',
  [CardCondition.poor]: 'Poor',
};

export default function ListingDetailPage() {
  const { listingId } = useParams({ from: '/public/listing/$listingId' });
  const navigate = useNavigate();
  const { data: listings, isLoading, error } = useActiveListings();

  const listing = listings?.find((l) => l.listingId === listingId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load listing details. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Listing not found or no longer available.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Button>
      </div>
    );
  }

  const isSold = listing.status === ListingStatus.sold;
  const imageUrl = listing.imageUrl || '/assets/generated/card-placeholder.dim_800x800.png';

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Store
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border">
            <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
            {isSold && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="destructive" className="text-2xl px-6 py-3">
                  SOLD
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-primary">${Number(listing.price).toFixed(2)}</span>
              <Badge variant={isSold ? 'destructive' : 'default'}>
                {isSold ? 'Sold' : 'Available'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 border-t border-b py-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condition:</span>
              <span className="font-medium">{conditionLabels[listing.condition]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed:</span>
              <span className="font-medium">
                {new Date(Number(listing.createdAt) / 1000000).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          {/* Order Request Form */}
          <div className="border-t pt-6">
            <OrderRequestForm listing={listing} disabled={isSold} />
          </div>
        </div>
      </div>
    </div>
  );
}

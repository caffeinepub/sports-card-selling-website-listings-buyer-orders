import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CardListing, CardCondition, ListingStatus } from '../../backend';

const conditionLabels: Record<CardCondition, string> = {
  [CardCondition.mint]: 'Mint',
  [CardCondition.near_mint]: 'Near Mint',
  [CardCondition.good]: 'Good',
  [CardCondition.fair]: 'Fair',
  [CardCondition.poor]: 'Poor',
};

interface ListingCardProps {
  listing: CardListing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const navigate = useNavigate();
  const imageUrl = listing.imageUrl || '/assets/generated/card-placeholder.dim_800x800.png';
  const isSold = listing.status === ListingStatus.sold;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-2"
      onClick={() => navigate({ to: '/listing/$listingId', params: { listingId: listing.listingId } })}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        {isSold && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              SOLD
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">{listing.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${Number(listing.price).toFixed(2)}</span>
          <Badge variant="outline">{conditionLabels[listing.condition]}</Badge>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
      </CardFooter>
    </Card>
  );
}

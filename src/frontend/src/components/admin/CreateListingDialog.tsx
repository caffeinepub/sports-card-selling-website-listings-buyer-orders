import { useState } from 'react';
import { useCreateListing } from '../../hooks/useListings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { CardCondition } from '../../backend';

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateListingDialog({ open, onOpenChange }: CreateListingDialogProps) {
  const createListing = useCreateListing();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: CardCondition.near_mint,
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const listingId = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const price = Math.round(parseFloat(formData.price) * 100);

    try {
      await createListing.mutateAsync({
        listingId,
        title: formData.title,
        description: formData.description,
        price: BigInt(price),
        condition: formData.condition,
        imageUrl: formData.imageUrl,
      });

      setFormData({
        title: '',
        description: '',
        price: '',
        condition: CardCondition.near_mint,
        imageUrl: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>Add a new sports card to your store.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {createListing.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {createListing.error instanceof Error
                  ? createListing.error.message
                  : 'Failed to create listing. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., 1989 Upper Deck Ken Griffey Jr. Rookie Card"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the card's condition, features, and any notable details..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value as CardCondition })}
              >
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CardCondition.mint}>Mint</SelectItem>
                  <SelectItem value={CardCondition.near_mint}>Near Mint</SelectItem>
                  <SelectItem value={CardCondition.good}>Good</SelectItem>
                  <SelectItem value={CardCondition.fair}>Fair</SelectItem>
                  <SelectItem value={CardCondition.poor}>Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/card-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default placeholder image.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createListing.isPending}>
              {createListing.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

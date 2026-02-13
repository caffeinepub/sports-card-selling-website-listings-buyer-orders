import { useState } from 'react';
import { useCreateOrderRequest } from '../../hooks/useOrderRequests';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { CardListing } from '../../backend';

interface OrderRequestFormProps {
  listing: CardListing;
  disabled?: boolean;
}

export default function OrderRequestForm({ listing, disabled = false }: OrderRequestFormProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const createOrderRequest = useCreateOrderRequest();
  const [submitted, setSubmitted] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      login();
      return;
    }

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      await createOrderRequest.mutateAsync({
        orderId,
        listingId: listing.listingId,
        offerPrice: offerPrice.trim() ? BigInt(Math.floor(parseFloat(offerPrice) * 100)) : null,
        message: message.trim() || null,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to create order request:', error);
    }
  };

  if (submitted) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Request submitted successfully!</strong>
          <p className="mt-1">The seller will review your request and contact you soon.</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interested in this card?</h3>
        <p className="text-muted-foreground">Login to contact the seller and make an offer.</p>
        <Button onClick={login} disabled={loginStatus === 'logging-in'} className="w-full" size="lg">
          {loginStatus === 'logging-in' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Login to Contact Seller'
          )}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Seller</h3>
      <p className="text-sm text-muted-foreground">
        Submit a request to purchase this card. The seller will be notified.
      </p>

      <div className="space-y-2">
        <Label htmlFor="offerPrice">Your Offer (optional)</Label>
        <Input
          id="offerPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder={`List price: $${(Number(listing.price) / 100).toFixed(2)}`}
          value={offerPrice}
          onChange={(e) => setOfferPrice(e.target.value)}
          disabled={disabled || createOrderRequest.isPending}
        />
        <p className="text-xs text-muted-foreground">
          Enter your offer price in dollars. Leave blank to offer the list price.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message to Seller (optional)</Label>
        <Textarea
          id="message"
          placeholder="Add any questions or details about your purchase request..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled || createOrderRequest.isPending}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Include any questions or special requests for the seller.
        </p>
      </div>

      {createOrderRequest.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createOrderRequest.error instanceof Error
              ? createOrderRequest.error.message
              : 'Failed to submit request. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={disabled || createOrderRequest.isPending}
        className="w-full"
        size="lg"
      >
        {createOrderRequest.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : disabled ? (
          'This item is sold'
        ) : (
          'Submit Purchase Request'
        )}
      </Button>
    </form>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { CardListing, CardCondition } from '../backend';

export function useActiveListings() {
  const { actor, isFetching } = useActor();

  return useQuery<CardListing[]>({
    queryKey: ['listings', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSellerListings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CardListing[]>({
    queryKey: ['listings', 'seller', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getSellerListings(identity.getPrincipal());
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      listingId: string;
      title: string;
      description: string;
      price: bigint;
      condition: CardCondition;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(
        params.listingId,
        params.title,
        params.description,
        params.price,
        params.condition,
        params.imageUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useMarkListingSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markListingSold(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

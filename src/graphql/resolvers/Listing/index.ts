import { IResolvers } from 'apollo-server-express';
import { Listing } from '../../../lib/types';

export const listingResolvers: IResolvers = {
  Listing: {
    id: (parent: Listing): string => parent._id.toString(),
  },
};

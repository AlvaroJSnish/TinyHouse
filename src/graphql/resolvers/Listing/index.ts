import { IResolvers } from 'apollo-server-express';
import { ObjectId } from 'mongodb';

import { Database, Listing } from '../../../lib/types';

export const listingResolvers: IResolvers = {
  Query: {
    listings: async (
      _parent: undefined,
      _args: {},
      { db }: { db: Database }
    ): Promise<Listing[]> => {
      return await db.listings.find({}).toArray();
    },
  },
  Mutation: {
    deleteListing: async (
      _parent: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Listing> => {
      const deletedListing = await db.listings.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!deletedListing.value) {
        throw new Error('failed to delete listing');
      }

      return deletedListing.value;
    },
  },
  Listing: {
    id: (parent: Listing): string => parent._id.toString(),
  },
};

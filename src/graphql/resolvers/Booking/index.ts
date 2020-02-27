import { IResolvers } from 'apollo-server-express';
import { Booking, Database, Listing } from '../../../lib/types';

export const bookingResolvers: IResolvers = {
  Booking: {
    id: (parent: Booking): string => parent._id.toString(),
    listing: async (
      parent: Booking,
      _args: {},
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: parent.listing });
    },
  },
};

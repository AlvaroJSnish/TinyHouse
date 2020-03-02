import { IResolvers } from 'apollo-server-express';
import { ObjectId } from 'mongodb';
import { Request } from 'express';

import { authorize } from '../../../lib/utils';
import { Listing, Database, User } from '../../../lib/types';
import { ListingArgs, ListingBookingsArgs, ListingBookingsData } from './types';

export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      parent: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing | null> => {
      try {
        const listing = await db.listings.findOne({
          _id: new ObjectId(id),
        });

        if (!listing) {
          throw new Error(`Can't find the listing`);
        }

        const viewer = await authorize(db, req);
        if (viewer?._id === listing.host) {
          listing.authorized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Faile to query listing: ${error}`);
      }
    },
  },
  Listing: {
    id: (parent: Listing): string => parent._id.toString(),
    host: async (
      parent: Listing,
      _args: {},
      { db }: { db: Database }
    ): Promise<User | null> => {
      const host = await db.users.findOne({ _id: parent.host });

      if (!host) {
        throw new Error("host can't be found");
      }

      return host;
    },
    bookings: async (
      parent: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!parent.authorized) {
          return null;
        }

        const data: ListingBookingsData = {
          total: 0,
          result: [],
        };

        const result = await db.bookings
          .find({
            _id: { $in: parent.bookings },
          })
          .skip(page > 0 ? (page - 1) * limit : 0)
          .limit(limit);

        data.total = await result.count();
        data.result = await result.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query bookings: ${error}`);
      }
    },
    bookingsIndex: (parent: Listing): string => {
      return JSON.stringify(parent.bookingsIndex);
    },
  },
};

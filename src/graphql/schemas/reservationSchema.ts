import { gql } from 'apollo-server-express';
import { Reservation } from '../../model/reservation';
import { ReservationCreateParam } from '../../model/reservation/input';
import { ReservationRepository } from '../../repository/ReservationRepository';
import { ReservationService } from '../../service/ReservationService';

const reservationRepositoryInstance = new ReservationRepository();
const reservationServiceInstance = new ReservationService(reservationRepositoryInstance);

export const reservationTypeDef = gql`

    input ReservationCreateParam {
        name: String!
    }
    type Reservation {
        id: ID!

        name: String!                           

        createdAt: Instant!
    }

    extend type ReservationContainer {
        reservation(id: ID!): String!
        reservations(): [Reservation!]!
    }
    extend type Mutation {
        createReservation(param: ReservationCreateParam!): Reservation!
    }
`;

export const reservationResolvers = {
  ReservationContainer: {
    reservation: async (_: unknown, args: { id: string }): Promise<string> => {
      const reservation = await reservationServiceInstance.find(Number(args.id));
      return reservation;
    },
    reservations: async (_: unknown): Promise<Reservation[]> => {
      const reservations = await reservationServiceInstance.findAll();
      return reservations;
    },
  },
  Mutation: {
    createReservation: async (param: ReservationCreateParam): Promise<Reservation> => {
      const { name } = param;
      const createdReservation = await reservationServiceInstance.create(name);
      return createdReservation;
    },
  },
};

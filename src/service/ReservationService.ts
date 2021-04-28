import { Reservation } from '../model/reservation';
import { ReservationRepository } from '../repository/ReservationRepository';

export class ReservationService {
  repository: ReservationRepository;

  constructor(repository: ReservationRepository) {
    this.repository = repository;
  }

  public async find(id: number): Promise<Reservation> {
    const reservation = await this.repository.findById(id);
    if (!reservation) {
      throw new Error();
    }
    return reservation;
  }

  public async findAll(): Promise<Reservation[]> {
    const reservations = await this.repository.findAll();
    return reservations;
  }

  public async create(name: string): Promise<Reservation> {
    const createdId = await this.repository.create(name);
    const createdReservation = this.repository.findById(createdId);

    if (!createdReservation) {
      throw new Error();
    }
    return createdReservation;
  }
}

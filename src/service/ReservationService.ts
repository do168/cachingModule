import { Reservation } from '../model/reservation';
import { ReservationRepository } from '../repository/ReservationRepository';
import { redisService } from '../service/RedisService';
import Redis from 'ioredis';
export class ReservationService {
  repository: ReservationRepository;

  constructor(repository: ReservationRepository) {
    this.repository = repository;
  }

  /**
   * if cache-match => get data from cache
   * - if data === Code.WAIT => sub & callback
   * - else => return data
   * else => get data from DB
   * @param id
   * @returns
   */
  public async find(id: number): Promise<string> {
    try {
      const reservation = await this.findReservation(id);
      redisService.close();
      return reservation;
    } catch (e) {
      console.error('find ERROR : ', e);
      throw new Error(e);
    }
  }

  private async findReservation(id: number): Promise<string> {
    try {
      // 캐시 조회
      const cachedReservation = await this.getCachedReservation(id);
      if (cachedReservation) {
        console.log(`CACHED ${id} reservation`);
        return cachedReservation;
      }

      // 캐시 미스 시 DB 조회 후 캐시에 저장
      const dbReservation = await this.repository.findById(id);
      await redisService.setCache(id.toString(), JSON.stringify(dbReservation.name), '');
      console.log(`UNCACHED ${id} RESERVATION`);
      return JSON.stringify(dbReservation);
    } catch (e) {
      console.error('getProductIds ERROR : ', e);
      throw new Error();
    }
  }

  /**
   * get data from cache db
   * @param id
   * @returns
   */
  private async getCachedReservation(id: number): Promise<string | null> {
    const cachedReservation = await redisService.getCache(id.toString(), '');

    if (!cachedReservation) {
      return null;
    }

    try {
      return JSON.parse(cachedReservation) as string;
    } catch (e) {
      console.error(`can't parse cachedReservation: ${cachedReservation}`);
      return null;
    }
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

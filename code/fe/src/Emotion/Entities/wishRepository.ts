import { getRepository, Repository } from '../../Common/Repositories';
import { wish } from './wish';

class WishRepository extends Repository<wish>{

}

export const wishRepository = new WishRepository('wish');

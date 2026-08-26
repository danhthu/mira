import { getRepository } from '../../Common/Repositories';
import { Challenge } from './CChallenge';
import { ChallengeAssociate } from './ChallengeAssociate';

export const challengeRepository = getRepository<Challenge>('Challenges');

export const challengeAssociateRepository  = getRepository<ChallengeAssociate>('ChallengeAssociate');
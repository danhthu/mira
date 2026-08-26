

import * as CommonScreen from '../../Common/Screens';
import { Challenge, challengeRepository } from '../Entities';

export const Selection = CommonScreen.Selection<Challenge>(challengeRepository);

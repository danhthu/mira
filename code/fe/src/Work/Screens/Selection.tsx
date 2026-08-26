
import { workRepository, Work } from '../Entities';
import * as CommonScreen from '../../Common/Screens';

export const Selection = CommonScreen.Selection<Work>(workRepository);

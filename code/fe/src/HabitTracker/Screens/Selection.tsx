
import { Habit, habitRepository } from '../Entities';
import * as CommonScreen from '../../Common/Screens';

export const Selection = CommonScreen.Selection<Habit>(habitRepository); 

import { Habit } from './Habit';

export class HabitTemplate extends Habit {
    public group?: string;
    public group_local: string;
    public group_icon?: string;
    public group_desc?: string;
    public group_desc_local?: string;

    public collection?: string;
    public collection_local: string;
    public collection_icon?: string;
    public collection_desc?: string;
    public collection_desc_local?: string;
}


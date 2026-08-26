import { Entity } from '../../Common';
import { EmotionStatus } from './types';
export class emotionCheck extends Entity.base {
  public status?: EmotionStatus; // 0, 1, 2,3
  public day?: Date;
}

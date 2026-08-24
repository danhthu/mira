import { CHILD_INDEPENDENCE_AGE, DEFAULT_LIFE_EXPECTANCY, WEEKS_IN_YEAR } from './constants';

export interface ChildHourglassInput {
  type: 'child';
  currentAge: number;
  currentWeeklyHours: number;
  targetWeeklyHours?: number;
}

export interface ParentHourglassInput {
  type: 'parent';
  currentAge: number;
  lifeExpectancy?: number;
  visitsPerYear: number;
  daysPerVisit: number;
}

export type HourglassInput = ChildHourglassInput | ParentHourglassInput;

export interface ChildHourglassResult {
  type: 'child';
  yearsLeft: number;
  hoursLeft: number;
  hoursIfMore?: number;
}

export interface ParentHourglassResult {
  type: 'parent';
  yearsLeft: number;
  visitsLeft: number;
  daysTogether: number;
}

export type HourglassResult = ChildHourglassResult | ParentHourglassResult;

export function calculateHourglass(input: HourglassInput): HourglassResult {
  if (input.type === 'child') {
    const yearsLeftFloat = Math.max(0, CHILD_INDEPENDENCE_AGE - input.currentAge);
    const hoursLeftFloat = input.currentWeeklyHours * WEEKS_IN_YEAR * yearsLeftFloat;

    const result: ChildHourglassResult = {
      type: 'child',
      yearsLeft: Math.floor(yearsLeftFloat),
      hoursLeft: Math.floor(hoursLeftFloat),
    };

    if (input.targetWeeklyHours !== undefined) {
      result.hoursIfMore = Math.floor(input.targetWeeklyHours * WEEKS_IN_YEAR * yearsLeftFloat);
    }

    return result;
  }

  const lifeExp = input.lifeExpectancy ?? DEFAULT_LIFE_EXPECTANCY;
  const yearsLeftFloat = Math.max(0, lifeExp - input.currentAge);
  const visitsLeftFloat = input.visitsPerYear * yearsLeftFloat;
  const daysTogetherFloat = visitsLeftFloat * input.daysPerVisit;

  return {
    type: 'parent',
    yearsLeft: Math.floor(yearsLeftFloat),
    visitsLeft: Math.floor(visitsLeftFloat),
    daysTogether: Math.floor(daysTogetherFloat),
  };
}

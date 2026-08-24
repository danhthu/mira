import { describe, it, expect } from 'vitest';
import { calculateHourglass } from '../hourglass';

describe('calculateHourglass — child', () => {
  it('calculates correctly for a 5-year-old', () => {
    const result = calculateHourglass({ type: 'child', currentAge: 5, currentWeeklyHours: 14 });
    // yearsLeft = 18 - 5 = 13, hoursLeft = 14 × 52 × 13 = 9464
    expect(result).toEqual({ type: 'child', yearsLeft: 13, hoursLeft: 9464 });
  });

  it('returns zeros when child age is exactly 18', () => {
    const result = calculateHourglass({ type: 'child', currentAge: 18, currentWeeklyHours: 10 });
    expect(result).toEqual({ type: 'child', yearsLeft: 0, hoursLeft: 0 });
  });

  it('returns zeros when child age exceeds 18', () => {
    const result = calculateHourglass({ type: 'child', currentAge: 22, currentWeeklyHours: 10 });
    expect(result).toEqual({ type: 'child', yearsLeft: 0, hoursLeft: 0 });
  });

  it('returns hoursLeft 0 when currentWeeklyHours is 0', () => {
    const result = calculateHourglass({ type: 'child', currentAge: 5, currentWeeklyHours: 0 });
    expect(result).toEqual({ type: 'child', yearsLeft: 13, hoursLeft: 0 });
  });

  it('includes hoursIfMore when targetWeeklyHours is provided', () => {
    const result = calculateHourglass({
      type: 'child',
      currentAge: 10,
      currentWeeklyHours: 7,
      targetWeeklyHours: 14,
    });
    // yearsLeft = 8, hoursLeft = 7×52×8 = 2912, hoursIfMore = 14×52×8 = 5824
    expect(result).toEqual({ type: 'child', yearsLeft: 8, hoursLeft: 2912, hoursIfMore: 5824 });
  });

  it('omits hoursIfMore when targetWeeklyHours is not provided', () => {
    const result = calculateHourglass({ type: 'child', currentAge: 10, currentWeeklyHours: 7 });
    expect(result.type).toBe('child');
    if (result.type === 'child') {
      expect(result.hoursIfMore).toBeUndefined();
    }
  });

  it('floors non-integer year results', () => {
    // age 5.5 → yearsLeftFloat = 12.5, hoursLeftFloat = 10×52×12.5 = 6500
    const result = calculateHourglass({ type: 'child', currentAge: 5.5, currentWeeklyHours: 10 });
    expect(result).toEqual({ type: 'child', yearsLeft: 12, hoursLeft: 6500 });
  });

  it('floors fractional hoursLeft', () => {
    // age 4 → yearsLeft = 14, hoursLeft = 3×52×14 = 2184.0 (exact)
    // Use hours that produce a fraction: 3.5×52×14 = 2548
    const result = calculateHourglass({ type: 'child', currentAge: 4, currentWeeklyHours: 3 });
    // 3 × 52 × 14 = 2184
    expect(result).toEqual({ type: 'child', yearsLeft: 14, hoursLeft: 2184 });
  });

  it('floors hoursIfMore fractional result', () => {
    // age 5.5 → yearsLeftFloat = 12.5
    // hoursIfMore = floor(7 × 52 × 12.5) = floor(4550) = 4550
    const result = calculateHourglass({
      type: 'child',
      currentAge: 5.5,
      currentWeeklyHours: 5,
      targetWeeklyHours: 7,
    });
    expect(result.type).toBe('child');
    if (result.type === 'child') {
      expect(result.hoursLeft).toBe(Math.floor(5 * 52 * 12.5));   // 3250
      expect(result.hoursIfMore).toBe(Math.floor(7 * 52 * 12.5)); // 4550
    }
  });
});

describe('calculateHourglass — parent', () => {
  it('calculates correctly with default life expectancy', () => {
    const result = calculateHourglass({
      type: 'parent',
      currentAge: 65,
      visitsPerYear: 2,
      daysPerVisit: 5,
    });
    // yearsLeft = 78 - 65 = 13, visitsLeft = 2×13 = 26, daysTogether = 26×5 = 130
    expect(result).toEqual({ type: 'parent', yearsLeft: 13, visitsLeft: 26, daysTogether: 130 });
  });

  it('respects a custom life expectancy', () => {
    const result = calculateHourglass({
      type: 'parent',
      currentAge: 70,
      lifeExpectancy: 85,
      visitsPerYear: 2,
      daysPerVisit: 3,
    });
    // yearsLeft = 85 - 70 = 15, visitsLeft = 30, daysTogether = 90
    expect(result).toEqual({ type: 'parent', yearsLeft: 15, visitsLeft: 30, daysTogether: 90 });
  });

  it('returns zeros when parent age equals life expectancy', () => {
    const result = calculateHourglass({
      type: 'parent',
      currentAge: 78,
      visitsPerYear: 4,
      daysPerVisit: 7,
    });
    expect(result).toEqual({ type: 'parent', yearsLeft: 0, visitsLeft: 0, daysTogether: 0 });
  });

  it('returns zeros when parent age exceeds life expectancy', () => {
    const result = calculateHourglass({
      type: 'parent',
      currentAge: 82,
      visitsPerYear: 3,
      daysPerVisit: 10,
    });
    expect(result).toEqual({ type: 'parent', yearsLeft: 0, visitsLeft: 0, daysTogether: 0 });
  });

  it('floors non-integer year results', () => {
    // age 65.5 → yearsLeftFloat = 12.5, visitsLeft = floor(2×12.5) = 25
    // daysTogether = floor(25×5) = 125 — but we use float: floor(2×12.5×5) = floor(125) = 125
    const result = calculateHourglass({
      type: 'parent',
      currentAge: 65.5,
      visitsPerYear: 2,
      daysPerVisit: 5,
    });
    expect(result).toEqual({ type: 'parent', yearsLeft: 12, visitsLeft: 25, daysTogether: 125 });
  });

  it('floors fractional visits and days', () => {
    // age 65, yearsLeft = 13, visitsPerYear = 2.5 → visitsLeft = floor(2.5×13) = floor(32.5) = 32
    // daysTogether = floor(32.5 × 3) = floor(97.5) = 97
    const result = calculateHourglass({
      type: 'parent',
      currentAge: 65,
      visitsPerYear: 2.5,
      daysPerVisit: 3,
    });
    expect(result).toEqual({ type: 'parent', yearsLeft: 13, visitsLeft: 32, daysTogether: 97 });
  });
});

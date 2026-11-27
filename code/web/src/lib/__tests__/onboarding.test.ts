import { describe, expect, it } from 'vitest';
import type { TimeBucket } from '@mira/contract';
import {
  ONBOARD_STEPS,
  SETTLED_TIME_ENTRIES,
  isNo,
  pendingSteps,
  type OnboardFacts,
} from '../onboarding';

const rong: OnboardFacts = {
  netIncome: null,
  monthlyExpense: null,
  debtPayment: null,
  debtBalance: null,
  netWorth: null,
  buckets: new Set<TimeBucket>(),
  timeCount: 0,
  grains: 0,
};
const ids = (f: Partial<OnboardFacts>, skipped: string[] = []) =>
  pendingSteps({ ...rong, ...f }, new Set(skipped)).map((b) => b.id);

describe('pendingSteps', () => {
  it('tài khoản rỗng thì hỏi đủ, bắt đầu từ thu nhập', () => {
    expect(ids({})).toEqual(ONBOARD_STEPS.map((b) => b.id));
    expect(ids({})[0]).toBe('income');
  });

  it('khai lương rồi thì câu kế là nợ', () => {
    expect(ids({ netIncome: 18_000_000 })[0]).toBe('debt');
  });

  it('thu nhập bằng 0 chưa tính là đã khai', () => {
    expect(ids({ netIncome: 0 })[0]).toBe('income');
  });

  it('khai khoản trả nợ tháng cũng là đã trả lời câu nợ', () => {
    expect(ids({ debtPayment: 7_000_000 })).not.toContain('debt');
  });

  it('dư nợ bằng 0 là một câu trả lời, không phải chưa khai', () => {
    expect(ids({ debtBalance: 0 })).not.toContain('debt');
  });

  it('bước đã chọn bỏ qua thì không hỏi lại', () => {
    expect(ids({}, ['debt'])).not.toContain('debt');
  });

  it('có mục giờ nhóm nào thì thôi hỏi nhóm đó', () => {
    const ra = ids({ buckets: new Set<TimeBucket>(['work']), timeCount: 1 });
    expect(ra).not.toContain('work');
    expect(ra).toContain('waste');
    expect(ra).toContain('family');
  });

  it('người đã quen ghi giờ không bị hỏi lại ba bước giờ', () => {
    const ra = ids({ buckets: new Set<TimeBucket>(['work']), timeCount: SETTLED_TIME_ENTRIES });
    expect(ra).not.toContain('waste');
    expect(ra).not.toContain('family');
  });

  it('khai hết thì không còn bước nào', () => {
    expect(
      ids({
        netIncome: 1,
        monthlyExpense: 1,
        debtBalance: 1,
        netWorth: 1,
        buckets: new Set<TimeBucket>(['work', 'waste', 'family']),
        timeCount: 3,
        grains: 1,
      }),
    ).toEqual([]);
  });
});

describe('isNo', () => {
  it('nhận các cách nói không', () => {
    for (const c of ['không', 'Không.', 'ko', 'chưa', 'không có', 'ko nợ', 'bỏ qua', 'khong']) {
      expect(isNo(c), c).toBe(true);
    }
  });

  it('một dòng nhật ký bắt đầu bằng "không" thì không phải lời từ chối', () => {
    expect(isNo('không ngủ được cả đêm')).toBe(false);
    expect(isNo('chưa ăn gì từ sáng')).toBe(false);
  });

  it('một con số không phải lời từ chối', () => {
    expect(isNo('18 triệu')).toBe(false);
  });
});

describe('bộ câu hỏi', () => {
  it('mỗi bước có ít nhất năm câu mẫu và một lý do', () => {
    for (const b of ONBOARD_STEPS) {
      expect(b.samples.length, b.id).toBeGreaterThanOrEqual(5);
      expect(b.why.trim(), b.id).not.toBe('');
    }
  });
});

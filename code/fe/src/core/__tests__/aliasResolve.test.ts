import { describe, expect, it } from 'vitest';
import { MINUTES_IN_HOUR } from '@/core/constants';

// Test này canh cấu hình, không canh nghiệp vụ: alias '@' từng hỏng trên Windows
// (.pathname trả '/D:/...'). Nếu nó gãy thì mọi test import qua '@/' gãy theo.
describe('alias @ resolve được', () => {
  it('import qua @/ chạy được', () => {
    expect(MINUTES_IN_HOUR).toBe(60);
  });
});

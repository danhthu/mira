import { ONBOARDING_ROLES, ROLE_RING } from '../../src/Welcome/Models/constants';
import {
  PersonDraft,
  addDraft,
  draftFor,
  hasRole,
  namedDrafts,
  removeDraft,
  renameDraft,
  setCadence,
  toggleRole,
} from '../../src/Welcome/Models/draft';
import { cadenceName, roleName } from '../../src/Welcome/Models/labels';
import { useText } from '../../src/Welcome/Text';

const text = useText();

describe('bước 1 — chọn vai', () => {
  it('năm gợi ý đúng thứ tự của spec', () => {
    expect(ONBOARDING_ROLES.map((role) => roleName(role, text))).toEqual([
      'con',
      'bố mẹ',
      'bạn đời',
      'bạn thân',
      'bản thân',
    ]);
  });

  it('chọn nhiều vai được', () => {
    let drafts: readonly PersonDraft[] = [];
    drafts = toggleRole(drafts, 'child', 'k1');
    drafts = toggleRole(drafts, 'parent', 'k2');
    expect(hasRole(drafts, 'child')).toBe(true);
    expect(hasRole(drafts, 'parent')).toBe(true);
  });

  it('bỏ chọn một vai bỏ mọi chỗ trống của vai đó', () => {
    let drafts: readonly PersonDraft[] = [];
    drafts = toggleRole(drafts, 'child', 'k1');
    drafts = addDraft(drafts, 'child', 'k2');
    drafts = toggleRole(drafts, 'child', 'k3');
    expect(drafts.length).toBe(0);
  });

  it('chưa hỏi tên ở bước này', () => {
    expect(draftFor('child', 'k1').name).toBe('');
  });
});

describe('nhịp gặp mặc định theo vai', () => {
  it('con là hằng ngày', () => {
    const draft = draftFor('child', 'k1');
    expect(draft.cadence).toBe(30);
    expect(cadenceName(draft.cadence, text)).toBe('hằng ngày');
  });

  it('bố mẹ là 2 lần một tháng', () => {
    const draft = draftFor('parent', 'k1');
    expect(draft.cadence).toBe(2);
    expect(cadenceName(draft.cadence, text)).toBe('2 lần một tháng');
  });
});

describe('bước 2 và 3 — tên và nhịp', () => {
  const base = [draftFor('child', 'k1'), draftFor('parent', 'k2')];

  it('đổi tên chỉ chạm vào đúng một hàng', () => {
    const after = renameDraft(base, 'k1', 'Bi');
    expect(after[0].name).toBe('Bi');
    expect(after[1].name).toBe('');
  });

  it('đổi nhịp chỉ chạm vào đúng một hàng', () => {
    const after = setCadence(base, 'k2', 4);
    expect(after[1].cadence).toBe(4);
    expect(after[0].cadence).toBe(30);
  });

  it('bỏ một hàng không đụng hàng còn lại', () => {
    expect(removeDraft(base, 'k1').map((d) => d.key)).toEqual(['k2']);
  });
});

describe('bước 4 — lưu ai', () => {
  it('hàng để trống bị bỏ qua, bỏ qua được hết', () => {
    const drafts = [renameDraft([draftFor('child', 'k1')], 'k1', '  ')[0], draftFor('parent', 'k2')];
    expect(namedDrafts(drafts).length).toBe(0);
  });

  it('tên được cắt khoảng trắng hai đầu', () => {
    const drafts = renameDraft([draftFor('child', 'k1')], 'k1', '  Bi  ');
    expect(namedDrafts(drafts)[0].name).toBe('Bi');
  });
});

describe('vòng Dunbar suy từ vai, onboarding không hỏi thêm', () => {
  it('người nhà vào vòng 5, bạn thân vòng 15', () => {
    expect(ROLE_RING.child).toBe(5);
    expect(ROLE_RING.parent).toBe(5);
    expect(ROLE_RING.partner).toBe(5);
    expect(ROLE_RING.friend).toBe(15);
  });
});

describe('giọng của onboarding', () => {
  it('không câu nào dùng "nên", "phải", "hãy" hay dấu chấm than', () => {
    const all = Object.keys(text)
      .map((key) => (text as Record<string, string>)[key])
      .join(' ');
    expect(all).not.toMatch(/\bnên\b|\bphải\b|\bhãy\b|!/);
  });

  it('không hỏi tuổi, khoảng cách hay thu nhập', () => {
    const questions = [text.step1Question, text.step2Question, text.step3Question];
    expect(questions.join(' ')).not.toMatch(/tuổi|thu nhập|khoảng cách/);
  });
});

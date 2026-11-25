/**
 * Đăng nhập Google ở trình duyệt.
 *
 * Phía này **chỉ lấy ID token rồi đưa cho máy chủ**. Không kiểm gì, không tin gì, không
 * quyết định ai là ai — mã chạy trong trình duyệt thì người dùng sửa được. Máy chủ kiểm
 * chữ ký, audience và `email_verified` (xem `be/src/services/google.ts`).
 *
 * Nút do chính Google vẽ, không phải nút tự làm. Lý do không phải thẩm mỹ: nút của Google
 * chạy trong iframe của họ, nên thao tác chọn tài khoản không đi qua mã của Mira.
 *
 * `VITE_GOOGLE_CLIENT_ID` **không phải bí mật** — nó nằm công khai trong gói JS. Chưa đặt
 * thì `googleBat` là false và màn đăng nhập ẩn nút đi thay vì hiện một nút hỏng.
 *
 * Khuôn lấy từ Vessel360 `web/src/lib/googleSignIn.ts`. Phần Capacitor/Android bỏ đi vì
 * Mira hiện chỉ có web.
 */

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
export const googleBat = GOOGLE_CLIENT_ID !== '';

interface GsiId {
  initialize(o: {
    client_id: string;
    callback: (r: { credential: string }) => void;
    ux_mode?: 'popup';
    auto_select?: boolean;
  }): void;
  renderButton(el: HTMLElement, o: Record<string, unknown>): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GsiId } };
  }
}

let dangTai: Promise<GsiId> | null = null;

function napGsi(): Promise<GsiId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  dangTai ??= new Promise<GsiId>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () =>
      window.google?.accounts?.id
        ? resolve(window.google.accounts.id)
        : reject(new Error('Không tải được Google Sign-In.'));
    s.onerror = () => {
      // Xoá để lần bấm sau thử lại được; giữ promise hỏng thì nút chết vĩnh viễn.
      dangTai = null;
      reject(new Error('Không tải được Google Sign-In.'));
    };
    document.head.appendChild(s);
  });
  return dangTai;
}

/** Vẽ nút "Tiếp tục với Google" vào `el`. Mỗi lần chọn tài khoản thì gọi `onToken`. */
export async function veNutGoogle(
  el: HTMLElement,
  onToken: (idToken: string) => void,
): Promise<void> {
  const id = await napGsi();
  id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (r) => onToken(r.credential),
    ux_mode: 'popup',
    // Không tự đăng nhập: vào Mira phải là một hành động có ý thức, không phải thứ xảy ra
    // với mình khi mở trang.
    auto_select: false,
  });
  el.innerHTML = '';
  id.renderButton(el, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    logo_alignment: 'center',
    width: Math.min(400, Math.max(200, Math.round(el.getBoundingClientRect().width) || 320)),
    locale: 'vi',
  });
}

/** Sau khi thoát thì đừng tự đăng nhập lại bằng Google. */
export function googleThoat(): void {
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    /* chưa nạp GSI thì không có gì để tắt */
  }
}

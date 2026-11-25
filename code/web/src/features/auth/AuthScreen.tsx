import { useEffect, useRef, useState } from 'react';
import type { User } from '@mira/contract';
import { store } from '../../lib/store';
import { moPhien } from '../../lib/phien';
import { googleBat, veNutGoogle } from '../../lib/google';

/**
 * Màn đăng nhập.
 *
 * KHÔNG CÒN ĐĂNG KÝ. Từ 25/11/2026 người mới vào bằng Google, và lần đầu đăng nhập chính
 * là lần tài khoản được tạo — không có màn riêng để tạo.
 *
 * Mật khẩu vẫn còn, nhưng xuống dưới và phải bấm mới mở: nó là đường cho các tài khoản
 * đã có từ trước, không phải đường chính. Mật khẩu chỉ tồn tại trong ô nhập cho tới lúc
 * gửi đi — không lưu, không ghi lại, không điền sẵn.
 *
 * Thông báo lỗi lấy nguyên văn từ máy chủ, vì chính máy chủ mới biết sai ở đâu, và nó cố
 * tình không nói rõ sai tên hay sai mật khẩu.
 */
export function AuthScreen({ onVao }: { readonly onVao: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [moMatKhau, setMoMatKhau] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [dangGui, setDangGui] = useState(false);
  const oNut = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!googleBat || oNut.current === null) return;
    let conHieuLuc = true;

    void veNutGoogle(oNut.current, (idToken) => {
      if (!conHieuLuc) return;
      setDangGui(true);
      setLoi(null);
      store
        .google({ idToken })
        .then((kq) => {
          moPhien(kq.token);
          onVao(kq.user);
        })
        .catch((cause: unknown) => {
          setLoi(cause instanceof Error ? cause.message : 'Không kết nối được máy chủ.');
        })
        .finally(() => {
          if (conHieuLuc) setDangGui(false);
        });
    }).catch((cause: unknown) => {
      if (conHieuLuc) setLoi(cause instanceof Error ? cause.message : 'Không tải được Google.');
    });

    return () => {
      conHieuLuc = false;
    };
  }, [onVao]);

  async function guiMatKhau(): Promise<void> {
    if (username.trim() === '' || password === '') return;
    setDangGui(true);
    setLoi(null);
    try {
      const kq = await store.login({ username: username.trim(), password });
      moPhien(kq.token);
      setPassword('');
      onVao(kq.user);
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không kết nối được máy chủ.');
    } finally {
      setDangGui(false);
    }
  }

  const o = {
    width: '100%',
    background: 'var(--surface)',
    border: '1.5px solid #d7dfe9',
    borderRadius: 13,
    padding: '12px 15px',
    fontSize: 16,
  } as const;

  return (
    <div className="screen-body" style={{ justifyContent: 'center', paddingBottom: 24 }}>
      <div style={{ marginBottom: 6 }}>
        <div className="title" style={{ fontSize: 30 }}>
          Mira
        </div>
        <p className="sm" style={{ marginTop: 6, lineHeight: 1.5 }}>
          Đăng nhập để mở nhật ký của bạn.
        </p>
      </div>

      {googleBat && (
        <div ref={oNut} style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
      )}

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)' }}>
          {loi}
        </p>
      )}

      {!moMatKhau && (
        <button
          type="button"
          onClick={() => setMoMatKhau(true)}
          style={{ fontSize: 14, color: 'var(--fg-dim)', marginTop: 4 }}
        >
          Đăng nhập bằng mật khẩu
        </button>
      )}

      {moMatKhau && (
        <>
          <input
            id="auth-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên đăng nhập"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            style={o}
          />
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void guiMatKhau();
            }}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            style={o}
          />
          <button
            type="button"
            onClick={() => void guiMatKhau()}
            disabled={dangGui}
            style={{
              background: 'var(--navy)',
              color: '#fff',
              borderRadius: 13,
              padding: '13px 15px',
              fontWeight: 600,
              fontSize: 16,
              opacity: dangGui ? 0.6 : 1,
            }}
          >
            {dangGui ? 'Đang gửi…' : 'Đăng nhập'}
          </button>
        </>
      )}

      <p className="empty" style={{ marginTop: 10 }}>
        Dữ liệu của bạn nằm trên máy chủ Mira và chỉ bạn đọc được. Không ai khác thấy nhật
        ký, giờ hay tiền của bạn.
      </p>
    </div>
  );
}

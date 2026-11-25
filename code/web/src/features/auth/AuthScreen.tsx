import { useState } from 'react';
import type { User } from '@mira/contract';
import { MIN_PASSWORD_LENGTH } from '@mira/contract';
import { store } from '../../lib/store';
import { moPhien } from '../../lib/phien';

/**
 * Màn đăng nhập và đăng ký.
 *
 * Mật khẩu chỉ tồn tại trong ô nhập cho tới lúc gửi đi — không lưu, không ghi lại, không
 * điền sẵn. Thông báo lỗi lấy nguyên văn từ máy chủ, vì chính máy chủ mới biết đăng nhập
 * sai ở đâu, và nó cố tình không nói rõ sai tên hay sai mật khẩu.
 */
export function AuthScreen({ onVao }: { readonly onVao: (user: User) => void }) {
  const [dangKy, setDangKy] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenHienThi, setTenHienThi] = useState('');
  const [loi, setLoi] = useState<string | null>(null);
  const [dangGui, setDangGui] = useState(false);

  async function gui(): Promise<void> {
    if (username.trim() === '' || password === '') return;
    setDangGui(true);
    setLoi(null);
    try {
      const ketQua = dangKy
        ? await store.register({
            username: username.trim(),
            password,
            displayName: tenHienThi.trim() === '' ? null : tenHienThi.trim(),
          })
        : await store.login({ username: username.trim(), password });
      moPhien(ketQua.token);
      setPassword('');
      onVao(ketQua.user);
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
          {dangKy
            ? 'Tạo tài khoản để dữ liệu theo bạn qua mọi máy.'
            : 'Đăng nhập để mở nhật ký của bạn.'}
        </p>
      </div>

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

      {dangKy && (
        <input
          id="auth-display"
          value={tenHienThi}
          onChange={(e) => setTenHienThi(e.target.value)}
          placeholder="Tên hiển thị (không bắt buộc)"
          autoComplete="name"
          style={o}
        />
      )}

      <input
        id="auth-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void gui();
        }}
        placeholder={dangKy ? `Mật khẩu — ít nhất ${MIN_PASSWORD_LENGTH} ký tự` : 'Mật khẩu'}
        autoComplete={dangKy ? 'new-password' : 'current-password'}
        style={o}
      />

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)' }}>
          {loi}
        </p>
      )}

      <button
        type="button"
        onClick={() => void gui()}
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
        {dangGui ? 'Đang gửi…' : dangKy ? 'Tạo tài khoản' : 'Đăng nhập'}
      </button>

      <button
        type="button"
        onClick={() => {
          setDangKy(!dangKy);
          setLoi(null);
        }}
        style={{ fontSize: 14, color: 'var(--fg-dim)' }}
      >
        {dangKy ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Tạo mới'}
      </button>

      <p className="empty" style={{ marginTop: 10 }}>
        Dữ liệu của bạn nằm trên máy chủ Mira và chỉ bạn đọc được. Không ai khác thấy nhật
        ký, giờ hay tiền của bạn.
      </p>
    </div>
  );
}

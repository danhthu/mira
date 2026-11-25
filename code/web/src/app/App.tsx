import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { User } from '@mira/contract';
import { TabBar } from '../ui/TabBar';
import { AuthScreen } from '../features/auth/AuthScreen';
import { WelcomeScreen } from '../features/auth/WelcomeScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { TimeScreen } from '../features/time/TimeScreen';
import { BucketScreen } from '../features/time/BucketScreen';
import { HuScreen } from '../features/home/HuScreen';
import { MoneyScreen } from '../features/money/MoneyScreen';
import { GoalScreen } from '../features/goal/GoalScreen';
import { MeScreen } from '../features/me/MeScreen';
import { coToken, dongPhien } from '../lib/phien';
import { store } from '../lib/store';

/**
 * Ba trạng thái, không phải hai. Trước đây chỉ có "có user" và "không có user" vì user
 * đọc được ngay từ localStorage. Giờ user đến từ máy chủ nên có quãng giữa — và quãng đó
 * phải vẽ ra cái gì đó, không thì mỗi lần mở app sẽ nháy qua màn đăng nhập một nhịp dù
 * đang đăng nhập.
 */
type Phien =
  | { trang_thai: 'dang-hoi' }
  | { trang_thai: 'chao' }
  | { trang_thai: 'chua-vao' }
  | { trang_thai: 'da-vao'; user: User };

export function App() {
  // Chưa có token thì vào màn chào trước, không phải màn đăng nhập. Thoát ra thì về
  // 'chua-vao' chứ không về 'chao': người vừa đăng xuất không cần xem lại lời giới thiệu.
  const [phien, setPhien] = useState<Phien>(() =>
    coToken() ? { trang_thai: 'dang-hoi' } : { trang_thai: 'chao' },
  );

  useEffect(() => {
    if (phien.trang_thai !== 'dang-hoi') return;
    let conHieuLuc = true;

    void store
      .me()
      .then((user: User) => {
        if (conHieuLuc) setPhien({ trang_thai: 'da-vao', user });
      })
      .catch(() => {
        // Token hết hạn, bị thu hồi, hoặc máy chủ không trả lời. Trường hợp nào cũng
        // không vào được, nên xoá token cho khỏi thử lại vô ích mỗi lần mở app.
        dongPhien();
        if (conHieuLuc) setPhien({ trang_thai: 'chua-vao' });
      });

    return () => {
      conHieuLuc = false;
    };
  }, [phien.trang_thai]);

  if (phien.trang_thai === 'dang-hoi') {
    return (
      <div className="screen">
        <div className="card" style={{ margin: 16, textAlign: 'center' }}>
          Đang mở phiên…
        </div>
      </div>
    );
  }

  if (phien.trang_thai === 'chao') {
    return <WelcomeScreen onVao={() => setPhien({ trang_thai: 'chua-vao' })} />;
  }

  // Chưa đăng nhập thì không dựng router: không màn nào trong app có nghĩa khi chưa biết
  // dữ liệu của ai.
  if (phien.trang_thai === 'chua-vao') {
    return (
      <div className="screen">
        <AuthScreen onVao={(user) => setPhien({ trang_thai: 'da-vao', user })} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="screen">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/thoi-gian" element={<TimeScreen />} />
          <Route path="/thoi-gian/:bucket" element={<BucketScreen />} />
          <Route path="/hu" element={<HuScreen />} />
          <Route path="/tai-chinh" element={<MoneyScreen />} />
          <Route path="/muc-tieu" element={<GoalScreen />} />
          <Route
            path="/toi"
            element={
              <MeScreen user={phien.user} onRa={() => setPhien({ trang_thai: 'chua-vao' })} />
            }
          />
        </Routes>
        <TabBar />
      </div>
    </BrowserRouter>
  );
}

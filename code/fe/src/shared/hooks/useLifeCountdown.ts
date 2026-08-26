import { useSettingsStore } from '@/store/settingsStore';

/**
 * Ràng buộc cứng #4: đếm ngược đời người mặc định TẮT. Màn nào muốn hiện nó
 * phải hỏi hook này trước, và chỉ hiện khi người dùng đã tự bật trong Cài đặt.
 */
export function useLifeCountdownEnabled(): boolean {
  return useSettingsStore((state) => state.lifeCountdownEnabled);
}

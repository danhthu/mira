

import { useEffect } from 'react';

// Hook để đo thời gian hoàn thành màn hình
export function useScreenLoadTime(name, dependencies: any[] = []) {

  useEffect(() => {
    // Ghi nhận thời điểm màn hình bắt đầu load
    const startTime = Date.now();
    return () => {
      const endTime = Date.now();
      if (startTime && endTime) {
        const loadTime = (endTime - startTime) / 1000;
        console.info(`Screen ${name}: ${loadTime} ms`);
        if (loadTime > 500) {
          console.warn(`Warning: Screen ${name}: Load Time exceeded 500ms! (${loadTime} ms)`);
        }
      }
    };
  }, [dependencies]); // Hook này chạy lại mỗi khi dependencies thay đổi

}



export const StartProfiling = (context: any): { end: () => void } => ({ end: () => { } });


export default useScreenLoadTime;

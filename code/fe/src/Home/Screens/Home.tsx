import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import useScreenLoadTime from '../../../hook/useScreenLoadTime';
import { Router } from '../../../Router';
import { challengeRepository } from '../../Challenger/Entities/Repositories';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { emotionTrackerRepository } from '../../Emotion/Entities/emotionTrackerRepository';
import { goalRepository } from '../../Goal/Entities/Repositories';
import {
  habitRepository,
  habitTrackerRepository,
} from '../../HabitTracker/Entities/habitRepository';
import { timeDataRepository } from '../../TimeTracker/Entities/repositories';
import { workRepository } from '../../Work/Entities/Repository';
import { ModuleTile } from '../Components/ModuleTile';
import { MomentInput } from '../Components/MomentInput';
import { useHomeStyle } from '../Components/styles';
import { formatVietnameseDate } from '../Models/format';
import { loadHomeSummary } from '../Models/load';
import { saveMoment } from '../Models/logging';
import { EMPTY_SUMMARY } from '../Models/summary';
import { ModuleEntry, buildTiles } from '../Models/tiles';
import { useText } from '../Text';

/**
 * Màn chính: bảng dẫn vào các module đang hoạt động, mỗi ô kèm một câu về hôm nay.
 *
 * Bảng bốn con số của `08-three-pillars.md` đã gỡ ở đợt 2026-09-05: hai con số tài
 * chính đọc từ trụ Tài chính, mà trụ đó tạm ẩn khỏi navigator, nên chúng sẽ kẹt ở
 * "chưa có dữ liệu" vĩnh viễn — xem `../HANDOFF.md`.
 */
export const Home = () => {
  useScreenLoadTime('Home', []);
  const style = useHomeStyle();
  const text = useText();
  const nav = useNavigation();

  // Ngày của màn hình cố định lúc mở: các ô đều nói về "hôm nay", đổi ngày giữa
  // chừng sẽ làm câu chữ nhảy mà người dùng không chạm gì.
  const [today] = useState(() => new Date());

  const summary = useAsyncAction(
    () => loadHomeSummary(today),
    [
      useDectectDataChanged(workRepository),
      useDectectDataChanged(habitRepository),
      useDectectDataChanged(habitTrackerRepository),
      useDectectDataChanged(challengeRepository),
      useDectectDataChanged(goalRepository),
      useDectectDataChanged(emotionTrackerRepository),
      useDectectDataChanged(timeDataRepository),
    ],
    EMPTY_SUMMARY,
  );

  const open = (entry: ModuleEntry) => {
    Router.Open(nav, entry.route.name, entry.route.params);
  };

  return (
    <View style={style.screen}>
      <ScrollView contentContainerStyle={style.content}>
        <Text style={style.headerDate}>{formatVietnameseDate(today)}</Text>

        <View style={style.grid}>
          {buildTiles(summary, text).map((entry) => (
            <ModuleTile key={entry.key} entry={entry} onOpen={open} />
          ))}
        </View>

        <MomentInput
          onSave={(value) => {
            saveMoment(value, new Date());
          }}
        />
      </ScrollView>
    </View>
  );
};

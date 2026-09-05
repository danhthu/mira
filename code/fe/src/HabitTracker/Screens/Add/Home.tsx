import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { BText as Text } from '../../../../libs/components';
import { ButtonV2 } from '../../../../libs/components/Buttons';
import { Router } from '../../../../Router';
import { useTheme } from '../../../../theme';
import {
  FONT_SIZE,
  FONTSIZE,
  ROUND_BIG,
} from '../../../../theme/Constraints';
import { useAsyncAction } from '../../../Common/Hooks';
import { useCommonStyle } from '../../../Common/Styles';
import { AssetManagement } from '../../Assets/';
import { Header } from '../../Components/Header';
import { habitRepository, habitTemplateRepository } from '../../Entities';
import { useText } from '../../Text';
import { AddableHabits, AddableTemplate } from './AddableHabits';
import TabSlider from './TabSlider';

/**
 * Màn chọn thói quen mới.
 *
 * Luồng cũ tốn ba chạm cho một thói quen: chạm dấu cộng trên thẻ gợi ý → mở màn
 * `AddFromTemplate` (một biểu mẫu tám mục đã điền sẵn) → chạm "Add". Hai chạm sau
 * không thêm thông tin gì mà người dùng chưa thấy, nên đã bỏ: dấu cộng ghi thẳng
 * thói quen vào máy. Muốn sửa màu, lịch lặp hay lời nhắc thì vào Chi tiết → Sửa,
 * nhưng đó là việc làm một lần, không nằm trong ngân sách nhập liệu hằng ngày.
 *
 * Hai lối đi hỏng cũng đã gỡ cùng lúc: nút "Tất cả" của mỗi nhóm và thẻ bộ sưu
 * tập đều điều hướng tới `HabitTrackerAppModal` — một tên route không tồn tại
 * trong navigator nào — nên chạm vào không có gì xảy ra.
 */
export const Home = ({ navigation }) => {
  const text = useText();
  const commonStyle = useCommonStyle();

  return (
    <View style={[commonStyle.screen]}>
      <Header title={text.screen_add} />
      <ScrollView>
        <Text
          style={{
            fontWeight: '600',
            fontSize: FONT_SIZE.PageTitle,
            marginBottom: 4,
          }}
        >
          {text.pick_one}
        </Text>
        <Hint />
        <TabSlider
          style={{ marginTop: 16, marginBottom: 20 }}
          tabs={[text.tab_suggested, text.tab_all]}
        >
          <Groups />
          <AllHabits />
        </TabSlider>
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <ButtonV2
          type="secondary"
          text={text.add_own}
          onPress={() =>
            Router.Open(navigation, 'HabitAppModal', { screen: 'AddModal' })
          }
        />
      </View>
    </View>
  );
};

const Hint = () => {
  const colors = useTheme();
  const text = useText();
  return (
    <Text style={{ color: colors.token.textSecondary, fontSize: FONTSIZE.SMALL }}>
      {text.add_own_hint}
    </Text>
  );
};

/** Danh sách phẳng mọi mẫu, dùng cho tab "Tất cả". */
const AllHabits = () => {
  const [reloadKey, setReloadKey] = useState(0);
  const data = useAsyncAction(
    async () => {
      const owned = (await habitRepository.list()).map((h) => h.name);
      return (await habitTemplateRepository.list()).map((h) => ({
        ...h,
        owned: owned.includes(h.name),
      }));
    },
    [reloadKey],
    [] as Array<AddableTemplate>,
  );
  return (
    <AddableHabits
      habits={data}
      onAdded={() => setReloadKey((k) => k + 1)}
    />
  );
};

/** Các nhóm gợi ý, mỗi nhóm hiện đủ mẫu của nó — không còn nút "Tất cả" chết. */
const Groups = () => {
  const [reloadKey, setReloadKey] = useState(0);
  const text = useText();
  const colors = useTheme();
  const groups = useAsyncAction(
    async () => {
      const all = await habitTemplateRepository.list();
      const owned = (await habitRepository.list()).map((h) => h.name);
      return [...new Set(all.map((h) => h.group).filter((g) => !!g))].map(
        (name) => {
          const first = all.find((h) => h.group == name);
          return {
            name,
            desc: first.group_desc,
            icon: first.group_icon,
            children: all
              .filter((h) => h.group == name)
              .map((h) => ({ ...h, owned: owned.includes(h.name) })),
          };
        },
      );
    },
    [reloadKey],
    [] as Array<{
      name: string
      desc: string
      icon: string
      children: Array<AddableTemplate>
    }>,
  );

  const styles = StyleSheet.create({
    image: { width: 28, height: 28, marginRight: 8 },
    title: {
      lineHeight: 28,
      fontWeight: '600',
      fontSize: FONTSIZE.Title,
      color: colors.token.textPrimary,
    },
    desc: {
      color: colors.token.textSecondary,
      fontSize: FONTSIZE.SMALL,
      marginBottom: 8,
    },
  });

  if (groups.length == 0) {
    return <Text style={styles.desc}>{text.empty_template}</Text>;
  }

  return (
    <>
      {groups.map((g) => (
        <View key={g.name} style={{ marginBottom: ROUND_BIG }}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              style={styles.image}
              source={AssetManagement[g.icon] || AssetManagement.habit_default}
            />
            <Text style={styles.title}>{g.name}</Text>
          </View>
          <Text style={styles.desc}>{g.desc}</Text>
          <AddableHabits
            habits={g.children}
            onAdded={() => setReloadKey((k) => k + 1)}
          />
        </View>
      ))}
    </>
  );
};

import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PersonDraft } from '../Models/draft';
import { cadenceName, roleName } from '../Models/labels';
import { useText } from '../Text';
import { CadenceSlider } from './CadenceSlider';
import { useWelcomeStyle } from './styles';

/**
 * Bước 3: "Bạn muốn gặp họ bao nhiêu lần một tháng?". Thanh đã đặt sẵn theo vai
 * (con hằng ngày, bố mẹ 2 lần/tháng — `05-v1-spec.md` §Onboarding), nên không đụng
 * vào cũng đi tiếp được.
 */
export const StepCadence = (props: {
  drafts: readonly PersonDraft[];
  onChange: (key: string, cadence: number) => void;
}) => {
  const style = useWelcomeStyle();
  const text = useText();

  return (
    <ScrollView style={style.body}>
      {props.drafts.map((draft) => (
        <View key={draft.key} style={style.cadenceBlock}>
          <View style={style.cadenceHead}>
            <Text style={style.cadenceName}>
              {draft.name.length === 0 ? roleName(draft.role, text) : draft.name}
            </Text>
            <Text style={style.cadenceValue}>{cadenceName(draft.cadence, text)}</Text>
          </View>
          <CadenceSlider
            value={draft.cadence}
            accessibilityLabel={draft.name}
            onChange={(cadence) => props.onChange(draft.key, cadence)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

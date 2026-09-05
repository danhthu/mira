import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { PersonRole } from '../../Core/types';
import { ONBOARDING_ROLES } from '../Models/constants';
import { PersonDraft } from '../Models/draft';
import { roleName } from '../Models/labels';
import { useText } from '../Text';
import { useWelcomeStyle } from './styles';

/**
 * Bước 2: nhập tên từng người — một màn, danh sách, gõ nhanh (`05-v1-spec.md`
 * §Onboarding). Hàng nào để trống thì lúc lưu bị bỏ qua, không chặn ai đi tiếp.
 */
export const StepNames = (props: {
  drafts: readonly PersonDraft[];
  onRename: (key: string, name: string) => void;
  onAdd: (role: PersonRole) => void;
  onRemove: (key: string) => void;
}) => {
  const style = useWelcomeStyle();
  const text = useText();

  return (
    <ScrollView style={style.body} keyboardShouldPersistTaps="handled">
      {props.drafts.map((draft, index) => (
        <View key={draft.key} style={style.row}>
          <Text style={style.rowRole}>{roleName(draft.role, text)}</Text>
          <TextInput
            style={style.input}
            value={draft.name}
            autoFocus={index === 0}
            placeholder={text.namePlaceholder}
            onChangeText={(value) => props.onRename(draft.key, value)}
            returnKeyType="next"
          />
          <Pressable accessibilityRole="button" onPress={() => props.onRemove(draft.key)}>
            <Text style={style.rowRemove}>{text.step2Remove}</Text>
          </Pressable>
        </View>
      ))}

      <Text style={style.hint}>{text.step2AddHint}</Text>
      <View style={style.chipRow}>
        {ONBOARDING_ROLES.map((role) => (
          <Pressable
            key={role}
            accessibilityRole="button"
            style={style.chipSmall}
            onPress={() => props.onAdd(role)}
          >
            <Text style={style.chipSmallText}>{roleName(role, text)}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

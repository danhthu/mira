import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useText } from '../Text';
import { useHomeStyle } from './styles';

/**
 * Ô khoảnh khắc luôn hiện (`05-v1-spec.md` §"Màn hình 1"): gõ rồi enter là xong,
 * không hộp thoại, không bước chọn người.
 */
export const MomentInput = (props: { onSave: (text: string) => void }) => {
  const style = useHomeStyle();
  const text = useText();
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    const value = draft.trim();
    if (value.length === 0) return;
    props.onSave(value);
    setDraft('');
    setSaved(true);
  };

  return (
    <View style={style.section}>
      <View style={style.inputRow}>
        <TextInput
          style={style.input}
          value={draft}
          placeholder={text.momentPlaceholder}
          onChangeText={(value) => {
            setDraft(value);
            setSaved(false);
          }}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Pressable accessibilityRole="button" style={style.inputAction} onPress={submit}>
          <Text style={style.inputActionText}>{text.momentSave}</Text>
        </Pressable>
      </View>
      {saved ? <Text style={style.hintText}>{text.momentSaved}</Text> : null}
    </View>
  );
};

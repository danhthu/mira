import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { PersonRole } from '../../Core/types';
import { CADENCE_STOPS, ROLE_ORDER } from '../Models/constants';
import { cadenceName, roleName } from '../Models/presenter';
import { PersonDraft, defaultCadenceFor } from '../Models/store';
import { useText } from '../Text';
import { usePersonStyle } from './styles';

export interface PersonFormTarget {
  /** `null` khi đang thêm người mới. */
  readonly id: string | null;
  readonly draft: PersonDraft;
}

/**
 * Thêm và sửa một người. Chỉ ba câu hỏi: tên, vai, nhịp gặp. Tuổi và khoảng cách
 * không có ở đây — `05-v1-spec.md` §Onboarding để hai thứ đó cho lúc người dùng chủ
 * động bật Đồng hồ cát trong Cài đặt.
 */
export const PersonForm = (props: {
  target: PersonFormTarget | null;
  onSave: (id: string | null, draft: PersonDraft) => void;
  onRemove: (id: string) => void;
  onCancel: () => void;
}) => {
  const style = usePersonStyle();
  const text = useText();
  const [name, setName] = useState('');
  const [role, setRole] = useState<PersonRole>('other');
  const [cadence, setCadence] = useState(defaultCadenceFor('other'));
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const target = props.target;
  const targetId = target === null ? null : target.id;

  useEffect(() => {
    if (target === null) return;
    setName(target.draft.name);
    setRole(target.draft.role);
    setCadence(target.draft.desiredCadence);
    setConfirmingRemove(false);
  }, [target]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const pickRole = (next: PersonRole) => {
    setRole(next);
    // Đổi vai lúc đang thêm mới thì kéo theo nhịp mặc định của vai đó; người đã có
    // nhịp riêng thì giữ nguyên, đổi vai không được ghi đè lựa chọn của họ.
    if (targetId === null) setCadence(defaultCadenceFor(next));
  };

  return (
    <Modal
      visible={target !== null}
      transparent
      animationType="fade"
      onRequestClose={props.onCancel}
    >
      <Pressable style={style.sheetScrim} onPress={props.onCancel}>
        <Pressable style={style.sheet}>
          <ScrollView>
            <Text style={style.fieldLabel}>{text.nameLabel}</Text>
            <TextInput
              style={style.input}
              value={name}
              autoFocus
              placeholder={text.namePlaceholder}
              onChangeText={setName}
              returnKeyType="done"
            />

            <Text style={style.fieldLabel}>{text.roleLabel}</Text>
            <View style={style.chipRow}>
              {ROLE_ORDER.map((option) => {
                const selected = option === role;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    style={selected ? [style.chip, style.chipSelected] : style.chip}
                    onPress={() => pickRole(option)}
                  >
                    <Text
                      style={
                        selected ? [style.chipText, style.chipTextSelected] : style.chipText
                      }
                    >
                      {roleName(option, text)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={style.fieldLabel}>{text.cadenceLabel}</Text>
            <View style={style.chipRow}>
              {CADENCE_STOPS.map((stop) => {
                const selected = stop === cadence;
                return (
                  <Pressable
                    key={stop}
                    accessibilityRole="button"
                    style={selected ? [style.chip, style.chipSelected] : style.chip}
                    onPress={() => setCadence(stop)}
                  >
                    <Text
                      style={
                        selected ? [style.chipText, style.chipTextSelected] : style.chipText
                      }
                    >
                      {cadenceName(stop, text)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={style.actionRow}>
              <Pressable accessibilityRole="button" onPress={props.onCancel}>
                <Text style={style.secondaryActionText}>{text.cancel}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!canSave}
                style={
                  canSave
                    ? style.primaryAction
                    : [style.primaryAction, style.primaryActionDisabled]
                }
                onPress={() =>
                  props.onSave(targetId, {
                    name: trimmed,
                    role,
                    desiredCadence: cadence,
                  })
                }
              >
                <Text
                  style={
                    canSave
                      ? style.primaryActionText
                      : [style.primaryActionText, style.primaryActionTextDisabled]
                  }
                >
                  {text.save}
                </Text>
              </Pressable>
            </View>

            {targetId !== null ? (
              <View>
                {confirmingRemove ? (
                  <View>
                    <Text style={style.cardNote}>
                      {`${text.removeQuestionPrefix} ${trimmed} ${text.removeQuestionSuffix}`}
                    </Text>
                    <Text style={style.removeNote}>{text.removeNote}</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => props.onRemove(targetId)}
                    >
                      <Text style={style.removeText}>{text.removeConfirm}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setConfirmingRemove(true)}
                  >
                    <Text style={style.removeText}>{text.remove}</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

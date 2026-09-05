import React from 'react';
import { Text, View } from 'react-native';
import { PersonRole } from '../../Core/types';
import { ONBOARDING_ROLES } from '../Models/constants';
import { PersonDraft, hasRole } from '../Models/draft';
import { roleName } from '../Models/labels';
import { useText } from '../Text';
import { Chip } from './Chip';
import { useWelcomeStyle } from './styles';

/**
 * Bước 1: "Ai là người bạn muốn giữ thời gian cho?". Chọn nhiều được, chưa hỏi tên
 * (`05-v1-spec.md` §Onboarding).
 */
export const StepRoles = (props: {
  drafts: readonly PersonDraft[];
  onToggle: (role: PersonRole) => void;
}) => {
  const style = useWelcomeStyle();
  const text = useText();

  return (
    <View style={style.body}>
      <View style={style.chipRow}>
        {ONBOARDING_ROLES.map((role) => (
          <Chip
            key={role}
            label={roleName(role, text)}
            selected={hasRole(props.drafts, role)}
            onPress={() => props.onToggle(role)}
          />
        ))}
      </View>
    </View>
  );
};

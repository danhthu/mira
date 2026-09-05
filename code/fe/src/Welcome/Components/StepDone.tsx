import React from 'react';
import { Text, View } from 'react-native';
import { useText } from '../Text';
import { useWelcomeStyle } from './styles';

/**
 * Bước 4: xong. Không hỏi tuổi, không hỏi thu nhập (`05-v1-spec.md` §Onboarding).
 * Dòng cuối nói thẳng khi nào Mira mới hỏi tuổi, để không ai bị hỏi bất ngờ về sau.
 */
export const StepDone = (props: { savedCount: number }) => {
  const style = useWelcomeStyle();
  const text = useText();

  return (
    <View style={style.body}>
      <Text style={style.doneTitle}>{text.step4Title}</Text>
      <Text style={style.doneLine}>
        {props.savedCount === 0
          ? text.step4NoneSaved
          : `${text.step4SavedPrefix} ${props.savedCount} ${text.step4SavedSuffix}`}
      </Text>
      <Text style={style.doneNote}>{text.step4Note}</Text>
    </View>
  );
};

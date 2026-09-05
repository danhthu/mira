/**
 * Hỏi lại trước một thao tác không lùi được (ẩn card vĩnh viễn, xoá toàn bộ dữ liệu).
 * Tự dựng thay vì dùng `Alert` vì `Alert` của react-native-web không hiện gì.
 */

import { View } from 'react-native';
import { space } from '../../../theme';
import { Button, ButtonTone, Note, Row, Sheet, Title } from './Basics';

export interface ConfirmSheetProps {
  readonly visible: boolean;
  readonly title: string;
  readonly body: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly tone: ButtonTone;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly testID: string;
}

export const ConfirmSheet = (props: ConfirmSheetProps) => {
  if (!props.visible) return null;
  return (
    <Sheet visible onClose={props.onCancel} testID={props.testID}>
      <Title>{props.title}</Title>
      <Note>{props.body}</Note>
      <View style={{ marginTop: space.lg }}>
        <Row>
          <Button
            testID={props.testID + '-yes'}
            tone={props.tone}
            label={props.confirmLabel}
            onPress={props.onConfirm}
          />
          <Button
            testID={props.testID + '-no'}
            tone="quiet"
            label={props.cancelLabel}
            onPress={props.onCancel}
          />
        </Row>
      </View>
    </Sheet>
  );
};

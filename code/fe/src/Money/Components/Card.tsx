import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useColorToken, fontSize, radius, space } from '../../../theme';

export interface CardProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly testID: string;
}

export const Card = (props: CardProps) => {
  const token = useColorToken();
  return (
    <View
      testID={props.testID}
      style={{
        backgroundColor: token.surface,
        borderColor: token.border,
        borderWidth: 1,
        borderRadius: radius.large,
        padding: space.lg,
        marginBottom: space.lg,
      }}
    >
      <Text
        style={{
          color: token.textMuted,
          fontSize: fontSize.caption,
          marginBottom: space.sm,
        }}
      >
        {props.title}
      </Text>
      {props.children}
    </View>
  );
};

/** Dòng chính của một thẻ — câu người dùng đọc đầu tiên. */
export const CardHeadline = ({ children }: { readonly children: string }) => {
  const token = useColorToken();
  return (
    <Text
      style={{
        color: token.textPrimary,
        fontSize: fontSize.title,
        marginBottom: space.xs,
      }}
    >
      {children}
    </Text>
  );
};

/** Dòng phụ: quãng đường phía trước, hoặc lý do chỉ số chưa hiện được. */
export const CardNote = ({ children }: { readonly children: string }) => {
  const token = useColorToken();
  return (
    <Text
      style={{
        color: token.textSecondary,
        fontSize: fontSize.body,
        marginTop: space.xxs,
      }}
    >
      {children}
    </Text>
  );
};

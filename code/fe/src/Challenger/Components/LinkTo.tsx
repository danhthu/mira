import {
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';


import { useTheme } from '../../../theme';

import { useNavigation } from '@react-navigation/native';
import React, {
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { B } from '../../../libs/components';
import { debugStyle } from '../../../libs/components/debugStyle';
import { Router } from '../../../Router';
import { FONTSIZE } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import {
  Challenge,
  ChallengeAssociate,
  challengeAssociateRepository,
  challengeRepository,
} from '../Entities';
import { useText } from '../Text';

export interface LinkToProp {
  table: string
  tableId: string
  rowHeight?: number
  onChanged?: (data: string) => void
  style?: StyleProp<ViewStyle>
}

export interface ChallengeLinkToAction {
  save: () => Promise<void>
}

export const LinkTo = React.forwardRef(
  (props: LinkToProp, ref: Ref<ChallengeLinkToAction>) => {
    useImperativeHandle(
      ref,
      () => {
        return {
          save: async () => {
            if (dataRef.current.challenge) {
              await challengeAssociateRepository.delete2(
                (h) =>
                  h.tableId == dataRef.current.tableId &&
                  h.table == dataRef.current.table,
              );
              await challengeAssociateRepository.add({
                ...new ChallengeAssociate(),
                challengeId: dataRef.current.challenge.id,
                table: dataRef.current.table,
                tableId: dataRef.current.tableId,
              });
              await challengeAssociateRepository.save();
            } else {
              await challengeAssociateRepository.delete2(
                (h) =>
                  h.tableId == dataRef.current.tableId &&
                  h.table == dataRef.current.table,
              );
            }
          },
        };
      },
      [],
    );
    const [data, setData] = useState<Challenge>();
    const dataRef = useRef({
      tableId: '',
      table: '',
      challenge: data,
    });
    useEffect(() => {
      dataRef.current = {
        tableId: props.tableId,
        table: props.table,
        challenge: data,
      };
    }, [data, props.table, props.tableId]);
    const text = useText();

    useAsyncAction(async () => {
      const g = (await challengeAssociateRepository.list())
        .filter((t) => t.table == props.table && t.tableId == props.tableId)
        .map((m) => m.challengeId);
      const data = (await challengeRepository.list()).filter(
        (h) => g.indexOf(h.id) > -1,
      )[0];
      setData(data);
    }, [
      props.table,
      props.tableId,
      useDectectDataChanged(challengeAssociateRepository),
      useDectectDataChanged(challengeRepository),
    ]);

    const onGoBack = (data) => {
      setData(data);
    };
    const nav = useNavigation();
    const onSelectChallengeClick = (data) => {
      Router.Open(nav, 'ChallengerApp', {
        screen: 'Selection',
        multiple: true,
        onGoBack,
        data: data,
        table: props.table,
        tableId: props.tableId,
      });
    };

    //if (!data || !text) return <View></View>
    return (
      <Row
        icon="stairs-up"
        onPress={() => onSelectChallengeClick(data)}
        selected={data && true}
        showClose={data && true}
        text={!data ? text.chonthuthach || 'Liên kết thử thách' : data.name}
        rowHeight={props.rowHeight || 50}
      />
    );
  },
);

const Row = (props: {
  icon
  selected: boolean
  rowHeight: number
  text: ReactNode | string
  showClose
  onClose?: () => void
  onPress: () => void
}) => {
  const style = useCommonStyle();
  const colors = useTheme();
  return (
    <View style={[{ flexDirection: 'row', flex: 1, }]}>
      <View style={{ height: props.rowHeight, justifyContent: 'center' }}>
        <B.ICon
          size={FONTSIZE.NORMAL}
          name={props.icon}
          style={[
            style.icon_wrapper,
            { marginRight: 10 },
            props.selected && { color: colors.primary },
          ]}
        />
      </View>
      <TouchableOpacity
        style={[
          style.full,
          { height: props.rowHeight, justifyContent: 'center' },
        ]}
        onPress={props.onPress}
      >
        {typeof props.text === 'string' ? (
          <B.Text style={[props.selected && { color: colors.primary }]}>
            {props.text}
          </B.Text>
        ) : (
          props.text
        )}
      </TouchableOpacity>
      {props.showClose && (
        <TouchableOpacity
          style={[
            style.icon_wrapper,
            style.right,
            { height: props.rowHeight, width: 50, alignItems: 'flex-end' },
            debugStyle,
          ]}
          onPress={props.onClose}
        >
          <B.ICon
            style={[{ color: colors.primary }]}
            size={FONTSIZE.NORMAL}
            name="close"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

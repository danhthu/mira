import React, { Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { B } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
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

/**
 * Một dòng "gắn với một thử thách" để module khác nhúng vào biểu mẫu của nó.
 * `Work/Screens/Edit.tsx` đang dùng qua `ChallengerApp.Components.LinkTo`, nên
 * đây là API công khai của module — không xoá được như `Components/Card.tsx`.
 */
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
    const [data, setData] = useState<Challenge>();
    const dataRef = useRef({ tableId: '', table: '', challenge: data });
    useEffect(() => {
      dataRef.current = {
        tableId: props.tableId,
        table: props.table,
        challenge: data,
      };
    }, [data, props.table, props.tableId]);

    useImperativeHandle(
      ref,
      () => ({
        save: async () => {
          const current = dataRef.current;
          await challengeAssociateRepository.delete2(
            (a) => a.tableId === current.tableId && a.table === current.table,
          );
          if (!current.challenge) return;
          await challengeAssociateRepository.add({
            ...new ChallengeAssociate(),
            challengeId: current.challenge.id,
            table: current.table,
            tableId: current.tableId,
            option: { link: current.table === 'Work' ? 'Work' : 'Habit' },
          });
          await challengeAssociateRepository.save();
        },
      }),
      [],
    );

    const text = useText();
    const colors = useTheme();
    const style = useCommonStyle();
    const nav = useNavigation();
    const rowHeight = props.rowHeight || 50;

    useAsyncAction(async () => {
      const linked = (await challengeAssociateRepository.list())
        .filter((a) => a.table === props.table && a.tableId === props.tableId)
        .map((a) => a.challengeId);
      const challenges = await challengeRepository.list();
      setData(challenges.filter((c) => linked.indexOf(c.id) > -1)[0]);
    }, [
      props.table,
      props.tableId,
      useDectectDataChanged(challengeAssociateRepository),
      useDectectDataChanged(challengeRepository),
    ]);

    const onPress = () =>
      Router.Open(nav, 'ChallengerApp', {
        screen: 'Selection',
        multiple: true,
        onGoBack: setData,
        data,
        table: props.table,
        tableId: props.tableId,
      });

    return (
      <View style={[{ flexDirection: 'row', flex: 1 }, props.style]}>
        <View style={{ height: rowHeight, justifyContent: 'center' }}>
          <B.ICon
            size={FONTSIZE.NORMAL}
            name="stairs-up"
            style={[
              style.icon_wrapper,
              { marginRight: 10 },
              data && { color: colors.token.accent },
            ]}
          />
        </View>
        <TouchableOpacity
          style={[style.full, { height: rowHeight, justifyContent: 'center' }]}
          onPress={onPress}
        >
          <B.Text style={[data && { color: colors.token.accent }]}>
            {data ? data.name : text.link_challenge}
          </B.Text>
        </TouchableOpacity>
      </View>
    );
  },
);

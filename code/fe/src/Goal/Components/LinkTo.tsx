import {
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';



import { useNavigation } from '@react-navigation/native';
import React, {
  Ref,
  useImperativeHandle,
  useState
} from 'react';
import { B, BText } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import {
  Goal,
  GoalAssociate,
  goalAssociateRepository,
  goalRepository,
} from '../Entities';

import { FlatList, Text, } from 'react-native';

import Modal from 'react-native-modal';


import { useText } from '../Text';

export interface LinkToProp {
  table: string
  tableId: string
  rowHeight?: number
  onChanged?: (data: string) => void
  style?: StyleProp<ViewStyle>
}

export interface GoalLinkToAction {
  save: () => Promise<void>
}

export const LinkTo = React.forwardRef(
  (props: LinkToProp, ref: Ref<GoalLinkToAction>) => {
    const [selectedItem, setSelectedItem] = useState<Goal>();
    const t = useText().translate;
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState([] as Array<{ value, display }>);
    const colors = useTheme();
    useAsyncAction(async () => {
      setData((await goalRepository.list()).map((w) => ({ value: w.id, display: w.name })));
      const g = (await goalAssociateRepository.list())
        .filter((t) => t.table == props.table && t.tableId == props.tableId)
        .map((m) => m.goalId);
      const data = (await goalRepository.list()).filter(
        (h) => g.indexOf(h.id) > -1,
      )[0];
      setSelectedItem(data);
    }, [
      props.table,
      props.tableId,
      useDectectDataChanged(goalAssociateRepository),
      useDectectDataChanged(goalRepository),
    ]);
    useImperativeHandle(
      ref,
      () => {
        return {
          save: async () => {
            if (selectedItem) {
              await goalAssociateRepository.delete2(
                (h) =>
                  h.tableId == props.tableId &&
                  h.table == props.table,
              );
              await goalAssociateRepository.add({
                ...new GoalAssociate(),
                goalId: selectedItem.id,
                table: props.table,
                tableId: props.tableId,
              });
              await goalAssociateRepository.save();
            } else {
              await goalAssociateRepository.delete2(
                (h) =>
                  h.tableId == props.tableId &&
                  h.table == props.table,
              );
            }
          },
        };
      },
      [selectedItem, props],
    );

    const onGoBack = (data) => {
      setSelectedItem(data);
    };
    const nav = useNavigation();
    const onSelectGoalClick = (data) => {
      Router.Open(nav, 'GoalApp', {
        screen: 'Selection',
        multiple: true,
        onGoBack,
        data: data,
        table: props.table,
        tableId: props.tableId,
      });
    };

    //if (!data || !text) return <View></View>;
    return (
      <View style={[{ paddingTop: 8, paddingBottom: 8 }]}>
        <View style={{ flexDirection: 'row', }}>
          <View style={{ justifyContent: 'center' }}>
            <B.ICon
              size={FONTSIZE.NORMAL}
              name={'link'}
              style={[
                { marginRight: 10 },
                { color: colors.colorLink, fontSize: FONTSIZE.NORMAL },
              ]}
            />
          </View>
          <TouchableOpacity
            style={[
              { justifyContent: 'center', flex: 1 },
            ]}
            onPress={() => { }}
          >
            <BText style={{ fontWeight: '400', fontSize: FONTSIZE.NORMAL }}>{t('Link your goal')}</BText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              { width: 50, alignItems: 'flex-end', marginTop: -8, marginBottom: -8, justifyContent: 'center' }
            ]}
            onPress={() => setIsVisible(true)}
          >
            <B.ICon
              style={[{ color: colors.primary, fontSize: FONTSIZE.NORMAL }]}
              name="pluscircle"
            />
          </TouchableOpacity>
        </View>
        <Modal
          isVisible={isVisible}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationInTiming={300} // Thời gian vào
          animationOutTiming={300} // Thời gian ra
          onModalHide={() => setIsVisible(false)}
          onBackdropPress={() => setIsVisible(false)}
          style={{
            justifyContent: 'flex-end',
            flex: 1,
            marginLeft: -5,
            marginRight: -5,
            marginBottom: -20,
          }}
        >
          <View
            style={[
              {
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                paddingBottom: 40,
              },
            ]}
          >
            <View>
              <B.Text style={{ textAlign: 'center', marginBottom: 10 }}>
                {t('Chọn')}
              </B.Text>
              <FlatList
                data={data}
                style={{ minHeight: 100 }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={{ height: 40, justifyContent: 'center' }}
                    onPress={() => {
                      setIsVisible(false);
                      props.onChanged(item.value);
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ flex: 1 }}>{item.display}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View
                    style={{ height: 1, backgroundColor: colors.outline }}
                  ></View>
                )}
              ></FlatList>
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);



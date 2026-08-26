import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAsyncAction } from '../../Common/Hooks';

import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { getLogger } from '../../Common';
import { useCommonStyle } from '../../Common/Styles';
import { uuid } from '../../Common/Utils/common';
import { workRepository } from '../Entities';
import { useText } from '../Text';

const logger = getLogger('ChooseScreen');
function ChooseScreen() {
  const repo = workRepository;

  return ({ route, navigation }) => {
    logger.info('enter into [ChooseScreen]');
    route.params.date = new Date(route.params.date);
    const [selectedList, setSelectedList] = useState([]);
    const [mandatoryList, setMandatoryList] = useState([]);
    const [data, setData] = useState([]);

    const multiple = true;
    const style = useStyle();
    const text = useText();

    const colors = useTheme();
    //bind
    useEffect(() => {
      navigation.setOptions({
        title: route.params.title
      });
    }, [route.params]);

    const selectedListRef = useRef(selectedList);
    const mandatoryListRef = useRef(mandatoryList);

    useEffect(() => {
      selectedListRef.current = selectedList;
    }, [selectedList]);

    useEffect(() => {
      mandatoryListRef.current = mandatoryList;
    }, [mandatoryList]);
    //all data
    useAsyncAction(async () => {
      logger.info('load all works');
      const result = (await repo.getUnPlanned(route.params.date));
      setData(result);
    }, []);

    const handleSelection = (data, item, status) => {
      if (status) {
        const _old = data.filter((h) => h.id != item.id);
        if (multiple) {
          setSelectedList([..._old, item]);
        } else {
          setSelectedList([item]);
        }
      } else {
        setSelectedList([...data.filter((h) => h.id != item.id)]);
      }
    };

    const handleMandatory = (data, item, status) => {
      if (status) {
        const _old = data.filter((h) => h.id != item.id);
        setMandatoryList([..._old, item]);
      } else {
        setMandatoryList([...data.filter((h) => h.id != item.id)]);
      }
    };
    useEffect(() => {
      //back to callback
      return () => {
        (async () => {
          logger.info('save selection');
          if (selectedListRef.current) {
            const ids = selectedListRef.current.map(w => w.id);
            let id_man = [];
            if (mandatoryListRef.current) {
              id_man = mandatoryListRef.current.map(w => w.id);
            }
            await workRepository.updates(w => ids.indexOf(w.id) > -1, w => {
              w.startDate = route.params.date,
                w.mandatory = id_man.indexOf(w.id) > -1;
            });
          }
        })();
      };
    }, []);

    if (!data) return <View></View>;
    return (
      <View style={{ padding: 10 }}>
        {/**table header */}
        <View style={[style.row, { borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }]}>
          <View style={[style.col, { flex: 1 }]}>
            <Text style={[style.center, { fontWeight: '500' }]}>{text.congviec || 'Công việc'}
            </Text>
          </View>
          <View style={[style.col, style.rightContainer]}>
            <Text style={[style.center, { fontWeight: '500' }]}>{text.chon || 'Chọn'}
            </Text></View>
          <View style={[style.col, style.rightContainer]}>
            <Text style={[style.center, { fontWeight: '500' }]}>{text.batbuoc || 'Bắt buộc'}
            </Text>
          </View>
        </View>

        <FlatList
          keyExtractor={item => item.id + uuid()}
          data={data}
          renderItem={({ item, index }) => (
            <RowItem
              item={item}
              status={selectedList.map((h) => h.id).indexOf(item.id) > -1}
              handleSelection={(item2, status) =>
                handleSelection(selectedList, item2, status)
              }
              mandatory={item.mandatory}
              handleMandatory={(item2, status) =>
                handleMandatory(mandatoryList, item2, status)
              }
            />
          )}
        />
      </View>
    );
  };
}
const RowItem = (props: {
  item: { id?; icon?; name }
  status: boolean
  handleSelection
  mandatory: boolean
  handleMandatory
}) => {
  const style = useStyle();
  const colors = useTheme();
  if (props == undefined) return <View></View>;
  const { item, handleSelection, handleMandatory } = props;
  return (<View style={[style.row, { borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }]}>
    <View style={[style.col, { flex: 1 }]}>
      <Text style={[style.center]}>{item.name}
      </Text>
    </View>
    <View style={[style.col, style.rightContainer]}>
      <TouchableOpacity
        onPress={() => {
          handleSelection(item, !props.status);
        }}
      >
        <B.ICon
          style={props.status ? style.right_icon_selected : style.right_icon_unselected}
          name={props.status ? 'check-circle' : 'radio-button-off-outline'}
          size={24}
        />
      </TouchableOpacity>
    </View>
    <View style={[style.col, style.rightContainer]}>
      <TouchableOpacity
        onPress={() => {
          handleMandatory(item, !props.mandatory);
        }}
      >
        <B.ICon
          style={props.mandatory ? style.right_icon_selected : style.right_icon_unselected}
          name={props.mandatory ? 'check-circle' : 'radio-button-off-outline'}
          size={24}
        />
      </TouchableOpacity>
    </View>
  </View>
  );
};

const useStyle = () => {
  const colors = useTheme();
  return {
    ...useCommonStyle(), ...StyleSheet.create({
      right_icon_selected: {
        color: colors.primary,
      },
      right_icon_unselected: {},
      leftContainer: {
        flexDirection: 'row',
        flex: 1,
      },
      rightContainer: {
        width: 90,
        alignSelf: 'flex-end',
        alignItems: 'center'
      },
    })
  };
};

export const Choose = ChooseScreen();

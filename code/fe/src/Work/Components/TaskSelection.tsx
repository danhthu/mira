import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import Modal from 'react-native-modal';
import { B, BICon } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { useAsyncAction } from '../../Common/Hooks';
import { workRepository } from '../Entities';
import { useText } from '../Text';

export const TaskSelection = (props: {
  value
  onChanged: (value, item?) => void
}) => {
  const t = useText().translate;
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState([]);
  const colors = useTheme();
  useAsyncAction(async () => setData((await workRepository.filter(w => w.kind == 'group')).map((w) => ({ value: w.id, display: w.name }))), []);

  return (
    <View style={{ flexDirection: 'row', paddingTop: 8, paddingBottom: 8 }}>
      <BICon
        name={'link'}
        style={{
          fontSize: FONTSIZE.NORMAL,
          marginRight: 10,
          color: colors.colorLink,

        }}
      />
      <Text style={{ flex: 1, fontSize: FONTSIZE.NORMAL, }}>{t('Add to')}</Text>
      <TouchableOpacity
        onPress={() => {
          setIsVisible(true);
        }}
        style={{ flexDirection: 'row' }}
      >
        <Text style={{ color: colors.colorLink, fontSize: FONTSIZE.NORMAL, }}>
          {data?.findLast((d) => d.value == props.value)?.display || t('Chọn')}
        </Text>
        <BICon
          name="down"
          style={{
            fontSize: FONTSIZE.NORMAL,
            marginLeft: 5,
            color: colors.colorLink,
          }}
        />
      </TouchableOpacity>
      <Modal
        isVisible={isVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
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
              {t('Chọn task')}
            </B.Text>
            <FlatList
              data={data}
              style={{ height: 250 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={{ height: 40, justifyContent: 'center' }}
                  onPress={() => {
                    setIsVisible(false);
                    props.onChanged(item.value, item);
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ flex: 1 }}>{item.display}</Text>
                    {props.value == item.value && (
                      <BICon
                        name="checkcircle"
                        style={{
                          color: colors.primary,
                          width: 30,
                          fontSize: FONTSIZE.NORMAL,
                          textAlign: 'center',
                        }}
                      ></BICon>
                    )}
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
};

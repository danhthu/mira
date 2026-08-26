import { useState } from 'react';
import { FlatList, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { B, BICon } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { useText } from '../Text';
export const Priority: React.FunctionComponent<{
  value: string;
  style?: StyleProp<ViewStyle>
  onChanged?: (value: string) => void;
}> = ({ value = 0, onChanged = () => { } }) => {
  const t = useText().translate;
  const [data, setData] = useState(value);
  const [listPriorities, setListPriorities] = useState([{
    value: 'high',
    display: 'high'
  }, {
    value: 'medium',
    display: 'medium'
  }, {
    value: 'low',
    display: 'low'
  },]);
  const [showModal, setShowModal] = useState(false);
  const colors = useTheme();
  return <View>
    <View style={{ flexDirection: 'row' }}>
      <BICon name='sunny-outline' style={{
        fontSize: FONTSIZE.NORMAL,

        color: 'orange',
      }} />
      <Text style={{
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: FONTSIZE.NORMAL,
        fontWeight: '600'
      }}>{t('Priority')}</Text>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => {
        setShowModal(true);
      }}><Text style={{
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: FONTSIZE.NORMAL,
        fontWeight: '400'
      }}>{data || t('Empty')}</Text></TouchableOpacity>
    </View>
    <Modal
      isVisible={showModal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onModalHide={() => setShowModal(false)}
      onBackdropPress={() => setShowModal(false)}
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
            {t('Choose priority')}
          </B.Text>
          <FlatList
            data={listPriorities}
            style={{ height: 250 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{ height: 40, justifyContent: 'center' }}
                onPress={() => {
                  setShowModal(false);
                  setData(item.value);
                  onChanged(item.value);
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ flex: 1, fontSize: FONTSIZE.NORMAL, textAlign: 'center' }}>{item.display}</Text>
                  <View style={{ width: 30 }}>
                    {value == item.value && (
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
  </View>;
};

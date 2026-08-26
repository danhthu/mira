import { FlatList, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { useAsyncAction, useDectectDataChanged, useSettings } from '../../Common/Hooks';
import { wish, wishRepository } from '../Entities';
import { ScreenContainer } from '../../Common/Components/ScreenContainer';
import { Header } from '../../Common/Components/Header';
import { useText } from '../Text';
import { FONT_SIZE, FONTSIZE, ICON_TOUCH_WIDTH, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { B, BButton, BTextBox, ButtonActionSheet, BText as Text } from '../../../libs/components';
import { Divider } from '../../Common/Components/Divider';
import { useState } from 'react';
import { Link } from '../../../libs/components/Link';
import { useTheme } from '../../../theme';
import { debugStyle } from '../../../libs/components/debugStyle';
export const DailyMovitationString = ({ route, navigation }) => {
  const text = useText();
  return <ScreenContainer>
    <Header title={text.dailyMovitation || 'Câu nói hàng ngày'} />
    <Body />
  </ScreenContainer>;
};

const Body = () => {
  const [settings, updateSettings] = useSettings();
  const [addText, setAddText] = useState('');
  const text = useText();
  const colors = useTheme();
  const modes = [text.ngaunhien || 'Ngẫu nhiên', text.tuantu || 'Tuần tự'];
  const data = useAsyncAction(async () => {
    return (await wishRepository.list());
  }, [useDectectDataChanged(wishRepository)]);
  return <View>
    <View style={{ height: TBL_ROW_HEIGHT, flexDirection: 'row' }} >
      <Text style={{ flex: 1, fontSize: FONTSIZE.NORMAL, lineHeight: TBL_ROW_HEIGHT }}>{text.chedohienthi || 'Chọn chế độ hiện thị'}</Text>
      <ButtonActionSheet
        containerStyle={{ backgroundColor: null, borderWidth: 0 }}
        textStyle={{
          color: colors.primary,
          fontSize: FONTSIZE.NORMAL
        }}
        style={{ alignSelf: 'flex-end', height: TBL_ROW_HEIGHT, justifyContent: 'center' }} textList={modes} onPress={(selected) => {
          updateSettings({ movitaion_daily_display_method: selected });
        }} title={text.chonchedohienthi || 'Chọn chế độ hiện thị'}>
        {modes[settings.movitaion_daily_display_method || 0]}
      </ButtonActionSheet>
    </View>

    <FlatList data={data}
      style={[{ marginTop: 10 }, debugStyle]}
      renderItem={({ item, index }) => <View style={[{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 5, paddingTop: 5 }, debugStyle]} >
        <View style={[{ flex: 1 }]}><Text >{item.text}</Text></View>
        <View style={[{ width: ICON_TOUCH_WIDTH, alignSelf: 'flex-end', justifyContent: 'center', alignItems: 'center' }, debugStyle]}>
          <TouchableOpacity
            onPress={async () => await wishRepository.delete(item)}
          >
            <View style={{ backgroundColor: colors.error, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', }}>
              <B.ICon style={{ fontSize: FONTSIZE.SMALL, color: '#fff' }} name="close" />
            </View>
          </TouchableOpacity>
        </View>
      </View>}
      ItemSeparatorComponent={Divider}
    />
    <View style={{ marginTop: 20, height: 120, justifyContent: 'center' }}>
      <TextInput style={{ height: 100, borderRadius: 10, padding: 10, backgroundColor: '#fff', fontSize: FONTSIZE.NORMAL }}
        placeholder={text.nhapnoidung || 'Nhập nội dung'} multiline value={addText} onChangeText={val => { setAddText(val); }}

      />
      {addText && addText.length > 0 && <TouchableOpacity onPress={async () => { await wishRepository.addOrUpdate({ ...new wish, text: addText }); setAddText(null); }}
        style={{ position: 'absolute', bottom: 15, right: 5 }}
      >
        <View style={{ backgroundColor: colors.primary, width: 30, height: 30, borderRadius: 15, justifyContent: 'center' }}>
          <B.ICon name="save" style={{ color: '#fff' }} />
        </View>
      </TouchableOpacity>
      }
    </View>

  </View>;
};


import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  Platform,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  View,
  Dimensions,
  Button,
  Keyboard,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useCommonStyle } from '../Styles';
import { useText } from '../../Work/Text';
import { B } from '../../../libs/components';
import { Link } from '../../../libs/components/Link';
import { debugStyle } from '../../../libs/components/debugStyle';


export const RichEditorBottomModal = ({ route, navigation }) => {
  const richText = React.useRef<any>();
  const text = useText();
  const [value, setValue] = useState('');
  const [editorMode, setEditorMode] = useState(false);
  const commonStyle = useCommonStyle();
  useEffect(() => {
    setValue(route.params.data);
  }, [route.params]);
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ height: 50, justifyContent: 'center', padding: 10 }}>
        <View style={{ flexDirection: 'row', }}>
          <Link
            viewStyle={[commonStyle.left, { flex: 1 }]}
            onPress={() => {
              setEditorMode(!editorMode);
              richText.current.focusContentEditor();
            }}>{editorMode ? text.xemtruoc || 'Xem trước' : text.chinhsua || 'Chỉnh sửa'}</Link>
          <B.Text style={{ flex: 1, textAlign: 'center' }}>{text.ghichu || 'Ghi chú'}</B.Text>
          <Link
            viewStyle={[commonStyle.right, { flex: 1, alignItems: 'flex-end' }]}

            onPress={() => {
              route.params.onGoBack && route.params.onGoBack(value);
              navigation.goBack();
            }}>{text.xong || 'Xong'}</Link>
        </View>
      </View>
      {!editorMode && <B.Html viewStyle={{ padding: 10 }} >
        {value||''}
      </B.Html>}
      <KeyboardAvoidingView

        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { display: !editorMode ? 'none' : null, backgroundColor: 'white' }]}
      >

        <View style={styles.inner}>

          <ScrollView style={[{ flex: 1 }]}>
            <RichEditor
              style={{ flex: 1 }}
              ref={richText}
              initialContentHTML={route.params.data}
              onChange={(descriptionText) => {
                setValue(descriptionText);
              }}
            />
          </ScrollView>
          <View style={styles.btnContainer}>
            <RichToolbar

              getEditor={() => richText.current}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.insertBulletsList,
                actions.insertOrderedList,
              ]}
              iconTint={'red'}
              selectedIconTint={'orange'}
            />
          </View>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
};







const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100
  },
  inner: {

    paddingBottom: 60,
    flex: 1,

  },

  textInput: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
});


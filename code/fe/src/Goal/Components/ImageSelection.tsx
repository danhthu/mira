import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { ButtonActionSheet } from '../../../libs/components';
import { useText } from '../Text';
import { Router } from '../../../Router';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const ImageSelection = (props:{ style?:StyleProp<ViewStyle>, value:string, onChanged:(value:string)=>void})=>{
  const text = useText();
  const navigation = useNavigation();

  const pickImage = async () => {
    // Hỏi quyền truy cập
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });


    if (!result.canceled) {
      return await saveImage(result.assets[0]);
    }
    return null;
  };

  const saveImage = async (uri) => {
    const fileName = uri.split('/').pop();
    const newPath = `${FileSystem.documentDirectory}${fileName}`;
    try {
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      console.log('Image saved to', newPath);
      return newPath;
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  return <ButtonActionSheet style={props.style} text={text.sua || 'Sửa'}
    textList={[text.chonanhthuvien||'Chọn ảnh từ thư viện',text.chonanhtumay||'Chọn ảnh từ máy',text.cancel||'Hủy']}
    title={text.chonanh||'Chọn ảnh'}
    kind="primary"
    type="Link"
    onPress={selectedIndex=>{
      if(selectedIndex==0){
        Router.Open(navigation, 'ChallengerModal', { screen: 'IconSelection', src: props.value,onGoBack:val=>props.onChanged(val) });
      }
      if(selectedIndex==1)
      {
        pickImage()
          .then(res=>{
            res&&props.onChanged(res);
          });
      }
    }}
  ></ButtonActionSheet>;
};
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { Link } from '../../../libs/components/Link';
import { useText } from '../Text';

/**
 * Chọn ảnh cho thử thách — một chạm, mở thẳng thư viện ảnh.
 *
 * Bản cũ là một action sheet ba lựa chọn, trong đó nhánh "chọn ảnh từ thư viện"
 * mở route `ChallengerModal` không tồn tại trong navigator nào (chạm vào không
 * có gì xảy ra), và màn nó định mở là một lưới gồm đúng hai ảnh mặc định.
 */
export const ImageSelection = (props: {
  style?: StyleProp<ViewStyle>
  onChanged: (value: string) => void
}) => {
  const text = useText();

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled) return;

    // Ảnh do picker trả về nằm ở thư mục tạm; chép sang thư mục tài liệu thì
    // đường dẫn lưu trong kho mới còn dùng được ở lần mở app sau.
    const uri = result.assets[0].uri;
    const target = `${FileSystem.documentDirectory}${uri.split('/').pop()}`;
    await FileSystem.copyAsync({ from: uri, to: target });
    props.onChanged(target);
  };

  return (
    <Link viewStyle={props.style as ViewStyle} onPress={pickImage}>
      {text.pick_image}
    </Link>
  );
};

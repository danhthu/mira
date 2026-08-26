import { View, Text, TouchableOpacity } from 'react-native';
import { B, ImageIconSets } from '../../../libs/components';
import { useText } from '../../../lang';

export const IconSelectionModal = ({ route, navigation }) => {
  const catagories = Array.from(
    new Set(ImageIconSets.map((item) => item.catagory)),
  );

  const text = useText();
  const numOfIconOnRow = 6;
  const iconSelected = (cat, name: string) => () => {    
    route.params.onGoBack && route.params.onGoBack(name,cat,'assets');
    navigation.pop();
  };

  return (
    <View>
      {catagories.map((cat, index) => (
        <View key={index}>
          <Text>{text.for(cat)}</Text>
          <View>
            {[
              ...Array(
                Math.floor(
                  ImageIconSets.filter((s) => s.catagory == cat).length /
                  numOfIconOnRow,
                ) + 1,
              ),
            ].map((val, stt) => (
              <View key={index + '$' + stt} style={{ flexDirection: 'row' }}>
                {[...Array(numOfIconOnRow)].map((item, itemIndex) => (
                  <View key={index + '$' + stt + '$' + itemIndex}>
                    {ImageIconSets.filter((s) => s.catagory == cat).length >
                      stt * numOfIconOnRow + itemIndex ? (
                        <TouchableOpacity
                          onPress={

                            iconSelected(cat,
                              ImageIconSets.filter((s) => s.catagory == cat)[
                                stt * numOfIconOnRow + itemIndex
                              ].name,
                            )
                          }
                        >
                          <B.ImageFor
                            name={
                              ImageIconSets.filter((s) => s.catagory == cat)[
                                stt * numOfIconOnRow + itemIndex
                              ].name
                            }
                          ></B.ImageFor>
                        </TouchableOpacity>
                      ) : null}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

import { StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { uuid } from '../../src/Common/Utils/common';

export const TextBold = (props: { style?: TextStyle, children?: string, viewStyle?: ViewStyle }) => {
  const style = useStyle()
  function getSmartBold() {
    // Split the text around **
    const arr = props.children.split("**");

    // Here we will store an array of Text components
    const newTextArr = [];

    // Loop over split text
    arr.forEach((element, index) => {
      // If its an odd element then it is inside **...** block
      if (index % 2 !== 0) {
        // Wrap with bold text style
        const newElement = <Text key={uuid()} style={[props.style, style.bold]}>{element}</Text>;
        newTextArr.push(newElement);
      } else {
        // Simple Text
        const newElement = <Text key={uuid()} style={props.style}>{element}</Text>;
        newTextArr.push(newElement);
      }
    });

    return newTextArr;
  }
  return <Text style={props.style} >
    {getSmartBold()}
  </Text>
}

const useStyle = () => {
  return StyleSheet.create({
    bold: {
      fontWeight: 'bold'
    }

  })
}
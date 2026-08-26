import {
  View,
  Text,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useCommonStyle } from '../Styles';

export interface hashTagProp {
  data: Array<string>
  onSelected?: (item: string, index: number) => void
  activeIndex?: number
}

export const HashTag = (props: hashTagProp) => {
  const styles = useCommonStyle().hashtag;
  if (!props || props.data.length == 0) return <View></View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.wrapper]}>
        {props.data.map((tag, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => props.onSelected && props.onSelected(tag, index)}
            style={[
              styles.container,
              index === props.activeIndex && styles.container_actived,
            ]}
          >
            <Text
              style={[
                styles.text,
                index === props.activeIndex && styles.text_actived,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};


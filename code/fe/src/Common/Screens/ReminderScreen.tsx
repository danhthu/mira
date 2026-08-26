import { View, Text, FlatList } from 'react-native';
import * as model from  '../Models';
import { reminderService } from '../../../libs/reminderService';
import { Reminder } from '../Entities';
export const ReminderScreen = () => {
  const reminderModel = model.reminderModel;
  const data = reminderModel.useList();
  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={r => r.id}
        renderItem={({ item }) => <RenderItem {...item}></RenderItem>}
      ></FlatList>
    </View>
  );
};

const RenderItem = (props: Reminder) => {
  const onOff = async () => {
    reminderService.off(props.option);
  };
  return (<View>
    <Text>{props.option.title}</Text>
  </View>);
};
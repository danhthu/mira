import { View } from 'react-native';

export const ETA: React.FunctionComponent<{
  value: number;
  onChanged: (value: number, item?: any) => void;
}> = ({ value = 0, onChanged = () => { } }) => {
  return <View></View>;
};

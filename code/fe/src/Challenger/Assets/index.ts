import { ImageURISource } from 'react-native';

export default {
  'item-icon-default': {
    uri: require('./item-icon-default.png') as ImageURISource,
    cat: 'default',
  },
} as { [Key: string]: { uri: ImageURISource; cat: string } };

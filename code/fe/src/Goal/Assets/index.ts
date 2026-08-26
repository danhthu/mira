import { ImageURISource } from 'react-native';

export default {
  'item-icon-default': { uri: require('./goal.jpg'), cat: 'default' },
  'gif-icon-default': { uri: require('./gif-icon-default.png'), cat: 'default' },
} as { [Key: string]: {uri:ImageURISource,cat:string};};
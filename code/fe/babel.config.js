module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo',
      //'babel-preset-expo', // If you’re using Expo
    ],
    plugins: [
      'react-native-reanimated/plugin',
      //  'react-native-iconify/babel',
    ],
  }
}

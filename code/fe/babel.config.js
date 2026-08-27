module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo',
      //'babel-preset-expo', // If you’re using Expo
    ],
    plugins: [
      // tsconfig bật experimentalDecorators và src/HabitTracker/Entities/Habit.ts
      // dùng @IsDefined/@IsString của class-validator, nhưng babel lại không có
      // plugin nào xử lý decorator. Thiếu hai dòng này thì bundle vẫn dựng xong
      // rồi chết lúc chạy: "Decorating class property failed".
      // Thứ tự bắt buộc: decorator trước, class-properties sau.
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      // reanimated phải nằm cuối cùng.
      'react-native-reanimated/plugin',
      //  'react-native-iconify/babel',
    ],
  }
}

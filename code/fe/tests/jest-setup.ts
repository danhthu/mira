jest.mock('react-native-get-random-values', () => ({
    getRandomValues: (arr) => arr.map(() => Math.floor(Math.random() * 256))
}));

import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
async function onFetchUpdateAsync() {
  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    // You can also add an alert() to see the error message in case of an error when fetching updates.
    Alert.alert('ERROR!!', `Error fetching latest Expo update: ${error}`);
  }
}
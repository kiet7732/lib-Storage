import * as Haptics from 'expo-haptics';

export async function selectionHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    await Haptics.selectionAsync();
  }
}

export async function successHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

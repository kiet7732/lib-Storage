import { BooksApiTestScreen } from '@/features/dev-tools/screens/books-api-test-screen';
import { Stack } from 'expo-router';

export default function BooksApiTestRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Books API Test', headerShown: false }} />
      <BooksApiTestScreen />
    </>
  );
}

// App.tsx
import React from 'react';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigator/StackNavigator';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default App;

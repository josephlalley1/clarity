import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './App/CameraScreen';
import VideoLibraryScreen from './App/VideoLibraryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Library" component={VideoLibraryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

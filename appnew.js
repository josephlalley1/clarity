import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App'; // Your main camera component
import VideoGallery from './VideoGallery'; // The new video gallery component

const Stack = createStackNavigator();

export default function Main() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen name="Camera" component={App} />
        <Stack.Screen name="VideoGallery" component={VideoGallery} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

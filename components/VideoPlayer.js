import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

export default function VideoPlayer({ videoUri }) {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUri }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  video: { width: '100%', height: 200 },
});

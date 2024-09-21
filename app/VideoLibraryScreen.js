import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import VideoPlayer from '../components/VideoPlayer';

export default function VideoLibraryScreen() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const videoDir = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    const videoFiles = videoDir.filter(file => file.endsWith('.mp4'));
    setVideos(videoFiles);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {videos.length > 0 ? (
        videos.map((video, index) => (
          <VideoPlayer key={index} videoUri={`${FileSystem.documentDirectory}${video}`} />
        ))
      ) : (
        <Text>No videos recorded yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';

export default function ListerPage() {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]); // Holds the list of video URIs
  const [thumbnails, setThumbnails] = useState({}); // Stores thumbnails for each video
  const [playingVideoUri, setPlayingVideoUri] = useState(null); // For the currently playing video

  useEffect(() => {
    const getSavedVideos = async () => {
      try {
        const videoDir = `${FileSystem.documentDirectory}videos/`;

        // Check if the 'videos' directory exists
        const dirInfo = await FileSystem.getInfoAsync(videoDir);
        if (dirInfo.exists) {
          const videoFiles = await FileSystem.readDirectoryAsync(videoDir);

          // Construct full paths for the video files
          const videoList = videoFiles.map((filename) => ({
            id: filename,
            uri: `${videoDir}${filename}`,
          }));

          setVideos(videoList);
        }
      } catch (error) {
        console.error('Error reading video files:', error);
      }
    };

    getSavedVideos();
  }, []);

  useEffect(() => {
    // Generate thumbnails for each video
    videos.forEach(async (video) => {
      if (!thumbnails[video.uri]) {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, {
            time: 1000, // Capture thumbnail at 1 second into the video
          });
          setThumbnails((prevThumbnails) => ({
            ...prevThumbnails,
            [video.uri]: uri,
          }));
        } catch (error) {
          console.error('Error generating thumbnail:', error);
        }
      }
    });
  }, [videos]);

  const handleVideoPress = (videoUri) => {
    setPlayingVideoUri(videoUri); // Set the clicked video URI as the playing one
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity style={styles.videoItem} onPress={() => handleVideoPress(item.uri)}>
      {thumbnails[item.uri] ? (
        <Image source={{ uri: thumbnails[item.uri] }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text>Loading thumbnail...</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Updated navigation back to start function
  const navigateToStart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Camera' }], // Replace 'CameraScreen' with the name of your actual start screen
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToStart}>
          <Image source={require('./assets/left-arrow.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Videos</Text>
        <View style={styles.emptySpace} />
      </View>

      {playingVideoUri ? (
        <Video
          source={{ uri: playingVideoUri }}
          style={styles.videoPlayer}
          useNativeControls
          resizeMode="contain"
          isLooping
          shouldPlay
        />
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          style={styles.videoList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50, // Move the header down by 30 pixels
  },
  backButton: {
    width: 20,
    height: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  emptySpace: {
    width: 20,
  },
  videoList: {
    width: '100%',
  },
  videoItem: {
    margin: 10,
    alignItems: 'center',
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  thumbnailPlaceholder: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 10,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
});

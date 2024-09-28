import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

// Helper function to format date with suffix and time
const formatDateWithSuffix = (date) => {
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
      ? 'nd'
      : day === 3 || day === 23
      ? 'rd'
      : 'th';

  const month = date.toLocaleString('default', { month: 'long' });
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${day}${suffix} ${month} ${formattedHour}:${minutes}${ampm}`;
};

export default function ListerPage() {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [playingVideoUri, setPlayingVideoUri] = useState(null);
  const [videoDateTime, setVideoDateTime] = useState('');

  useEffect(() => {
    const getSavedVideos = async () => {
      try {
        const videoDir = `${FileSystem.documentDirectory}videos/`;
        const dirInfo = await FileSystem.getInfoAsync(videoDir);
  
        if (dirInfo.exists) {
          const videoFiles = await FileSystem.readDirectoryAsync(videoDir);
          const videoList = await Promise.all(
            videoFiles.map(async (filename) => {
              const fileInfo = await FileSystem.getInfoAsync(`${videoDir}${filename}`);
              
              // Ensure the creation time is retrieved correctly
              const creationTime = fileInfo.creationTime || fileInfo.modificationTime; // Use creationTime if available, otherwise modificationTime
              const date = new Date(creationTime * 1000); // Convert to milliseconds
              
              if (isNaN(date.getTime())) {
                console.error(`Invalid date for file: ${filename}`);
                return null; // Skip invalid dates
              }
              
              const formattedDateTime = formatDateWithSuffix(date);
              return {
                id: filename,
                uri: `${videoDir}${filename}`,
                dateTime: formattedDateTime,
              };
            })
          );
  
          // Filter out any null values (invalid dates)
          setVideos(videoList.filter(video => video !== null));
        }
      } catch (error) {
        console.error('Error reading video files:', error);
      }
    };
  
    getSavedVideos();
  }, []);
  

  useEffect(() => {
    videos.forEach(async (video) => {
      if (!thumbnails[video.uri]) {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, { time: 1000 });
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

  const handleVideoPress = (videoUri, dateTime) => {
    setPlayingVideoUri(videoUri);
    setVideoDateTime(dateTime);
  };

  const handleBackToGallery = () => {
    setPlayingVideoUri(null);
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity style={styles.videoItem} onPress={() => handleVideoPress(item.uri, item.dateTime)}>
      {thumbnails[item.uri] ? (
        <Image source={{ uri: thumbnails[item.uri] }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text>Loading thumbnail...</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const navigateToStart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Camera' }],
    });
  };

  return (
    <View style={styles.container}>
      {!playingVideoUri && (
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateToStart}>
            <Image source={require('./assets/left-arrow.png')} style={styles.backButton} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Videos</Text>
          <View style={styles.emptySpace} />
        </View>
      )}

      {playingVideoUri ? (
        <>
          <View style={styles.videoHeader}>
            <TouchableOpacity onPress={handleBackToGallery} style={styles.backButtonContainer}>
              <Image source={require('./assets/left-arrow.png')} style={styles.backButtonWhite} />
            </TouchableOpacity>
            <Text style={styles.videoDateTime}>{videoDateTime}</Text>
          </View>

          <Video
            source={{ uri: playingVideoUri }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode="cover"
            isLooping
            shouldPlay
          />
        </>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          style={styles.videoList}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
    paddingTop: 50,
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
    margin: 0,
    alignItems: 'center',
  },
  thumbnail: {
    width: 195,
    height: 195,
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
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  videoHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: '100%',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
  },
  backButtonWhite: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  videoDateTime: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

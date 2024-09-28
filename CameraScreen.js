import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import firebase from './firebase'; // Assuming you have initialized Firebase in firebase.js

export default function App() {
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const video = React.useRef(null);

  const [type] = useState(CameraType.front);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');
    })();
  }, []);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleRecordToggle = async () => {
    if (isRecording) {
      camera.stopRecording();
      setIsRecording(false);
      setRecordTime(0);
    } else {
      setIsRecording(true);
      setRecordTime(0);
      const data = await camera.recordAsync({
        maxDuration: 10,
      });
      setRecord(data.uri);
      setIsRecording(false);
    }
  };

  const saveVideo = async () => {
    if (record) {
      setIsSaving(true);
  
      try {
        // Retrieve UID from AsyncStorage
        const userUID = await AsyncStorage.getItem('userUID');
        if (!userUID) {
          Alert.alert('Error', 'User UID not found. Please sign in again.');
          setIsSaving(false);
          return;
        }

        const timestamp = new Date().getTime();
        const videoUri = record;
        const response = await fetch(videoUri);
        const blob = await response.blob();
  
        const storage = getStorage();
        const storageRef = ref(storage, `videos/${userUID}/video_${timestamp}.mp4`); // Use UID in the path
  
        const uploadTask = uploadBytesResumable(storageRef, blob);
  
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // You can monitor upload progress here, e.g., show a progress bar
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Upload error:', error);
            Alert.alert('Upload Error', 'There was an error uploading the video.');
            setIsSaving(false);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('File available at', downloadURL);
              Alert.alert('Video uploaded!', 'The video has been successfully uploaded.');
              setIsSaving(false);
              navigation.navigate('ListerPage');
            });
          }
        );
      } catch (error) {
        console.error('Error saving video:', error);
        Alert.alert('Save Error', 'There was an error saving the video.');
        setIsSaving(false);
      }
    } else {
      Alert.alert('No video to save', 'Please record a video first.');
    }
  };

  const deleteVideo = async () => {
    if (record) {
      await FileSystem.deleteAsync(record);
      setRecord(null);
      Alert.alert('Video deleted', 'The recorded video has been deleted.');
    } else {
      Alert.alert('No video to delete', 'There is no video to delete.');
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      video.current.replayAsync();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (video.current) {
          video.current.stopAsync();
        }
      };
    }, [])
  );

  if (hasCameraPermission === null || hasAudioPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false || hasAudioPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {record ? (
        <>
          <Video
            ref={video}
            style={styles.fullScreenVideo}
            source={{ uri: record }}
            resizeMode="cover"
            isLooping={true}
            shouldPlay={true}
            isMuted={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            useNativeControls={false}
          />
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.savingButton]}
            onPress={saveVideo}
            disabled={isSaving}
          >
            <Text 
              style={[styles.saveButtonText, isSaving && styles.saveButtonTextSaving]}
            >
              {isSaving ? 'Saving Video...' : 'Save Video'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.binButton}
            onPress={deleteVideo}
          >
            <Image source={require('./assets/close.png')} style={styles.binIcon} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.cameraContainer}>
            <Camera
              ref={ref => setCamera(ref)}
              style={styles.camera}
              type={type}
              ratio={'16:9'}
            />
          </View>

          <View style={styles.controls}>
            <View style={styles.recordContainer}>
              <TouchableOpacity
                onPress={handleRecordToggle}
              >
                <Image 
                  source={isRecording ? require('./assets/red-rec.png') : require('./assets/white-rec.png')} 
                  style={styles.recordButton} 
                />
              </TouchableOpacity>
              {isRecording && (
                <Text style={styles.timer}>
                  {formatTime(recordTime)}
                </Text>
              )}
            </View>
          </View>
        </>
      )}

      {!isRecording && !record && (
        <TouchableOpacity 
          style={styles.galleryButton}
          onPress={() => navigation.navigate('ListerPage')}
        >
          <Image source={require('./assets/grid.png')} style={styles.galleryIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  fullScreenVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  recordContainer: {
    alignItems: 'center',
    marginBottom: 50,
    height: 100,
  },
  recordButton: {
    width: 115,
    height: 115,
  },
  timer: {
    marginTop: 10,
    fontSize: 18,
    color: 'white',
  },
  saveButton: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    transform: [{ translateX: -135 }],
    width: 270,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background
  },
  saveButtonText: {
    fontSize: 18,
    color: 'black',
  },
  saveButtonTextSaving: {
    color: 'white',
    zIndex: 10,
  },
  binButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  binIcon: {
    width: 35,
    height: 35,
  },
  galleryButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  galleryIcon: {
    width: 35,
    height: 35,
  },
});

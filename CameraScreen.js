import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function App() {
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [borderRadius, setBorderRadius] = useState(35);
  const [buttonColor, setButtonColor] = useState('white');
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
      setBorderRadius(35);
      setButtonColor('grey');
      setRecordTime(0);
    } else {
      setIsRecording(true);
      setBorderRadius(20);
      setButtonColor('red');
      setRecordTime(0);
      const data = await camera.recordAsync({
        maxDuration: 10,
      });
      setRecord(data.uri);
      setIsRecording(false);
      setBorderRadius(35);
      setButtonColor('grey');
    }
  };

  const saveVideo = async () => {
    if (record) {
      setIsSaving(true);
      setTimeout(async () => {
        const fileUri = FileSystem.documentDirectory + 'my_video.mp4';
        await FileSystem.moveAsync({
          from: record,
          to: fileUri,
        });
        setIsSaving(false);
        navigation.navigate('ListerPage');
      }, 3000); // 3-second delay
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
      // Cleanup function to stop playback when navigating away
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
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving Video ...' : 'Save Video'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.binButton}
            onPress={deleteVideo}
          >
            <Image source={require('./assets/bin.png')} style={styles.binIcon} />
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
                style={[styles.recordButton, { borderRadius, backgroundColor: buttonColor }]}
                onPress={handleRecordToggle}
              />
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
          <Image source={require('./assets/gallery.png')} style={styles.galleryIcon} />
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
    marginBottom: 10,
    height: 100,
  },
  recordButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  timer: {
    marginTop: 5,
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
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'black',
    fontSize: 18,
  },
  binButton: {
    position: 'absolute',
    top: 70,
    right: 20,
  },
  binIcon: {
    width: 30,
    height: 30,
  },
  galleryButton: {
    position: 'absolute',
    top: 70,
    right: 20,
  },
  galleryIcon: {
    width: 30,
    height: 30,
  },
});

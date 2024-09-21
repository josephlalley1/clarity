import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      let video = await cameraRef.current.recordAsync({
        maxDuration: 60, // Limit to 60 seconds
      });
      saveVideo(video.uri);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
    }
  };

  const saveVideo = async (uri) => {
    const newVideoPath = `${FileSystem.documentDirectory}video_${Date.now()}.mp4`;
    await FileSystem.moveAsync({
      from: uri,
      to: newVideoPath,
    });
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} />
      <View style={styles.controlBar}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.button}>
          <Text style={styles.buttonText}>{recording ? 'Stop' : 'Record'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Library')}
          style={styles.button}>
          <Text style={styles.buttonText}>Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controlBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  button: { padding: 10, backgroundColor: 'blue', borderRadius: 5 },
  buttonText: { color: 'white', fontSize: 16 },
});

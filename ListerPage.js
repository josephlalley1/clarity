import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ListerPage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('./assets/left-arrow.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Videos</Text>
        <View style={styles.emptySpace} />
      </View>
      <Text style={styles.text}>This is the Lister Page. Here you can list saved videos!</Text>
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
    width: 20, // Adjust width as needed
    height: 20, // Adjust height as needed
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // Allow the text to take available space
  },
  emptySpace: {
    width: 20, // Space for alignment
  },
  text: {
    fontSize: 18,
    marginTop: 20,
  },
});

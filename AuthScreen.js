import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(true); // State to toggle between signup and signin

  const auth = getAuth();

  const handleAuth = async () => {
    try {
      if (isSignup) {
        // Signup logic
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up:', email);
      } else {
        // Sign-in logic
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', email);
      }
      // Navigate to Camera screen after successful signup/sign-in
      navigation.navigate('Camera');
    } catch (error) {
      console.error('Authentication error:', error);
      // You might want to show an alert to the user here
    }
  };

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? 'Sign Up' : 'Sign In'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isSignup ? 'Sign Up' : 'Sign In'} onPress={handleAuth} />
      <Button title={`Switch to ${isSignup ? 'Sign In' : 'Sign Up'}`} onPress={() => setIsSignup(!isSignup)} />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default AuthPage;

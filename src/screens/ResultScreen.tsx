import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Clipboard from '@react-native-clipboard/clipboard';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUri, detectedText } = route.params;

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const copyToClipboard = () => {
    Clipboard.setString(detectedText);
    Alert.alert('Copied to Clipboard', 'The detected text has been copied!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detected Text:</Text>
      <Text style={styles.text}>{detectedText}</Text>

      {imageUri && (
        <>
          <Text style={styles.title}>Captured Image:</Text>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addToNotesButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.addToNotesButtonText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.copyButton}
          onPress={copyToClipboard}
        >
          <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 20 },
  image: { width: '100%', height: 300, borderRadius: 10 },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  addToNotesButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    marginBottom: 10,
  },
  addToNotesButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  copyButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
  },
  copyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ResultScreen;

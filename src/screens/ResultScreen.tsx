// src/screens/ResultScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // Adjust the import path if needed

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUri, detectedText } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detected Text:</Text>
      <Text style={styles.text}>{detectedText}</Text>
      {imageUri && (
        <>
          <Text style={styles.title}>Captured Image:</Text>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 20 },
  image: { width: 200, height: 200, marginBottom: 20 },
});

export default ResultScreen;
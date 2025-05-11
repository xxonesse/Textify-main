// src/screens/ResultScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // Adjust the path as needed

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUri, detectedText } = route.params;

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 20 },
  image: { width: '100%', height: 300, borderRadius: 10 },
});

export default ResultScreen;

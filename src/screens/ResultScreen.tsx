import React from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp } from "@react-navigation/native";

type RootStackParamList = {
  ResultScreen: { text: string };
};

type ResultScreenRouteProp = RouteProp<RootStackParamList, "ResultScreen">;

type Props = {
  route: ResultScreenRouteProp;
};

export default function ResultScreen({ route }: Props) {
  const { text } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Recognized Text</Text>
      <Text selectable style={styles.result}>{text}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#fff"
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },
  result: {
    fontSize: 16,
    lineHeight: 22
  }
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Note = {
  title: string;
  content: string;
  createdAt: string;
  index: number;
};

type RootStackParamList = {
  Home: { userName: string } | undefined;
  AddNote: {
    addNote?: (title: string, content: string, index?: number) => void;
    noteToEdit?: Note;
    noteIndex?: number;
    deleteNote?: (index: number) => void;
  };
  Scanner: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "AddNote">;

const AddNoteScreen: React.FC<Props> = ({ navigation, route }) => {
  const note = route.params?.noteToEdit;
  const noteIndex = route.params?.noteIndex;

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Both fields are required!");
      return;
    }

    if (route.params?.addNote) {
      route.params.addNote(title, content, noteIndex);
    } else {
      Alert.alert("Note saving function is missing.");
    }

    navigation.goBack();
  };

  const confirmDelete = () => {
    if (route.params?.deleteNote && typeof noteIndex === "number") {
      route.params.deleteNote(noteIndex);
    }
    navigation.goBack();
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.contentInput}
        placeholder="Write your note here..."
        placeholderTextColor="#888"
        multiline
        value={content}
        onChangeText={setContent}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        {note && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal transparent visible={isModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Delete this note?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    color: "#000",
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top",
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#080808",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#d11a2a",
    padding: 15,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 280,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#080808",
    minWidth: 100,
  },
});

export default AddNoteScreen;

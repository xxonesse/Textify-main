import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEditorBridge, RichText, Toolbar } from "@10play/tentap-editor";

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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const editor = useEditorBridge({
    initialContent: note?.content || "<p></p>",
    autofocus: true,
    avoidIosKeyboard: true,
  });

  const handleSave = async () => {
    // Get the plain text content instead of HTML
    const content = await editor.getText();

    if (!title.trim() || !content?.trim()) {
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#080808"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.editorContainer}>
          <RichText editor={editor} style={{ flex: 1, backgroundColor: "#F1E9B2" }} />
        </View>

        <Toolbar editor={editor} />

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F1E9B2" },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#080808",
    color: "#000",
  },
  editorContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#F1E9B2",
    backgroundColor: "#F1E9B2",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
    padding: 10
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
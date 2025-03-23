import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Note = {
  title: string;
  content: string;
};

type RootStackParamList = {
  AddNote: {
    addNote: (title: string, content: string, index?: number) => void;
    noteToEdit?: Note;
    noteIndex?: number;
    deleteNote: (index: number) => void;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, "AddNote">;

const AddNoteScreen: React.FC<Props> = ({ navigation, route }) => {
  const { addNote, noteToEdit, noteIndex, deleteNote } = route.params;

  const [title, setTitle] = useState(noteToEdit?.title || "");
  const [content, setContent] = useState(noteToEdit?.content || "");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDelete = () => {
    setIsModalVisible(true); 
  };

  const confirmDelete = () => {
    deleteNote(noteIndex!);
    navigation.goBack();
    setIsModalVisible(false); 
  };

  const cancelDelete = () => {
    setIsModalVisible(false); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
      </View>
      <TextInput
        style={styles.contentInput}
        placeholder="Write your note here..."
        placeholderTextColor="#aaa"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          addNote(title, content, noteIndex);
          navigation.goBack();
        }}
      >
        <Text style={styles.buttonText}>{noteToEdit ? "Update" : "Save"}</Text>
      </TouchableOpacity>
      {noteToEdit && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      )}

      {/* Custom Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to delete this note?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={cancelDelete}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 5,
    flex: 1,
    color: "#fff",
  },
  contentInput: {
    fontSize: 20,
    flex: 1,
    textAlignVertical: "top",
    padding: 10,
    backgroundColor: "#fff2",
    borderRadius: 10,
    marginBottom: 50,
    color: "#fff"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    position: "absolute",
    top: 15,
    right: 20,
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddNoteScreen;

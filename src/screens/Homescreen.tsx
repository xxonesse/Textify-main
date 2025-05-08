import React, { useState } from "react";
import { Text, View, Image, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ProfilePicture from "../components/profilepicture";
import NotesList from "../components/NotesList";

// Define the Note type
type Note = {
  title: string;
  content: string;
  createdAt: string;
  index: number;
};

// Define navigation props
type RootStackParamList = {
  Home: { userName: string } | undefined;
  AddNote: {
    addNote: (title: string, content: string, index?: number) => void;
    noteToEdit?: Note;
    noteIndex?: number;
    deleteNote: (index: number) => void;
  };
  Scanner: undefined;
};

// Define props type
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const Homescreen: React.FC<Props> = ({ navigation, route }) => {
  const { userName = "User" } = route.params || {};
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for modal visibility and selected note for deletion
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(null);

  // Function to format date
  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  // Function to add or edit a note
  const addNote = (title: string, content: string, index?: number) => {
    if (!title.trim() || !content.trim()) return;

    setNotes((prevNotes) => {
      if (index !== undefined) {
        const updatedNotes = [...prevNotes];
        updatedNotes[index] = { ...updatedNotes[index], title, content };
        return updatedNotes;
      } else {
        return [...prevNotes, { title, content, createdAt: getFormattedDate(), index: prevNotes.length }];
      }
    });
  };

  // Function to delete a note
  const deleteNote = (index: number) => {
    setNotes((prevNotes) => prevNotes.filter((_, i) => i !== index).map((note, i) => ({ ...note, index: i })));
  };

  // Function to open the delete confirmation modal
  const confirmDelete = (index: number) => {
    setSelectedNoteIndex(index);
    setIsModalVisible(true); // Show the modal
  };

  // Function to handle confirming the delete action
  const handleDeleteConfirmation = () => {
    if (selectedNoteIndex !== null) {
      // Call delete function with the note index
      deleteNote(selectedNoteIndex);
      setIsModalVisible(false); // Close the modal after deleting
    }
  };

  // Function to cancel the delete action
  const handleCancelDelete = () => {
    setIsModalVisible(false); // Close the modal without doing anything
  };

  // Filtered notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.home}>
      <View style={styles.section1}>
        <View style={styles.logo}>
          <Image source={require("../assets/textify_logo.png")} style={styles.textifylogo} />
          <Text style={styles.textifyname}>textify</Text>
        </View>
        <View style={styles.profile}>
          <Text style={styles.greet}>morning, {userName}!</Text>
          <ProfilePicture imageSource={require("../assets/profilepicture.png")} />
        </View>
      </View>

      <Text style={styles.myNotes}>My Notes <Text style={styles.notesCount}>/{String(notes.length).padStart(2, "0")}</Text></Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Image source={require("../assets/settingBtn.png")} style={styles.settings} />
        <Image source={require("../assets/lightmode.png")} style={styles.themeMode} />
      </View>

      <ScrollView>
        {filteredNotes.length > 0 ? (
          <NotesList 
            notes={filteredNotes} 
            onNoteClick={(index) => navigation.navigate("AddNote", { 
              addNote, 
              noteToEdit: filteredNotes[index], 
              noteIndex: filteredNotes[index].index, 
              deleteNote 
            })} 
            onDelete={confirmDelete} // Pass the index for deletion
          />
        ) : (
          <Text style={styles.noNotes}>No notes found.</Text>
        )}
      </ScrollView>
 
      <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate("Scanner")}>
        <Image source={require("../assets/scanner.png")} style={styles.scanner} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate("AddNote", { addNote, deleteNote })}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>


      {/* Confirmation Delete Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to delete this note?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCancelDelete}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleDeleteConfirmation}>
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
  home: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  section1: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  logo: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  textifylogo: { 
    height: 26, 
    width: 41, 
    resizeMode: "contain" 
  },
  textifyname: { 
    fontSize: 20, 
    fontWeight: "700",
    color: "#000" 
  },
  profile: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  greet: { 
    fontSize: 15 
  },
  myNotes: { 
    fontSize: 50, 
    fontWeight: "bold", 
    marginVertical: 15 
  },
  notesCount: { 
    fontSize: 20 
  },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#000", 
    padding: 10, borderRadius: 20, 
    marginBottom: 10 
  },
  searchBar: { 
    flex: 1, 
    height: 40, 
    color: "#000", 
    paddingHorizontal: 10, 
    backgroundColor: "white", 
    borderRadius: 10 
  },
  settings: { 
    width: 22, 
    height: 22, 
    resizeMode: "contain", 
    marginLeft: 10 
  },
  themeMode: { 
    width: 15, 
    height: 15, 
    resizeMode: "contain", 
    marginLeft: 10 
  },
  noNotes: { 
    textAlign: "center", 
    marginTop: 20, 
    fontSize: 18, 
    color: "gray" 
  },
  floatingButton: { 
    position: "absolute", 
    bottom: 30, 
    right: 20, 
    backgroundColor: "#080808", 
    width: 60, height: 60, 
    borderRadius: 30, 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4 
  },
  floatingButtonText: { 
    fontSize: 30, 
    color: "white", 
    fontWeight: "bold" 
  },

  // Modal styles
  modalOverlay: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  modalContainer: { 
    width: 300, 
    padding: 20, 
    backgroundColor: "white", 
    borderRadius: 10 
  },
  modalText: { 
    fontSize: 18, 
    marginBottom: 15 
  },
  modalButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  modalButton: { 
    padding: 10, 
    borderRadius: 5, 
    backgroundColor: "#080808", 
    width: "45%" 
  },
  modalButtonText: { 
    color: "white", 
    textAlign: "center" 
  },
  scanButton: { 
    position: "absolute", 
    bottom: 100, 
    right: 26, 
    backgroundColor: "#000", 
    padding: 15, 
    borderRadius: 30 },
  scanner: { 
    height: 20,
    width: 20,
 },
});

export default Homescreen;

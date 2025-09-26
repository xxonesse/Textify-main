
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
  Home: { userName?: string };
  AddNote: {
    addNote?: (title: string, content: string, index?: number) => void;
    noteToEdit?: Note;
    noteIndex?: number;
    deleteNote?: (index: number) => void;
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
          <Text style={styles.greet}>Good day, {userName}!</Text>
          <ProfilePicture imageSource={require("../assets/profilepicture.png")} />
        </View>
      </View>

      <Text style={styles.myNotes}>My Notes <Text style={styles.notesCount}>/{String(notes.length).padStart(2, "0")}</Text></Text>

      <View style={styles.searchGroup}>
        <View style={styles.searchContainer}>
          <Image source={require("../assets/searchBtn.png")} style={styles.searchbtn} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#F1E9B2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.themeNsettings}>
          <Image source={require("../assets/settingBtn.png")} style={styles.settings} />
          <Image source={require("../assets/lightmode.png")} style={styles.themeMode} />
        </View>
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
 
    <View style={styles.navBttns}>
      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate("AddNote", { addNote, deleteNote })}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate("Scanner")}>
        <Image source={require("../assets/scanner.png")} style={styles.scanner} />
      </TouchableOpacity>
    </View>

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
    backgroundColor: "#F1E9B2" 
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
    padding: 3, 
    paddingLeft: 10,
    width: "80%",
    borderRadius: 20, 
    marginBottom: 10,
    backgroundColor: "#161616", 

  },
  searchBar: { 
    flex: 1, 
    height: 50, 
    color: "#F1E9B2", 
    paddingHorizontal: 10, 
    borderRadius: 15 
  },
  searchbtn: {
    height: 20,
    width: 20,
    marginLeft: 10,
  },
  searchGroup: {
    flexDirection: "row",
  },
  themeNsettings: {
    flexDirection: "row",
    marginTop: 15
  },
  settings: { 
    width: 22, 
    height: 22, 
    resizeMode: "contain", 
    marginLeft: 10 
  },
  themeMode: { 
    width: 25, 
    height: 25, 
    resizeMode: "contain", 
    marginLeft: 10 
  },
  noNotes: { 
    textAlign: "center", 
    marginTop: 20, 
    fontSize: 18, 
    color: "gray" 
  },
  navBttns: {
    flexDirection: "row",
    gap: 30,
    backgroundColor: "#000",
    borderRadius: 50,
    margin: "auto",
    justifyContent: "center",
    width: 150,
    height: 70,
    paddingTop: 10
  },
  floatingButton: { 
    // position: "absolute", 
    // bottom: 30, 
    backgroundColor: "#F1E9B2", 
    width: 50, 
    height: 50, 
    borderRadius: 30, 
    justifyContent: "center", 
    alignItems: "center", 
  },
  floatingButtonText: { 
    fontSize: 40, 
    color: "#000", 
    fontWeight: "bold" 
  },
  scanButton: { 
    // position: "absolute", 
    // bottom: 100, 
    // right: 26, 
    height: 50,
    width: 50,
    backgroundColor: "#F1E9B2", 
    borderRadius: 30 
  },
  scanner: { 
    margin: "auto",
    height: 35,
    width: 35,
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
});

export default Homescreen;

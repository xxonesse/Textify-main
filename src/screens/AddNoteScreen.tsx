import React, { useState, useEffect } from "react";
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
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEditorBridge, RichText, Toolbar } from "@10play/tentap-editor";
import { checkAndCorrectGrammar } from "../utils/sapling";
import Tts from "react-native-tts";
import RNHTMLtoPDF from "react-native-html-to-pdf";

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

const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Legal: { width: 612, height: 1008 },
  Short: { width: 612, height: 792 },
};

const FONT_SIZES = [14, 16, 18, 20, 24, 28, 32];

const AddNoteScreen: React.FC<Props> = ({ navigation, route }) => {
  const note = route.params?.noteToEdit;
  const noteIndex = route.params?.noteIndex;

  const [title, setTitle] = useState(note?.title || "");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pages, setPages] = useState([
    { id: 1, size: "A4" as keyof typeof PAGE_SIZES, fontSize: 16 },
  ]);

  const screenWidth = Dimensions.get("window").width;
  const editor = useEditorBridge({
    initialContent: note?.content || "<p></p>",
    autofocus: true,
    avoidIosKeyboard: true,
  });

  // Set font size when pages change
  useEffect(() => {
    if (pages.length > 0) {
      // This is a placeholder - you'll need to check the tentap-editor documentation
      // for the correct way to set font size programmatically
      // editor.setFontSize(pages[0].fontSize);
    }
  }, [pages, editor]);

  // ---- Functions ----
  const handleCheckGrammar = async () => {
    const rawContent = await editor.getText();
    if (!rawContent?.trim()) {
      Alert.alert("Note content is empty!");
      return;
    }
    try {
      const correctedContent = await checkAndCorrectGrammar(rawContent);
      editor.setContent(correctedContent);
      Alert.alert("Grammar checked and corrected!");
    } catch (err) {
      console.error("Grammar check error:", err);
      Alert.alert("Failed to check grammar.");
    }
  };

  const handleSave = async () => {
    const rawContent = await editor.getText();
    if (!title.trim() || !rawContent?.trim()) {
      Alert.alert("Both fields are required!");
      return;
    }
    try {
      const correctedContent = await checkAndCorrectGrammar(rawContent);
      if (route.params?.addNote) {
        route.params.addNote(title, correctedContent, noteIndex);
      } else {
        Alert.alert("Note saving function is missing.");
      }
      navigation.goBack();
    } catch (err) {
      console.error("Error correcting grammar:", err);
      Alert.alert("An error occurred while checking grammar.");
    }
  };

  const handleTextToSpeech = async () => {
    const rawContent = await editor.getText();
    if (!rawContent?.trim()) {
      Alert.alert("Note is empty!", "There's no content to read.");
      return;
    }
    try {
      await Tts.speak(rawContent);
    } catch (error) {
      console.error("Text-to-speech error:", error);
      Alert.alert("Error", "Failed to convert text to speech.");
    }
  };

  const handleGeneratePdf = async () => {
    const rawContent = await editor.getText();
    if (!rawContent?.trim()) {
      Alert.alert("Note is empty!", "There's no content to convert to PDF.");
      return;
    }
    try {
      const htmlContent = `
        <h1>${title}</h1>
        <p>${rawContent}</p>
      `;
      const options = {
        html: htmlContent,
        fileName: title.replace(/[^a-zA-Z0-9]/g, "_") || `note-${Date.now()}`,
        directory: "Documents",
      };
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert("Success!", `PDF saved to: ${file.filePath}`);
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  const confirmDelete = () => {
    if (route.params?.deleteNote && typeof noteIndex === "number") {
      route.params.deleteNote(noteIndex);
    }
    navigation.goBack();
    setIsModalVisible(false);
  };

  const addPage = () => {
    setPages([...pages, { id: pages.length + 1, size: "A4", fontSize: 16 }]);
  };

  const deletePage = (id: number) => {
    if (pages.length === 1) return; // Always keep at least one page
    setPages(pages.filter((p) => p.id !== id));
  };

  // ---- UI ----
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#080808"
          value={title}
          onChangeText={setTitle}
        />

        {/* Pages */}
        <ScrollView
          style={styles.editorScroll}
          contentContainerStyle={{
            alignItems: "center",
            paddingVertical: 5,
          }}
        >
          {pages.map((page, i) => {
            const { width, height } = PAGE_SIZES[page.size];
            const scaleFactor = (screenWidth * 0.9) / width;
            const scaledHeight = height * scaleFactor;

            return (
              <View key={page.id} style={{ marginBottom: 15, alignItems: "center" }}>
                {/* Picker + Font Size */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                  <Picker
                    selectedValue={page.size}
                    style={{ width: 120 }}
                    onValueChange={(val) => {
                      const updated = [...pages];
                      updated[i].size = val;
                      setPages(updated);
                    }}
                  >
                    <Picker.Item label="A4" value="A4" />
                    <Picker.Item label="Legal" value="Legal" />
                    <Picker.Item label="Short" value="Short" />
                  </Picker>

                  <Picker
                    selectedValue={page.fontSize}
                    style={{ width: 100, marginLeft: 10 }}
                    onValueChange={(val) => {
                      const updated = [...pages];
                      updated[i].fontSize = val;
                      setPages(updated);
                    }}
                  >
                    {FONT_SIZES.map((f) => (
                      <Picker.Item key={f} label={`${f}px`} value={f} />
                    ))}
                  </Picker>

                  {i > 0 && (
                    <TouchableOpacity
                      style={styles.deletePageBtn}
                      onPress={() => deletePage(page.id)}
                    >
                      <Text style={{ color: "#fff" }}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Page */}
                <View
                  style={{
                    width: screenWidth * 0.9,
                    height: scaledHeight,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={[styles.page, { width, height, transform: [{ scale: scaleFactor }] }]}
                  >
                    <View style={styles.richText}>
                      <RichText editor={editor} />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Add Page Button */}
          <TouchableOpacity style={styles.addPageBtn} onPress={addPage}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>+ Add Page</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Toolbar */}
        <Toolbar editor={editor} />

        {/* Bottom Buttons */}
        <View style={styles.lowerbtn}>
          <TouchableOpacity onPress={handleTextToSpeech}>
            <Image source={require("../assets/read_note.png")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGeneratePdf}>
            <Image source={require("../assets/pdf_save.png")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCheckGrammar}>
            <Image source={require("../assets/grammar_check.png")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Image source={require("../assets/save_note.png")} />
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

        {/* Delete Modal */}
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

// ---- Styles ----
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#F1E9B2" },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#080808",
    color: "#000",
  },
  editorScroll: { flex: 1 },
  page: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  richText: {
    flex: 1,
    padding: 20,
  },
  addPageBtn: {
    backgroundColor: "#357ABD",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  lowerbtn: {
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 50,
    flexDirection: "row",
    gap: 15,
    backgroundColor: "#000",
    padding: 10,
    width: 270,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  deleteButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#800000",
  },
  deletePageBtn: {
    marginLeft: 10,
    backgroundColor: "#800000",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
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
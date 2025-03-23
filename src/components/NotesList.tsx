import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Note = {
  title: string;
  content: string;
  createdAt: string;
};

type NotesListProps = {
  notes: Note[];
  onNoteClick: (index: number) => void;
  onDelete: (index: number) => void;
};

const NotesList: React.FC<NotesListProps> = ({ notes, onNoteClick, onDelete }) => {
  const [selectedNote, setSelectedNote] = useState<number | null>(null);

  return (
    <View>
      {notes.map((note, index) => (
        <TouchableOpacity
          key={index}
          style={styles.noteContainer}
          onPress={() => onNoteClick(index)}
          onLongPress={() => setSelectedNote(index)} // Show delete button on long-press
        >
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>
              {String(index + 1).padStart(2, "0")}/ {note.title}
            </Text>
            <Text style={styles.noteText}>{note.content}</Text>
            
            {/* ✅ Date now placed at the bottom-right of the content */}
            <Text style={styles.noteDate}>{note.createdAt}</Text>
          </View>

          {selectedNote === index && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(index)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  noteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    padding: 15,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: "relative",
  },
  noteContent: {
    flex: 1,
    paddingRight: 50, // Prevent overlap with delete button
    position: "relative", // Needed for absolute positioning of date
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noteText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    paddingBottom: 20, // ✅ Adds space for date placement
  },
  noteDate: {
    fontSize: 12,
    color: "#777",
    position: "absolute",
    bottom: 0, // ✅ Moves the date to bottom-right of content
    right: 0,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default NotesList;

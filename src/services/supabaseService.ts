import { supabase } from '../lib/supabase';

// Add a new note
export const addNote = async (title: string, content: string) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }]);

  if (error) {
    console.error('Error inserting note:', error.message);
    return null;
  }
  return data;
};

// Get all notes
export const getNotes = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*');

  if (error) {
    console.error('Error fetching notes:', error.message);
    return [];
  }
  return data;
};

// Update a note
export const updateNote = async (id: number, newContent: string) => {
  const { data, error } = await supabase
    .from('notes')
    .update({ content: newContent })
    .eq('id', id);

  if (error) {
    console.error('Error updating note:', error.message);
    return null;
  }
  return data;
};

// Delete a note
export const deleteNote = async (id: number) => {
  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting note:', error.message);
    return null;
  }
  return data;
};

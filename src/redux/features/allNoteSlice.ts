import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';

// Interfaces
interface TNote {
  _id: string;
  title: string;
  content: string;
  author: string | { _id: string; name: string };
  isDeleted?: boolean;
  important?: boolean;
  createdAt: Date;
  updatedAt: Date;
  __optimistic?: boolean; // For tracking optimistic note state
}

interface NoteState {
  notes: TNote[];
  loading: boolean;
  error: string | null;
  polling: boolean;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  error: null,
  polling: false,
};

// Async Thunks
export const fetchAllNotes = createAsyncThunk<
  TNote[],
  { userId: string; query?: Record<string, any> }
>('notes/fetchAllNotes', async ({ userId, query }) => {
  const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
  const response = await axiosInstance.get(`/notes/${userId}${queryString}`);
  return response.data.data.result;
});

export const createNewNote = createAsyncThunk<TNote, Partial<TNote>>(
  'notes/createNewNote',
  async (noteData) => {
    const response = await axiosInstance.post('/notes', noteData);
    return response.data.data;
  }
);

export const updateNote = createAsyncThunk<TNote, { noteId: string; noteData: Partial<TNote> }>(
  'notes/updateNote',
  async ({ noteId, noteData }) => {
    const response = await axiosInstance.patch(`/notes/singlenote/${noteId}`, noteData);
    return response.data.data;
  }
);

export const deleteNote = createAsyncThunk<string, string>(
  'notes/deleteNote',
  async (noteId) => {
    await axiosInstance.delete(`/notes/singlenote/${noteId}`);
    return noteId;
  }
);

// Create Slice
const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    startPolling: (state) => {
      state.polling = true;
    },
    stopPolling: (state) => {
      state.polling = false;
    },
    updateNoteLocally: (state, action) => {
      const index = state.notes.findIndex((note) => note._id === action.payload._id);
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...action.payload,
        };
      }
    },
    clearNotes: (state) => {
      state.notes = [];
    },
    addOptimisticNote: (state, action) => {
      state.notes = [action.payload, ...state.notes];
    },
    removeOptimisticNote: (state, action) => {
      state.notes = state.notes.filter(note => note._id !== action.payload);
    },
    mergeNotes : (state, action) => {
      const uniqueNotes = action.payload.reduce((acc, note) => {
        // Check if note exists based on _id or title (for optimistic notes)
        const existingIndex = acc.findIndex(
          (n) =>
            n._id === note._id ||
            (note.__optimistic && n.title === note.title && !n.__optimistic)
        );
    
        if (existingIndex >= 0) {
          if (!note.__optimistic) {
            // Replace the optimistic note with the real note
            acc[existingIndex] = note;
          }
        } else {
          acc.push(note);
        }
    
        return acc;
      }, []);
    
      state.notes = uniqueNotes;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Notes
      .addCase(fetchAllNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNotes.fulfilled, (state, action) => {
        state.loading = false;
        const newNotes = action.payload.filter(note => !note.isDeleted);

        const existingMap = new Map(state.notes.map(n => [n._id, n]));

        state.notes = newNotes.map(note => {
          const existing = existingMap.get(note._id);
          return existing
            ? {
                ...note,
                important: existing.important,
              }
            : note;
        });
      })
      .addCase(fetchAllNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notes';
      })

      // Create Note
      .addCase(createNewNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewNote.fulfilled, (state, action) => {
        state.loading = false;
        // Replace the optimistic note with the real one
        state.notes = state.notes.map(note => 
          note.__optimistic && note.title === action.payload.title 
            ? action.payload 
            : note
        );
      })
      .addCase(createNewNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create note';
      })

      // Update Note
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notes.findIndex(note => note._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update note';
      })

      // Delete Note
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = state.notes.filter(note => note._id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete note';
      });
  },
});

export const {
  startPolling,
  stopPolling,
  updateNoteLocally,
  clearNotes,
  addOptimisticNote,
  removeOptimisticNote,
  mergeNotes,
} = noteSlice.actions;

export default noteSlice.reducer;

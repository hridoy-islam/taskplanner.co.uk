import { useEffect } from 'react';
import {
  startPolling,
  stopPolling,
  fetchAllNotes,
  mergeNotes
} from '@/redux/features/allNoteSlice';
import { useDispatch, useSelector } from 'react-redux';

const DEFAULT_POLL_INTERVAL = 5000;

const usePollNotes = (userId: string, query?: Record<string, any>) => {
  const dispatch = useDispatch();
  const { polling, loading, error, notes } = useSelector(
    (state) => state.allnotes
  );

  useEffect(() => {
    if (!userId) return;

    // In usePollNotes.ts
    const fetchData = () => {
      dispatch(fetchAllNotes({ userId, query })).then((action) => {
        if (action.payload) {
          // Get current optimistic notes (but exclude those that have been confirmed)
          const optimisticNotes = notes.filter(
            (note) =>
              note.__optimistic &&
              !action.payload.some((realNote) => realNote.title === note.title)
          );

          // Combine with real notes, avoiding duplicates
          const mergedNotes = [...optimisticNotes, ...action.payload];

          // Remove duplicates (prioritize real notes over optimistic ones)
          const uniqueNotes = mergedNotes.reduce((acc, note) => {
            const exists = acc.some(
              (n) =>
                n._id === note._id ||
                (!note.__optimistic && n.title === note.title)
            );
            if (!exists) acc.push(note);
            return acc;
          }, []);

          dispatch(mergeNotes(uniqueNotes));
        }
      });
    };

    fetchData();

    const interval = setInterval(fetchData, DEFAULT_POLL_INTERVAL);

    return () => {
      clearInterval(interval);
      dispatch(stopPolling());
    };
  }, [userId, query, dispatch]); // Removed `notes` from the dependencies

  return { polling, loading, error };
};

export default usePollNotes;

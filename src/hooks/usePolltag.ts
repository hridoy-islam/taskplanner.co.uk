import { useEffect } from 'react';
import {
  startPolling,
  stopPolling,
  fetchTags,
  mergeTags
} from '../redux/features/tagSlice';
import { useDispatch, useSelector } from 'react-redux';

const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds

const usePollTags = (userId: string) => {
  const dispatch = useDispatch();
  const { polling, loading, error, tags } = useSelector((state) => state.tags);

  useEffect(() => {
    if (!userId) return;

    // In usePollTags.ts
    const fetchData = () => {
      dispatch(fetchTags({ userId })).then((action) => {
        if (action.payload) {
          // Get current optimistic tags (but exclude those that have been confirmed)
          const optimisticTags = tags.filter(
            (tag) =>
              tag.__optimistic &&
              !action.payload.some((realTag) => realTag.name === tag.name)
          );

          // Combine with real tags, avoiding duplicates
          const mergedTags = [...optimisticTags, ...action.payload];

          // Remove duplicates (prioritize real tags over optimistic ones)
          const uniqueTags = mergedTags.reduce((acc, tag) => {
            const exists = acc.some(
              (t) =>
                t._id === tag._id ||
                (!tag.__optimistic && t.name === tag.name)
            );
            if (!exists) acc.push(tag);
            return acc;
          }, []);

          dispatch(mergeTags(uniqueTags));
        }
      });
    };

    // Initial fetch
    fetchData();

    // Set up polling interval
    const interval = setInterval(fetchData, DEFAULT_POLL_INTERVAL);

    // Clean up on unmount or userId change
    return () => {
      clearInterval(interval);
      dispatch(stopPolling());
    };
  }, [userId, dispatch]); // Make sure `tags` is included in the dependencies

  return { polling, loading, error };
};

export default usePollTags;

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './features/authSlice';
import profileReducer from './features/profileSlice';

import userSlice from './features/userSlice';
import  tagReducer  from './features/tagSlice';
import allTasksReducer from './features/allTaskSlice';
import allNotesReducer from "./features/allNoteSlice"
const persistConfig = {
  key: 'taskplanner',
  storage
};

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  users: userSlice,
  alltasks: allTasksReducer,
  allnotes: allNotesReducer,
  tags: tagReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'] // Ignore persist related actions to avoid serializability issues
      }
    }),
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;

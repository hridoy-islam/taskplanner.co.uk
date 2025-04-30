import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: 'AIzaSyDyw-pWBCnYnmmsjyDOl_6O2GGnw1EadVU',
//   authDomain: 'task-planner-e833d.firebaseapp.com',
//   projectId: 'task-planner-e833d',
//   storageBucket: 'task-planner-e833d.firebasestorage.app',
//   messagingSenderId: '678302069362',
//   appId: '1:678302069362:web:7fa59ee292aa0c73c508eb'
// };


const firebaseConfig = {
  apiKey: "AIzaSyB8wA8Cn3SP66iAltf4bEcrcxTcP3efK_U",
  authDomain: "taskplanner-7ed20.firebaseapp.com",
  projectId: "taskplanner-7ed20",
  storageBucket: "taskplanner-7ed20.firebasestorage.app",
  messagingSenderId: "756204695909",
  appId: "1:756204695909:web:74d20f30ff68c743d6b18c",
  // measurementId: "G-GWS69HT0NS"
};


const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

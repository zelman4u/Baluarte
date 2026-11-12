import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// Force long polling with 15-second timeout to prevent QUIC protocol idle timeouts and proxy buffering drops
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
    experimentalLongPollingOptions: {
      timeoutSeconds: 15,
    },
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);
export const storage = getStorage(app);

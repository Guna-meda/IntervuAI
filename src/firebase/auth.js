// firebase/auth.js
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  getAuth,
} from 'firebase/auth';
import { auth, provider } from './config';

export const loginWithGoogle = async () => {
  try {
    console.log('Starting Google popup...');
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const response = await fetch('http://localhost:3001/api/v1/users/createOrFetchUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create/fetch user in MongoDB');
    }

    const mongoUser = await response.json();
    return { firebaseUser: result.user, mongoUser: mongoUser.data };
  } catch (error) {
    console.error('Popup or MongoDB error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log('Logout successful');
    try {
      window.location.reload();
    } catch (e) {
      console.warn('Could not reload after logout:', e);
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUserWithToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No Firebase user found');
      return null;
    }

    const idToken = await currentUser.getIdToken();
    
    const response = await fetch('http://localhost:3001/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const mongoUser = await response.json();
    return {
      firebaseUser: currentUser,
      mongoUser: mongoUser
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};
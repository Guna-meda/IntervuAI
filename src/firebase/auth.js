// firebase/auth.js
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult, 
  signOut,
  GoogleAuthProvider,
  getAuth,
} from 'firebase/auth';
import { auth, provider } from './config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

const performGoogleSignIn = async () => {
  const signInFn = isMobile() ? signInWithRedirect : signInWithPopup;
  console.log(`Starting Google ${isMobile() ? 'redirect' : 'popup'}...`);
  return await signInFn(auth, provider);
};

export const loginWithGoogle = async () => {
  try {
    if (isMobile()) {
      console.log('📱 Using redirect flow...');
      await signInWithRedirect(auth, provider);
      return; // 🔥 Don't proceed further here
    }

    console.log('💻 Using popup flow...');
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const response = await fetch(`${API_BASE_URL}/users/createOrFetchUser`, {
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

    if (!response.ok) throw new Error('Failed to create/fetch user in MongoDB');

    const mongoUser = await response.json();
    return { firebaseUser: result.user, mongoUser: mongoUser.data };
  } catch (error) {
    console.error('Google sign-in or MongoDB error:', error);
    throw error;
  }
};


export const completeRedirectLogin = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      console.log('No redirect result available');
      return null;
    }

    console.log('Completing redirect sign-in...');
    const idToken = await result.user.getIdToken();

    const response = await fetch(`${API_BASE_URL}/users/createOrFetchUser`, {
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
    console.error('Redirect completion or MongoDB error:', error);
    if (error.code === 'auth/web-storage-unsupported') {
      console.warn('Browser does not support web storage');
    }
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log('Logout successful');
    window.location.reload();
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

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const mongoUser = await response.json();
    return { firebaseUser: currentUser, mongoUser };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};
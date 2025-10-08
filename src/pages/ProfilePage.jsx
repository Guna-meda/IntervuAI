// ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProfileSetup from '../components/profile/ProfileSetup';
import ProfileView from '../components/profile/ProfileView';
import { getCurrentUserWithToken } from '../firebase/auth';
import { getAuth } from 'firebase/auth';
import useAuthStore from '../store/authStore';

export default function ProfilePage() {
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const { mongoUser, setUser, user: firebaseUser } = useAuthStore();

  // Fix: Only fetch data once when component mounts and we have firebaseUser but no mongoUser
  useEffect(() => {
    const initializeUser = async () => {
      if (firebaseUser && !mongoUser) {
        await fetchUserData();
      } else {
        setLocalLoading(false);
      }
    };

    initializeUser();
  }, []); // Empty dependency array - run only once on mount

  const fetchUserData = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      const result = await getCurrentUserWithToken();
      if (result) {
        setUser(result.firebaseUser, result.mongoUser);
      } else {
        setError('Failed to load user data. Please try logging in again.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.code === 'auth/quota-exceeded') {
        setError('Authentication quota exceeded. Please try again later or contact support.');
      } else {
        setError('Error loading profile: ' + error.message);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleProfileSave = async (profileData) => {
    try {
      const currentUser = getAuth().currentUser;
      const idToken = await currentUser.getIdToken();

      const response = await fetch('http://localhost:3001/api/v1/users/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || 'Failed to save profile');
      }

      const updatedUser = await response.json();
      setUser(currentUser, updatedUser); // Fix: Remove .data since backend returns user directly
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile: ' + error.message);
    }
  };

  if (localLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!mongoUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">User not found. Please log in again.</div>
      </div>
    );
  }

  if (!mongoUser.profileSetup) {
    return <ProfileSetup onSave={handleProfileSave} />;
  }

  return <ProfileView />;
}
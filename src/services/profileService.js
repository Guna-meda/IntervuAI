// services/profileService.js
import useAuthStore from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

class ProfileService {
  async getAuthHeaders() {
    const { user: firebaseUser } = useAuthStore.getState();
    if (!firebaseUser) throw new Error('No user authenticated');
    
    const idToken = await firebaseUser.getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    };
  }

  async getFormDataHeaders() {
    const { user: firebaseUser } = useAuthStore.getState();
    if (!firebaseUser) throw new Error('No user authenticated');
    
    const idToken = await firebaseUser.getIdToken();
    return {
      Authorization: `Bearer ${idToken}`,
    };
  }

  // Get user profile
  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: await this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch profile: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Update profile
  async updateProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: 'PATCH',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Upload image - FIXED VERSION
  async uploadImage(file, type) {
    console.log('Uploading image:', { file, type, size: file.size });
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const headers = await this.getFormDataHeaders();
    
    const response = await fetch(`${API_BASE_URL}/users/upload-image`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    
    console.log('Upload response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `Upload failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  // Update profile with images
  async updateProfileWithImages(profileData, avatarFile, coverFile) {
    const formData = new FormData();
    
    // Append profile data as JSON string
    const profileDataWithoutImages = { ...profileData };
    delete profileDataWithoutImages.avatar;
    delete profileDataWithoutImages.coverImage;
    
    formData.append('profileData', JSON.stringify(profileDataWithoutImages));

    // Append files
    if (avatarFile) formData.append('avatar', avatarFile);
    if (coverFile) formData.append('coverImage', coverFile);

    const headers = await this.getFormDataHeaders();
    
    const response = await fetch(`${API_BASE_URL}/users/update-profile-with-images`, {
      method: 'PATCH',
      headers: headers,
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update profile with images: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Setup profile
  async setupProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/users/setup-profile`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to setup profile: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Get user stats
  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: await this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch stats: ${response.status} - ${errorText}`);
    }
    return response.json();
  }
}

export default new ProfileService();
// firebase/getToken.js

import { getAuth } from "firebase/auth";

export const getFreshToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return null;

  return await user.getIdToken(true); // 🔥 always fresh
};
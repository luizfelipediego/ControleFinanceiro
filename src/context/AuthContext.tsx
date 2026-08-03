import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type UserRole = "admin" | "editor" | "viewer";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  roleLabel: string;
  caixa_permissao: "PF" | "PJ" | "Ambos";
  is_admin: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  updateUserRole: (newRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  updateUserRole: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case "admin":
        return "Gestor Finanças (Admin)";
      case "editor":
        return "Colaborador (Editor)";
      case "viewer":
        return "Leitor (Visualização)";
      default:
        return "Gestor Finanças";
    }
  };

  const syncUserProfile = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, "users", fbUser.uid);
      const snap = await getDoc(userRef);
      let role: UserRole = "admin";
      let caixaPerm: "PF" | "PJ" | "Ambos" = "Ambos";

      if (snap.exists()) {
        const data = snap.data();
        role = (data.role as UserRole) || "admin";
        caixaPerm = data.caixa_permissao || "Ambos";
        // Update last login timestamp
        await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
      } else {
        // Create new cloud profile in Firestore
        await setDoc(
          userRef,
          {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuário",
            photoURL: fbUser.photoURL || null,
            role: "admin",
            caixa_permissao: "Ambos",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuário",
        photoURL: fbUser.photoURL,
        role,
        roleLabel: getRoleLabel(role),
        caixa_permissao: caixaPerm,
        is_admin: role === "admin",
      });
    } catch (err) {
      console.error("Erro ao sincronizar perfil do usuário na nuvem:", err);
      // Fallback local state if offline or network error
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuário",
        photoURL: fbUser.photoURL,
        role: "admin",
        roleLabel: getRoleLabel("admin"),
        caixa_permissao: "Ambos",
        is_admin: true,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        await syncUserProfile(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const updateUserRole = async (newRole: UserRole) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { role: newRole }, { merge: true });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              role: newRole,
              roleLabel: getRoleLabel(newRole),
              is_admin: newRole === "admin",
            }
          : null
      );
    } catch (err) {
      console.error("Erro ao atualizar papel do usuário:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        updateUserRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


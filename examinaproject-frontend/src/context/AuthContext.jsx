import { createContext, useState } from "react";
import { loginUser, registerStudent } from "../api/apiService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const login = async (email, password, role) => {
    try {
      const res = await loginUser({ email, password, role });
      const access = res.data.access;
      const refresh = res.data.refresh;
      setToken(access);
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      return { success: true, role };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || "Login failed",
      };
    }
  };

  const register = async (data) => {
    try {
      const res = await registerStudent(data);
      const access = res.data.access;
      const refresh = res.data.refresh;
      setToken(access);
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      return { success: true, role: "student" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data || "Register failed",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("wasteradar_token");

    const storedUser =
      localStorage.getItem("wasteradar_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser =
          JSON.parse(storedUser);

        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error(
          "Failed to restore authentication:",
          error
        );

        localStorage.removeItem(
          "wasteradar_token"
        );

        localStorage.removeItem(
          "wasteradar_user"
        );

        setToken(null);
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem(
      "wasteradar_token",
      newToken
    );

    localStorage.setItem(
      "wasteradar_user",
      JSON.stringify(newUser)
    );

    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem(
      "wasteradar_user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem(
      "wasteradar_token"
    );

    localStorage.removeItem(
      "wasteradar_user"
    );

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        updateUser,
        logout,
        isAuthenticated:
          Boolean(token) && Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
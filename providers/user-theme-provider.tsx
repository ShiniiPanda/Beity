import { createContext, PropsWithChildren, useContext, useState } from "react";
import { useColorScheme } from "react-native";

const UserThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({ theme: "light", toggleTheme: () => { } });

export function UserThemeProvider({ children }: PropsWithChildren) {
  const deviceScheme = useColorScheme();
  const [theme, setTheme] = useState<"light" | "dark">(deviceScheme ?? "light");
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <UserThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
}

export const useUserTheme = () => useContext(UserThemeContext);

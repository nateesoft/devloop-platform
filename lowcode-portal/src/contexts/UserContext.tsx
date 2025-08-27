import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  company?: string;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Using the same user ID as in AccountSettings
  const userId = user?.id || '';
  console.log('Current userId in UserContext:', user);

  const fetchUser = async () => {
    setLoading(true);
    try {
      console.log('Attempting to fetch user data from API...');
      const response = await fetch(`/api/users/${userId}`, {
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      const data = await response.json();

      if (data.success && data.data) {
        console.log('Successfully loaded user data from API');
        setUser({
          id: userId,
          fullName: data.data.fullName,
          email: data.data.email,
          company: data.data.company,
        });
      } else {
        console.log('API returned no data, using fallback');
        setUser({
          id: userId,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          company: 'Acme Corporation',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('API call failed, using fallback data. Reason:', errorMessage);
      // Always provide fallback data when backend is unavailable
      setUser({
        id: userId,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corporation',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<UserData>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    loading,
    fetchUser,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
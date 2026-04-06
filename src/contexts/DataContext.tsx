import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, setDoc, updateDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from './AuthContext';
import { Task, Client, OperationType, FirestoreErrorInfo, UserSettings } from '../types';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  tasks: Task[];
  clients: Client[];
  settings: UserSettings | null;
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'tr',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
  },
  exchangeRates: {
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.0,
  }
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setClients([]);
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as UserSettings);
      } else {
        // Initialize default settings if not exists
        setDoc(doc(db, 'settings', user.uid), DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `settings/${user.uid}`);
    });

    const qTasks = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    const qClients = query(collection(db, 'clients'), where('userId', '==', user.uid));
    const unsubscribeClients = onSnapshot(qClients, (snapshot) => {
      const clientsData: Client[] = [];
      snapshot.forEach((doc) => {
        clientsData.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'clients');
    });

    return () => {
      unsubscribeSettings();
      unsubscribeTasks();
      unsubscribeClients();
    };
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newDocRef = doc(collection(db, 'tasks'));
    const task: Task = {
      ...taskData,
      id: newDocRef.id,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(newDocRef, task);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tasks/${newDocRef.id}`);
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'tasks', id), taskData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newDocRef = doc(collection(db, 'clients'));
    const client: Client = {
      ...clientData,
      id: newDocRef.id,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(newDocRef, client);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `clients/${newDocRef.id}`);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'clients', id), clientData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${id}`);
    }
  };

  const deleteClient = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'settings', user.uid), newSettings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/${user.uid}`);
    }
  };

  return (
    <DataContext.Provider value={{ 
      tasks, 
      clients, 
      settings,
      loading, 
      addTask, 
      updateTask, 
      deleteTask, 
      addClient, 
      updateClient, 
      deleteClient,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

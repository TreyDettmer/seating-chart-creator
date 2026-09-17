import { createContext, ReactNode, useContext, useEffect, useReducer, useState } from "react";
import { AppAction, appReducer, AppState, initialAppState, SchoolClass, SeatingConfiguration, Student } from "./app-state"
import { getItem, setItem } from "./utils/local-storage";

const AppStateContext = createContext<AppState | null>(null);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {

  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = getItem("state");
    if (saved) {
      dispatch({ type: "LOAD_STATE", payload: saved });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    setItem("state", state);
  }, [state, isHydrated]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}

// Derived selector hooks -- components use these instead of pulling the
// whole state object, so a component reading one class doesn't care when
// an unrelated class changes (pairs well with React.memo).

export function useClass(classId: string | null): SchoolClass | undefined {
  const { classes } = useAppState();
  return classId ? classes[classId] : undefined;
}

export function useSeatingConfig(
  configId: string | null
): SeatingConfiguration | undefined {
  const { seatingConfigurations } = useAppState();
  return configId ? seatingConfigurations[configId] : undefined;
}

export function useStudent(studentId: string | null): Student | undefined {
  const { students } = useAppState();
  return studentId ? students[studentId] : undefined;
}

export function useActiveClass(): SchoolClass | undefined {
  const { classes, activeClassId } = useAppState();
  return activeClassId ? classes[activeClassId] : undefined;
}

export function useActiveSeatingConfig(): SeatingConfiguration | undefined {
  const { classes, activeClassId, seatingConfigurations } = useAppState();
  return activeClassId ? classes[activeClassId].activeConfigurationId ? seatingConfigurations[classes[activeClassId].activeConfigurationId] : undefined : undefined;
}
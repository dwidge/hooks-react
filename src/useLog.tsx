import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from "react";

// Define the type for the logger function.  It takes a scope and then any number of arguments.
type Logger = (scope: string, ...args: any[]) => void;

// The type for the context value.
interface LogContextValue {
  log: Logger;
}

// Create the context.  Default logger does nothing.
const LogContext = createContext<LogContextValue>({
  log: () => {}, // Default no-op logger
});

// Props for the provider.
interface LogProviderProps {
  children: ReactNode;
  logger?: Logger; // Optional custom logger
  enabledScopes?: string[]; // Optional array of enabled scopes
}

// The provider component.
const LogProvider: React.FC<LogProviderProps> = ({
  children,
  logger = console.log, // Default to console.log
  enabledScopes = [], // Default to an empty array (no scopes enabled)
}) => {
  const [scopes, setScopes] = useState<string[]>(enabledScopes);

  useEffect(() => {
    setScopes(enabledScopes);
  }, [enabledScopes]);

  // Memoize the log function to avoid unnecessary re-renders.
  const log = useMemo<Logger>(() => {
    return (scope: string, ...args: any[]) => {
      if (scopes.includes(scope)) {
        logger(scope, ...args);
      }
    };
  }, [logger, scopes]);

  // Memoize the context value.
  const contextValue = useMemo<LogContextValue>(() => ({ log }), [log]);

  return (
    <LogContext.Provider value={contextValue}>{children}</LogContext.Provider>
  );
};

// The hook to access the logger.
const useLog = (scope: string): Logger => {
  const { log } = useContext(LogContext);

  // Return a function that calls the context's log with the given scope.
  return useMemo(
    () =>
      (...args: any[]) => {
        log(scope, ...args);
      },
    [log, scope],
  );
};

export { LogProvider, useLog };

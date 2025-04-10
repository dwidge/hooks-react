import { useRef } from "react";

/** Log changed variables */
export const useLogVariables = (
  name: string,
  variables: Record<string, any>,
  enable = true,
) => {
  const prevVariablesRef = useRef<Record<string, any> | null>(null);

  if (enable) {
    let hasChanged = false;
    const changedVars: Record<string, any> = {};

    if (prevVariablesRef.current) {
      Object.entries(variables).forEach(([name, value]) => {
        if (
          prevVariablesRef.current &&
          prevVariablesRef.current[name] !== value
        ) {
          changedVars[name] = value;
          hasChanged = true;
        }
      });
    } else {
      // On the first render, consider all variables as "changed" for initial log
      Object.entries(variables).forEach(([name, value]) => {
        changedVars[name] = value;
        hasChanged = true; // Indicate changes for initial log
      });
    }

    if (hasChanged) {
      console.groupCollapsed(`${name} - ${Object.keys(changedVars).join(" ")}`);
      Object.entries(changedVars).forEach(([name, value]) => {
        console.log(`- ${name}:`, value);
      });
      console.groupEnd();
    } else console.log(`${name}`);

    prevVariablesRef.current = variables; // Update previous values for next render
  }
};

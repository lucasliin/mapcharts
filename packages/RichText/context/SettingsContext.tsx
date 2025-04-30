import * as React from "react";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

export const DEFAULT_SETTINGS = {
  isCharLimit: false,
  isCharLimitUtf8: false,
  isCollab: false,
  isMaxLength: false,
  showTableOfContents: false,
  tableCellBackgroundColor: true,
  tableCellMerge: true,
  disabled: false,
} as const;

// These are mutated in setupEnv
export const INITIAL_SETTINGS: Record<SettingName, boolean> = {
  ...DEFAULT_SETTINGS,
};

export type SettingName = keyof typeof DEFAULT_SETTINGS;

type SettingsContextShape = {
  setOption: (name: SettingName, value: boolean) => void;
  settings: Record<SettingName, boolean>;
};

const Context: React.Context<SettingsContextShape> = createContext({
  setOption: (name: SettingName, value: boolean) => {
    return;
  },
  settings: INITIAL_SETTINGS,
});

export const SettingsContext = ({
  initialConfig,
  children,
}: {
  initialConfig: Record<SettingName, boolean>;
  children: ReactNode;
}): JSX.Element => {
  const [settings, setSettings] = useState(initialConfig);

  const setOption = useCallback((setting: SettingName, value: boolean) => {
    setSettings((options) => ({ ...options, [setting]: value }));
  }, []);

  const contextValue = useMemo(() => {
    return { setOption, settings };
  }, [setOption, settings]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useSettings = (): SettingsContextShape => {
  return useContext(Context);
};

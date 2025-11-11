import { useNetworkState } from "expo-network";
import { useContext, createContext, PropsWithChildren } from "react";

const NetworkConnectivityContext = createContext<{
  isConnected: boolean | null;
  isReachable: boolean | null;
}>({
  isConnected: null,
  isReachable: null,
});

export function NetworkConnectivityProvider({ children }: PropsWithChildren) {
  const networkState = useNetworkState();
  return (
    <NetworkConnectivityContext.Provider
      value={{
        isConnected: networkState.isConnected ?? null,
        isReachable: networkState.isInternetReachable ?? null,
      }}
    >
      {children}
    </NetworkConnectivityContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkConnectivityContext);

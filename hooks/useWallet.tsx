import { useState, useEffect } from "react";

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        if (!window.ethereum) {
          setAccount(null);
          return;
        }

        const walletAccounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (walletAccounts.length) {
          setAccount(walletAccounts[0]);
        } else {
          setAccount(null);
        }

        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        });
      } catch (e) {
        console.log(e);
        setAccount(null);
      }
    };

    checkWallet();

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", setAccount);
      }
    };
  }, []);

  return account;
};

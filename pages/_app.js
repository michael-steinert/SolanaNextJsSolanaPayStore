import React, {useMemo} from "react";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import {PhantomWalletAdapter,} from "@solana/wallet-adapter-wallets";
import {clusterApiUrl} from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import "../styles/App.css";

const App = ({Component, pageProps}) => {
    /* Wallet Adapter can be set to Can 'devnet', 'testnet' or 'mainnet-beta' */
    const network = WalletAdapterNetwork.Devnet;
    /* `useMemo` loads only if the Dependency `network` changes */
    /* Using RPC Endpoint from Solana to connect to a Node */
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <Component {...pageProps} />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;

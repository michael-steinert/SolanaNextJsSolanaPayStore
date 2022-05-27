import React, {useEffect, useState} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import Product from "../components/Product";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import HeadComponent from "../components/Head";
import CreateProduct from "../components/CreateProduct";

const App = () => {
    /* Fetching Users' public Key that corresponds to the Wallet Address */
    const {publicKey} = useWallet();
    const isOwner = (publicKey ? publicKey.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY : false);
    const [creating, setCreating] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (publicKey) {
            fetch("/api/fetchProducts")
                .then(response => response.json())
                .then(data => {
                    setProducts(data);
                    console.log("Products", data);
                });
        }
    }, [publicKey]);

    const renderNotConnectedContainer = () => (
        <div>
            <img src={"https://media.giphy.com/media/eSwGh3YK54JKU/giphy.gif"} alt={"emoji"}/>
            <div className="button-container">
                <WalletMultiButton className={"cta-button connect-wallet-button"}/>
            </div>
        </div>
    );

    const renderItemBuyContainer = () => (
        <div className={"products-container"}>
            {
                products.map((product) => (
                    <Product key={product.id} product={product}/>
                ))
            }
        </div>
    );

    return (
        <div className={"App"}>
            <HeadComponent/>
            <div className={"container"}>
                <header className={"header-container"}>
                    <p className={"header"}>Emoji Store</p>
                    <p className={"sub-text"}>Emoji Store that accepts SPL Tokens</p>
                    {
                        isOwner && (
                            <button className={"create-product-button"} onClick={() => setCreating(!creating)}>
                                {
                                    creating ? (
                                        "Close"
                                    ) : (
                                        "Create Product"
                                    )
                                }
                            </button>
                        )
                    }
                </header>
                <main>
                    {
                        creating && (
                            <CreateProduct />
                        )
                    }
                    {
                        publicKey ? (
                            renderItemBuyContainer()
                        ) : (
                            renderNotConnectedContainer()
                        )
                    }
                </main>
                <div className={"footer-container"}>
                    <img
                        alt={"Twitter Logo"}
                        className={"twitter-logo"}
                        src={"twitter-logo.svg"}
                    />
                    <a
                        className={"footer-text"}
                        href={"https://twitter.com"}
                        target={"_blank"}
                        rel={"noreferrer"}
                    >
                        {`Built on @https://twitter.com`}
                    </a>
                </div>
            </div>
        </div>
    );
}

export default App;

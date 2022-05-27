import React, {useState, useEffect, useMemo} from "react";
import {Keypair, Transaction} from "@solana/web3.js";
import {findReference, FindReferenceError} from "@solana/pay";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {InfinitySpin} from "react-loader-spinner";
import IPFSDownload from "./IpfsDownload";
import {addOrder, hasPurchased, fetchItem} from "../lib/api";

const STATUS = {
    Initial: "Initial",
    Submitted: "Submitted",
    Paid: "Paid"
};

const Buy = ({itemID}) => {
    const {connection} = useConnection();
    const {publicKey, sendTransaction} = useWallet();
    /* Public Key used to identify the Order */
    const orderID = useMemo(() => Keypair.generate().publicKey, []);

    /* Loading State of Application */
    const [loading, setLoading] = useState(false);
    /* Tracking Transaction Status */
    const [status, setStatus] = useState(STATUS.Initial);
    /* IPFS Hash and filename of the purchased Item */
    const [item, setItem] = useState(null);

    /* `useMemo` computes only the Value again if its Dependency Array change */
    const order = useMemo(() => ({
            buyer: publicKey.toString(),
            orderID: orderID.toString(),
            itemID: itemID
        }), [publicKey, orderID, itemID]
    );

    /* Fetching the Transaction Object from the Server */
    const processTransaction = async () => {
        setLoading(true);
        const txResponse = await fetch("../api/createTransaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });
        const txData = await txResponse.json();

        /* Creating a Transaction Object */
        const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
        console.log("Transaction Data:", tx);

        /* Sending the Transaction to the Network */
        try {
            const txHash = await sendTransaction(tx, connection);
            console.log(`Transaction sent to Devnet: https://solscan.io/tx/${txHash}?cluster=devnet`);
            /* Transaction could fail, nevertheless the State is set to `Submitted` */
            setStatus(STATUS.Submitted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        /* Check if this Address already has purchased this Item */
        /* If so, then fetch the Item and set State to paid */
        async function checkPurchased() {
            const purchased = await hasPurchased(publicKey, itemID);
            if (purchased) {
                setStatus(STATUS.Paid);
                const item = await fetchItem(itemID);
                setItem(item);
                console.log("Address has already purchased this Item");
            }
        }

        checkPurchased().catch(console.error);
    }, [publicKey, itemID]);

    useEffect(() => {
        /* Checking if Transaction was confirmed */
        if (status === STATUS.Submitted) {
            setLoading(true);
            const interval = setInterval(async () => {
                try {
                    /* When Transaction Object was created, an Order ID was added as a Reference field */
                    /* Solana Pay allows to search for Transactions by their Reference */
                    /* Looking for `orderID` on the Blockchain */
                    const result = await findReference(connection, orderID);
                    console.log("Finding tx reference", result.confirmationStatus);
                    if (result.confirmationStatus === "confirmed" || result.confirmationStatus === "finalized") {
                        clearInterval(interval);
                        setStatus(STATUS.Paid);
                        setLoading(false);
                        await addOrder(order);
                        alert("Thank you for Purchase");
                    }
                } catch (error) {
                    /* `findReference` will error if the Transaction is not found and that can happen right after the Transaction is submitted */
                    /*  Therefore `FindReferenceError` can be ignored */
                    if (error instanceof FindReferenceError) {
                        return null;
                    }
                    console.error("Unknown Error", error);
                } finally {
                    setLoading(false);
                }
            }, 1000);
            return () => {
                clearInterval(interval);
            };
        }
        const getItem = async (itemID) => {
            const item = await fetchItem(itemID);
            setItem(item);
        }

        if (status === STATUS.Paid) {
            getItem(itemID).catch(console.error);
        }
    }, [status]);

    if (!publicKey) {
        return (
            <div>
                <p>Wallet need to be connected to make a Transfer Transaction</p>
            </div>
        );
    }

    if (loading) {
        return (
            <InfinitySpin color={"gray"} width={"150px"}/>
        );
    }

    return (
        <div>
            {
                (item) ? (
                    <IPFSDownload hash={item.hash} filename={item.filename}/>
                ) : (
                    <button
                        disabled={loading}
                        className={"buy-button"}
                        onClick={processTransaction}
                    >
                        Buy now
                    </button>
                )
            }
        </div>
    );
}

export default Buy;

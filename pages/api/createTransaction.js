import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {createTransferCheckedInstruction, getAssociatedTokenAddress, getMint} from "@solana/spl-token";
import BigNumber from "bignumber.js";
import products from "./products.json";

const usdcAddress = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
const sellerAddress = "47G4LsMdsX2CsEqSQDm6KSWRXiyKC1QGKcWnG5z4onFP";
const sellerPublicKey = new PublicKey(sellerAddress);

const createTransaction = async (request, response) => {
    try {
        /* Extracting the Transaction Data from the Request Body */
        const {buyer, orderID, itemID} = request.body;

        if (!buyer) {
            response.status(400).json({
                message: "Missing Buyer Address"
            });
        }

        if (!orderID) {
            response.status(400).json({
                message: "Missing Order ID"
            });
        }

        /* Fetching Item Price from `products.json` using `itemID` */
        const itemPrice = products.find((item) => item.id === itemID).price;

        if (!itemPrice) {
            response.status(404).json({
                message: "Item not found with given Item ID"
            });
        }

        /* Converting Price to the correct Format */
        const bigAmount = BigNumber(itemPrice);
        const buyerPublicKey = new PublicKey(buyer);

        const network = WalletAdapterNetwork.Devnet;
        const endpoint = clusterApiUrl(network);
        const connection = new Connection(endpoint);

        const buyerUsdcAddress = await getAssociatedTokenAddress(usdcAddress, buyerPublicKey);
        const shopUsdcAddress = await getAssociatedTokenAddress(usdcAddress, sellerPublicKey);

        /* Blockhash is an ID for a Block that lets identify each Block */
        const {blockhash} = await connection.getLatestBlockhash("finalized");

        /* Getting the Mint Address of the USDC Token to transfer */
        const usdcMint = await getMint(connection, usdcAddress);

        /* Transaction needs a recent Block ID and the Public Key of the Fee Payer */
        const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: buyerPublicKey
        });

        /* Creating a Transfer Transaction for some USDC SPL Token */
        const transferInstruction = createTransferCheckedInstruction(
            buyerUsdcAddress,
            usdcAddress,
            shopUsdcAddress,
            buyerPublicKey,
            bigAmount.toNumber() * 10 ** (await usdcMint).decimals,
            usdcMint.decimals
        );

        /* Adding more instructions to the Transfer Transaction */
        transferInstruction.keys.push({
            /* Using OrderId to find this Transaction */
            pubkey: new PublicKey(orderID),
            isSigner: false,
            isWritable: false
        });

        tx.add(transferInstruction);

        /* Formatting the Transfer Transaction */
        const serializedTransaction = tx.serialize({
            requireAllSignatures: false
        });
        const base64 = serializedTransaction.toString("base64");

        response.status(200).json({
            transaction: base64
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: "Error during the Creation of Transaction"
        });
    }
}

const handler = (request, response) => {
    if (request.method === "POST") {
        createTransaction(request, response).catch(console.error);
    } else {
        response.status(405).end();
    }
}

export default handler;

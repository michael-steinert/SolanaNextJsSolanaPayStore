import Head from "next/head";

const HeadComponent = () => {
    return (
        <Head>
            <meta name={"viewport"} content={"initial-scale=1.0, width=device-width"}/>
            <meta name={"theme-color"} content={"#000000"}/>

            <title>Solana Pay Store</title>
            <meta name={"title"} content={"Solana Pay Store"}/>
            <meta name={"description"} content="Buy items on Store using Solana Pay"/>
        </Head>
    );
}

export default HeadComponent;

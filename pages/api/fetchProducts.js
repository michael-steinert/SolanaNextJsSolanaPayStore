import products from "./products.json"

const handler = (request, response) => {
    /* If Request is a GET */
    if (request.method === "GET") {
        /* Copying Products without the Hashes and Filenames */
        const productsNoHashes = products.map((product) => {
            const {hash, filename, ...rest} = product;
            return rest;
        });
        response.status(200).json(productsNoHashes);
    } else {
        response.status(405).send(`HTTP Method ${request.method} is not allowed`);
    }
}

export default handler;

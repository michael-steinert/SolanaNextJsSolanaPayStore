/* This API Endpoint will send the User a File Hash from IPFS */
import products from "./products.json"

export default async function handler(request, response) {
    if (request.method === "POST") {
        const {itemID} = request.body;

        if (!itemID) {
            response.status(400).send("Missing Item ID");
        }

        for (let i = 0; i < products.length; i++) {
            let found = false;
            if (products[i].id === itemID) {
                const {hash, filename} = products[i];
                found = true;
                response.status(200).send({hash, filename});
                break;
            }
            if (i === products.length - 1 && !found) {
                response.status(404).send("Item not found");
            }
        }
    } else {
        response.status(405).send(`Method ${request.method} not allowed`);
    }
}

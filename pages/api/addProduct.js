import fs from "fs";
import products from "./products.json";

const handler = (request, response) => {
    if (request.method === "POST") {
        try {
            console.log("Body is ", request.body);
            const {name, price, image_url, description, filename, hash} = request.body;

            /* Creating new Product ID based on last Product ID */
            const maxID = products.reduce((max, product) => Math.max(max, product.id), 0);
            products.push({
                id: maxID + 1,
                name,
                price,
                image_url,
                description,
                filename,
                hash
            });
            fs.writeFileSync("./pages/api/products.json", JSON.stringify(products, null, 2));
            response.status(200).send({
                status: "ok"
            });
        } catch (error) {
            console.error(error);
            response.status(500).json({
                error: "Error adding Product"
            });
        }
    } else {
        response.status(405).send(`HTTP Method ${request.method} not allowed`);
    }
}

export default handler;

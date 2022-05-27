/* This API Endpoint will let Users POST Data to add Records and GET to retrieve */
import orders from "./orders.json";
import {writeFile} from "fs/promises";

const get = (request, response) => {
    const {buyer} = request.query;

    /* Checking if Address has any Orders */
    const buyerOrders = orders.filter((order) => order.buyer === buyer);
    if (buyerOrders.length === 0) {
        /* HTTP Status 204 means successfully processed the Request, not returning any Content */
        response.status(204).send();
    } else {
        response.status(200).json(buyerOrders);
    }
}

const post = async (request, response) => {
    console.log("Received a Add (POST) Order Request", request.body);
    /* Adding new Order to `orders.json` */
    try {
        const newOrder = request.body;

        /* If Address has not purchased this item, add Order to `orders.json` */
        if (!orders.find((order) => order.buyer === newOrder.buyer.toString() && order.itemID === newOrder.itemID)) {
            orders.push(newOrder);
            await writeFile("./pages/api/orders.json", JSON.stringify(orders, null, 2));
            response.status(200).json(orders);
        } else {
            response.status(400).send("Order already exists");
        }
    } catch (error) {
        response.status(400).send(error);
    }
}

const handler = async (request, response) => {
    switch (request.method) {
        case "GET":
            get(request, response);
            break;
        case "POST":
            await post(request, response);
            break;
        default:
            response.status(405).send(`Method ${request.method} not allowed`);
    }
}

export default handler;

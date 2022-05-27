export const addOrder = async (order) => {
    console.log("adding Order ", order, "to Database");
    await fetch("../api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
    });
};


/* Returning `true` if a given Public Key has purchased an Item */
export const hasPurchased = async (publicKey, itemID) => {
    /* Sending a GET Request with the Public Key as a Parameter */
    const response = await fetch(`../api/orders?buyer=${publicKey.toString()}`);
    /* If HTTP Response Code is 200 means Ok */
    if (response.status === 200) {
        const json = await response.json();
        console.log("Current Wallet's Orders:", json);
        /* If Orders is not empty */
        if (json.length > 0) {
            /* Checking if there are Records with this Buyer and Item ID */
            const order = json.find((order) => order.buyer === publicKey.toString() && order.itemID === itemID);
            if (order) {
                return true;
            }
        }
    }
    return false;
};

export const fetchItem = async (itemID) => {
    const response = await fetch("../api/fetchItem", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({itemID})
    });
    return await response.json();
}

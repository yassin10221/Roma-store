// ======================================
// ROMA STORE CHECKOUT
// ======================================

const db = window.supabaseClient;

const subtotalPrice = document.getElementById("subtotalPrice");
const shippingPrice = document.getElementById("shippingPrice");
const totalPrice = document.getElementById("totalPrice");
const placeOrderBtn = document.getElementById("placeOrderBtn");

const cart = JSON.parse(localStorage.getItem("cart")) || [];

let subtotal = 0;

cart.forEach(item => {

    subtotal +=
        Number(item.price) *
        Number(item.quantity);

});

let shippingCost = Number(

    document.querySelector(
        'input[name="shipping"]:checked'
    ).value

);

updateTotals();

// ==========================
// SHIPPING CHANGE
// ==========================

document
.querySelectorAll('input[name="shipping"]')
.forEach(radio=>{

    radio.addEventListener("change",()=>{

        shippingCost = Number(radio.value);

        updateTotals();

    });

});

// ==========================
// UPDATE TOTALS
// ==========================

function updateTotals(){

    subtotalPrice.textContent =
        subtotal.toLocaleString() + " EGP";

    shippingPrice.textContent =
        shippingCost.toLocaleString() + " EGP";

    totalPrice.textContent =
        (subtotal + shippingCost)
        .toLocaleString() + " EGP";

}

// ==========================
// PLACE ORDER
// ==========================

placeOrderBtn.addEventListener("click", placeOrder);

async function placeOrder(){

    try{

        const customer_name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const address =
            document.getElementById("address").value.trim();

        if(
            !customer_name ||
            !email ||
            !phone ||
            !address
        ){

            alert("Please fill all fields.");

            return;

        }

        if(cart.length===0){

            alert("Cart is empty.");

            return;

        }

        placeOrderBtn.disabled = true;

        placeOrderBtn.innerHTML =
            "Placing Order...";

        const shippingMethod =
            shippingCost===0
            ?
            "Store Pickup"
            :
            "Home Delivery";

            const paymentMethod =

document.querySelector(

'input[name="payment"]:checked'

).value;

        // ======================
        // CREATE ORDER
        // ======================

        const {data:order,error:orderError} =
        await db

        .from("orders")

.insert({

    customer_name,

    customer_email: email,

    phone,

    address,

    subtotal,

    shipping_cost: shippingCost,

    shipping_method: shippingMethod,

    payment_method: paymentMethod,

    payment_status:

        paymentMethod === "Cash On Delivery"

        ? "Pending"

        : "Waiting Confirmation",

    total:

        subtotal + shippingCost,

    status: "Pending"

})

        .select()

        .single();

        if(orderError) throw orderError;

        // ======================
        // ORDER ITEMS
        // ======================
console.log("Cart Before Saving:", cart);
const orderItems = cart.map(item => ({

    order_id: order.id,

    product_id: item.id,

    quantity: item.quantity,

    price: item.price,

    image: item.image,

    size: item.size,

    color: item.color

}));

        const {error:itemsError} =

        await db

        .from("order_items")

        .insert(orderItems);

        if(itemsError) throw itemsError;

        // ======================
        // UPDATE STOCK
        // ======================

        for(const item of cart){

            const {data:product} =

            await db

            .from("products")

            .select("stock")

            .eq("id",item.id)

            .single();

            if(product){

                await db

                .from("products")

                .update({

                    stock:
                        product.stock-
                        item.quantity

                })

                .eq("id",item.id);

            }

        }

        localStorage.removeItem("cart");

        alert("✅ Order Placed Successfully");

        location.href="index.html";

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

    finally{

        placeOrderBtn.disabled=false;

        placeOrderBtn.innerHTML="Place Order";

    }

}
// ==========================
// PAYMENT METHOD
// ==========================

const paymentInfo =
    document.getElementById("paymentInfo");
    paymentInfo.style.display = "none";

const paymentText =
    document.getElementById("paymentText");

document
.querySelectorAll('input[name="payment"]')
.forEach(radio=>{

    radio.addEventListener("change",()=>{

        switch(radio.value){

            case "Instapay":

                paymentInfo.style.display="block";

                paymentText.innerHTML=`

<strong>Instapay</strong><br><br>

Send the payment to:<br>

<b>roma@instapay</b>

`;

            break;

            case "Vodafone Cash":

                paymentInfo.style.display="block";

                paymentText.innerHTML=`

<strong>Vodafone Cash</strong><br><br>

Send the payment to:<br>

<b>01012345678</b>

`;

            break;

            default:

                paymentInfo.style.display="none";

        }

    });

});
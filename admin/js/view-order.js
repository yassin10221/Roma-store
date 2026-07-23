// ======================================
// ROMA STORE
// VIEW ORDER
// ======================================

const db = window.supabaseClient;

const params = new URLSearchParams(window.location.search);

const orderId = params.get("id");

// ======================================
// LOAD ORDER
// ======================================

async function loadOrder(){

    try{

        // Order

        const { data:order, error } = await db

            .from("orders")

            .select("*")

            .eq("id", orderId)

            .single();

        if(error) throw error;

        document.getElementById("orderId").textContent =
            "#" + order.id;

        document.getElementById("orderDate").textContent =
            new Date(order.created_at)
            .toLocaleDateString();

        document.getElementById("customerName").textContent =
            order.customer_name;

        document.getElementById("customerEmail").textContent =
            order.customer_email;

        document.getElementById("customerPhone").textContent =
            order.phone;

        document.getElementById("customerAddress").textContent =
            order.address;

document.getElementById("orderTotal").textContent =
    Number(order.total).toLocaleString() + " EGP";

document.getElementById("subtotal").textContent =
    Number(order.subtotal || 0).toLocaleString() + " EGP";

document.getElementById("shipping").textContent =
    Number(order.shipping_cost || 0).toLocaleString() + " EGP";

document.getElementById("grandTotal").textContent =
    Number(order.total).toLocaleString() + " EGP";

document.getElementById("statusSelect").value =
    order.status;

// Shipping Method
document.getElementById("shippingMethod").textContent =
    order.shipping_method || "Home Delivery";

// Payment Method
document.getElementById("paymentMethod").textContent =
    order.payment_method || "Cash On Delivery";

        // ===============================
        // ORDER ITEMS
        // ===============================

        const { data:items, error:itemError } = await db

            .from("order_items")

            .select("*")

            .eq("order_id", orderId);
            console.log("Order ID:", orderId);
console.log("Items:", items);
console.log("Items Error:", itemError);

        if(itemError) throw itemError;

        const table =
            document.getElementById("productsTable");

        table.innerHTML = "";

        for(const item of items){
            console.log(item.image);
const { data:product } = await db

    .from("products")

    .select("name")

    .eq("id", item.product_id)

    .single();

// استخدم الصورة المحفوظة وقت الشراء
const image =
    item.image || "../assets/no-image.png";

            table.innerHTML += `

<tr>

<td>

<img src="${image}">

</td>

<td>

${product?.name || "Deleted Product"}

</td>

<td>

${Number(item.price).toLocaleString()} EGP

</td>

<td>

${item.quantity}

</td>

<td>

${Number(item.price * item.quantity)
.toLocaleString()} EGP

</td>

</tr>

`;

        }

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}

loadOrder();

// ======================================
// UPDATE STATUS
// ======================================

document

.getElementById("statusSelect")

.onchange = async function(){

    const status = this.value;

    const { error } = await db

        .from("orders")

        .update({

            status

        })

        .eq("id", orderId);

    if(error){

        alert(error.message);

        return;

    }

    alert("Status Updated");

}

// ======================================
// PRINT
// ======================================

document

.getElementById("printInvoice")

.onclick = function(){

    window.print();

}
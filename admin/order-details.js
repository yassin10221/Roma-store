const db = window.supabaseClient;

const params = new URLSearchParams(location.search);
const orderId = params.get("id");

loadOrder();

async function loadOrder(){

    const { data:order } = await db
    .from("orders")
    .select("*")
    .eq("id",orderId)
    .single();

    document.getElementById("customerInfo").innerHTML=`

<h3>${order.customer_name}</h3>

<p>Email : ${order.customer_email}</p>

<p>Phone : ${order.phone}</p>

<p>Address : ${order.address}</p>

<p>Status : ${order.status}</p>

<p>Total : ${order.total} EGP</p>

`;

    const { data:items } = await db
    .from("order_items")
    .select("*")
    .eq("order_id",orderId);

    const table=document.getElementById("itemsTable");

    table.innerHTML="";

    items.forEach(item=>{

        table.innerHTML+=`

<tr>

<td>${item.product_id}</td>

<td>${item.price}</td>

<td>${item.quantity}</td>

<td>${item.price*item.quantity}</td>

</tr>

`;

    });

}
window.viewOrder = function(id) {
    window.location.href = `order-details.html?id=${id}`;
};
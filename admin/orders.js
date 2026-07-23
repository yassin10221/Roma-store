console.log("ORDERS JS LOADED");

const db = window.supabaseClient;

const table = document.getElementById("ordersTable");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

let orders = [];

// =======================
// LOAD ORDERS
// =======================

async function loadOrders() {

    table.innerHTML = `
    <tr>
        <td colspan="7">Loading...</td>
    </tr>
    `;

    const { data, error } = await db

        .from("orders")

        .select("*")

        .order("created_at", { ascending:false });

    console.log(data);

    if(error){

        table.innerHTML = `
        <tr>
            <td colspan="7">
                ${error.message}
            </td>
        </tr>
        `;

        return;

    }

    orders = data;

    renderOrders(orders);

}

// =======================
// RENDER
// =======================

function renderOrders(list){

    if(!list.length){

        table.innerHTML=`
        <tr>
            <td colspan="7">
                No Orders
            </td>
        </tr>
        `;

        return;

    }

    table.innerHTML="";

    list.forEach(order=>{

        table.innerHTML += `

<tr>

<td>${order.id}</td>

<td>${order.customer_name}</td>

<td>${order.customer_email}</td>

<td>${order.total} EGP</td>

<td>

<select
onchange="changeStatus('${order.id}',this.value)">

<option
${order.status=="Pending"?"selected":""}>
Pending
</option>

<option
${order.status=="Processing"?"selected":""}>
Processing
</option>

<option
${order.status=="Shipped"?"selected":""}>
Shipped
</option>

<option
${order.status=="Delivered"?"selected":""}>
Delivered
</option>

<option
${order.status=="Cancelled"?"selected":""}>
Cancelled
</option>

</select>

</td>

<td>

${new Date(order.created_at)
.toLocaleDateString()}

</td>

<td>

<button
class="view"
onclick="viewOrder('${order.id}')">

View

</button>

<button
class="delete"
onclick="deleteOrder('${order.id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

// =======================
// SEARCH
// =======================

search.addEventListener("input",filterOrders);
statusFilter.addEventListener("change",filterOrders);

function filterOrders(){

    let result=[...orders];

    if(search.value){

        const key=search.value.toLowerCase();

        result=result.filter(order=>

            order.customer_name
            .toLowerCase()
            .includes(key)

            ||

            order.customer_email
            .toLowerCase()
            .includes(key)

            ||

            order.id
            .toString()
            .includes(key)

        );

    }

    if(statusFilter.value){

        result=result.filter(order=>

            order.status===statusFilter.value

        );

    }

    renderOrders(result);

}

// =======================
// CHANGE STATUS
// =======================

window.changeStatus = async function(id,status){

    const { error } = await db

        .from("orders")

        .update({

            status

        })

        .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

}

// =======================
// VIEW
// =======================

window.viewOrder=function(id){

    location.href=`view-order.html?id=${id}`;

}

// =======================
// DELETE
// =======================

window.deleteOrder = async function(id){

    if(!confirm("Delete Order?")) return;

    try{

        await db

            .from("order_items")

            .delete()

            .eq("order_id",id);

        const { error } = await db

            .from("orders")

            .delete()

            .eq("id",id);

        if(error) throw error;

        loadOrders();

    }

    catch(err){

        alert(err.message);

    }

}

loadOrders();
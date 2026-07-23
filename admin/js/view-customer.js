// =====================================
// VIEW CUSTOMER
// =====================================

const db = window.supabaseClient;

const params = new URLSearchParams(window.location.search);

const email = params.get("email");

async function loadCustomer(){

    try{

        const { data: orders, error } = await db

            .from("orders")

            .select("*")

            .eq("customer_email", email)

            .order("created_at", {
                ascending: false
            });

        if(error) throw error;

        if(!orders.length){

            alert("Customer Not Found");

            location.href = "customers.html";

            return;

        }

        const customer = orders[0];

        document.getElementById("customerName").textContent =
            customer.customer_name;

        document.getElementById("customerEmail").textContent =
            customer.customer_email;

        document.getElementById("customerPhone").textContent =
            customer.phone;

        document.getElementById("customerAddress").textContent =
            customer.address;

        document.getElementById("customerOrders").textContent =
            orders.length;

        let totalSpent = 0;

        const table =
            document.getElementById("ordersTable");

        table.innerHTML = "";

        orders.forEach((order,index)=>{

            totalSpent += Number(order.total);

            table.innerHTML += `

<tr>

<td>

${index+1}

</td>

<td>

${new Date(order.created_at)
.toLocaleDateString()}

</td>

<td>

${order.status}

</td>

<td>

${order.shipping_method || "Home Delivery"}

</td>

<td>

${Number(order.total)
.toLocaleString()} EGP

</td>

</tr>

`;

        });

        document.getElementById("customerSpent").textContent =

            totalSpent.toLocaleString() + " EGP";

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}

loadCustomer();
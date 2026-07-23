// =====================================
// ROMA STORE CUSTOMERS
// =====================================

const db = window.supabaseClient;

let customers = [];
let filteredCustomers = [];

// =====================================
// LOAD CUSTOMERS
// =====================================

async function loadCustomers(){

    try{

        const { data: orders, error } = await db

            .from("orders")

            .select("*")

            .order("created_at", { ascending:false });

        if(error) throw error;

        const map = {};

        let revenue = 0;

        orders.forEach(order=>{

            revenue += Number(order.total || 0);

            const key = order.customer_email;

            if(!map[key]){

                map[key] = {

                    name: order.customer_name,

                    email: order.customer_email,

                    phone: order.phone,

                    orders: 0,

                    total: 0

                };

            }

            map[key].orders++;

            map[key].total += Number(order.total);

        });

        customers = Object.values(map);

        filteredCustomers = [...customers];

        document.getElementById("customersCount").textContent =
            customers.length;

        document.getElementById("ordersCount").textContent =
            orders.length;

        document.getElementById("revenue").textContent =
            revenue.toLocaleString() + " EGP";

        renderCustomers();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}

loadCustomers();

// =====================================
// RENDER TABLE
// =====================================

function renderCustomers(){

    const table =
        document.getElementById("customersTable");

    table.innerHTML = "";

    if(filteredCustomers.length === 0){

        table.innerHTML = `
        <tr>

            <td colspan="6">

                No Customers Found

            </td>

        </tr>
        `;

        return;

    }

    filteredCustomers.forEach(customer=>{

        table.innerHTML += `

<tr>

<td>

${customer.name}

</td>

<td>

${customer.email}

</td>

<td>

${customer.phone}

</td>

<td>

${customer.orders}

</td>

<td>

${customer.total.toLocaleString()} EGP

</td>

<td>

<button
class="view-btn"
onclick="viewCustomer('${customer.email}')">

View

</button>

</td>

</tr>

`;

    });

}

// =====================================
// SEARCH
// =====================================

document

.getElementById("searchCustomer")

.addEventListener("input", function(){

    const keyword =
        this.value
        .toLowerCase()
        .trim();

    filteredCustomers = customers.filter(customer=>

        customer.name
        .toLowerCase()
        .includes(keyword)

        ||

        customer.email
        .toLowerCase()
        .includes(keyword)

        ||

        customer.phone
        .toLowerCase()
        .includes(keyword)

    );

    renderCustomers();

});

// =====================================
// VIEW CUSTOMER
// =====================================

window.viewCustomer = function(email){

    location.href =
    `view-customer.html?email=${encodeURIComponent(email)}`;

}
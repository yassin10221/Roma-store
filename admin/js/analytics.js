// ======================================
// ROMA STORE ANALYTICS
// ======================================

const db = window.supabaseClient;

let products = [];
let orders = [];
let orderItems = [];

loadAnalytics();

// ======================================
// LOAD
// ======================================

async function loadAnalytics(){

    try{

        const { data: productsData } =
        await db
        .from("products")
        .select("*");

        const { data: ordersData } =
        await db
        .from("orders")
        .select("*");

        const { data: itemsData } =
        await db
        .from("order_items")
        .select(`
            *,
            products(name)
        `);

        products = productsData || [];
        orders = ordersData || [];
        orderItems = itemsData || [];

        loadCards();

        drawSalesChart();

        drawCategoryChart();

        loadTopProducts();

    }

    catch(err){

        console.error(err);

    }

}

// ======================================
// TOP CARDS
// ======================================

function loadCards(){

    document.getElementById("totalProducts").innerText =
        products.length;

    document.getElementById("totalOrders").innerText =
        orders.length;

    const customers =
        [...new Set(
            orders.map(x=>x.customer_email)
        )];

    document.getElementById("totalCustomers").innerText =
        customers.length;

    let revenue = 0;

    orders.forEach(order=>{

        revenue += Number(order.total || 0);

    });

    document.getElementById("totalRevenue").innerText =
        revenue.toLocaleString() + " EGP";

}
// ======================================
// MONTHLY SALES CHART
// ======================================

function drawSalesChart(){

    const months = [

        "Jan","Feb","Mar","Apr","May","Jun",

        "Jul","Aug","Sep","Oct","Nov","Dec"

    ];

    const sales = new Array(12).fill(0);

    orders.forEach(order=>{

        const date = new Date(order.created_at);

        const month = date.getMonth();

        sales[month] += Number(order.total || 0);

    });

    new Chart(

        document.getElementById("salesChart"),

        {

            type:"bar",

            data:{

                labels:months,

                datasets:[{

                    label:"Revenue",

                    data:sales,

                    backgroundColor:"#111",

                    borderRadius:8

                }]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{

                        display:false

                    }

                }

            }

        }

    );

}

// ======================================
// CATEGORY CHART
// ======================================

function drawCategoryChart(){

    const categories = {};

    products.forEach(product=>{

        const cat = product.category || "Other";

        categories[cat] =

            (categories[cat] || 0) + 1;

    });

    new Chart(

        document.getElementById("categoryChart"),

        {

            type:"doughnut",

            data:{

                labels:Object.keys(categories),

                datasets:[{

                    data:Object.values(categories)

                }]

            },

            options:{

                responsive:true

            }

        }

    );

}

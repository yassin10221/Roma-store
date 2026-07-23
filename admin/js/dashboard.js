// =====================================
// ROMA STORE DASHBOARD
// =====================================

async function loadDashboard() {

    try {

        const { data: products, error } = await window.supabaseClient
.from("products")
.select(`
    *,
    product_images(*)
`)
            .order("id", { ascending: false });

        if (error) throw error;

        // ======================
        // Cards
        // ======================

        document.getElementById("productsCount").innerText =
            products.length;

// ======================
// Orders
// ======================

const {
    data: orders,
    error: ordersError
} = await window.supabaseClient
    .from("orders")
    .select("*");

const safeOrders = orders || [];

document.getElementById("ordersCount").innerText =
    safeOrders.length;

const customers = new Set();

let revenue = 0;

safeOrders.forEach(order => {

    customers.add(order.customer_email);

    revenue += Number(order.total || 0);

});

document.getElementById("customersCount").innerText =
    customers.size;

document.getElementById("revenue").innerText =
    revenue.toLocaleString() + " EGP";

if (ordersError) {

    console.error("Orders Error:", ordersError);

}


        // ======================
        // Products Table
        // ======================

        const table =
            document.getElementById("productsTable");

        table.innerHTML = "";

        products.forEach(product => {
            let image = "../assets/no-image.png";

if (product.product_images?.length) {

    image = product.product_images
        .sort((a,b)=>a.sort_order-b.sort_order)[0]
        .image_url;

}
else if(product.image){

    image = product.image;

}
            table.innerHTML += `

<tr>

<td>

<img src="${image}">

</td>

<td>${product.name}</td>

<td>${product.category || "-"}</td>

<td>${Number(product.price).toLocaleString()} EGP</td>

<td>${product.stock}</td>

<td>

<button
class="action-btn view"
onclick="window.open('../product.html?id=${product.id}')">

<i class="fa-solid fa-eye"></i>

</button>

<button
class="action-btn edit"
onclick="location.href='edit-product.html?id=${product.id}'">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="action-btn delete"
onclick="deleteProduct(${product.id})">

<i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`;

        });

        // ======================
        // Low Stock
        // ======================

        const lowStock =
            document.getElementById("lowStockTable");

        lowStock.innerHTML = "";

        products
            .filter(p => Number(p.stock) <= 5)
            .forEach(product => {

                lowStock.innerHTML += `

<tr>

<td>${product.name}</td>

<td style="color:red">

${product.stock}

</td>

</tr>

`;

            });

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

// =====================================
// DELETE PRODUCT
// =====================================

async function deleteProduct(id) {

    if (!confirm("Delete this product?"))
        return;

    try {

        // حذف الصور

        await window.supabaseClient

            .from("product_images")

            .delete()

            .eq("product_id", id);

        // حذف الـ Variants

        await window.supabaseClient

            .from("product_variants")

            .delete()

            .eq("product_id", id);

        // حذف المنتج

        const { error } = await window.supabaseClient

            .from("products")

            .delete()

            .eq("id", id);

        if (error) throw error;

        alert("Product Deleted Successfully");

        loadDashboard();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

loadDashboard();
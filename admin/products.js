console.log("PRODUCTS JS LOADED");

const db = window.supabaseClient;

const table = document.getElementById("productsTable");
const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const brandFilter = document.getElementById("brandFilter");
const sortFilter = document.getElementById("sortFilter");

let products = [];

// ===========================
// Load Products
// ===========================

async function loadProducts() {

    console.log("Loading products...");

const { data, error } = await db
.from("products")
.select(`
    *,
    product_images(*)
`)
.order("created_at", { ascending: false });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
        table.innerHTML = `
            <tr>
                <td colspan="8">${error.message}</td>
            </tr>
        `;
        return;
    }

products = data;
console.log("Products Loaded:", products);

fillBrands();

renderProducts(products);
console.log("Calling renderProducts...");
}

// ===========================
// Fill Brands
// ===========================

function fillBrands() {

    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

    brandFilter.innerHTML =
        `<option value="">All Brands</option>`;

    brands.forEach(brand => {

        brandFilter.innerHTML += `
        <option value="${brand}">
            ${brand}
        </option>
        `;

    });

}

// ===========================
// Render Products
// ===========================

function renderProducts(list) {
console.log("renderProducts works");
console.log(list);
    if (!list.length) {

        table.innerHTML = `
        <tr>
            <td colspan="8">
                No Products Found
            </td>
        </tr>
        `;

        return;

    }

    table.innerHTML = "";

list.forEach(product => {

    console.log(product.name, product.product_images);

    const image =
        product.product_images?.length
            ? product.product_images[0].image_url
            : (product.image || "../assets/no-image.png");

    let status = "in";
    let statusText = "In Stock";

    if (product.stock <= 0) {

        status = "out";
        statusText = "Out Of Stock";

    } else if (product.stock < 5) {

        status = "low";
        statusText = "Low Stock";

    }

    table.innerHTML += `
<tr>

<td>
<img src="${image}">
</td>

<td>${product.name}</td>

<td>${product.brand || "-"}</td>

<td>${product.price} EGP</td>

<td>${product.stock}</td>

<td>
<span class="status ${status}">
${statusText}
</span>
</td>

<td>
<span
class="featured"
onclick="toggleFeatured('${product.id}', ${product.featured})">
${product.featured ? "⭐" : "☆"}
</span>
</td>

<td class="actions">

<button
class="edit"
onclick="editProduct('${product.id}')">
Edit
</button>

<button
class="delete"
onclick="deleteProduct('${product.id}')">
Delete
</button>

</td>

</tr>
`;

}); 

function renderProducts(list) {

    if (!list.length) {
        table.innerHTML = `
            <tr>
                <td colspan="8">No Products Found</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = "";

    list.forEach(product => {

        const image =
            product.product_images?.length
                ? product.product_images[0].image_url
                : (product.image || "../assets/no-image.png");

        let status = "in";
        let statusText = "In Stock";

        if (product.stock <= 0) {
            status = "out";
            statusText = "Out OfStock";
        } else if (product.stock < 5) {
            status = "low";
            statusText = "Low Stock";
        }

        table.innerHTML += `
<tr>
<td><img src="${image}"></td>
<td>${product.name}</td>
<td>${product.brand || "-"}</td>
<td>${product.price} EGP</td>
<td>${product.stock}</td>
<td><span class="status ${status}">${statusText}</span></td>
<td>
<span class="featured"
onclick="toggleFeatured('${product.id}', ${product.featured})">
${product.featured ? "⭐" : "☆"}
</span>
</td>
<td class="actions">
<button class="edit" onclick="editProduct('${product.id}')">Edit</button>
<button class="delete" onclick="deleteProduct('${product.id}')">Delete</button>
</td>
</tr>
`;
    });
}

}

loadProducts();
// =====================================
// SEARCH
// =====================================

search.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
brandFilter.addEventListener("change", filterProducts);
sortFilter.addEventListener("change", filterProducts);

function filterProducts() {

    let result = [...products];

    // Search
    const keyword = search.value.toLowerCase().trim();

    if (keyword) {

        result = result.filter(product =>

            product.name.toLowerCase().includes(keyword) ||

            (product.brand || "")
            .toLowerCase()
            .includes(keyword)

        );

    }

    // Category
    if (categoryFilter.value) {

        result = result.filter(product =>

            product.category === categoryFilter.value

        );

    }

    // Brand
    if (brandFilter.value) {

        result = result.filter(product =>

            product.brand === brandFilter.value

        );

    }

    // Sort
    switch (sortFilter.value) {

        case "high":

            result.sort((a,b)=>b.price-a.price);

            break;

        case "low":

            result.sort((a,b)=>a.price-b.price);

            break;

        case "oldest":

            result.sort((a,b)=>

                new Date(a.created_at)-new Date(b.created_at)

            );

            break;

        default:

            result.sort((a,b)=>

                new Date(b.created_at)-new Date(a.created_at)

            );

    }

    renderProducts(result);

}

// =====================================
// FEATURED
// =====================================

window.toggleFeatured = async function(id,current){

    const { error } = await db

        .from("products")

        .update({

            featured: !current

        })

        .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

    loadProducts();

}

// =====================================
// EDIT
// =====================================

window.editProduct = function(id){

    location.href = `edit-product.html?id=${id}`;

}

// =====================================
// DELETE
// =====================================

window.deleteProduct = async function(id){

    if(!confirm("Delete this product?")) return;

    try{

        // صور المنتج

        const { data:images } = await db

            .from("product_images")

            .select("*")

            .eq("product_id",id);

        // حذف الصور من Storage

        if(images){

            const files = images.map(img=>

                img.image_url.split("/").pop()

            );

            if(files.length){

                await db.storage

                    .from("products")

                    .remove(files);

            }

        }

        // حذف الصور

        await db

            .from("product_images")

            .delete()

            .eq("product_id",id);

        // حذف الـ Variants

        await db

            .from("product_variants")

            .delete()

            .eq("product_id",id);

        // حذف المنتج

        const { error } = await db

            .from("products")

            .delete()

            .eq("id",id);

        if(error) throw error;

        loadProducts();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}
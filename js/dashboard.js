// ==========================================
// Roma Store Dashboard
// ==========================================

// عناصر الصفحة
const tableBody = document.getElementById("productsTable");
const searchInput = document.getElementById("search");

// جميع المنتجات
let products = [];

// ==========================================
// تشغيل الصفحة
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

});

// ==========================================
// تحميل المنتجات
// ==========================================

async function loadProducts(){

const { data, error } = await window.supabaseClient

    .from("products")

.select("*")

    .order("id", { ascending: false });

    console.log(data);
    if(error){

        console.error(error);

        alert(error.message);

        return;

    }

    products = data || [];

    renderProducts(products);

}
// ==========================================
// عرض المنتجات
// ==========================================

function renderProducts(list){

    tableBody.innerHTML = "";

    if(list.length===0){

        tableBody.innerHTML = `

            <tr>

                <td colspan="6">

                    No Products Found

                </td>

            </tr>

        `;

        return;

    }

    list.forEach(product=>{

let image = product.image;

if(!image || image.trim()===""){

    image = "https://placehold.co/70x70?text=No+Image";

}

        tableBody.innerHTML += `

        <tr>

            <td>

                <img src="${image}">

            </td>

            <td>

                ${product.name}

            </td>

            <td>

                ${product.category}

            </td>

            <td>

                ${product.price} EGP

            </td>

            <td>

                ${product.stock}

            </td>

            <td>

                <div class="action-buttons">

                    <button

                        class="edit-btn"

                        onclick="editProduct(${product.id})">

                        Edit

                    </button>

                    <button

                        class="delete-btn-table"

                        onclick="deleteProduct(${product.id})">

                        Delete

                    </button>

                </div>

            </td>

        </tr>

        `;

    });

}
// ==========================================
// Search
// ==========================================

searchInput.addEventListener("input", function () {

    const value = this.value.toLowerCase();

    const filtered = products.filter(product => {

        return (
            product.name.toLowerCase().includes(value) ||
            (product.category || "").toLowerCase().includes(value)
        );

    });

    renderProducts(filtered);

});

// ==========================================
// Edit Product
// ==========================================

function editProduct(id){

    window.location.href = `edit-product.html?id=${id}`;

}

// ==========================================
// Delete Product
// ==========================================

async function deleteProduct(id){

    const ok = confirm("Delete this product?");

    if(!ok) return;

    try{

        const { error } = await window.supabaseClient

            .from("products")

            .delete()

            .eq("id", id);

        if(error) throw error;

        products = products.filter(p => p.id !== id);

        renderProducts(products);

        alert("✅ Product Deleted");

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}
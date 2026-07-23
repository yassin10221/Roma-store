// ===============================
// ROMA STORE ADMIN
// ===============================

const table = document.getElementById("productsTable");

// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    const { data, error } = await window.supabaseClient
        .from("products")
        .select("*")
        .order("id", { ascending: false });

    if (error) {

        console.error(error);

        return;

    }

    table.innerHTML = "";

    data.forEach(product => {

        table.innerHTML += `

        <tr>

            <td>
                <img src="${product.image}" width="70">
            </td>

            <td>${product.name}</td>

            <td>${product.price} EGP</td>

            <td>

                <button
                    class="edit"
                    onclick="editProduct(${product.id})">

                    Edit

                </button>

            </td>

            <td>

                <button
                    class="delete"
                    onclick="deleteProduct(${product.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ===============================
// ADD PRODUCT
// ===============================

async function addProduct() {

    const product = {

        name: document.getElementById("name").value,

        description: document.getElementById("description").value,

        category: document.getElementById("category").value,

        price: Number(document.getElementById("price").value),

        old_price: Number(document.getElementById("old_price").value),

        stock: Number(document.getElementById("stock").value),

        image: document.getElementById("image").value

    };

    const { error } = await window.supabaseClient
        .from("products")
        .insert(product);

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    alert("Product Added Successfully ✅");

    document.querySelectorAll(".form input,.form textarea")
        .forEach(el => el.value = "");

    loadProducts();

}

// ===============================
// DELETE PRODUCT
// ===============================

async function deleteProduct(id) {

    if (!confirm("Delete this product?")) return;

    const { error } = await window.supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        return;

    }

    loadProducts();

}

// ===============================
// EDIT PRODUCT
// ===============================

async function editProduct(id) {

    const { data } = await window.supabaseClient
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (!data) return;

    document.getElementById("name").value = data.name;
    document.getElementById("description").value = data.description;
    document.getElementById("category").value = data.category;
    document.getElementById("price").value = data.price;
    document.getElementById("old_price").value = data.old_price;
    document.getElementById("stock").value = data.stock;
    document.getElementById("image").value = data.image;

    const btn = document.querySelector(".form button");

    btn.textContent = "Update Product";

    btn.onclick = async function () {

        const { error } = await window.supabaseClient
            .from("products")
            .update({

                name: document.getElementById("name").value,
                description: document.getElementById("description").value,
                category: document.getElementById("category").value,
                price: Number(document.getElementById("price").value),
                old_price: Number(document.getElementById("old_price").value),
                stock: Number(document.getElementById("stock").value),
                image: document.getElementById("image").value

            })
            .eq("id", id);

        if (error) {

            console.error(error);

            return;

        }

        alert("Updated Successfully ✅");

        btn.textContent = "Add Product";

        btn.onclick = addProduct;

        document.querySelectorAll(".form input,.form textarea")
            .forEach(el => el.value = "");

        loadProducts();

    };

}

// ===============================

loadProducts();
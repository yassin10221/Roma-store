// =====================================
// ROMA STORE - PRODUCTS (SUPABASE)
// =====================================

const productsContainer = document.getElementById("products-container");

async function loadProducts() {

    if (!productsContainer) return;

    productsContainer.innerHTML = `
        <div style="text-align:center;padding:40px;">
            Loading products...
        </div>
    `;

    try {

const { data: products, error } = await window.supabaseClient
    .from("products")
    .select(`
        *,
        product_images(*)
    `)
    .order("id", { ascending: false });

        if (error) throw error;

        productsContainer.innerHTML = "";

        if (!products || products.length === 0) {

            productsContainer.innerHTML = `
                <h2 style="text-align:center;padding:60px;">
                    No Products Found
                </h2>
            `;

            return;
        }

        products.forEach(product => {
            let image = "https://placehold.co/600x700?text=No+Image";

if (product.product_images?.length) {

    image = product.product_images
        .sort((a, b) => a.sort_order - b.sort_order)[0]
        .image_url;

}
else if (product.image) {

    image = product.image;

}
            const oldPrice = product.old_price || product.price;

            let discount = 0;

            if (oldPrice > product.price) {
                discount = Math.round(
                    ((oldPrice - product.price) / oldPrice) * 100
                );
            }
            product.image = image;
            productsContainer.innerHTML += `

<div class="product-card">

<div class="product-image">

    <a href="product.html?id=${product.id}">

<img
src="${image}"
    alt="${product.name}"
    loading="lazy"
>

    </a>

                    ${
                        discount > 0
                            ? `<span class="sale-badge">-${discount}%</span>`
                            : ""
                    }

                    <div class="product-actions">

                        <button
                            onclick='addToWishlist(${JSON.stringify(product)})'
                            title="Wishlist"
                        >
                            ❤️
                        </button>

                        <button
                            onclick="window.location.href='product.html?id=${product.id}'"
                            title="View"
                        >
                            👁️
                        </button>

                    </div>

                </div>

                <div class="product-info">

<p class="product-category">
    ${product.category || "Roma Store"}
</p>

<h3 class="product-name">

    <a href="product.html?id=${product.id}">
        ${product.name}
    </a>

</h3>

                    <div class="rating">
                        ⭐⭐⭐⭐⭐
                    </div>

                    <div class="price-box">

                        <span class="price">
                            ${Number(product.price).toLocaleString()} EGP
                        </span>

                        ${
                            product.old_price
                                ? `
                        <span class="old-price">
                            ${Number(product.old_price).toLocaleString()} EGP
                        </span>
                        `
                                : ""
                        }

                    </div>

                    <button
                        class="add-cart"
                        onclick='addToCart(${JSON.stringify(product)})'
                    >
                        Add To Cart
                    </button>

                </div>

            </div>

            `;

        });

    } catch (err) {

        console.error(err);

        productsContainer.innerHTML = `
            <h2 style="text-align:center;color:red;padding:50px;">
                Error Loading Products
            </h2>
        `;

    }

}

loadProducts();
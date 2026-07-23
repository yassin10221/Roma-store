/* ==========================================
   ROMA STORE - WISHLIST PAGE
========================================== */

const wishlistContainer = document.getElementById("wishlist-container");

function renderWishlist() {

    if (!wishlistContainer) return;

    const wishlist = getWishlist();

    if (wishlist.length === 0) {

        wishlistContainer.innerHTML = `

        <div class="empty-cart">

            <h2>Your Wishlist Is Empty</h2>

            <br>

            <a href="shop.html" class="add-cart">

                Continue Shopping

            </a>

        </div>

        `;

        return;

    }

    wishlistContainer.innerHTML = "";

    wishlist.forEach(product => {

        wishlistContainer.innerHTML += `

        <div class="product-card">

            <div class="product-image">

                <a href="product.html?id=${product.id}">

                    <img src="${product.image}" alt="${product.name}">

                </a>

            </div>

            <div class="product-info">

                <p>${product.category || "Roma Store"}</p>

                <h3>

                    <a href="product.html?id=${product.id}">

                        ${product.name}

                    </a>

                </h3>

                <div class="price-box">

                    <span class="price">

                        ${Number(product.price).toLocaleString()} EGP

                    </span>

                </div>

                <button
                    class="add-cart"
                    onclick="moveToCart(${product.id})">

                    Add To Cart

                </button>

                <br><br>

                <button
                    class="buy-now"
                    onclick="removeWishlistItem(${product.id})">

                    Remove

                </button>

            </div>

        </div>

        `;

    });

}

function removeWishlistItem(id) {

    let wishlist = getWishlist();

    wishlist = wishlist.filter(item => item.id != id);

    saveWishlist(wishlist);

    renderWishlist();

}

function moveToCart(id) {

    const wishlist = getWishlist();

    const product = wishlist.find(item => item.id == id);

    if (!product) return;

    addToCart(product);

    removeWishlistItem(id);

}

document.addEventListener("DOMContentLoaded", renderWishlist);
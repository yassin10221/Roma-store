/* ==========================================
   ROMA STORE - APP.JS
========================================== */

/* ===========================
   CART
=========================== */

function getCart() {

    return JSON.parse(localStorage.getItem("cart")) || [];

}

function saveCart(cart) {

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

}

function addToCart(product) {

    let cart = getCart();

    const existing = cart.find(item => item.id == product.id);

    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id: product.id,
            name: product.name,
            image: product.image,
            price: Number(product.price),
            quantity: 1,
            size: product.size || "",
            color: product.color || ""

        });

    }

    saveCart(cart);

    showToast("Product added to cart 🛒");

}

/* ===========================
   WISHLIST
=========================== */

function getWishlist() {

    return JSON.parse(localStorage.getItem("wishlist")) || [];

}

function saveWishlist(list) {

    localStorage.setItem("wishlist", JSON.stringify(list));

    updateWishlistCount();

}

function addToWishlist(product) {

    let wishlist = getWishlist();

    const index = wishlist.findIndex(item => item.id == product.id);

    if (index !== -1) {

        wishlist.splice(index, 1);

        saveWishlist(wishlist);

        showToast("Removed from wishlist ❤️");

        return;

    }

    wishlist.push({

        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        old_price: product.old_price || 0,
        category: product.category || ""

    });

    saveWishlist(wishlist);

    showToast("Added to wishlist ❤️");

}

/* ===========================
   COUNTERS
=========================== */

function updateCartCount() {

    const counter = document.getElementById("cart-count");

    if (!counter) return;

    let total = 0;

    getCart().forEach(item => {

        total += Number(item.quantity || 1);

    });

    counter.textContent = total;

}

function updateWishlistCount() {

    const counter = document.getElementById("wishlist-count");

    if (!counter) return;

    counter.textContent = getWishlist().length;

}

/* ===========================
   TOAST
=========================== */

function showToast(message) {

    let toast = document.getElementById("roma-toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "roma-toast";

        toast.style.position = "fixed";
        toast.style.right = "25px";
        toast.style.bottom = "25px";
        toast.style.background = "#111";
        toast.style.color = "#fff";
        toast.style.padding = "15px 25px";
        toast.style.borderRadius = "10px";
        toast.style.zIndex = "99999";
        toast.style.opacity = "0";
        toast.style.transition = ".3s";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.style.opacity = "1";

    setTimeout(() => {

        toast.style.opacity = "0";

    }, 2000);

}

/* ===========================
   INIT
=========================== */

document.addEventListener("DOMContentLoaded", () => {

    updateCartCount();

    updateWishlistCount();

});
// ===============================
// ROMA STORE - CART
// ===============================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("cart-items");
const totalElement = document.getElementById("cart-total");

function saveCartPage() {
    localStorage.setItem("cart", JSON.stringify(cart));

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}

function renderCart() {

    if (!cartContainer) return;

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <a href="shop.html" class="add-cart">
                    Continue Shopping
                </a>
            </div>
        `;

        totalElement.textContent = "0 EGP";
        return;
    }

    cartContainer.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {

        total += Number(item.price) * Number(item.quantity);

        cartContainer.innerHTML += `

        <div class="cart-item">

            <img src="${item.image}" class="cart-image">

            <div class="cart-info">

                <h3>${item.name}</h3>

                <p>${Number(item.price).toLocaleString()} EGP</p>

                <p>Size: ${item.size || "-"}</p>

                <p>Color: ${item.color || "-"}</p>

            </div>

            <div class="cart-actions">

                <button onclick="decreaseQuantity(${index})">-</button>

                <span>${item.quantity}</span>

                <button onclick="increaseQuantity(${index})">+</button>

                <br><br>

                <button onclick="removeItem(${index})">
                    Remove
                </button>

            </div>

        </div>

        `;

    });

    totalElement.textContent =
        total.toLocaleString() + " EGP";

}

function increaseQuantity(index){

    cart[index].quantity++;

    saveCartPage();

    renderCart();

}

function decreaseQuantity(index){

    if(cart[index].quantity > 1){

        cart[index].quantity--;

    }

    saveCartPage();

    renderCart();

}

function removeItem(index){

    cart.splice(index,1);

    saveCartPage();

    renderCart();

}

const checkoutBtn = document.getElementById("checkoutBtn");

if(checkoutBtn){

    checkoutBtn.onclick = () => {

    window.location.href = "checkout.html";

}

}

renderCart();
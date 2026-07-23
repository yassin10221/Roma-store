// ==========================================
// ROMA STORE PRODUCT
// ==========================================

const db = window.supabaseClient;

const params = new URLSearchParams(location.search);
const productId = params.get("id");

let product = null;
let images = [];
let quantity = 1;
let selectedSize = "";
let selectedColor = "";
let selectedImage = "";

// ==========================================
// LOAD PRODUCT
// ==========================================

async function loadProduct() {

    try {

        const { data, error } = await db

            .from("products")

            .select(`
                *,
                product_images(*)
            `)

            .eq("id", productId)

            .single();

        if (error) throw error;

        product = data;

        images = [];

        if (product.product_images?.length) {

            product.product_images
                .sort((a,b)=>a.sort_order-b.sort_order)
                .forEach(img=>images.push(img.image_url));

        }
        else if(product.image){

            images.push(product.image);

        }
        else{

            images.push("assets/no-image.png");

        }

        renderProduct();

        loadRelatedProducts();

    }

    catch(err){

        console.error(err);

    }

}

loadProduct();

// ==========================================
// RENDER PRODUCT
// ==========================================

function renderProduct(){

    document.title =
        product.name + " | Roma Store";

    document.getElementById("productName").textContent =
        product.name;

    document.getElementById("breadcrumbProduct").textContent =
        product.name;

    document.getElementById("productBrand").textContent =
        product.brand || "Roma Store";

    document.getElementById("productPrice").textContent =
        Number(product.price).toLocaleString() + " EGP";

    document.getElementById("oldPrice").textContent =
        product.old_price
        ? Number(product.old_price).toLocaleString()+" EGP"
        : "";

    document.getElementById("productDescription").textContent =
        product.description || "";
        document.getElementById("descriptionTab").textContent =
    product.description || "";

    document.getElementById("reviewCount").textContent =
        "("+(product.reviews||0)+" Reviews)";

    buildGallery();

    buildSizes();

    buildColors();

    setupQuantity();

}
// ==========================================
// GALLERY
// ==========================================

function buildGallery(){

    const main =
        document.getElementById("mainImage");

    const thumbs =
        document.getElementById("thumbnailImages");

    main.src = images[0];

selectedImage = images[0];

    thumbs.innerHTML = "";

    images.forEach((img,index)=>{

        thumbs.innerHTML += `

<img
src="${img}"
class="${index==0?'active':''}"
onclick="changeImage('${img}',this)">

`;

    });

}

window.changeImage = function(src, element){

    console.log("Image Changed:", src);

    selectedImage = src;

    document.getElementById("mainImage").src = src;

    document
        .querySelectorAll("#thumbnailImages img")
        .forEach(img => img.classList.remove("active"));

    element.classList.add("active");
}
// ==========================================
// BUILD SIZES
// ==========================================

function buildSizes(){

    const container =
        document.getElementById("sizesContainer");

    if(!container) return;

    container.innerHTML = "";

    let sizes = product.sizes || [];

    if(typeof sizes === "string"){

        try{

            sizes = JSON.parse(sizes);

        }catch{

            sizes = sizes
                .split(",")
                .map(x=>x.trim());

        }

    }

    if(!sizes.length){

        sizes = ["S","M","L","XL"];

    }

    sizes.forEach((size,index)=>{

        const btn =
            document.createElement("button");

        btn.textContent = size;

        if(index===0){

            btn.classList.add("active");

            selectedSize = size;

        }

        btn.onclick=()=>{

            document
            .querySelectorAll("#sizesContainer button")
            .forEach(x=>x.classList.remove("active"));

            btn.classList.add("active");

            selectedSize = size;

        }

        container.appendChild(btn);

    });

}

// ==========================================
// BUILD COLORS
// ==========================================

function buildColors(){

    const container =
        document.getElementById("colorsContainer");

    if(!container) return;

    container.innerHTML="";

    let colors = product.colors || [];

    if(typeof colors==="string"){

        try{

            colors=JSON.parse(colors);

        }catch{

            colors=colors
                .split(",")
                .map(x=>x.trim());

        }

    }

    if(!colors.length){

        colors=["Black","White"];

    }

    colors.forEach((color,index)=>{

        const span =
            document.createElement("span");

        span.className="color";

        span.style.background=color.toLowerCase();

        span.title=color;

        if(index===0){

            span.classList.add("active");

            selectedColor=color;

        }

        span.onclick=()=>{

            document
            .querySelectorAll(".color")
            .forEach(x=>x.classList.remove("active"));

            span.classList.add("active");

            selectedColor=color;

        }

        container.appendChild(span);

    });

}

// ==========================================
// QUANTITY
// ==========================================

function setupQuantity(){

    const input =
        document.getElementById("quantityInput");

    const plus =
        document.getElementById("plusBtn");

    const minus =
        document.getElementById("minusBtn");

    input.value = quantity;

    plus.onclick=()=>{

        quantity++;

        input.value=quantity;

    }

    minus.onclick=()=>{

        if(quantity>1){

            quantity--;

            input.value=quantity;

        }

    }

    input.onchange=()=>{

        quantity=parseInt(input.value)||1;

        if(quantity<1)
            quantity=1;

        input.value=quantity;

    }

}
// ==========================================
// ADD TO CART
// ==========================================

function addCurrentProductToCart(){

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];

const image =
    selectedImage ||
    images[0] ||
    "assets/no-image.png";

    const item = {

        id: product.id,

        name: product.name,

        image,

        price: Number(product.price),

        quantity,

        size: selectedSize,

        color: selectedColor

    };

const existing = cart.find(p =>

    p.id == item.id &&
    p.size == item.size &&
    p.color == item.color &&
    p.image == item.image

);

    if(existing){

        existing.quantity += quantity;

    }else{

        cart.push(item);

    }

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    if(typeof updateCartCount==="function"){

        updateCartCount();

    }

    showToast("✅ Added To Cart");

}

// ==========================================
// WISHLIST
// ==========================================

function addCurrentProductToWishlist(){

    let wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists =
        wishlist.find(x=>x.id==product.id);

    if(exists){

        showToast("Already In Wishlist");

        return;

    }

wishlist.push({

    id: product.id,

    name: product.name,

    image: selectedImage || images[0] || "assets/no-image.png",

    price: product.price

});

    localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

    );

    showToast("❤️ Added To Wishlist");

}

// ==========================================
// BUY NOW
// ==========================================

function buyNow(){

    const image =
        selectedImage ||
        images[0] ||
        "assets/no-image.png";

    const item = {

        id: product.id,

        name: product.name,

        image: image,

        price: Number(product.price),

        quantity: quantity,

        size: selectedSize,

        color: selectedColor

    };

    // Buy Now يشتري المنتج الحالي فقط
    localStorage.setItem(
        "cart",
        JSON.stringify([item])
    );

    window.location.href = "checkout.html";

}
// ==========================================
// TOAST
// ==========================================

function showToast(message){

    let toast =
        document.getElementById("roma-toast");

    if(!toast){

        toast=document.createElement("div");

        toast.id="roma-toast";

        toast.style.position="fixed";
        toast.style.bottom="30px";
        toast.style.right="30px";
        toast.style.background="#111";
        toast.style.color="#fff";
        toast.style.padding="15px 25px";
        toast.style.borderRadius="10px";
        toast.style.zIndex="99999";
        toast.style.transition=".3s";
        toast.style.opacity="0";

        document.body.appendChild(toast);

    }

    toast.innerHTML=message;

    toast.style.opacity="1";

    setTimeout(()=>{

        toast.style.opacity="0";

    },2500);

}

// ==========================================
// BUTTON EVENTS
// ==========================================

window.addEventListener("DOMContentLoaded",()=>{

    document
        .querySelector(".add-cart")
        ?.addEventListener(
            "click",
            addCurrentProductToCart
        );

    document
        .querySelector(".wishlist-btn")
        ?.addEventListener(
            "click",
            addCurrentProductToWishlist
        );

    document
        .querySelector(".buy-now")
        ?.addEventListener(
            "click",
            buyNow
        );

});
// ==========================================
// RELATED PRODUCTS
// ==========================================

async function loadRelatedProducts() {

    const container =
        document.getElementById("related-products");

    if (!container) return;

    try {

        const { data, error } = await db

            .from("products")

            .select(`
                *,
                product_images(*)
            `)

            .neq("id", product.id)

            .limit(4);

        if (error) throw error;

        container.innerHTML = "";

        data.forEach(item => {

            let image = "assets/no-image.png";

            if (item.product_images?.length) {

                image = item.product_images
                    .sort((a,b)=>a.sort_order-b.sort_order)[0]
                    .image_url;

            } else if (item.image) {

                image = item.image;

            }

            container.innerHTML += `

<div class="product-card">

    <div class="product-image">

        <img src="${image}" alt="${item.name}">

    </div>

    <div class="content">

        <h3>${item.name}</h3>

        <p>${item.brand || "Roma Store"}</p>

        <div class="price">

            ${Number(item.price).toLocaleString()} EGP

        </div>

        <br>

        <a
            href="product.html?id=${item.id}"
            class="add-cart">

            View Product

        </a>

    </div>

</div>

`;

        });

    }

    catch (err) {

        console.error(err);

    }

}
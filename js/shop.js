// ======================================
// ROMA STORE SHOP
// ======================================

const db = window.supabaseClient;

const productsContainer =
    document.getElementById("productsContainer");

const loading =
    document.getElementById("loading");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const brandFilter =
    document.getElementById("brandFilter");

const sortFilter =
    document.getElementById("sortFilter");

const featuredOnly =
    document.getElementById("featuredOnly");

const inStockOnly =
    document.getElementById("inStockOnly");

const priceRange =
    document.getElementById("priceRange");

const priceValue =
    document.getElementById("priceValue");

const productsCount =
    document.getElementById("productsCount");

let allProducts = [];
let filteredProducts = [];
const ITEMS_PER_PAGE = 12;

let currentPage = 1;

// ======================================
// LOAD PRODUCTS
// ======================================

async function loadProducts() {

    loading.style.display = "flex";

    try {

        const { data, error } = await db

            .from("products")

            .select(`
                *,
                product_images(*)
            `)

            .order("created_at", {
                ascending: false
            });

        if (error) throw error;

        allProducts = data;

        filteredProducts = [...allProducts];

        fillBrands();

        renderPagination();

renderCurrentPage();

    }

    catch (err) {

        console.error(err);

    }

    finally {

        loading.style.display = "none";

    }

}

loadProducts();

// ======================================
// FILL BRANDS
// ======================================

function fillBrands() {

    const brands =
        [...new Set(

            allProducts

                .map(x => x.brand)

                .filter(Boolean)

        )];

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

// ======================================
// RENDER PRODUCTS
// ======================================

function renderProducts(products){

    productsContainer.innerHTML="";

productsCount.innerHTML =
    `${filteredProducts.length} Products`;

    if(!products.length){

        productsContainer.innerHTML=

        `<h2>No Products Found</h2>`;

        return;

    }

    products.forEach(product=>{

        let image="assets/no-image.png";

        if(product.product_images?.length){

            image =
                product.product_images

                .sort((a,b)=>

                    a.sort_order-b.sort_order

                )[0]

                .image_url;

        }

        else if(product.image){

            image=product.image;

        }

        productsContainer.innerHTML += `
        <div class="product-card">

    <div class="product-image">

        <img
            src="${image}"
            alt="${product.name}">

        ${product.old_price ? `

        <span class="discount">

            ${Math.round(
                ((product.old_price-product.price)/
                product.old_price)*100
            )}% OFF

        </span>

        ` : ""}

        <div class="product-actions">

            <button
                onclick="addToWishlist(${product.id})">

                <i class="fa-regular fa-heart"></i>

            </button>

            <button
                onclick="quickView(${product.id})">

                <i class="fa fa-eye"></i>

            </button>

        </div>

    </div>

    <div class="product-info">

        <span class="brand">

            ${product.brand || "Roma Store"}

        </span>

        <h3>

            ${product.name}

        </h3>

        <div class="rating">

            ⭐⭐⭐⭐⭐

        </div>

        <div class="price-box">

            <span class="price">

                ${Number(product.price).toLocaleString()} EGP

            </span>

            ${product.old_price ? `

            <span class="old-price">

                ${Number(product.old_price).toLocaleString()} EGP

            </span>

            ` : ""}

        </div>

        <div class="card-buttons">

            <button

                class="add-cart"

                onclick="addToCart(${product.id})">

                <i class="fa fa-cart-shopping"></i>

                Add To Cart

            </button>

            <a

                href="product.html?id=${product.id}"

                class="view-product">

                View Product

            </a>

        </div>

    </div>

</div>

`;
    });

}
// ======================================
// SEARCH + FILTERS
// ======================================

searchInput.addEventListener("input",filterProducts);

categoryFilter.addEventListener("change",filterProducts);

brandFilter.addEventListener("change",filterProducts);

sortFilter.addEventListener("change",filterProducts);

featuredOnly.addEventListener("change",filterProducts);

inStockOnly.addEventListener("change",filterProducts);

priceRange.addEventListener("input",()=>{

    priceValue.innerHTML =
        priceRange.value + " EGP";

    filterProducts();

});
// ======================================
// FILTER PRODUCTS
// ======================================

function filterProducts(){

    filteredProducts=[...allProducts];

    // Search
    const keyword=
        searchInput.value
        .toLowerCase()
        .trim();

    if(keyword){

        filteredProducts=
            filteredProducts.filter(product=>

                product.name
                .toLowerCase()
                .includes(keyword)

                ||

                (product.brand||"")

                .toLowerCase()

                .includes(keyword)

            );

    }

    // Category

    if(categoryFilter.value){

        filteredProducts=

        filteredProducts.filter(product=>

            product.category===

            categoryFilter.value

        );

    }

    // Brand

    if(brandFilter.value){

        filteredProducts=

        filteredProducts.filter(product=>

            product.brand===

            brandFilter.value

        );

    }

    // Price

    filteredProducts=

    filteredProducts.filter(product=>

        Number(product.price)

        <=

        Number(priceRange.value)

    );

    // Featured

    if(featuredOnly.checked){

        filteredProducts=

        filteredProducts.filter(product=>

            product.featured

        );

    }

    // Stock

    if(inStockOnly.checked){

        filteredProducts=

        filteredProducts.filter(product=>

            product.stock>0

        );

    }

    // Sort

    switch(sortFilter.value){

        case "low":

            filteredProducts.sort(

                (a,b)=>a.price-b.price

            );

            break;

        case "high":

            filteredProducts.sort(

                (a,b)=>b.price-a.price

            );

            break;

        default:

            filteredProducts.sort(

                (a,b)=>

                new Date(b.created_at)

                -

                new Date(a.created_at)

            );

    }

currentPage = 1;

renderPagination();

renderCurrentPage();

}
// ======================================
// ADD TO CART
// ======================================

window.addToCart=function(id){

    const product=

    allProducts.find(x=>x.id==id);

    if(!product) return;

    let image="assets/no-image.png";

    if(product.product_images?.length){

        image=

        product.product_images[0]

        .image_url;

    }

    else if(product.image){

        image=product.image;

    }

    let cart=

    JSON.parse(

        localStorage.getItem("cart")

    ) || [];

    const existing=

    cart.find(item=>

        item.id==id

    );

    if(existing){

        existing.quantity++;

    }

    else{

        cart.push({

            id:product.id,

            name:product.name,

            image,

            price:Number(product.price),

            quantity:1,

            size:"",

            color:""

        });

    }

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    alert("Added To Cart");

}
// ======================================
// WISHLIST
// ======================================

window.addToWishlist=function(id){

    const product=

    allProducts.find(x=>x.id==id);

    if(!product) return;

    let wishlist=

    JSON.parse(

        localStorage.getItem("wishlist")

    ) || [];

    if(

        wishlist.find(x=>x.id==id)

    ){

        alert("Already In Wishlist");

        return;

    }

    wishlist.push(product);

    localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

    );

    alert("Added To Wishlist");

}
// ======================================
// QUICK VIEW
// ======================================

window.quickView = function(id){

    const product = allProducts.find(x => x.id == id);

    if(!product) return;

    let image = "assets/no-image.png";

    if(product.product_images?.length){

        image = product.product_images[0].image_url;

    }else if(product.image){

        image = product.image;

    }

    document.getElementById("quickViewContent").innerHTML = `

        <div class="quick-grid">

            <img src="${image}" class="quick-image">

            <div>

                <h2>${product.name}</h2>

                <p>${product.brand || "Roma Store"}</p>

                <h3>${Number(product.price).toLocaleString()} EGP</h3>

                <p>

                    ${product.description || ""}

                </p>

                <br>

                <button
                    onclick="addToCart(${product.id})"
                    class="add-cart">

                    Add To Cart

                </button>

                <a
                    href="product.html?id=${product.id}"
                    class="view-product">

                    View Product

                </a>

            </div>

        </div>

    `;

    document.getElementById("quickView")
        .classList.add("show");

}

window.onclick = function(e){

    const modal = document.getElementById("quickView");

    if(e.target === modal){

        modal.classList.remove("show");

    }


};
// ======================================
// PAGINATION
// ======================================

function renderCurrentPage(){

    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    const end = start + ITEMS_PER_PAGE;

    renderProducts(filteredProducts.slice(start, end));

}

function renderPagination(){

    const pages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const container = document.getElementById("pagination");

    container.innerHTML = "";

    for(let i = 1; i <= pages; i++){

        container.innerHTML += `
            <button
                class="${i === currentPage ? "active" : ""}"
                onclick="goPage(${i})">

                ${i}

            </button>
        `;

    }

}

window.goPage = function(page){

    currentPage = page;

currentPage = 1;

renderPagination();

renderCurrentPage();

}
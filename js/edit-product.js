// ==========================================
// Roma Store - Edit Product
// ==========================================

// قراءة ID المنتج من الرابط
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// عناصر الصفحة
const form = document.getElementById("editForm");

const currentImagesContainer =
document.getElementById("currentImages");

const previewContainer =
document.getElementById("preview");

const imageInput =
document.getElementById("images");

// متغيرات عامة
let currentImages = [];

let newImages = [];

// ==========================================
// تشغيل الصفحة
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    if (!productId) {

        alert("Product ID not found");

        window.location.href = "dashboard.html";

        return;

    }

    loadProduct();

});

// ==========================================
// تحميل المنتج
// ==========================================

async function loadProduct() {

    const { data, error } = await window.supabaseClient

        .from("products")

        .select("*")

        .eq("id", productId)

        .single();

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    fillForm(data);

    await loadImages();

}

// ==========================================
// تعبئة البيانات داخل الفورم
// ==========================================

function fillForm(product){

    document.getElementById("name").value =
    product.name || "";

    document.getElementById("category").value =
    product.category || "";

    document.getElementById("brand").value =
    product.brand || "";

    document.getElementById("price").value =
    product.price || 0;

    document.getElementById("oldPrice").value =
    product.old_price || 0;

    document.getElementById("stock").value =
    product.stock || 0;

    document.getElementById("description").value =
    product.description || "";

    document.getElementById("sizes").value =
    (product.sizes || []).join(",");

    document.getElementById("colors").value =
    (product.colors || []).join(",");

}
// ==========================================
// تحميل صور المنتج
// ==========================================

async function loadImages() {

    const { data, error } = await window.supabaseClient

        .from("product_images")

        .select("*")

        .eq("product_id", productId)

        .order("sort_order", { ascending: true });

    if (error) {

        console.error(error);

        return;

    }

    currentImages = data || [];

    renderCurrentImages();

}

// ==========================================
// عرض الصور الحالية
// ==========================================

function renderCurrentImages() {

    currentImagesContainer.innerHTML = "";

    if(currentImages.length === 0){

        currentImagesContainer.innerHTML =

        "<p>No images found.</p>";

        return;

    }

    currentImages.forEach(image => {

        const card = document.createElement("div");

        card.className = "image-card";

        card.innerHTML = `

            <img src="${image.image_url}" alt="Product Image">

            <button
                class="remove-image"
                data-id="${image.id}">

                <i class="fa-solid fa-trash"></i>

            </button>

        `;

        currentImagesContainer.appendChild(card);

    });

}
// ==========================================
// حذف صورة
// ==========================================

currentImagesContainer.addEventListener("click", async (e)=>{

    const btn = e.target.closest(".remove-image");

    if(!btn) return;

    const imageId = btn.dataset.id;

    if(!confirm("Delete this image?")) return;

    const { error } = await window.supabaseClient

        .from("product_images")

        .delete()

        .eq("id", imageId);

    if(error){

        alert(error.message);

        return;

    }

    loadImages();

});
// ==========================================
// اختيار صور جديدة
// ==========================================

imageInput.addEventListener("change", () => {

    newImages = [...imageInput.files];

    renderPreviewImages();

});

// ==========================================
// عرض معاينة الصور الجديدة
// ==========================================

function renderPreviewImages(){

    previewContainer.innerHTML = "";

    if(newImages.length === 0) return;

    newImages.forEach(file=>{

        const reader = new FileReader();

        reader.onload = function(e){

            const card = document.createElement("div");

            card.className = "image-card";

            card.innerHTML = `

                <img src="${e.target.result}" alt="Preview">

            `;

            previewContainer.appendChild(card);

        }

        reader.readAsDataURL(file);

    });

}
// ==========================================
// رفع الصور الجديدة إلى Supabase
// ==========================================

async function uploadNewImages(){

    if(newImages.length === 0) return;

    let order = currentImages.length;

    for(const file of newImages){

        const fileName =

            Date.now() +

            "-" +

            Math.random().toString(36).substring(2) +

            "-" +

            file.name;

        const { error: uploadError } =

        await window.supabaseClient.storage

        .from("products")

        .upload(fileName, file);

        if(uploadError){

            throw uploadError;

        }

        const { data } =

        window.supabaseClient.storage

        .from("products")

        .getPublicUrl(fileName);

        order++;

        await window.supabaseClient

        .from("product_images")

        .insert({

            product_id: productId,

            image_url: data.publicUrl,

            sort_order: order

        });

    }

}
// ==========================================
// حفظ التعديلات
// ==========================================

form.addEventListener("submit", saveProduct);

async function saveProduct(e){

    e.preventDefault();

    try{

        const product = {

            name: document.getElementById("name").value.trim(),

            category: document.getElementById("category").value,

            brand: document.getElementById("brand").value.trim(),

            price: Number(document.getElementById("price").value),

            old_price: Number(document.getElementById("oldPrice").value) || 0,

            stock: Number(document.getElementById("stock").value) || 0,

            description: document.getElementById("description").value.trim(),

            sizes: document.getElementById("sizes")
                .value
                .split(",")
                .map(s=>s.trim())
                .filter(Boolean),

            colors: document.getElementById("colors")
                .value
                .split(",")
                .map(c=>c.trim())
                .filter(Boolean)

        };

        // تحديث المنتج

        const { error } = await window.supabaseClient

            .from("products")

            .update(product)

            .eq("id", productId);

        if(error) throw error;

        // حذف الـ Variants القديمة

        await window.supabaseClient

            .from("product_variants")

            .delete()

            .eq("product_id", productId);

        // إنشاء Variants جديدة

        for(const color of product.colors){

            for(const size of product.sizes){

                await window.supabaseClient

                    .from("product_variants")

                    .insert({

                        product_id: productId,

                        color,

                        size,

                        quantity: product.stock

                    });

            }

        }

        // رفع الصور الجديدة

        await uploadNewImages();

        // إعادة تحميل الصور

        await loadImages();

        previewContainer.innerHTML = "";

        newImages = [];

        imageInput.value = "";

        alert("✅ Product Updated Successfully");

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}
// ==========================================
// حذف المنتج بالكامل
// ==========================================

document
.getElementById("deleteBtn")
.addEventListener("click", deleteProduct);

async function deleteProduct(){

    const ok = confirm(
        "Are you sure you want to delete this product?"
    );

    if(!ok) return;

    try{

        // تحميل صور المنتج

        const { data: images } = await window.supabaseClient

            .from("product_images")

            .select("*")

            .eq("product_id", productId);

        // حذف الصور من Storage

        if(images){

            for(const image of images){

                try{

                    const url = new URL(image.image_url);

                    const path = decodeURIComponent(

                        url.pathname.split("/object/public/products/")[1]

                    );

                    if(path){

                        await window.supabaseClient.storage

                        .from("products")

                        .remove([path]);

                    }

                }

                catch(err){

                    console.log(err);

                }

            }

        }

        // حذف الصور من قاعدة البيانات

        await window.supabaseClient

            .from("product_images")

            .delete()

            .eq("product_id", productId);

        // حذف الـ Variants

        await window.supabaseClient

            .from("product_variants")

            .delete()

            .eq("product_id", productId);

        // حذف المنتج

        const { error } = await window.supabaseClient

            .from("products")

            .delete()

            .eq("id", productId);

        if(error) throw error;

        alert("✅ Product Deleted Successfully");

        window.location.href="dashboard.html";

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}
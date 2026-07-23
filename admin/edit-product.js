const db = window.supabaseClient;

const params = new URLSearchParams(location.search);
const productId = params.get("id");

const nameInput = document.getElementById("name");
const brandInput = document.getElementById("brand");
const priceInput = document.getElementById("price");
const oldPriceInput = document.getElementById("oldPrice");
const stockInput = document.getElementById("stock");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");

const imagesContainer =
document.getElementById("preview");

const newImagesInput =
document.getElementById("images");

const saveBtn = document.getElementById("saveBtn");

let productImages = [];
let selectedFiles = [];

// =============================
// Load Product
// =============================

async function loadProduct() {

    const { data, error } = await db
        .from("products")
        .select(`
            *,
            product_images(*)
        `)
        .eq("id", productId)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    nameInput.value = data.name || "";
    brandInput.value = data.brand || "";
    priceInput.value = data.price || 0;
    oldPriceInput.value = data.old_price || 0;
    stockInput.value = data.stock || 0;
    categoryInput.value = data.category || "";
    descriptionInput.value = data.description || "";

    productImages = data.product_images || [];

    renderImages();
}

function renderImages() {

    imagesContainer.innerHTML = "";

    productImages.forEach(img => {

        imagesContainer.innerHTML += `

<div class="image-card">

<img src="${img.image_url}">

<button
class="delete-image"
onclick="deleteImage(${img.id})">

<i class="fa fa-trash"></i>

</button>

</div>

`;

    });

}

newImagesInput.addEventListener("change", () => {

    selectedFiles = Array.from(newImagesInput.files);

});

loadProduct();
// ======================================
// DELETE IMAGE
// ======================================

window.deleteImage = async function(imageId){

    if(!confirm("Delete this image?")) return;

    try{

        const image = productImages.find(x => x.id == imageId);

        if(!image) return;

        // استخراج اسم الملف من الرابط
        const fileName = image.image_url.split("/").pop();

        // حذف من Storage
        await db.storage
            .from("products")
            .remove([fileName]);

        // حذف من قاعدة البيانات
        const { error } = await db
            .from("product_images")
            .delete()
            .eq("id", imageId);

        if(error) throw error;

        productImages = productImages.filter(x => x.id != imageId);

        renderImages();

    }catch(err){

        console.error(err);

        alert(err.message);

    }

}

// ======================================
// SAVE PRODUCT
// ======================================

saveBtn.addEventListener("click", saveProduct);

async function saveProduct(){

    try{

        saveBtn.disabled = true;
        saveBtn.innerHTML = "Saving...";

        // تحديث بيانات المنتج
        const { error:updateError } = await db
            .from("products")
            .update({

                name: nameInput.value.trim(),

                brand: brandInput.value.trim(),

                category: categoryInput.value,

                price: Number(priceInput.value),

                old_price: Number(oldPriceInput.value),

                stock: Number(stockInput.value),

                description: descriptionInput.value.trim()

            })
            .eq("id", productId);

        if(updateError) throw updateError;

        // ===================================
        // Upload New Images
        // ===================================

        if(selectedFiles.length){

            let sortOrder = productImages.length + 1;

            for(const file of selectedFiles){

                const fileName =
                    Date.now() +
                    "-" +
                    Math.random().toString(36).substring(2) +
                    "-" +
                    file.name;

                const { error:uploadError } =
                    await db.storage
                    .from("products")
                    .upload(fileName,file);

                if(uploadError) throw uploadError;

                const { data } =
                    db.storage
                    .from("products")
                    .getPublicUrl(fileName);

                const { error:imageError } =
                    await db
                    .from("product_images")
                    .insert({

                        product_id: productId,

                        image_url: data.publicUrl,

                        sort_order: sortOrder++

                    });

                if(imageError) throw imageError;

            }

        }

        alert("✅ Product Updated Successfully");

        location.reload();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

    finally{

        saveBtn.disabled = false;

        saveBtn.innerHTML = "Save Changes";

    }

}
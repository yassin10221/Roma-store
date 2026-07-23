// ======================================
// ROMA STORE ADD PRODUCT
// ======================================

const db = window.supabaseClient;

const nameInput = document.getElementById("name");
const brandInput = document.getElementById("brand");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const oldPriceInput = document.getElementById("oldPrice");
const stockInput = document.getElementById("stock");
const sizesInput = document.getElementById("sizes");
const colorsInput = document.getElementById("colors");
const descriptionInput = document.getElementById("description");
const featuredInput = document.getElementById("featured");

const imagesInput = document.getElementById("images");
const preview = document.getElementById("preview");

const saveBtn = document.getElementById("saveBtn");

let selectedFiles = [];

// ===========================
// IMAGE PREVIEW
// ===========================

imagesInput.addEventListener("change", () => {

    selectedFiles = [...imagesInput.files];

    preview.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = function (e) {

            preview.innerHTML += `

<div class="preview-card">

<img src="${e.target.result}">

<button
class="remove"
onclick="removeImage(${index})">

×

</button>

</div>

`;

        };

        reader.readAsDataURL(file);

    });

});

// ===========================
// REMOVE IMAGE
// ===========================

window.removeImage = function(index){

    selectedFiles.splice(index,1);

    const dt = new DataTransfer();

    selectedFiles.forEach(file=>dt.items.add(file));

    imagesInput.files = dt.files;

    imagesInput.dispatchEvent(new Event("change"));

}

// ===========================
// SAVE PRODUCT
// ===========================

saveBtn.addEventListener("click", saveProduct);

async function saveProduct(){

    try{

        if(
            !nameInput.value ||
            !priceInput.value
        ){

            alert("Please fill required fields");

            return;

        }

        saveBtn.disabled = true;

        saveBtn.innerHTML = "Saving...";

        // ======================
        // CREATE PRODUCT
        // ======================

        const {data:product,error} = await db

        .from("products")

        .insert({

            name: nameInput.value.trim(),

            brand: brandInput.value.trim(),

            category: categoryInput.value,

            price: Number(priceInput.value),

            old_price: Number(oldPriceInput.value),

            stock: Number(stockInput.value),

            description: descriptionInput.value.trim(),

            sizes:
                sizesInput.value
                .split(",")
                .map(x=>x.trim()),

            colors:
                colorsInput.value
                .split(",")
                .map(x=>x.trim()),

            featured:
                featuredInput.checked

        })

        .select()

        .single();

        if(error) throw error;

        // ======================
        // UPLOAD IMAGES
        // ======================

        let order = 1;

        for(const file of selectedFiles){

            const fileName =
                Date.now() +
                "-" +
                Math.random().toString(36).substring(2) +
                "-" +
                file.name;

            const {error:uploadError} =

            await db.storage

            .from("products")

            .upload(fileName,file);

            if(uploadError)
                throw uploadError;

            const {data:url} =

            db.storage

            .from("products")

            .getPublicUrl(fileName);

            const {error:imageError} =

            await db

            .from("product_images")

            .insert({

                product_id: product.id,

                image_url: url.publicUrl,

                sort_order: order++

            });

            if(imageError)
                throw imageError;

        }

        alert("✅ Product Added Successfully");

        location.reload();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

    finally{

        saveBtn.disabled = false;

        saveBtn.innerHTML = "Save Product";

    }

}
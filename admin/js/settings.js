// ======================================
// ROMA STORE SETTINGS
// ======================================

const db = window.supabaseClient;

const saveBtn =
    document.getElementById("saveSettings");

loadSettings();

// ======================================
// LOAD SETTINGS
// ======================================

async function loadSettings(){

    try{

        const { data, error } = await db

            .from("settings")

            .select("*")

            .eq("id",1)

            .single();

        if(error){

            console.log(error);

            return;

        }

        document.getElementById("storeName").value =
            data.store_name || "";

        document.getElementById("storeEmail").value =
            data.store_email || "";

        document.getElementById("storePhone").value =
            data.phone || "";

        document.getElementById("storeAddress").value =
            data.address || "";

        document.getElementById("currency").value =
            data.currency || "EGP";

        document.getElementById("shippingPrice").value =
            data.shipping_price || 20;

        document.getElementById("freeShipping").value =
            data.free_shipping || 1500;

        document.getElementById("pickupEnabled").checked =
            data.pickup_enabled || false;

        document.getElementById("cod").checked =
            data.cod || false;

        document.getElementById("instapay").checked =
            data.instapay || false;

        document.getElementById("vodafone").checked =
            data.vodafone || false;

    }

    catch(err){

        console.error(err);

    }

}

// ======================================
// SAVE SETTINGS
// ======================================

saveBtn.onclick = saveSettings;

async function saveSettings(){

    saveBtn.disabled = true;

    saveBtn.innerHTML = "Saving...";

    try{

        const settings = {

            id:1,

            store_name:
                document.getElementById("storeName").value,

            store_email:
                document.getElementById("storeEmail").value,

            phone:
                document.getElementById("storePhone").value,

            address:
                document.getElementById("storeAddress").value,

            currency:
                document.getElementById("currency").value,

            shipping_price:
                Number(
                    document.getElementById("shippingPrice").value
                ),

            free_shipping:
                Number(
                    document.getElementById("freeShipping").value
                ),

            pickup_enabled:
                document.getElementById("pickupEnabled").checked,

            cod:
                document.getElementById("cod").checked,

            instapay:
                document.getElementById("instapay").checked,

            vodafone:
                document.getElementById("vodafone").checked

        };

        const { error } = await db

            .from("settings")

            .upsert(settings);

        if(error) throw error;

        alert("Settings Saved Successfully");

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

    finally{

        saveBtn.disabled = false;

        saveBtn.innerHTML = `

<i class="fa-solid fa-floppy-disk"></i>

Save Settings

`;

    }

}
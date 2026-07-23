async function testConnection() {
    const { data, error } = await supabaseClient
        .from("products")
        .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);
}

testConnection();
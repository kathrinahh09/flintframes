const supabaseUrl = "https://YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById("battleForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const wallet = document.getElementById("wallet").value;
    const statusMessage = document.getElementById("statusMessage");

    statusMessage.textContent = "Verifying NFTs... Please wait.";
    statusMessage.style.color = "blue";

    // **Step 1: Check if player already registered**
    let { data: existingPlayer } = await supabase
        .from("players")
        .select("wallet")
        .eq("wallet", wallet)
        .single();

    if (existingPlayer) {
        statusMessage.textContent = "❌ This wallet is already registered.";
        statusMessage.style.color = "red";
        return;
    }

    // **Step 2: Verify NFTs on OpenSea**
    let isNFTValid = await verifyFlintFramesNFT(wallet);
    if (!isNFTValid) {
        statusMessage.textContent = "❌ No FlintFrames NFTs found in your wallet.";
        statusMessage.style.color = "red";
        return;
    }

    // **Step 3: Store in Supabase**
    let { error } = await supabase.from("players").insert([
        { username, email, wallet, verified: false }
    ]);

    if (error) {
        statusMessage.textContent = "⚠️ Registration failed. Please try again.";
        statusMessage.style.color = "red";
    } else {
        statusMessage.textContent = "✅ Registration successful! Await verification.";
        statusMessage.style.color = "green";
    }
});

// **Function: Verify FlintFrames NFT**
async function verifyFlintFramesNFT(wallet) {
    let url = `https://api.opensea.io/api/v1/assets?owner=${wallet}&order_direction=desc&limit=10`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        let flintframesNFTs = data.assets.filter(asset => 
            asset.collection.slug === "flintframes"  // Ensure it's your NFT collection
        );

        return flintframesNFTs.length > 0;
    } catch (error) {
        console.error("Error fetching NFTs:", error);
        return false;
    }
}
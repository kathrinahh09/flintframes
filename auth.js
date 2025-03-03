const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ✅ Function to check if user is logged in
async function checkAuth() {
    const wallet = localStorage.getItem("wallet");
    if (!wallet) {
        alert("⚠️ Please log in first!");
        window.location.href = "Battle Registration.html";  // Redirect to login if not authenticated
    }
}

// ✅ Function to check if player is verified for Arena access
async function checkPlayerAccess() {
    const wallet = localStorage.getItem("wallet");

    if (!wallet) {
        alert("⚠️ Please register first!");
        window.location.href = "Battle Registration.html";
        return;
    }

    let { data: player, error } = await supabase
        .from("players")
        .select("verified")
        .eq("wallet", wallet)
        .single();

    if (error || !player || !player.verified) {
        alert("⚠️ Verification pending. You cannot enter the Arena yet.");
        window.location.href = "Battle Registration.html";
    } else {
        // ✅ Player is verified, allow access
        document.getElementById("arena-content").style.display = "block";
    }
}

// ✅ Call functions when the page loads
checkAuth();         // Ensure user is logged in
checkPlayerAccess(); // Ensure user is verified before entering Arena

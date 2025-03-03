const supabaseUrl = https://pukmiyeyaiphhpzlhefe.supabase.co;
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a21peWV5YWlwaGhwemxoZWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzkxMjMsImV4cCI6MjA1NjQxNTEyM30.gmoeJsHsp2qyDgsTuNhQRTBT5yrNgnKlseIQQg3yLvY;
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

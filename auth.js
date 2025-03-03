import { supabase } from "./config.js";

// ✅ Function to check if user is logged in
async function checkAuth() {
    const wallet = sessionStorage.getItem("wallet");  // ✅ Use sessionStorage instead of localStorage
    if (!wallet) {
        alert("⚠️ Please log in first!");
        window.location.href = "Battle Registration.html";
    }
}

// ✅ Function to check if player is verified for Arena access
async function checkPlayerAccess() {
    const wallet = sessionStorage.getItem("wallet");

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
        document.getElementById("arena-content").style.display = "block";
    }
}

checkAuth();
checkPlayerAccess();

import { supabase } from "./config.js";

document.getElementById("battleForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const wallet = document.getElementById("wallet").value;
    const nftLink = document.getElementById("nftLink").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const statusMessage = document.getElementById("statusMessage");

    statusMessage.textContent = "Submitting registration... Please wait.";
    statusMessage.style.color = "blue";
    
    if (password !== confirmPassword) {
        statusMessage.textContent = "❌ Passwords do not match!";
        statusMessage.style.color = "red";
        return;
    }

    let { data: existingPlayer, error: checkError } = await supabase
        .from("players")
        .select("wallet")
        .eq("wallet", wallet)
        .single();

    if (checkError) console.error("Check wallet error:", checkError);
    if (existingPlayer) {
        statusMessage.textContent = "❌ This wallet is already registered.";
        statusMessage.style.color = "red";
        return;
    }

    let { error: insertError } = await supabase.from("players").insert([
        {
            username,
            email,
            wallet,
            nft_link: nftLink,
            password,
            verified: false
        }
    ]);

    if (insertError) {
        console.error("Insert error:", insertError);
        statusMessage.textContent = "⚠️ Registration failed. Please try again.";
        statusMessage.style.color = "red";
    } else {
        localStorage.setItem("wallet", wallet);
        statusMessage.textContent = "✅ Registration submitted! Await manual verification.";
        statusMessage.style.color = "green";
    }
});

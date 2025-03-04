import { supabase } from "./config.js"; 

document.getElementById("battleForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const wallet = document.getElementById("wallet").value.trim();
    const nftLink = document.getElementById("nftLink").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const statusMessage = document.getElementById("statusMessage");

    statusMessage.textContent = "Submitting registration... Please wait.";
    statusMessage.style.color = "blue";

    // Password validation
    if (password !== confirmPassword) {
        statusMessage.textContent = "❌ Passwords do not match!";
        statusMessage.style.color = "red";
        return;
    }

    // Check if email or wallet is already registered
    const { data: existingPlayer, error: checkError } = await supabase
        .from("players")
        .select("id")
        .or(`email.eq.${email},wallet.eq.${wallet}`)
        .single();

    if (checkError && checkError.code !== "PGRST116") {
        console.error("Check error:", checkError);
        statusMessage.textContent = "⚠️ Registration failed. Try again later.";
        statusMessage.style.color = "red";
        return;
    }

    if (existingPlayer) {
        statusMessage.textContent = "❌ Email or Wallet is already registered.";
        statusMessage.style.color = "red";
        return;
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Insert user into Supabase
    const { error: insertError } = await supabase.from("players").insert([
        {
            username,
            email,
            wallet,
            nft_link: nftLink,
            password: hashedPassword,  // Store hashed password
            verified: false
        }
    ]);

    if (insertError) {
        console.error("Insert error:", insertError);
        statusMessage.textContent = "⚠️ Registration failed. Please try again.";
        statusMessage.style.color = "red";
    } else {
        localStorage.setItem("wallet", wallet);
        localStorage.setItem("email", email);
        statusMessage.textContent = "✅ Registration submitted! Await manual verification.";
        statusMessage.style.color = "green";

        // Redirect to login page
        setTimeout(() => {
            window.location.href = "arena.html";
        }, 2000);
    }
});

// Function to hash passwords securely
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

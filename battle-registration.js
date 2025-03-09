import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Initialize Supabase client
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

    // Validate input fields
    if (!username || !email || !wallet || !nftLink || !password || !confirmPassword) {
        statusMessage.textContent = "❌ All fields are required!";
        statusMessage.style.color = "red";
        return;
    }

    // Password validation
    if (password !== confirmPassword) {
        statusMessage.textContent = "❌ Passwords do not match!";
        statusMessage.style.color = "red";
        return;
    }

    if (password.length < 8) {
        statusMessage.textContent = "❌ Password must be at least 8 characters!";
        statusMessage.style.color = "red";
        return;
    }

    // Verify NFT ownership
    try {
        const response = await fetch("https://nft-verification-api.onrender.com/verify-nft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: wallet })
        });

        const data = await response.json();

        if (!data.verified) {
            statusMessage.textContent = "❌ NFT verification failed. You must own a FlintFrames NFT to register.";
            statusMessage.style.color = "red";
            return;
        }
    } catch (error) {
        console.error("Error verifying NFT:", error);
        statusMessage.textContent = "⚠️ Error verifying NFT. Please try again later.";
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
            password: hashedPassword,
            verified: true,
            created_at: new Date().toISOString()
        }
    ]);

    if (insertError) {
        console.error("Insert error:", insertError);
        statusMessage.textContent = "⚠️ Registration failed. Please try again.";
        statusMessage.style.color = "red";
    } else {
        localStorage.setItem("wallet", wallet);
        localStorage.setItem("email", email);
        statusMessage.textContent = "✅ Registration successful! Redirecting to Arena...";
        statusMessage.style.color = "green";

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

// Password visibility toggle (FIXED)
document.addEventListener("DOMContentLoaded", function () {
    function enablePasswordPeek(inputId, iconId) {
        const passwordField = document.getElementById(inputId);
        const eyeIcon = document.getElementById(iconId);

        // Show password when pressing the icon
        eyeIcon.addEventListener("mousedown", function () {
            passwordField.type = "text";
        });

        // Hide password when releasing the icon
        eyeIcon.addEventListener("mouseup", function () {
            passwordField.type = "password";
        });

        // Hide password if mouse leaves the icon (prevents getting stuck)
        eyeIcon.addEventListener("mouseleave", function () {
            passwordField.type = "password";
        });

        // Mobile support: Show password when tapping
        eyeIcon.addEventListener("touchstart", function (event) {
            event.preventDefault();
            passwordField.type = "text";
        });

        // Mobile support: Hide password when lifting finger
        eyeIcon.addEventListener("touchend", function () {
            passwordField.type = "password";
        });
    }

    enablePasswordPeek("password", "togglePassword");
    enablePasswordPeek("confirmPassword", "toggleConfirmPassword");
});

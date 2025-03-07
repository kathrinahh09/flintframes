import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

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

    // Password validation
    if (password !== confirmPassword) {
        statusMessage.textContent = "❌ Passwords do not match!";
        statusMessage.style.color = "red";
        return;
    }

    // Verify NFT ownership
    try {
        const response = await fetch("https://your-render-server-url.com/verify-nft", {
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
            password: hashedPassword, // Store hashed password
            verified: true // Automatically verified after NFT check
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

// Password visibility toggle
const togglePasswordVisibility = (inputId, iconId) => {
    const passwordField = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);

    eyeIcon.addEventListener("mousedown", () => {
        passwordField.type = "text";
    });
    eyeIcon.addEventListener("mouseup", () => {
        passwordField.type = "password";
    });
    eyeIcon.addEventListener("mouseleave", () => {
        passwordField.type = "password";
    });
};

// Apply to both password fields
togglePasswordVisibility("password", "togglePassword");
togglePasswordVisibility("confirmPassword", "toggleConfirmPassword");

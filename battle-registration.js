const supabaseUrl = https://pukmiyeyaiphhpzlhefe.supabase.co;
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a21peWV5YWlwaGhwemxoZWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzkxMjMsImV4cCI6MjA1NjQxNTEyM30.gmoeJsHsp2qyDgsTuNhQRTBT5yrNgnKlseIQQg3yLvY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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

    // **Password Confirmation Check**
    if (password !== confirmPassword) {
        statusMessage.textContent = "❌ Passwords do not match!";
        statusMessage.style.color = "red";
        return;
    }

    // **Check if wallet is already registered**
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

    // **Securely store the user’s details**
    let { error } = await supabase.from("players").insert([
        {
            username,
            email,
            wallet,
            nft_link: nftLink,
            password,  // 🔒 Ensure this is hashed in Supabase
            verified: false
        }
    ]);

    if (error) {
        statusMessage.textContent = "⚠️ Registration failed. Please try again.";
        statusMessage.style.color = "red";
    } else {
        // ✅ Store wallet in localStorage after successful registration
        localStorage.setItem("wallet", wallet);

        statusMessage.textContent = "✅ Registration submitted! Await manual verification.";
        statusMessage.style.color = "green";
    }
});

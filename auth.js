const supabaseUrl = https://pukmiyeyaiphhpzlhefe.supabase.co;
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a21peWV5YWlwaGhwemxoZWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzkxMjMsImV4cCI6MjA1NjQxNTEyM30.gmoeJsHsp2qyDgsTuNhQRTBT5yrNgnKlseIQQg3yLvY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function checkVerification() {
    let wallet = localStorage.getItem("wallet"); // Retrieve stored wallet
    const arenaLink = document.getElementById("arena-link");

    if (!wallet) {
        arenaLink.addEventListener("click", function (event) {
            event.preventDefault();
            alert("Only verified players can enter the Arena!");
        });
        return;
    }

    let { data: player } = await supabase
        .from("players")
        .select("verified")
        .eq("wallet", wallet)
        .single();

    if (!player) {
        // Unregistered player
        arenaLink.addEventListener("click", function (event) {
            event.preventDefault();
            alert("You are not registered. Please register first!");
        });
    } else if (!player.verified) {
        // Registered but not verified
        arenaLink.addEventListener("click", function (event) {
            event.preventDefault();
            alert("Your registration is pending verification. Please wait for approval.");
        });
    } else {
        // Verified player - Allow access
        arenaLink.addEventListener("click", function () {
            window.location.href = "arena.html";
        });
    }
}

// Run the verification check when the page loads
checkVerification();

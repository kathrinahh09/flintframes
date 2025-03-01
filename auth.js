async function checkVerification() {
    let wallet = localStorage.getItem("wallet"); // Store wallet after login
    const arenaLink = document.getElementById("arena-link");

    if (!wallet) {
        disableArenaLink(arenaLink);
        return;
    }

    let { data: player } = await supabase
        .from("players")
        .select("verified")
        .eq("wallet", wallet)
        .single();

    if (!player || !player.verified) {
        disableArenaLink(arenaLink);
    } else {
        arenaLink.addEventListener("click", function () {
            window.location.href = "arena.html";
        });
    }
}

function disableArenaLink(link) {
    link.style.opacity = "0.5";
    link.style.pointerEvents = "none";
    link.style.cursor = "not-allowed";
    alert("Only verified players can enter the Arena!");
}

checkVerification();
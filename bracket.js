async function fetchPlayers() {
    let { data: players, error } = await supabase
        .from('players')
        .select('id, username, nfts')
        .order('id', { ascending: true });

    if (error) return console.error("Error fetching players:", error);
    return players;
}

async function generateBracket() {
    let players = await fetchPlayers();
    let bracket = document.getElementById("bracket");

    if (players.length < 4) {
        bracket.innerHTML = "<p>Not enough players for a tournament!</p>";
        return;
    }

    let matchups = [];
    for (let i = 0; i < players.length; i += 2) {
        let match = {
            player1: players[i],
            player2: players[i + 1] || { username: "Bye" },
            winner: null
        };
        matchups.push(match);
    }

    matchups.forEach((match, index) => {
        let winner = determineWinner(match.player1, match.player2);
        match.winner = winner;

        let matchElement = document.createElement("div");
        matchElement.classList.add("match");
        matchElement.innerHTML = `
            <p>${match.player1.username} vs ${match.player2.username}</p>
            <strong>Winner: ${winner.username}</strong>
        `;
        bracket.appendChild(matchElement);
    });

    return matchups;
}

function determineWinner(player1, player2) {
    if (player2.username === "Bye") return player1;

    let player1Score = player1.nfts.reduce((sum, nft) => sum + nft.attributes.power, 0);
    let player2Score = player2.nfts.reduce((sum, nft) => sum + nft.attributes.power, 0);

    return player1Score > player2Score ? player1 : player2;
}

async function submitResults() {
    let matchups = await generateBracket();

    await supabase.from("results").insert(
        matchups.map(m => ({
            player1: m.player1.username,
            player2: m.player2.username,
            winner: m.winner.username
        }))
    );

    alert("Results submitted!");
    window.location.href = "results.html";
}

generateBracket();
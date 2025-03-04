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
            player2: players[i + 1] || { username: "Bye", nfts: [] },
            selectedCards: { player1: [], player2: [] },
            winner: null
        };
        matchups.push(match);
    }

    for (let match of matchups) {
        await selectBattleCards(match);
        let winner = determineWinner(match);
        match.winner = winner;

        let matchElement = document.createElement("div");
        matchElement.classList.add("match");
        matchElement.innerHTML = `
            <p>${match.player1.username} vs ${match.player2.username}</p>
            <strong>Winner: ${winner.username}</strong>
        `;
        bracket.appendChild(matchElement);
    }

    return matchups;
}

async function selectBattleCards(match) {
    if (match.player2.username === "Bye") {
        match.selectedCards.player1 = match.player1.nfts.slice(0, 3);
        return;
    }

    return new Promise((resolve) => {
        let countdown = 15;
        let countdownElement = document.createElement("div");
        countdownElement.classList.add("countdown");
        document.body.appendChild(countdownElement);

        let interval = setInterval(() => {
            countdownElement.innerText = `Time remaining: ${countdown} seconds`;
            countdown--;
            if (countdown < 0) {
                clearInterval(interval);
                document.body.removeChild(countdownElement);
                console.log("Time's up! Auto-selecting cards...");
                match.selectedCards.player1 = getRandomCards(match.player1.nfts);
                match.selectedCards.player2 = getRandomCards(match.player2.nfts);
                resolve();
            }
        }, 1000);
    });
}

function getRandomCards(nfts) {
    let shuffled = nfts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

function determineWinner(match) {
    if (match.player2.username === "Bye") return match.player1;

    let player1Score = match.selectedCards.player1.reduce((sum, nft) => sum + nft.attributes.power, 0);
    let player2Score = match.selectedCards.player2.reduce((sum, nft) => sum + nft.attributes.power, 0);

    return player1Score > player2Score ? match.player1 : match.player2;
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

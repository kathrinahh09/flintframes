async function fetchResults() {
    let { data: results, error } = await supabase
        .from("results")
        .select("*")
        .order("id", { ascending: true });

    if (error) return console.error("Error fetching results:", error);

    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = results.map((r, index) => `
        <p><strong>#${index + 1}</strong>: ${r.winner}</p>
    `).join("");
}

fetchResults();
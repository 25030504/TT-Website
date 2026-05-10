// ELEMENTOS
const searchInput = document.getElementById("searchInput");
const regionFilter = document.getElementById("regionFilter");
const players = document.querySelectorAll(".player");

// FUNCION PRINCIPAL
function filterPlayers() {
  const searchValue = searchInput.value.toLowerCase();
  const regionValue = regionFilter.value;

  players.forEach((player) => {
    const name = player.dataset.name;
    const region = player.dataset.region;

    const matchName = name.includes(searchValue);
    const matchRegion = regionValue === "all" || region === regionValue;

    if (matchName && matchRegion) {
      player.style.display = "block";
    } else {
      player.style.display = "none";
    }
  });
}

// EVENTOS
searchInput.addEventListener("input", filterPlayers);
regionFilter.addEventListener("change", filterPlayers);

const newsData = [
  {
    title: "Ma Long wins another title",
    description: "The legend continues dominating international competitions.",
    image: "../img/Ma-Long.jpg",
  },
  {
    title: "Hugo Calderano makes history",
    description: "Breaking records for Latin America in table tennis.",
    image: "../img/Hugo-Calderano.jpg",
  },
  {
    title: "New training techniques",
    description: "Players are evolving faster than ever.",
    image: "../img/strategies.jpg",
  },
  {
    title: "Next generation rising",
    description: "Young talents are changing the future of the sport.",
    image: "../img/topPlayers.webp",
  },
];

// ELEMENTOS
const container = document.getElementById("newsFeed");
const searchInput = document.getElementById("searchNews");
const noNews = document.getElementById("noNews");

// RENDER
function renderNews(data) {
  container.innerHTML = "";

  if (data.length === 0) {
    noNews.classList.remove("d-none");
    return;
  } else {
    noNews.classList.add("d-none");
  }

  data.forEach((news) => {
    const card = document.createElement("div");
    card.className = "news-card-horizontal";

    card.innerHTML = `
      <img src="${news.image}" />
      <div class="news-info">
        <h5>${news.title}</h5>
        <p>${news.description}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// SEARCH
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = newsData.filter((n) =>
    n.title.toLowerCase().includes(value),
  );

  renderNews(filtered);
});

// INIT
renderNews(newsData);

async function fetchNews() {
  const res = await fetch("http://localhost:8000/api/news");
  const data = await res.json();
  renderNews(data);
}

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
searchInput.addEventListener("input", async () => {
  const value = searchInput.value.toLowerCase();

  const res = await fetch("http://localhost:8000/api/news");
  const data = await res.json();

  const filtered = data.filter((n) => n.title.toLowerCase().includes(value) || n.description.toLowerCase().includes(value));

  renderNews(filtered);
});

// INIT
fetchNews();

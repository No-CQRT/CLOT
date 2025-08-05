const repoOwner = "No-CQRT";
const repoName = "clot";
const issuesUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
const postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const paginationContainer = document.getElementById("pagination");

let allPosts = [];
let currentPage = 1;
const postsPerPage = 5;

async function fetchIssues() {
  const response = await fetch(issuesUrl);
  const issues = await response.json();
  allPosts = issues.map(issue => ({
    title: issue.title,
    body: marked.parse(issue.body),
    labels: issue.labels.map(label => label.name),
    links: [...issue.body.matchAll(/https?:\/\/\S+/g)].map(match => match[0])
  }));
  populateCategories();
  renderPosts();
}

function populateCategories() {
  const categories = new Set();
  allPosts.forEach(post => post.labels.forEach(label => categories.add(label)));
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function renderPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  const filteredPosts = allPosts.filter(post =>
    (post.title.toLowerCase().includes(searchTerm) || post.body.toLowerCase().includes(searchTerm)) &&
    (selectedCategory === "" || post.labels.includes(selectedCategory))
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;
  const paginatedPosts = filteredPosts.slice(start, end);

  postsContainer.innerHTML = "";
  paginatedPosts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <div>${post.body}</div>
      <div>${post.links.map(link => `<a href="${link}" target="_blank">${link}</a>`).join(", ")}</div>
      <div>${post.labels.map(label => `<span class="category-label">${label}</span>`).join("")}</div>
    `;
    postsContainer.appendChild(postDiv);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => {
      currentPage = i;
      renderPosts();
    };
    paginationContainer.appendChild(btn);
  }
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderPosts();
});
categoryFilter.addEventListener("change", () => {
  currentPage = 1;
  renderPosts();
});

fetchIssues();

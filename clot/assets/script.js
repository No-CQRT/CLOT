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
    body: issue.body,
    labels: issue.labels.map(label => label.name)
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
  const paginatedPosts = filteredPosts.slice(start, start + postsPerPage);

  postsContainer.innerHTML = "";
  paginatedPosts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.className = "bg-white p-4 rounded shadow mb-4";

    const title = document.createElement("h2");
    title.className = "text-xl font-bold mb-2";
    title.textContent = post.title;

    const body = document.createElement("div");
    body.className = "prose";
    body.innerHTML = marked.parse(post.body); // Markdown rendering

    const categories = document.createElement("div");
    categories.className = "mt-2 text-sm text-gray-600";
    categories.textContent = `Categories: ${post.labels.join(", ")}`;

    postDiv.appendChild(title);
    postDiv.appendChild(body);
    postDiv.appendChild(categories);
    postsContainer.appendChild(postDiv);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded ${i === currentPage ? "bg-blue-500 text-white" : ""}`;
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

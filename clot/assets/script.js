const repoOwner = "No-CQRT";
const repoName = "clot";
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let allPosts = [];

async function fetchIssues() {
  const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`);
  const issues = await response.json();
  allPosts = issues.map(issue => {
    const links = issue.body.match(/https?:\/\/\S+/g) || [];
    return {
      title: issue.title,
      body: issue.body,
      links: links,
      labels: issue.labels.map(label => label.name)
    };
  });
  populateCategories();
  renderPosts();
}

function populateCategories() {
  const categories = new Set();
  allPosts.forEach(post => post.labels.forEach(label => categories.add(label)));
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function renderPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  postsContainer.innerHTML = "";

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = post.body.toLowerCase().includes(searchTerm) || post.title.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === "" || post.labels.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  filteredPosts.forEach(post => {
    const postEl = document.createElement("div");
    postEl.className = "bg-white p-4 rounded shadow";
    postEl.innerHTML = `
      <h2 class="text-2xl font-semibold">${post.title}</h2>
      <p class="mt-2">${post.body}</p>
      <div class="mt-2">
        ${post.links.map(link => `<a href="${link}" class="text-blue-500 underline block">${link}</a>`).join("")}
      </div>
      <div class="mt-2 text-sm text-gray-600">Categories: ${post.labels.join(", ")}</div>
    `;
    postsContainer.appendChild(postEl);
  });
}

searchInput.addEventListener("input", renderPosts);
categoryFilter.addEventListener("change", renderPosts);

fetchIssues();

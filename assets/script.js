
const repoOwner = "No-CQRT";
const repoName = "clot";
const issuesApi = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;

let allPosts = [];
let currentPage = 1;
const postsPerPage = 5;
let selectedTags = [];

function fetchIssues() {
  fetch(issuesApi)
    .then(response => response.json())
    .then(data => {
      allPosts = data.map(issue => ({
        title: issue.title,
        body: marked(issue.body),
        labels: issue.labels.map(label => label.name),
        links: extractLinks(issue.body)
      }));
      renderTagFilters();
      renderTagCloud();
      renderPosts();
    });
}

function extractLinks(text) {
  const regex = /(https?:\/\/[^\s]+)/g;
  return text.match(regex) || [];
}

function renderTagFilters() {
  const tagSet = new Set();
  allPosts.forEach(post => post.labels.forEach(label => tagSet.add(label)));
  const container = document.getElementById("tagFilters");
  container.innerHTML = "";
  tagSet.forEach(tag => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = tag;
    checkbox.id = `tag-${tag}`;
    checkbox.addEventListener("change", () => {
      selectedTags = Array.from(document.querySelectorAll("#tagFilters input:checked")).map(cb => cb.value);
      currentPage = 1;
      renderPosts();
    });
    const label = document.createElement("label");
    label.htmlFor = `tag-${tag}`;
    label.textContent = tag;
    label.className = "mr-4";
    container.appendChild(checkbox);
    container.appendChild(label);
  });
}

function renderTagCloud() {
  const tagFrequency = {};
  allPosts.forEach(post => {
    post.labels.forEach(label => {
      tagFrequency[label] = (tagFrequency[label] || 0) + 1;
    });
  });
  const container = document.getElementById("tagCloud");
  container.innerHTML = "";
  Object.entries(tagFrequency).forEach(([tag, count]) => {
    const span = document.createElement("span");
    span.textContent = tag;
    span.style.fontSize = `${12 + count * 2}px`;
    span.addEventListener("click", () => {
      document.querySelector(`#tag-${tag}`).checked = true;
      selectedTags.push(tag);
      currentPage = 1;
      renderPosts();
    });
    container.appendChild(span);
  });
}

function renderPosts() {
  const container = document.getElementById("posts");
  container.innerHTML = "";
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  let filteredPosts = allPosts.filter(post =>
    (selectedTags.length === 0 || selectedTags.every(tag => post.labels.includes(tag))) &&
    (post.title.toLowerCase().includes(searchTerm) || post.body.toLowerCase().includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const start = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(start, start + postsPerPage);

  paginatedPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post mb-4";
    div.innerHTML = `<h2 class="text-xl font-bold">${post.title}</h2>
                     <div>${post.body}</div>
                     <div class="mt-2">${post.links.map(link => `<a href="${link}" target="_blank">${link}</a>`).join(", ")}</div>
                     <div class="mt-2">${post.labels.map(label => `<span class="category-label">${label}</span>`).join(" ")}</div>`;
    container.appendChild(div);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPosts();
    });
    container.appendChild(btn);
  }
}

document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  renderPosts();
});

fetchIssues();

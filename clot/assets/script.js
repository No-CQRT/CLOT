const repo = "No-CQRT/clot";
const postsPerPage = 5;
let allPosts = [];
let currentPage = 1;

async function fetchIssues() {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`);
  const issues = await res.json();
  allPosts = issues.map(issue => ({
    title: issue.title,
    body: issue.body,
    labels: issue.labels.map(l => l.name),
    links: [...issue.body.matchAll(/https?:\/\/\S+/g)].map(m => m[0])
  }));
  populateCategories();
  renderPosts();
}

function populateCategories() {
  const categories = new Set(allPosts.flatMap(post => post.labels));
  const filter = document.getElementById("categoryFilter");
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
}

function renderPosts() {
  const container = document.getElementById("postsContainer");
  container.innerHTML = "";
  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  const filtered = allPosts.filter(post =>
    (post.title.toLowerCase().includes(search) || post.body.toLowerCase().includes(search)) &&
    (category === "" || post.labels.includes(category))
  );

  const totalPages = Math.ceil(filtered.length / postsPerPage);
  const start = (currentPage - 1) * postsPerPage;
  const paginated = filtered.slice(start, start + postsPerPage);

  paginated.forEach(post => {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded shadow";
    div.innerHTML = `
      <h2 class="text-xl font-bold cursor-pointer text-blue-600 hover:underline" onclick="openModal('${post.title}', \`${marked.parse(post.body)}\`)">${post.title}</h2>
      <p>${post.links.map(link => `<a href="${link}" class="text-blue-500 underline">${link}</a>`).join(", ")}</p>
      <p class="text-sm text-gray-600">Category: ${post.labels.join(", ")}</p>
    `;
    container.appendChild(div);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded ${i === currentPage ? "bg-blue-500 text-white" : ""}`;
    btn.onclick = () => {
      currentPage = i;
      renderPosts();
    };
    pagination.appendChild(btn);
  }
}

function openModal(title, content) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalContent").innerHTML = content;
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal").classList.add("flex");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("modal").classList.remove("flex");
}

document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  renderPosts();
});
document.getElementById("categoryFilter").addEventListener("change", () => {
  currentPage = 1;
  renderPosts();
});

fetchIssues();

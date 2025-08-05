async function fetchIssues() {
  const response = await fetch('https://api.github.com/repos/No-CQRT/clot/issues');
  const issues = await response.json();
  const container = document.getElementById('posts');
  issues.forEach(issue => {
    const post = document.createElement('div');
    post.className = 'bg-white p-4 rounded shadow';
    const links = issue.body.match(/https?:\/\/[^\s]+/g) || [];
    post.innerHTML = `
      <h2 class="text-2xl font-semibold">${issue.title}</h2>
      <p class="mt-2">${issue.body}</p>
      ${links.length ? '<ul class="mt-2 list-disc list-inside">' + links.map(link => `<li><a href="${link}" class="text-blue-600 underline">${link}</a></li>`).join('') + '</ul>' : ''}
      ${issue.labels.length ? '<p class="mt-2 text-sm text-gray-600">Category: ' + issue.labels.map(label => label.name).join(', ') + '</p>' : ''}
    `;
    container.appendChild(post);
  });
}
fetchIssues();
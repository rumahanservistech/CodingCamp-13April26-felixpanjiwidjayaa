// ELEMENT
const form = document.getElementById("form");
const list = document.getElementById("list");
const totalEl = document.getElementById("total");

const categorySelect = document.getElementById("category");
const newCategoryInput = document.getElementById("newCategory");

const limitInput = document.getElementById("limit");
const setLimitBtn = document.getElementById("setLimit");

const toggleBtn = document.getElementById("toggleMode");

const totalDisplay = document.getElementById("totalDisplay");
const limitDisplay = document.getElementById("limitDisplay");

// DATA
let data = JSON.parse(localStorage.getItem("transactions")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Food", "Transport", "Fun"];
let limit = Number(localStorage.getItem("limit")) || 0;
let darkMode = localStorage.getItem("darkMode") === "true";

// INIT LIMIT INPUT
if (limitInput) {
  limitInput.value = limit || "";
}

// DARK MODE INIT
if (darkMode) document.body.classList.add("dark");

// TOGGLE MODE
if (toggleBtn) {
  toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  };
}

// RENDER CATEGORY
function renderCategories() {
  if (!categorySelect) return;

  categorySelect.innerHTML = `<option value="">Select Category</option>`;
  categories.forEach(cat => {
    categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}
renderCategories();

// FORM SUBMIT
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let amount = document.getElementById("amount").value;
    let category = categorySelect.value;
    let newCategory = newCategoryInput ? newCategoryInput.value : "";

    // ADD CUSTOM CATEGORY
    if (newCategory) {
      if (!categories.includes(newCategory)) {
        categories.push(newCategory);
        localStorage.setItem("categories", JSON.stringify(categories));
      }
      renderCategories();
      category = newCategory;
    }

    if (!name || !amount || !category) {
      alert("Please fill all fields");
      return;
    }

    data.push({
      name,
      amount: Number(amount),
      category
    });

    update();
    form.reset();
  });
}

// SET LIMIT BUTTON
if (setLimitBtn && limitInput) {
  setLimitBtn.onclick = () => {
    limit = Number(limitInput.value);
    localStorage.setItem("limit", limit);
    updateTotal();
    renderList();
  };
}

// UPDATE ALL
function update() {
  localStorage.setItem("transactions", JSON.stringify(data));
  renderList();
  updateTotal();
  updateChart();
}

// RENDER LIST
function renderList() {
  if (!list) return;

  list.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");

    // HIGHLIGHT LIMIT
    if (limit && item.amount > limit) {
      li.classList.add("warning");
    }

    li.innerHTML = `
      ${item.name} - $ ${item.amount} (${item.category})
      <span class="delete" onclick="deleteItem(${index})">Delete</span>
    `;

    list.appendChild(li);
  });
}

// DELETE
function deleteItem(index) {
  const confirmDelete = confirm(`Delete "${data[index].name}"?`);
  if (confirmDelete) {
    data.splice(index, 1);
    update();
  }
}

// UPDATE TOTAL + COLOR
function updateTotal() {
  const total = data.reduce((acc, item) => acc + item.amount, 0);

  if (totalEl) totalEl.innerText = total;
  if (limitDisplay) limitDisplay.innerText = limit ? `/ ${limit}` : "";

  if (!totalDisplay) return;

  totalDisplay.classList.remove("total-safe", "total-danger");

  if (limit && total > limit) {
    totalDisplay.classList.add("total-danger");
  } else {
    totalDisplay.classList.add("total-safe");
  }
}

// CHART
let chart;
function updateChart() {
  const canvas = document.getElementById("chart");
  if (!canvas) return;

  let categoryTotals = {};

  categories.forEach(cat => categoryTotals[cat] = 0);

  data.forEach(item => {
    categoryTotals[item.category] += item.amount;
  });

  const ctx = canvas.getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals)
      }]
    }
  });
}

// INIT
update();
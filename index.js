// ================= STATE =================
const state = {
transactions: [
{ id: 1, amount: 500, category: "Food", type: "expense", date: "2026-04-01" },
{ id: 2, amount: 2000, category: "Salary", type: "income", date: "2026-04-02" },
{ id: 3, amount: 800, category: "Shopping", type: "expense", date: "2026-04-03" }
],
filters: {
search: "",
type: ""
},
role: "viewer"
};
// ================= LOAD FROM STORAGE =================
const savedData = localStorage.getItem("transactions");

if (savedData) {
  state.transactions = JSON.parse(savedData);
}
// ================= SELECTORS =================
const tableBody = document.getElementById("transactionsTable");
const roleSelect = document.getElementById("roleSelect");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const resetBtn = document.getElementById("resetBtn");
const addBtn = document.getElementById("addBtn");
const insightsContainer = document.getElementById("insightsContent");
document.querySelector(".avatar").textContent = state.role === "admin" ? "A" : "V";
// ================= RENDER TRANSACTIONS =================
function renderTransactions() {
tableBody.innerHTML = "";

const filtered = state.transactions.filter(t =>
t.category.toLowerCase().includes(state.filters.search.toLowerCase()) &&
(state.filters.type === "" || t.type === state.filters.type)
);

if (filtered.length === 0) {
tableBody.innerHTML = `
  <tr>
    <td colspan="4" style="text-align:center; opacity:0.6;">
      No transactions yet
    </td>
  </tr>
`;
return;
}

filtered.forEach(t => {
const row = document.createElement("tr");


row.innerHTML = `
  <td>${t.date}</td>
  <td>${t.category}</td>
  <td>₹${t.amount}</td>
  <td>${t.type}</td>
  <td>
    ${state.role === "admin" 
      ? `<button onclick="deleteTransaction(${t.id})">❌</button>` 
      : ""}
  </td>
`;
tableBody.appendChild(row);

});
//============delete transaction=================
}
function deleteTransaction(id) {
  const confirmDelete = confirm("Delete this transaction?");
  if (!confirmDelete) return;

  state.transactions = state.transactions.filter(t => t.id !== id);

  renderAll();
}
// ================= SUMMARY =================
function updateSummary() {
let income = 0;
let expenses = 0;

state.transactions.forEach(t => {
if (t.type === "income") income += t.amount;
else expenses += t.amount;
});

document.getElementById("income").textContent = `₹${income}`;
document.getElementById("expenses").textContent = `₹${expenses}`;
document.getElementById("balance").textContent = `₹${income - expenses}`;
}

// ================= INSIGHTS =================
function renderInsights() {
if (state.transactions.length === 0) {
insightsContainer.innerHTML = "<p>No insights available</p>";
return;
}

const categoryMap = {};

state.transactions.forEach(t => {
if (t.type === "expense") {
categoryMap[t.category] =
(categoryMap[t.category] || 0) + t.amount;
}
});

const topCategory = Object.entries(categoryMap)
.sort((a, b) => b[1] - a[1])[0];

const totalAmount = state.transactions.reduce(
(sum, t) => sum + t.amount,
0
);
const expenses = state.transactions
  .filter(t => t.type === "expense")
  .reduce((sum, t) => sum + t.amount, 0);

const income = state.transactions
  .filter(t => t.type === "income")
  .reduce((sum, t) => sum + t.amount, 0);

const insightMsg = income > expenses
  ? "You're saving money 💰"
  : "Spending is higher than income ⚠️";

insightsContainer.innerHTML = `     <p><strong>Top Category:</strong> ${topCategory ? topCategory[0] : "N/A"}</p>     <p><strong>Total Transactions:</strong> ${state.transactions.length}</p>     <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
 <p><strong>Insight:</strong> ${insightMsg}</p> `;
}

// ================= ROLE UI =================
function updateRoleUI() {
  addBtn.style.display = state.role === "admin" ? "block" : "none";

  document.querySelector(".avatar").textContent =
    state.role === "admin" ? "A" : "V";
}
// ================= ADD TRANSACTION =================
function addTransaction() {
const amount = prompt("Enter amount:");
const category = prompt("Enter category:");
const type = prompt("income or expense:");

if (!amount || !category || !type) return;

if (type !== "income" && type !== "expense") {
alert("Type must be income or expense");
return;
}

const newTransaction = {
id: Date.now(),
amount: Number(amount),
category: category.trim().charAt(0).toUpperCase() + category.trim().slice(1),
type: type.toLowerCase(),
date: new Date().toISOString().split("T")[0]
};


state.transactions.push(newTransaction);
alert("✅ Transaction added!");
renderAll();
}
//=================render chart=================
function renderChart() {
  const container = document.getElementById("categoryChartBars");
  container.innerHTML = "";

  const map = {};

  state.transactions.forEach(t => {
    if (t.type === "expense") {
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
  });

  if (Object.keys(map).length === 0) {
    container.innerHTML = "<p>No expense data</p>";
    return;
  }

  const max = Math.max(...Object.values(map));

  Object.entries(map).forEach(([cat, amt]) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (amt / max) * 100 + "%";

    bar.innerHTML = `
      <p>₹${amt}</p>
      <span>${cat}</span>
    `;

    container.appendChild(bar);
  });
}
//=====================trend================
function renderTrendChart() {
  const container = document.getElementById("trendChart");
  container.innerHTML = "";

  let balance = 0;
  const trend = [];
const sorted = [...state.transactions].sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);
  sorted.forEach(t => {
    if (t.type === "income") balance += t.amount;
    else balance -= t.amount;

    trend.push({
      date: t.date,
      value: balance
    });
  });

  const max = Math.max(...trend.map(t => t.value), 1);

  trend.forEach(t => {
    const bar = document.createElement("div");
    bar.className = "trend-bar";

const height = Math.max(10, (Math.abs(t.value) / max) * 100);
bar.style.height = height + "%";
    bar.innerHTML = `
      <p>₹${t.value}</p>
      <span>${t.date.slice(5)}</span>
    `;

    container.appendChild(bar);
  });
}
// ================= RENDER ALL =================
function renderAll() {
renderTransactions();
updateSummary();
renderInsights();
updateRoleUI();
localStorage.setItem("transactions", JSON.stringify(state.transactions));
renderChart();
renderTrendChart();
}

// ================= EVENTS =================
roleSelect.addEventListener("change", (e) => {
  state.role = e.target.value;
  renderAll(); 
});
searchInput.addEventListener("input", (e) => {
state.filters.search = e.target.value;
renderTransactions();
});

typeFilter.addEventListener("change", (e) => {
state.filters.type = e.target.value;
renderTransactions();
});

resetBtn.addEventListener("click", () => {
state.filters.search = "";
state.filters.type = "";
searchInput.value = "";
typeFilter.value = "";
renderTransactions();
});

addBtn.addEventListener("click", addTransaction);

// ================= INIT =================
function init() {
renderAll();
}

init();

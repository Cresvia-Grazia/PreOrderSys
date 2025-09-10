const API_URL = "https://script.google.com/macros/s/AKfycbyI_0ovHIuIlybc4_ffEJAjJ7WK7T8WRnDlrPae7nDQMs5j7_wiryBukQf59Za46-xYAw/exec"; // backend URL

let cart = [];
let books = [];

// Fetch books from Google Sheets backend
async function loadBooks() {
  try {
    const res = await fetch(API_URL + "?action=getBooks");
    const data = await res.json();
    books = data.books;
    updateFilter();
  } catch (err) {
    console.error("Error fetching books:", err);
  }
}

let activeFilter = "title";
let filterValue = "";

// Render books
function renderBooks() {
  const list = document.getElementById("book-list");
  list.innerHTML = "";

  let filtered = books;
  if (activeFilter !== "title" && filterValue) {
    filtered = books.filter(b => b[activeFilter] === filterValue);
  }

  filtered.forEach((b, i) => {
    list.innerHTML += `
      <div class="book">
        <img src="${b.image}" alt="${b.title}">
        <div class="book-details">
          <h3>${b.title}</h3>
          <p>by ${b.author}</p>
          <p><small>Genre: ${b.genre}</small></p>
          <p class="price">₱${parseFloat(b.price).toFixed(2)}</p>
          <button onclick="addToCart(${i})">Add to Cart</button>
        </div>
      </div>`;
  });
}

// Filter
function updateFilter() {
  const radios = document.querySelectorAll("input[name='filterType']");
  activeFilter = Array.from(radios).find(r => r.checked).value;

  const dropdown = document.getElementById("filterDropdown");
  if (activeFilter === "author" || activeFilter === "genre") {
    const options = [...new Set(books.map(b => b[activeFilter]))];
    dropdown.innerHTML = "<option value=''>-- Select --</option>" +
      options.map(o => `<option value="${o}">${o}</option>`).join("");
    dropdown.style.display = "inline-block";
  } else {
    dropdown.style.display = "none";
    filterValue = "";
  }
  renderBooks();
}

document.getElementById("filterDropdown").addEventListener("change", (e) => {
  filterValue = e.target.value;
  renderBooks();
});

// Cart functions
function addToCart(index) {
  const b = books[index];
  const item = cart.find(it => it.title === b.title && it.author === b.author);
  if (item) item.qty++;
  else cart.push({ title: b.title, author: b.author, qty: 1, price: parseFloat(b.price) });
  renderCart();
}

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let total = 0;
  cart.forEach((it, i) => {
    const subtotal = it.qty * it.price;
    total += subtotal;
    tbody.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${it.title} by ${it.author}</td>
        <td><input type="number" value="${it.qty}" min="1" onchange="updateQty(${i}, this.value)"></td>
        <td>₱${it.price.toFixed(2)}</td>
        <td>₱${subtotal.toFixed(2)}</td>
        <td><button onclick="removeItem(${i})">X</button></td>
      </tr>`;
  });
  document.getElementById("cart-total").innerText = "Total: ₱" + total.toFixed(2);
}

function updateQty(i, qty) {
  cart[i].qty = parseInt(qty);
  renderCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  renderCart();
}

// Place order
async function placeOrder() {
  if (cart.length === 0) return alert("Please add at least 1 book.");

  const payload = { action: "placeOrder", cart };
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      alert("✅ Order placed! Order ID: " + json.orderId);
      cart = [];
      renderCart();
    } else {
      alert("❌ Failed: " + json.error);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Init
loadBooks();
renderCart();

const SHEET_ID = "1Gm7u6JoGClHvMTJnTAz5f6PMeysrGrdpLMUaT-IJIxA";
const GID_INVENTORY = "0";
const INVENTORY_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_INVENTORY}`;

async function loadInventory() {
  const res = await fetch(INVENTORY_URL);
  const csv = await res.text();
  const rows = Papa.parse(csv, { header: true }).data; // PapaParse makes CSV into JSON

  const container = document.getElementById("book-list");
  container.innerHTML = "";

  rows.forEach((book, idx) => {
    if (!book.Title) return; // skip empty rows
    const price = book["Discounted Price"] || book.Price;
    const original = book["Discounted Price"] ? `<s>₱${book.Price}</s>` : "";
    const stock = parseInt(book.Stock) || 0;

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book.ImageURL || 'placeholder.jpg'}" alt="${book.Title}">
      <h3>${book.Title}</h3>
      <p>by ${book.Author}</p>
      <p><em>${book.Genre}</em></p>
      <p>${book.Description || ""}</p>
      <p>${original} <strong>₱${price}</strong></p>
      ${stock > 0 
        ? `<label><input type="checkbox" data-id="${idx}"> Add to cart</label>` 
        : `<p class="out-stock">Out of stock</p>`}
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadInventory);


document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const data = new FormData(form);

  // Send data to Google Apps Script Web App
  try {
    let response = await fetch("https://script.google.com/macros/s/AKfycbyLASAkmIjxzkMjQ6agBzrg9OhDxeJW9lEVw50lF5v6eiyDR0BRL_BPa7V-b-rbOOaIEg/exec", {
      method: "POST",
      body: data,
    });

    let result = await response.text();
    document.getElementById("msg").innerText = result || "Order submitted!";
    form.reset();
  } catch (err) {
    document.getElementById("msg").innerText = "Error submitting order.";
    console.error(err);
  }
});

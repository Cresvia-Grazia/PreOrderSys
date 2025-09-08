const API_URL = "https://script.google.com/macros/s/AKfycbz4pt4ib8wpTRA3EJfpycSZkipallgNtaI5QNBmIOaWG8uvsoQcp4JNkgp6768pw4gY4A/exec"; // replace with your web app URL
let books=[], cart=[];

async function loadBooks(){
  const res = await fetch(API_URL+"?action=inventory");
  books = await res.json();
  renderBooks(books);
}
function renderBooks(list){
  const el=document.getElementById("bookList");
  el.innerHTML="";
  list.forEach(b=>{
    const d=document.createElement("div");
    d.className="card";
    d.innerHTML=`<h4>${b.Title}</h4>
      <p>${b.Author} · ₱${b.Price}</p>
      <button>Add</button>`;
    d.querySelector("button").onclick=()=>addToCart(b);
    el.appendChild(d);
  });
}
function addToCart(b){
  const i=cart.findIndex(c=>c.Title===b.Title);
  if(i>-1) cart[i].qty++; else cart.push({...b,qty:1});
  renderCart();
}
function renderCart(){
  const el=document.getElementById("cart");
  el.innerHTML="";
  let tot=0;
  cart.forEach(c=>{
    tot+=c.Price*c.qty;
    el.innerHTML+=`<div>${c.Title} x ${c.qty} = ₱${c.Price*c.qty}</div>`;
  });
  document.getElementById("total").textContent=tot;
}

document.getElementById("checkout").onclick=()=>{
  if(!cart.length) return alert("Empty cart");
  document.getElementById("formArea").style.display="block";
};
document.getElementById("custForm").onsubmit=async e=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const data=Object.fromEntries(fd.entries());
  data.pickup=document.getElementById("pickup").value;
  data.items=cart;
  data.total=document.getElementById("total").textContent;
  const res=await fetch(API_URL,{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const j=await res.json();
  if(j.status==="ok"){
    alert("Order placed! Your Order ID: "+j.orderId+"\nUse it to upload payment slip.");
    cart=[]; renderCart(); e.target.reset();
    document.getElementById("formArea").style.display="none";
  } else alert("Error: "+j.message);
};

document.getElementById("search").oninput=ev=>{
  const q=ev.target.value.toLowerCase();
  renderBooks(books.filter(b=>
    b.Title.toLowerCase().includes(q)||
    b.Author.toLowerCase().includes(q)||
    b.Genre.toLowerCase().includes(q)||
    b.Location.toLowerCase().includes(q)
  ));
};

loadBooks();

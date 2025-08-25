const menu = [
  { id: 1, name: "Classic Burger", desc: "Juicy beef patty with cheese", price: 5, img: "./assest/beef-burger.avif" },
  { id: 2, name: "Chicken Burger", desc: "Crispy chicken fillet with mayo", price: 6, img: "./assest/zinger-burger.avif" },
  { id: 3, name: "Veggie Burger", desc: "Healthy & fresh vegetable patty", price: 4, img: "./assest/veg.avif" }
];

let cart = [];

const menuItemsEl = document.getElementById("menu-items");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutSection = document.getElementById("checkout");
const checkoutForm = document.getElementById("checkout-form");
const orderConfirmation = document.getElementById("order-confirmation");
const orderIdEl = document.getElementById("order-id");

function renderMenu(){
  menuItemsEl.innerHTML = "";
  menu.forEach(item =>{
    const div = document.createElement("div");
    div.classList.add("burger-card");
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <p><strong>$${item.price}</strong></p>
      <button onclick="addToCart(${item.id})">Add to Cart</button>
    `;
    menuItemsEl.appendChild(div);
  });
};
 
renderMenu();


const menu = [
  { id: 1, name: "Classic Beef Burger", desc: "Juicy beef patty with cheddar & lettuce", price: 650, img: "./assest/beef-burger.avif", category: "burger", rating: 4.6 },
  { id: 2, name: "Crispy Chicken Zinger", desc: "Crispy fillet, spicy mayo & pickles", price: 720, img: "./assest/zinger-burger.avif", category: "burger", rating: 4.7 },
  { id: 3, name: "Veggie Delight", desc: "Grilled veggie patty, fresh greens", price: 490, img: "./assest/veg.avif", category: "burger", rating: 4.4 },
  { id: 4, name: "French Fries", desc: "Crispy salted fries", price: 180, img: "./assest/fries.avif", category: "sides", rating: 4.3 },
  { id: 5, name: "Onion Rings", desc: "Crunchy battered onion rings", price: 220, img: "./assest/onion-rings.avif", category: "sides", rating: 4.1 },
  { id: 6, name: "Cold Drink", desc: "330ml chilled drink", price: 120, img: "./assest/drink.avif", category: "drinks", rating: 4.0 },
  { id: 7, name: "Family Deal (2B + Fries)", desc: "Two burgers + fries at a discount", price: 1400, img: "./assest/deal.avif", category: "deals", rating: 4.8 }
];


let cart = JSON.parse(localStorage.getItem("bp_cart") || "[]");
let activeCategory = "all";
let currentSort = "default";

const menuItemsEl = document.getElementById("menu-items");
const featuredEl = document.getElementById("featured-items");
const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartDeliveryEl = document.getElementById("cart-delivery");
const cartTotalEl = document.getElementById("cart-total");
const overlay = document.getElementById("overlay");
const toastEl = document.getElementById("toast");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const checkoutForm = document.getElementById("checkout-form");
const orderModal = document.getElementById("order-modal");
const orderMsg = document.getElementById("order-msg");
const orderIdEl = document.getElementById("order-id");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const tabs = document.querySelectorAll(".tab");
const featuredCount = 3;
const deliveryFee = 60;


const navToggle = document.getElementById("nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const navButtons = document.querySelectorAll(".nav-buttons button");


function $(id){ return document.getElementById(id); }


function showToast(message, time = 1800){
  if(!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  toastEl.classList.remove("hidden");
  setTimeout(()=> toastEl.classList.remove("show"), time);
}


function getFilteredMenu(){
  const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
  let list = menu.filter(item => {
    if(activeCategory !== "all" && item.category !== activeCategory) return false;
    if(q && !(`${item.name} ${item.desc}`.toLowerCase().includes(q))) return false;
    return true;
  });


  if(currentSort === "price-asc") list.sort((a,b)=>a.price-b.price);
  else if(currentSort === "price-desc") list.sort((a,b)=>b.price-a.price);
  else if(currentSort === "rating-desc") list.sort((a,b)=>b.rating-a.rating);
  return list;
}

function renderMenu(){
  if(!menuItemsEl) return;
  const items = getFilteredMenu();
  menuItemsEl.innerHTML = "";
  if(items.length === 0){
    menuItemsEl.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#666;">No items found.</p>`;
    return;
  }
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "burger-card";
    div.innerHTML = `
      <div class="card-top"><img src="${item.img}" alt="${item.name}"></div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="card-footer">
          <div class="card-actions">
            <span class="price">Rs ${item.price}</span>
            <span class="rating">${item.rating}</span>
          </div>
          <div>
            <button class="primary" onclick="addToCart(${item.id})">Add</button>
          </div>
        </div>
      </div>
    `;
    menuItemsEl.appendChild(div);
  });
}

function renderFeatured(){
  if(!featuredEl) return;
  const top = [...menu].sort((a,b)=>b.rating - a.rating).slice(0, featuredCount);
  featuredEl.innerHTML = "";
  top.forEach(it => {
    const card = document.createElement("div");
    card.className = "burger-card";
    card.style.padding = "10px";
    card.innerHTML = `
      <div style="display:flex; gap:12px; align-items:center;">
        <img src="${it.img}" alt="${it.name}" style="width:84px; height:64px; object-fit:cover; border-radius:8px;">
        <div>
          <strong style="display:block; color:#111;">${it.name}</strong>
          <small style="color:#666;">Rs ${it.price}</small>
        </div>
        <div style="margin-left:auto;"><button class="primary" onclick="addToCart(${it.id})">Add</button></div>
      </div>
    `;
    featuredEl.appendChild(card);
  });
}

function saveCart(){
  try { localStorage.setItem("bp_cart", JSON.stringify(cart)); } catch(e){ }
}

function findInCart(id){
  return cart.findIndex(ci => ci.id === id);
}

function addToCart(id){
  const idx = findInCart(id);
  if(idx > -1){
    cart[idx].qty += 1;
  } else {
    const item = menu.find(m => m.id === id);
    if(!item) return;
    cart.push({...item, qty:1});
  }
  saveCart();
  updateCartUI();
  openCart();
  showToast("Added to cart");
}

function removeFromCart(id){
  cart = cart.filter(ci => ci.id !== id);
  saveCart();
  updateCartUI();
  showToast("Removed from cart");
}

function changeQty(id, delta){
  const idx = findInCart(id);
  if(idx === -1) return;
  cart[idx].qty += delta;
  if(cart[idx].qty < 1) cart[idx].qty = 1;
  saveCart();
  updateCartUI();
}

function clearCart(){
  cart = [];
  saveCart();
  updateCartUI();
  showToast("Cart cleared");
}

function calculateTotals(){
  const subtotal = cart.reduce((s,it)=> s + it.price*it.qty, 0);
  const delivery = cart.length ? deliveryFee : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

function updateCartUI(){
  if(!cartItemsEl) return;
  cartItemsEl.innerHTML = "";
  if(cart.length === 0){
    cartItemsEl.innerHTML = `<p style="color:#666; text-align:center; padding:20px;">Your cart is empty. Add something tasty!</p>`;
  } else {
    cart.forEach(it => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cmeta">
          <strong>${it.name}</strong>
          <div style="color:#666; font-size:13px;">Rs ${it.price} x ${it.qty}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
          <div class="qty-controls">
            <button onclick="changeQty(${it.id}, -1)">−</button>
            <div style="min-width:26px; text-align:center;">${it.qty}</div>
            <button onclick="changeQty(${it.id}, 1)">+</button>
          </div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button onclick="removeFromCart(${it.id})" style="background:#f44336; color:white; border:none; padding:6px 8px; border-radius:8px; cursor:pointer;">Remove</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
  }

  const { subtotal, delivery, total } = calculateTotals();
  if(cartSubtotalEl) cartSubtotalEl.textContent = `Rs ${subtotal}`;
  if(cartDeliveryEl) cartDeliveryEl.textContent = `Rs ${delivery}`;
  if(cartTotalEl) cartTotalEl.textContent = `Rs ${total}`;
  if(cartCountEl) cartCountEl.textContent = cart.reduce((s,it)=>s+it.qty,0);
}


function openCart(){
  if(!cartSidebar || !overlay) return;
  cartSidebar.classList.add("open");
  overlay.classList.add("show");
  overlay.classList.remove("hidden");
  cartSidebar.classList.remove("hidden");
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeCart(){
  if(!cartSidebar || !overlay) return;
  cartSidebar.classList.remove("open");
  overlay.classList.remove("show");
  setTimeout(()=> {
    cartSidebar.classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
  }, 300);
}

function openCheckout(){
  if(!checkoutModal || !overlay){ showToast("Something went wrong"); return; }
  if(cart.length === 0){ showToast("Cart is empty"); return; }
  checkoutModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCheckout(){
  if(!checkoutModal || !overlay) return;
  checkoutModal.classList.add("hidden");
  overlay.classList.add("hidden");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

function placeOrder(data){

  const id = "BP" + Date.now().toString().slice(-6);
  if(orderIdEl) orderIdEl.textContent = `Order ID: ${id}`;
  if(orderMsg) orderMsg.textContent = `Thanks ${data.name}! We'll call ${data.phone} if needed.`;
  if(orderModal) orderModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";

  
  clearCart();
  closeCheckout();
}

function closeOrderModal(){
  if(!orderModal || !overlay) return;
  orderModal.classList.add("hidden");
  overlay.classList.add("hidden");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

function showPage(id){
  document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
  const el = document.getElementById(id);
  if(el) el.classList.remove("hidden");
  
  closeCart();
  closeCheckout();
  closeOrderModal();

  if(mobileMenu && !mobileMenu.classList.contains('closed')) toggleMobileMenu(false);
}

function toggleMobileMenu(force) {
  if(!mobileMenu || !navToggle) return;

  const isOpen = !mobileMenu.classList.contains('closed');
  const shouldOpen = typeof force === 'boolean' ? force : !isOpen;
  if(shouldOpen){
    mobileMenu.classList.remove('closed');
    navToggle.classList.add('open');
   
    navToggle.querySelectorAll('.bar').forEach((b,i)=>{
      if(i===0) b.style.transform = 'translateY(6px) rotate(45deg)';
      if(i===1) b.style.opacity = '0';
      if(i===2) b.style.transform = 'translateY(-6px) rotate(-45deg)';
    });
  } else {
    mobileMenu.classList.add('closed');
    navToggle.classList.remove('open');
    navToggle.querySelectorAll('.bar').forEach((b,i)=>{
      b.style.transform = '';
      b.style.opacity = '';
    });
  }
}


document.addEventListener('click', function(e){

  if(window.innerWidth <= 820 && mobileMenu && !mobileMenu.classList.contains('closed')){
    const within = e.target.closest('.mobile-menu') || e.target.closest('#nav-toggle');
    if(!within) toggleMobileMenu(false);
  }
});

if(navToggle){
  navToggle.addEventListener('click', ()=> toggleMobileMenu());
}

const closeCartBtn = document.getElementById("close-cart");
if(closeCartBtn) closeCartBtn.addEventListener("click", closeCart);


if(overlay) overlay.addEventListener("click", ()=> {
  closeCart();
  closeCheckout();
  closeOrderModal();
  toggleMobileMenu(false);
});

if(cartBtn) cartBtn.addEventListener("click", () => {
  updateCartUI();
  openCart();
});


const clearBtn = document.getElementById("clear-cart");
if(clearBtn) clearBtn.addEventListener("click", clearCart);

if(checkoutBtn) checkoutBtn.addEventListener("click", openCheckout);

if(checkoutForm){
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.getElementById("name") || {}).value || "";
    const phone = (document.getElementById("phone") || {}).value || "";
    const address = (document.getElementById("address") || {}).value || "";
    if(!name.trim() || !phone.trim() || !address.trim()){ showToast("Please fill required fields"); return; }
    placeOrder({ name: name.trim(), phone: phone.trim(), address: address.trim() });
  });
}


if(tabs && tabs.length){
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      activeCategory = t.dataset.cat;
      renderMenu();
    });
  });
}


if(sortSelect){
  sortSelect.addEventListener("change", (e)=> {
    currentSort = e.target.value;
    renderMenu();
  });
}


if(searchInput){
  searchInput.addEventListener("input", () => renderMenu());
}


const contactForm = document.getElementById("contact-form");
if(contactForm){
  contactForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    showToast("Message sent — we'll reply shortly!");
    contactForm.reset();
  });
}

if(navButtons && navButtons.length){
  navButtons.forEach(btn => btn.addEventListener('click', ()=> toggleMobileMenu(false)));
}


window.addEventListener('resize', ()=>{
  if(window.innerWidth > 820) toggleMobileMenu(false);
});


function init(){
  renderMenu();
  renderFeatured();
  updateCartUI(); 
  showPage('home');
  if(mobileMenu) mobileMenu.classList.add('closed');
}
init();

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;
window.showPage = showPage;
window.closeOrderModal = closeOrderModal;

document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("nav-links").classList.toggle("show");
});

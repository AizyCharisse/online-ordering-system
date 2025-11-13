// ====== GLOBAL VARIABLES ======
let currentUser = null;
let menuItems = JSON.parse(localStorage.getItem("menuItems")) || [
  { id: 1, name: "Classic Beef Burger", price: 120, image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/hamburger-1238246_1280.jpg" },
  { id: 2, name: "Cheese Overload Burger", price: 150, image: "https://cdn.pixabay.com/photo/2016/03/05/22/45/burger-1238247_1280.jpg" },
  { id: 3, name: "Bacon Deluxe Burger", price: 170, image: "https://cdn.pixabay.com/photo/2020/08/04/16/25/burger-5460284_1280.jpg" },
];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// ====== LOGIN FUNCTION ======
function login() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!username || !email || !password) {
    document.getElementById("login-error").innerText = "⚠️ Please fill in all fields!";
    return;
  }

  currentUser = { username, email, role };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  document.getElementById("login-page").style.display = "none";
  document.getElementById("main-system").style.display = "block";

  document.querySelectorAll(".customer-only").forEach(btn => btn.style.display = role === "customer" ? "inline-block" : "none");
  document.querySelectorAll(".staff-only").forEach(btn => btn.style.display = role === "staff" ? "inline-block" : "none");
  document.querySelectorAll(".admin-only").forEach(btn => btn.style.display = role === "admin" ? "inline-block" : "none");

  renderMenu();
  renderOrders();
  renderStaffOrders();
  renderAdminMenu();
}

// ====== LOGOUT ======
function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("main-system").style.display = "none";
  document.getElementById("login-page").style.display = "flex";
}

// ====== SECTION TOGGLE ======
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ====== MENU RENDER ======
function renderMenu() {
  const menuList = document.getElementById("menu-list");
  menuList.innerHTML = "";
  menuItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h4>${item.name}</h4>
      <p>₱${item.price}</p>
      ${currentUser.role === "customer" ? `<button onclick="addToCart(${item.id})">Add to Order</button>` : ""}
    `;
    menuList.appendChild(div);
  });
}

// ====== ADD TO CART ======
function addToCart(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;

  let order = orders.find(o => o.username === currentUser.username);
  if (!order) {
    order = { username: currentUser.username, items: [], status: "Pending" };
    orders.push(order);
  }
  order.items.push(item);
  saveOrders();
  renderOrders();
  alert(`${item.name} added to your order!`);
}

// ====== RENDER CUSTOMER ORDERS ======
function renderOrders() {
  const cartList = document.getElementById("cart-list");
  const totalEl = document.getElementById("total");
  const statusEl = document.getElementById("order-status");
  const order = orders.find(o => o.username === currentUser?.username);
  
  if (!order || order.items.length === 0) {
    cartList.innerHTML = "<p>No orders yet.</p>";
    totalEl.innerText = "Total: ₱0";
    statusEl.innerHTML = "";
    return;
  }

  let total = 0;
  cartList.innerHTML = "";
  order.items.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - ₱${item.price}`;
    cartList.appendChild(li);
  });
  totalEl.innerText = `Total: ₱${total}`;
  statusEl.innerHTML = `<p><b>Status:</b> ${order.status}</p>`;
}

// ====== PAYMENT ======
function makePayment() {
  alert("Payment Successful ✅");
  const order = orders.find(o => o.username === currentUser.username);
  if (order) {
    order.status = "Paid";
    saveOrders();
    renderOrders();
  }
}

// ====== STAFF VIEW & UPDATE ======
function renderStaffOrders() {
  const staffDiv = document.getElementById("staff-orders");
  staffDiv.innerHTML = "";
  orders.forEach((order, i) => {
    const div = document.createElement("div");
    div.className = "order-card";
    div.innerHTML = `
      <h4>Order by ${order.username}</h4>
      <ul>${order.items.map(i => `<li>${i.name}</li>`).join("")}</ul>
      <p><b>Status:</b> ${order.status}</p>
      <select id="status-${i}">
        <option>Pending</option>
        <option>Preparing</option>
        <option>Ready for Pickup</option>
        <option>Delivered</option>
      </select>
      <button onclick="updateOrderStatus(${i})">Update</button>
    `;
    staffDiv.appendChild(div);
  });
}

function updateOrderStatus(index) {
  const newStatus = document.getElementById(`status-${index}`).value;
  orders[index].status = newStatus;
  saveOrders();
  renderOrders();
  renderStaffOrders();
}

// ====== ADMIN MENU MANAGEMENT ======
function renderAdminMenu() {
  const adminMenu = document.getElementById("admin-menu");
  adminMenu.innerHTML = "";
  menuItems.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h4 contenteditable="true" id="name-${i}">${item.name}</h4>
      <p contenteditable="true" id="price-${i}">₱${item.price}</p>
      <button onclick="editMenuItem(${i})">💾 Save</button>
      <button onclick="deleteMenuItem(${i})">🗑 Delete</button>
    `;
    adminMenu.appendChild(div);
  });
}

// ====== ADD MENU ITEM (with image upload) ======
function addMenuItem() {
  const name = document.getElementById("newItem").value;
  const price = parseFloat(document.getElementById("newPrice").value);
  const imageFile = document.getElementById("newImage").files[0];

  if (!name || !price || !imageFile) {
    alert("Please complete all fields!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const newItem = {
      id: Date.now(),
      name,
      price,
      image: e.target.result,
    };
    menuItems.push(newItem);
    saveMenu();
    renderMenu();
    renderAdminMenu();
  };
  reader.readAsDataURL(imageFile);

  document.getElementById("newItem").value = "";
  document.getElementById("newPrice").value = "";
  document.getElementById("newImage").value = "";
}

// ====== EDIT MENU ITEM ======
function editMenuItem(index) {
  const name = document.getElementById(`name-${index}`).innerText;
  const priceText = document.getElementById(`price-${index}`).innerText.replace("₱", "");
  const price = parseFloat(priceText);
  menuItems[index].name = name;
  menuItems[index].price = price;
  saveMenu();
  renderMenu();
  alert("Menu item updated ✅");
}

// ====== DELETE MENU ITEM ======
function deleteMenuItem(index) {
  if (confirm("Are you sure to delete this burger?")) {
    menuItems.splice(index, 1);
    saveMenu();
    renderMenu();
    renderAdminMenu();
  }
}

// ====== SAVE TO LOCAL STORAGE ======
function saveMenu() {
  localStorage.setItem("menuItems", JSON.stringify(menuItems));
}
function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

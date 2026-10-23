// admin.js - Xử lý CRUD Danh mục, Sản phẩm & Quản lý đơn hàng (ASM2)
import { products as initialProducts, categories as initialCategories } from "./data.js";
import { getOrders, saveOrders } from "./orders.js";

const PRODUCTS_KEY   = "ap_products";
const CATEGORIES_KEY = "ap_categories";
const formatPrice    = amount => `${Number(amount).toLocaleString("vi-VN")}đ`;

let productList  = [...initialProducts];
let categoryList = [...initialCategories];

function syncProducts() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(productList));
}

function syncCategories() {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categoryList));
}

// ── 1. CHUYỂN TAB QUẢN TRỊ ──
function initAdminTabs() {
    const tabs = document.getElementById("admin-tabs");
    if (!tabs) return;

    tabs.addEventListener("click", e => {
        const btn = e.target.closest(".admin-tab");
        if (!btn) return;
        const targetId = btn.dataset.tab;

        tabs.querySelectorAll(".admin-tab").forEach(b => b.classList.toggle("active", b === btn));
        document.querySelectorAll(".admin-panel").forEach(p => p.classList.toggle("hidden", p.id !== targetId));
    });
}

// ── 2. CRUD DANH MỤC ──
function renderCategorySelect() {
    const select = document.getElementById("prod-category");
    if (!select) return;
    select.innerHTML = categoryList.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
}

function renderCategoriesTable() {
    const tbody = document.getElementById("admin-category-tbody");
    if (!tbody) return;

    tbody.innerHTML = categoryList.map(cat => {
        const count = productList.filter(p => p.category === cat.name).length;
        return `
            <tr>
                <td>#${cat.id}</td>
                <td><strong>${cat.name}</strong></td>
                <td>${count} sản phẩm</td>
                <td>
                    <button type="button" class="btn-edit" data-edit-cat="${cat.id}">Sửa</button>
                    <button type="button" class="btn-delete" data-del-cat="${cat.id}">Xóa</button>
                </td>
            </tr>
        `;
    }).join("");

    renderCategorySelect();
}

function initCategoryCRUD() {
    const form      = document.getElementById("admin-category-form");
    const idInput   = document.getElementById("cat-id");
    const nameInput = document.getElementById("cat-name");
    const errEl     = document.getElementById("err-admin-cat");
    const titleEl   = document.getElementById("cat-form-title");
    const cancelBtn = document.getElementById("cat-cancel-btn");
    const tbody     = document.getElementById("admin-category-tbody");

    if (!form || !tbody) return;

    function resetCatForm() {
        form.reset();
        idInput.value = "";
        titleEl.textContent = "Thêm danh mục mới";
        cancelBtn.classList.add("hidden");
        errEl.textContent = "";
    }

    cancelBtn.addEventListener("click", resetCatForm);

    form.addEventListener("submit", e => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (!name || name.length < 2) {
            errEl.textContent = "Tên danh mục phải từ 2 ký tự trở lên.";
            return;
        }

        const editId = Number(idInput.value);
        if (editId) {
            // Sửa danh mục & cập nhật tên danh mục cho các sản phẩm thuộc danh mục đó
            const target = categoryList.find(c => c.id === editId);
            if (target) {
                const oldName = target.name;
                target.name = name;
                productList.forEach(p => {
                    if (p.category === oldName) p.category = name;
                });
                syncProducts();
            }
        } else {
            if (categoryList.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                errEl.textContent = "Danh mục này đã tồn tại.";
                return;
            }
            const newId = categoryList.length ? Math.max(...categoryList.map(c => c.id)) + 1 : 1;
            categoryList.push({ id: newId, name });
        }

        syncCategories();
        renderCategoriesTable();
        renderProductsTable();
        resetCatForm();
    });

    tbody.addEventListener("click", e => {
        const editBtn = e.target.closest("[data-edit-cat]");
        const delBtn  = e.target.closest("[data-del-cat]");

        if (editBtn) {
            const cat = categoryList.find(c => c.id === Number(editBtn.dataset.editCat));
            if (!cat) return;
            idInput.value       = cat.id;
            nameInput.value     = cat.name;
            titleEl.textContent = `Sửa danh mục #${cat.id}`;
            cancelBtn.classList.remove("hidden");
        }

        if (delBtn) {
            const cat = categoryList.find(c => c.id === Number(delBtn.dataset.delCat));
            if (!cat) return;
            if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
            categoryList = categoryList.filter(c => c.id !== cat.id);
            syncCategories();
            renderCategoriesTable();
        }
    });

    renderCategoriesTable();
}

// ── 3. CRUD SẢN PHẨM ──
function renderProductsTable() {
    const tbody = document.getElementById("admin-product-tbody");
    if (!tbody) return;

    tbody.innerHTML = productList.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td><img src="${p.image}" alt="${p.name}" class="admin-thumb"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>${formatPrice(p.price)}</td>
            <td>
                <button type="button" class="btn-edit" data-edit-prod="${p.id}">Sửa</button>
                <button type="button" class="btn-delete" data-del-prod="${p.id}">Xóa</button>
            </td>
        </tr>
    `).join("");
}

function initProductCRUD() {
    const form      = document.getElementById("admin-product-form");
    const idInput   = document.getElementById("prod-id");
    const nameInput = document.getElementById("prod-name");
    const catSelect = document.getElementById("prod-category");
    const priceInp  = document.getElementById("prod-price");
    const imgInput  = document.getElementById("prod-image");
    const descInput = document.getElementById("prod-desc");
    const errEl     = document.getElementById("err-admin-prod");
    const titleEl   = document.getElementById("prod-form-title");
    const cancelBtn = document.getElementById("prod-cancel-btn");
    const tbody     = document.getElementById("admin-product-tbody");

    if (!form || !tbody) return;

    function resetProdForm() {
        form.reset();
        idInput.value = "";
        titleEl.textContent = "Thêm sản phẩm mới";
        cancelBtn.classList.add("hidden");
        errEl.textContent = "";
    }

    cancelBtn.addEventListener("click", resetProdForm);

    form.addEventListener("submit", e => {
        e.preventDefault();
        const name        = nameInput.value.trim();
        const category    = catSelect.value;
        const price       = Number(priceInp.value);
        const image       = imgInput.value.trim();
        const description = descInput.value.trim();

        if (!name || !category || !price || price <= 0 || !image || !description) {
            errEl.textContent = "Vui lòng điền đầy đủ thông tin hợp lệ và giá > 0.";
            return;
        }

        const editId = Number(idInput.value);
        if (editId) {
            const target = productList.find(p => p.id === editId);
            if (target) {
                target.name        = name;
                target.category    = category;
                target.price       = price;
                target.image       = image;
                target.description = description;
            }
        } else {
            const newId = productList.length ? Math.max(...productList.map(p => p.id)) + 1 : 1;
            productList.push({ id: newId, name, category, price, image, description });
        }

        syncProducts();
        renderProductsTable();
        renderCategoriesTable();
        resetProdForm();
    });

    tbody.addEventListener("click", e => {
        const editBtn = e.target.closest("[data-edit-prod]");
        const delBtn  = e.target.closest("[data-del-prod]");

        if (editBtn) {
            const prod = productList.find(p => p.id === Number(editBtn.dataset.editProd));
            if (!prod) return;
            idInput.value       = prod.id;
            nameInput.value     = prod.name;
            catSelect.value     = prod.category;
            priceInp.value      = prod.price;
            imgInput.value      = prod.image;
            descInput.value     = prod.description;
            titleEl.textContent = `Sửa sản phẩm #${prod.id}`;
            cancelBtn.classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        if (delBtn) {
            const prod = productList.find(p => p.id === Number(delBtn.dataset.delProd));
            if (!prod) return;
            if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${prod.name}"?`)) return;
            productList = productList.filter(p => p.id !== prod.id);
            syncProducts();
            renderProductsTable();
            renderCategoriesTable();
        }
    });

    renderProductsTable();
}

// ── 4. QUẢN LÝ ĐƠN HÀNG (ADMIN) ──
function renderAdminOrders() {
    const tbody = document.getElementById("admin-order-tbody");
    if (!tbody) return;

    const orders = getOrders();
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px">Chưa có đơn hàng nào.</td></tr>`;
        return;
    }

    const statuses = ["Chờ xác nhận", "Đang giao", "Hoàn thành", "Đã hủy"];

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>#${o.id}</strong></td>
            <td>
                <div><strong>${o.receiverName}</strong></div>
                <div style="font-size:12px;color:var(--muted)">${o.receiverPhone} · ${o.receiverAddress}</div>
            </td>
            <td>
                ${o.items.map(i => `<div>• ${i.name} (x${i.quantity})</div>`).join("")}
            </td>
            <td><strong>${formatPrice(o.total)}</strong></td>
            <td>${o.createdAt}</td>
            <td>
                <select class="order-status-select" data-order-id="${o.id}">
                    ${statuses.map(st => `<option value="${st}" ${st === o.status ? "selected" : ""}>${st}</option>`).join("")}
                </select>
            </td>
            <td>
                <button type="button" class="btn-delete" data-del-order="${o.id}">Xóa</button>
            </td>
        </tr>
    `).join("");

    // Đổi trạng thái đơn hàng
    tbody.onchange = e => {
        const select = e.target.closest("[data-order-id]");
        if (!select) return;
        const all = getOrders();
        const target = all.find(o => o.id === select.dataset.orderId);
        if (target) {
            target.status = select.value;
            saveOrders(all);
        }
    };

    // Xóa đơn hàng
    tbody.onclick = e => {
        const delBtn = e.target.closest("[data-del-order]");
        if (!delBtn) return;
        if (!confirm(`Xóa đơn hàng #${delBtn.dataset.delOrder}?`)) return;
        const updated = getOrders().filter(o => o.id !== delBtn.dataset.delOrder);
        saveOrders(updated);
        renderAdminOrders();
    };
}

function initAdminPage() {
    initAdminTabs();
    initCategoryCRUD();
    initProductCRUD();
    renderAdminOrders();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminPage, { once: true });
} else {
    initAdminPage();
}
// orders.js - Xử lý Đặt hàng (Checkout) và Lịch sử đơn hàng (ASM2)
import { getCart, getCartTotal, removeFromCart, updateCartCount } from "./cart.js";
import { getCurrentUser } from "./auth.js";

const ORDERS_KEY   = "ap_orders";
const SHIPPING_FEE = 30000;
const formatPrice  = amount => `${Number(amount).toLocaleString("vi-VN")}đ`;

export function getOrders() {
    const saved = localStorage.getItem(ORDERS_KEY);
    if (!saved) return [];
    try { return JSON.parse(saved); } catch { return []; }
}

export function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Hàm dọn giỏ hàng an toàn sử dụng removeFromCart có sẵn
function emptyCartSafe() {
    const items = getCart();
    items.forEach(item => removeFromCart(item.id));
}

// ── 1. TÍCH HỢP FORM ĐẶT HÀNG TRÊN TRANG GIỎ HÀNG (cart.html) ──
function initCheckoutOnCartPage() {
    const checkoutBtn = document.getElementById("checkout-button");
    if (!checkoutBtn) return;

    const user = getCurrentUser();

    // Chèn form thông tin người nhận ngay phía trên nút Thanh toán
    const formBox = document.createElement("div");
    formBox.className = "checkout-receiver-box";
    formBox.innerHTML = `
        <h4>Thông tin nhận hàng</h4>
        <div class="form-group">
            <input type="text" id="order-name" placeholder="Họ và tên người nhận *"
                   value="${user ? user.fullname : ""}">
        </div>
        <div class="form-group">
            <input type="tel" id="order-phone" placeholder="Số điện thoại nhận hàng *"
                   value="${user ? user.phone || "" : ""}">
        </div>
        <div class="form-group">
            <input type="text" id="order-address" placeholder="Địa chỉ giao hàng chi tiết *">
        </div>
        <span class="error-message" id="err-order-info"></span>
    `;
    checkoutBtn.parentElement.insertBefore(formBox, checkoutBtn);

    // Bắt sự kiện click nút Thanh toán ở pha Capture
    checkoutBtn.addEventListener("click", e => {
        e.stopImmediatePropagation();

        const items = getCart();
        const errEl = document.getElementById("err-order-info");
        if (items.length === 0) {
            errEl.textContent = "Giỏ hàng đang trống. Hãy thêm sản phẩm trước khi đặt hàng.";
            return;
        }

        const receiverName    = document.getElementById("order-name").value.trim();
        const receiverPhone   = document.getElementById("order-phone").value.trim();
        const receiverAddress = document.getElementById("order-address").value.trim();

        if (!receiverName || !receiverPhone || !receiverAddress) {
            errEl.textContent = "Vui lòng nhập đầy đủ Họ tên, SĐT và Địa chỉ giao hàng.";
            return;
        }
        if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(receiverPhone)) {
            errEl.textContent = "Số điện thoại nhận hàng không đúng định dạng (10 số).";
            return;
        }
        errEl.textContent = "";

        const subtotal = getCartTotal();
        const voucherInput = document.getElementById("voucher");
        const discount = (voucherInput && voucherInput.value.trim().toUpperCase() === "MYSHOP50")
            ? Math.min(50000, subtotal)
            : 0;
        const total = Math.max(0, subtotal - discount + SHIPPING_FEE);

        const newOrder = {
            id: "DH" + Date.now().toString().slice(-6),
            userEmail: user ? user.email : "guest",
            receiverName,
            receiverPhone,
            receiverAddress,
            items: [...items],
            subtotal,
            discount,
            shipping: SHIPPING_FEE,
            total,
            status: "Chờ xác nhận",
            createdAt: new Date().toLocaleString("vi-VN")
        };

        const orders = getOrders();
        orders.unshift(newOrder);
        saveOrders(orders);

        emptyCartSafe();
        updateCartCount();
        alert(`🎉 Đặt hàng thành công! Mã đơn hàng của bạn là #${newOrder.id}`);
        window.location.href = "orders.html";
    }, true);
}

// ── 2. HIỂN THỊ TRANG LỊCH SỬ ĐƠN HÀNG (orders.html) ──
function renderOrderHistoryPage() {
    const root = document.getElementById("orders-history-list");
    if (!root) return;

    const user = getCurrentUser();
    const allOrders = getOrders();

    const myOrders = user
        ? allOrders.filter(o => o.userEmail === user.email || o.userEmail === "guest")
        : allOrders.filter(o => o.userEmail === "guest");

    if (myOrders.length === 0) {
        root.innerHTML = `
            <div class="empty-orders-box">
                <p>Bạn chưa có đơn hàng nào.</p>
                <a href="products.html" class="btn-hero-primary" style="display:inline-block;margin-top:12px">
                    Mua sắm ngay →
                </a>
            </div>
        `;
        return;
    }

    root.innerHTML = myOrders.map(order => `
        <article class="order-card">
            <div class="order-card-header">
                <div>
                    <strong>Mã đơn: #${order.id}</strong>
                    <span class="order-date">· Ngày đặt: ${order.createdAt}</span>
                </div>
                <span class="status-badge status-${getStatusSlug(order.status)}">
                    ${order.status}
                </span>
            </div>

            <div class="order-receiver">
                <p><strong>Người nhận:</strong> ${order.receiverName} (${order.receiverPhone})</p>
                <p><strong>Địa chỉ:</strong> ${order.receiverAddress}</p>
            </div>

            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <span>${item.name} <strong>x${item.quantity}</strong></span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join("")}
            </div>

            <div class="order-card-footer">
                <div class="order-total-text">
                    Tổng thanh toán: <strong>${formatPrice(order.total)}</strong>
                </div>
                ${order.status === "Chờ xác nhận" ? `
                    <button type="button" class="btn-cancel-order" data-cancel-id="${order.id}">
                        Hủy đơn hàng
                    </button>
                ` : ""}
            </div>
        </article>
    `).join("");

    root.onclick = e => {
        const btn = e.target.closest("[data-cancel-id]");
        if (!btn) return;
        const orderId = btn.dataset.cancelId;
        if (!confirm(`Bạn có chắc muốn hủy đơn hàng #${orderId}?`)) return;

        const orders = getOrders();
        const target = orders.find(o => o.id === orderId);
        if (target && target.status === "Chờ xác nhận") {
            target.status = "Đã hủy";
            saveOrders(orders);
            renderOrderHistoryPage();
        }
    };
}

function getStatusSlug(status) {
    if (status === "Chờ xác nhận") return "pending";
    if (status === "Đang giao")    return "shipping";
    if (status === "Hoàn thành")   return "completed";
    return "cancelled";
}

function initOrdersModule() {
    initCheckoutOnCartPage();
    renderOrderHistoryPage();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOrdersModule, { once: true });
} else {
    initOrdersModule();
}
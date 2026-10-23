// app.js - Entry point DUY NHẤT cho toàn bộ trang web
// Tự nhận biết đang ở trang nào và khởi chạy đúng controller
import { products, banners } from "./data.js";
import {
    addToCart, getCart, getCartTotal,
    removeFromCart, setCartItemQuantity,
    updateCartCount, initializeCart
} from "./cart.js";

// ════════════════════════════════════════════════════
// ── UTILITIES ───────────────────────────────────────
// ════════════════════════════════════════════════════

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
}

const formatPrice = amount => `${Number(amount).toLocaleString("vi-VN")}đ`;

// Tự động tô màu ô menu tương ứng với trang khách hàng đang đứng
function highlightActiveNav() {
    const path = window.location.pathname;
    let currentPage = path.substring(path.lastIndexOf("/") + 1) || "index.html";

    // Nếu đang xem chi tiết sản phẩm thì sáng mục "Sản phẩm"
    if (currentPage === "detail.html") {
        currentPage = "products.html";
    }

    document.querySelectorAll(".nav-list a").forEach(link => {
        const href = link.getAttribute("href");
        link.classList.toggle("active", href === currentPage);
    });
}

// ════════════════════════════════════════════════════
// ── PRODUCT CARD TEMPLATE ───────────────────────────
// ════════════════════════════════════════════════════

function productCard(product) {
    return `
        <article class="product">
            <div class="product-image">
                <img src="${escapeHtml(product.image)}"
                     alt="${escapeHtml(product.name)}" loading="lazy">
                <span class="product-label">Bếp Mộc chọn</span>
            </div>
            <div class="product-info">
                <p class="product-category">${escapeHtml(product.category)}</p>
                <h3>${escapeHtml(product.name)}</h3>
                <p class="price">${formatPrice(product.price)}</p>
                <div class="product-actions">
                    <button class="add-cart" type="button"
                            data-add-to-cart="${product.id}">
                        + Thêm vào giỏ
                    </button>
                    <a class="detail" href="detail.html?id=${product.id}">
                        Chi tiết
                    </a>
                </div>
            </div>
        </article>
    `;
}

// ════════════════════════════════════════════════════
// ── MINI-CART PANEL (hiện khi bấm "Thêm vào giỏ") ──
// ════════════════════════════════════════════════════

let pendingProduct  = null;
let autoCloseTimer  = null;

function buildMiniCart() {
    const panel = document.createElement("div");
    panel.id        = "mini-cart";
    panel.className = "mini-cart hidden";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chọn số lượng");

    panel.innerHTML = `
        <div class="mc-header">
            <span class="mc-title">Thêm vào giỏ hàng</span>
            <button class="mc-close" aria-label="Đóng">✕</button>
        </div>

        <div class="mc-body">
            <img class="mc-img" src="" alt="">
            <div class="mc-info">
                <p class="mc-name"></p>
                <p class="mc-price"></p>

                <div class="mc-qty-row">
                    <span class="mc-qty-label">Số lượng</span>
                    <div class="mc-stepper">
                        <button class="mc-step" data-action="minus"
                                aria-label="Giảm">−</button>
                        <input type="number" id="mc-qty"
                               value="1" min="1" aria-label="Số lượng">
                        <button class="mc-step" data-action="plus"
                                aria-label="Tăng">+</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="mc-footer">
            <button class="mc-confirm" id="mc-confirm-btn">
                + Thêm vào giỏ
            </button>
            <a class="mc-goto-cart" href="cart.html">
                Xem giỏ hàng →
            </a>
        </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector(".mc-close")
         .addEventListener("click", closeMiniCart);

    panel.querySelector(".mc-stepper").addEventListener("click", e => {
        const btn = e.target.closest(".mc-step");
        if (!btn) return;
        const input = document.getElementById("mc-qty");
        const val   = parseInt(input.value) || 1;
        input.value = btn.dataset.action === "minus"
            ? Math.max(1, val - 1)
            : val + 1;
    });

    document.getElementById("mc-confirm-btn")
            .addEventListener("click", confirmAddToCart);
}

function openMiniCart(productId) {
    const product = products.find(p => p.id === Number(productId));
    if (!product) return;

    pendingProduct = product;
    clearTimeout(autoCloseTimer);

    const panel = document.getElementById("mini-cart");
    panel.querySelector(".mc-img").src              = product.image;
    panel.querySelector(".mc-img").alt              = product.name;
    panel.querySelector(".mc-name").textContent     = product.name;
    panel.querySelector(".mc-price").textContent    = formatPrice(product.price);
    document.getElementById("mc-qty").value         = "1";

    const confirmBtn       = document.getElementById("mc-confirm-btn");
    confirmBtn.textContent = "+ Thêm vào giỏ";
    confirmBtn.disabled    = false;
    confirmBtn.classList.remove("mc-success");

    panel.classList.remove("hidden");
    requestAnimationFrame(() => panel.classList.add("visible"));
}

function closeMiniCart() {
    const panel = document.getElementById("mini-cart");
    panel.classList.remove("visible");
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
        panel.classList.add("hidden");
        pendingProduct = null;
    }, 300);
}

function confirmAddToCart() {
    if (!pendingProduct) return;
    const qty = Math.max(1, parseInt(document.getElementById("mc-qty").value) || 1);
    addToCart(pendingProduct.id, qty);

    const confirmBtn       = document.getElementById("mc-confirm-btn");
    confirmBtn.textContent = `✓ Đã thêm ${qty} sản phẩm!`;
    confirmBtn.disabled    = true;
    confirmBtn.classList.add("mc-success");

    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(closeMiniCart, 1800);
}

function initMiniCart() {
    buildMiniCart();

    document.addEventListener("click", e => {
        const btn = e.target.closest("[data-add-to-cart]");
        if (btn) openMiniCart(btn.dataset.addToCart);
    });
}

// ════════════════════════════════════════════════════
// ── TRANG CHỦ (index.html) - HIỂN THỊ 4 SẢN PHẨM ────
// ════════════════════════════════════════════════════

function initHomePage() {
    const featuredEl   = document.getElementById("featured-list");
    const bestsellerEl = document.getElementById("bestseller-list");
    const viewAllEl    = document.getElementById("view-all-wrapper");

    // Lấy đúng 4 sản phẩm nổi bật
    if (featuredEl)
        featuredEl.innerHTML = products.slice(0, 4).map(productCard).join("");

    // Lấy đúng 4 sản phẩm bán chạy nhất
    if (bestsellerEl)
        bestsellerEl.innerHTML = products.slice(4, 8).map(productCard).join("");

    if (viewAllEl)
        viewAllEl.innerHTML = `
            <a href="products.html" class="btn-view-all">
                Xem tất cả sản phẩm →
            </a>
        `;
}

// ════════════════════════════════════════════════════
// ── TRANG SẢN PHẨM (products.html) ─────────────────
// ════════════════════════════════════════════════════

function initProductsPage() {
    const list           = document.getElementById("product-list");
    const searchInput    = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");

    if (!list || !searchInput || !categoryFilter) return;

    [...new Set(products.map(p => p.category))].forEach(cat => {
        const opt       = document.createElement("option");
        opt.value       = cat;
        opt.textContent = cat;
        categoryFilter.appendChild(opt);
    });

    function render() {
        const kw  = searchInput.value.toLowerCase().trim();
        const cat = categoryFilter.value;

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(kw) &&
            (cat === "" || p.category === cat)
        );

        list.innerHTML = filtered.length
            ? filtered.map(productCard).join("")
            : `<p class="empty-products">Không tìm thấy sản phẩm phù hợp.</p>`;
    }

    searchInput.addEventListener("input", render);
    categoryFilter.addEventListener("change", render);
    render();
}

// ════════════════════════════════════════════════════
// ── TRANG CHI TIẾT (detail.html) ────────────────────
// ════════════════════════════════════════════════════

function initDetailPage() {
    const root = document.getElementById("detail-root");
    if (!root) return;

    const id      = Number(new URLSearchParams(window.location.search).get("id"));
    const product = products.find(p => p.id === id);

    if (!product) {
        document.title = "Không tìm thấy - Anh Phát";
        root.innerHTML = `
            <div style="text-align:center;padding:80px 20px">
                <p style="font-size:64px;margin-bottom:16px">🔍</p>
                <h2 style="margin-bottom:12px">Không tìm thấy sản phẩm</h2>
                <p style="color:var(--muted);margin-bottom:24px">
                    Sản phẩm không tồn tại hoặc đã bị xóa.
                </p>
                <a href="products.html" class="add-cart"
                   style="display:inline-block;padding:12px 24px;border-radius:8px">
                    ← Quay lại danh sách
                </a>
            </div>
        `;
        return;
    }

    document.title = `${product.name} - Anh Phát`;

    root.innerHTML = `
        <div class="detail-container">
            <div class="detail-image-box">
                <img src="${escapeHtml(product.image)}"
                     alt="${escapeHtml(product.name)}">
            </div>
            <div class="detail-info-box">
                <span class="detail-category">${escapeHtml(product.category)}</span>
                <h1>${escapeHtml(product.name)}</h1>
                <p class="detail-price">${formatPrice(product.price)}</p>
                <p class="detail-desc">${escapeHtml(product.description)}</p>

                <div class="detail-actions">
                    <button class="add-cart" type="button"
                            data-add-to-cart="${product.id}">
                        + Thêm vào giỏ
                    </button>
                </div>

                <a href="products.html" class="back-link">← Quay lại danh sách</a>
            </div>
        </div>

        <section class="related-section">
            <h2 class="related-title">Sản phẩm liên quan</h2>
            <div class="product-list" id="related-list"></div>
        </section>
    `;

    const related = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    document.getElementById("related-list").innerHTML = related.length
        ? related.map(productCard).join("")
        : `<p style="color:var(--muted)">Không có sản phẩm liên quan.</p>`;
}

// ════════════════════════════════════════════════════
// ── TRANG GIỎ HÀNG (cart.html) ──────────────────────
// ════════════════════════════════════════════════════

const VOUCHER_CODE     = "MYSHOP50";
const VOUCHER_DISCOUNT = 50000;
const SHIPPING_FEE     = 30000;
let discount = 0;

function renderCartPage() {
    const cartList = document.getElementById("cart-list");
    if (!cartList) return;
    const items = getCart();

    if (items.length === 0) {
        discount = 0;
        cartList.innerHTML = `
            <p class="empty-cart">Giỏ hàng của bạn đang trống.</p> `;
    } else {
        cartList.innerHTML = items.map(item => `
            <article class="cart-item">
                <img src="${item.image}" alt="${item.name}"
                     class="cart-item-image">
                <div class="cart-item-info">
                    <h3>
                        <a href="detail.html?id=${item.id}">${item.name}</a>
                    </h3>
                    <p>${formatPrice(item.price)}</p>
                    <label>Số lượng:
                        <input type="number" min="1" value="${item.quantity}"
                               data-quantity="${item.id}"
                               aria-label="Số lượng ${item.name}">
                    </label>
                </div>
                <button type="button" class="remove-cart-item"
                        data-remove="${item.id}">
                    Xóa
                </button>
            </article>
        `).join("");
    }
    updateCartCount();
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal        = getCartTotal();
    const shipping        = subtotal > 0 ? SHIPPING_FEE : 0;
    const appliedDiscount = Math.min(discount, subtotal);
    const total           = Math.max(0, subtotal - appliedDiscount + shipping);

    document.getElementById("cart-subtotal").textContent = formatPrice(subtotal);
    document.getElementById("cart-discount").textContent = formatPrice(appliedDiscount);
    document.getElementById("cart-shipping").textContent = formatPrice(shipping);
    document.getElementById("cart-total").textContent    = formatPrice(total);
}

function applyVoucher() {
    const input    = document.getElementById("voucher");
    const note     = document.getElementById("voucher-note");
    const code     = input.value.trim().toUpperCase();
    const hasItems = getCart().length > 0;

    if (code === VOUCHER_CODE && hasItems) {
        discount             = VOUCHER_DISCOUNT;
        note.textContent     = "✓ Đã áp dụng mã giảm 50.000đ.";
        note.style.color     = "var(--green)";
    } else {
        discount             = 0;
        note.style.color     = "#dc2626";
        note.textContent     = code === VOUCHER_CODE
            ? "Bạn cần có sản phẩm trong giỏ để dùng mã."
            : "Mã không hợp lệ. Hãy nhập MYSHOP50.";
    }

    updateCartSummary();
}

function initCartPage() {
    const cartList     = document.getElementById("cart-list");
    const applyBtn     = document.getElementById("apply-voucher");
    const checkoutBtn  = document.getElementById("checkout-button");
    const voucherInput = document.getElementById("voucher");

    if (!cartList || !applyBtn || !checkoutBtn) return;

    cartList.addEventListener("click", e => {
        const btn = e.target.closest("[data-remove]");
        if (btn) { removeFromCart(btn.dataset.remove); renderCartPage(); }
    });

    cartList.addEventListener("change", e => {
        const input = e.target.closest("[data-quantity]");
        if (input) {
            setCartItemQuantity(input.dataset.quantity, input.value);
            renderCartPage();
        }
    });

    applyBtn.addEventListener("click", applyVoucher);
    voucherInput?.addEventListener("keydown", e => {
        if (e.key === "Enter") applyVoucher();
    });

    checkoutBtn.addEventListener("click", () => {
        if (getCart().length === 0) {
            alert("Giỏ hàng đang trống. Hãy thêm sản phẩm trước khi thanh toán.");
            return;
        }
        alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại Anh Phát.");
    });

    renderCartPage();
}

// ════════════════════════════════════════════════════
// ── 8.1 BANNER SLIDER (CÓ MẢNG LƯU TRỮ DATA) ────────
// ════════════════════════════════════════════════════

function initBannerSlider() {
    const sliderEl = document.getElementById("hero-slider");
    if (!sliderEl || !banners || banners.length === 0) return;

    let currentIndex = 0;
    let slideTimer   = null;

    const tagEl         = document.getElementById("slider-tag");
    const titleEl       = document.getElementById("slider-title");
    const highlightEl   = document.getElementById("slider-highlight");
    const descEl        = document.getElementById("slider-desc");
    const imgEl         = document.getElementById("slider-image");
    const floatIconEl   = document.getElementById("slider-float-icon");
    const floatTitleEl  = document.getElementById("slider-float-title");
    const floatDescEl   = document.getElementById("slider-float-desc");
    const dotsContainer = document.getElementById("slider-dots");
    const prevBtn       = document.getElementById("slider-prev");
    const nextBtn       = document.getElementById("slider-next");

    if (!dotsContainer) return;

    dotsContainer.innerHTML = banners.map((_, idx) => `
        <button type="button" class="slider-dot ${idx === 0 ? "active" : ""}"
                data-slide="${idx}" aria-label="Slide ${idx + 1}"></button>
    `).join("");

    function renderSlide(index) {
        const item = banners[index];
        if (!item) return;

        if (tagEl)        tagEl.textContent        = item.tag;
        if (titleEl)      titleEl.textContent      = item.title;
        if (highlightEl)  highlightEl.textContent  = item.highlight;
        if (descEl)       descEl.textContent       = item.description;
        if (imgEl) {
            imgEl.src = item.image;
            imgEl.alt = item.title;
        }
        if (floatIconEl)  floatIconEl.textContent  = item.floatingIcon;
        if (floatTitleEl) floatTitleEl.textContent = item.floatingTitle;
        if (floatDescEl)  floatDescEl.textContent  = item.floatingDesc;

        dotsContainer.querySelectorAll(".slider-dot").forEach((dot, idx) => {
            dot.classList.toggle("active", idx === index);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % banners.length;
        renderSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + banners.length) % banners.length;
        renderSlide(currentIndex);
    }

    function resetAutoSlide() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 4000);
    }

    prevBtn?.addEventListener("click", () => { prevSlide(); resetAutoSlide(); });
    nextBtn?.addEventListener("click", () => { nextSlide(); resetAutoSlide(); });

    dotsContainer.addEventListener("click", e => {
        const dot = e.target.closest(".slider-dot");
        if (!dot) return;
        currentIndex = Number(dot.dataset.slide);
        renderSlide(currentIndex);
        resetAutoSlide();
    });

    renderSlide(0);
    resetAutoSlide();
}

// ════════════════════════════════════════════════════
// ── 8.2 CHECK FORM & AUTH TABS (Đăng nhập, Đăng ký, Liên hệ)
// ════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.toggle("input-error", Boolean(message));
    if (error) error.textContent = message;
    return !message;
}

function initAuthTabs() {
    const tabContainer = document.getElementById("auth-tabs");
    if (!tabContainer) return;

    function switchTab(targetId) {
        document.querySelectorAll(".auth-panel").forEach(panel => {
            panel.classList.toggle("hidden", panel.id !== targetId);
        });

        tabContainer.querySelectorAll(".auth-tab").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.target === targetId);
        });
    }

    tabContainer.addEventListener("click", e => {
        const btn = e.target.closest(".auth-tab");
        if (btn) switchTab(btn.dataset.target);
    });

    document.addEventListener("click", e => {
        const link = e.target.closest("[data-switch-tab]");
        if (link) {
            e.preventDefault();
            switchTab(link.dataset.switchTab);
        }
    });
}

function initRegisterForm() {
    const form = document.getElementById("register-form");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();
        let isValid = true;

        const fullname = document.getElementById("reg-fullname").value.trim();
        const email    = document.getElementById("reg-email").value.trim();
        const phone    = document.getElementById("reg-phone").value.trim();
        const password = document.getElementById("reg-password").value;
        const confirm  = document.getElementById("reg-confirm").value;
        const success  = document.getElementById("register-success");
        if (success) success.textContent = "";

        if (fullname === "") {
            isValid = setFieldError("reg-fullname", "err-reg-fullname", "Vui lòng nhập họ và tên.") && isValid;
        } else if (fullname.length < 3 || fullname.length > 50) {
            isValid = setFieldError("reg-fullname", "err-reg-fullname", "Họ và tên phải từ 3 đến 50 ký tự.") && isValid;
        } else if (/\d/.test(fullname)) {
            isValid = setFieldError("reg-fullname", "err-reg-fullname", "Họ và tên không được chứa chữ số.") && isValid;
        } else {
            setFieldError("reg-fullname", "err-reg-fullname", "");
        }

        if (email === "") {
            isValid = setFieldError("reg-email", "err-reg-email", "Vui lòng nhập địa chỉ email.") && isValid;
        } else if (email.length < 5 || email.length > 100) {
            isValid = setFieldError("reg-email", "err-reg-email", "Email phải có độ dài từ 5 đến 100 ký tự.") && isValid;
        } else if (!EMAIL_REGEX.test(email)) {
            isValid = setFieldError("reg-email", "err-reg-email", "Email không đúng định dạng (VD: ten@gmail.com).") && isValid;
        } else {
            setFieldError("reg-email", "err-reg-email", "");
        }

        if (phone === "") {
            isValid = setFieldError("reg-phone", "err-reg-phone", "Vui lòng nhập số điện thoại.") && isValid;
        } else if (!PHONE_REGEX.test(phone)) {
            isValid = setFieldError("reg-phone", "err-reg-phone", "Số điện thoại không đúng định dạng (10 số, đầu 03/05/07/08/09).") && isValid;
        } else {
            setFieldError("reg-phone", "err-reg-phone", "");
        }

        if (password === "") {
            isValid = setFieldError("reg-password", "err-reg-password", "Vui lòng nhập mật khẩu.") && isValid;
        } else if (password.length < 6 || password.length > 32) {
            isValid = setFieldError("reg-password", "err-reg-password", "Mật khẩu phải có độ dài từ 6 đến 32 ký tự.") && isValid;
        } else {
            setFieldError("reg-password", "err-reg-password", "");
        }

        if (confirm === "") {
            isValid = setFieldError("reg-confirm", "err-reg-confirm", "Vui lòng xác nhận lại mật khẩu.") && isValid;
        } else if (confirm !== password) {
            isValid = setFieldError("reg-confirm", "err-reg-confirm", "Mật khẩu xác nhận không khớp.") && isValid;
        } else {
            setFieldError("reg-confirm", "err-reg-confirm", "");
        }

        if (isValid && success) {
            success.textContent = "✓ Đăng ký tài khoản thành công!";
            form.reset();
        }
    });
}

function initLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();
        let isValid = true;

        const email    = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const success  = document.getElementById("login-success");
        if (success) success.textContent = "";

        if (email === "") {
            isValid = setFieldError("login-email", "err-login-email", "Vui lòng nhập email đăng nhập.") && isValid;
        } else if (email.length < 5 || email.length > 100) {
            isValid = setFieldError("login-email", "err-login-email", "Email phải có độ dài từ 5 đến 100 ký tự.") && isValid;
        } else if (!EMAIL_REGEX.test(email)) {
            isValid = setFieldError("login-email", "err-login-email", "Email không đúng định dạng (VD: ten@gmail.com).") && isValid;
        } else {
            setFieldError("login-email", "err-login-email", "");
        }

        if (password === "") {
            isValid = setFieldError("login-password", "err-login-password", "Vui lòng nhập mật khẩu.") && isValid;
        } else if (password.length < 6 || password.length > 32) {
            isValid = setFieldError("login-password", "err-login-password", "Mật khẩu phải từ 6 đến 32 ký tự.") && isValid;
        } else {
            setFieldError("login-password", "err-login-password", "");
        }

        if (isValid && success) {
            success.textContent = "✓ Đăng nhập thành công! Chào mừng bạn quay lại.";
            form.reset();
        }
    });
}

function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();
        let isValid = true;

        const fullname = document.getElementById("ct-fullname").value.trim();
        const email    = document.getElementById("ct-email").value.trim();
        const phone    = document.getElementById("ct-phone").value.trim();
        const message  = document.getElementById("ct-message").value.trim();
        const success  = document.getElementById("contact-success");
        if (success) success.textContent = "";

        if (fullname === "") {
            isValid = setFieldError("ct-fullname", "err-ct-fullname", "Vui lòng nhập họ và tên.") && isValid;
        } else if (fullname.length < 3 || fullname.length > 50) {
            isValid = setFieldError("ct-fullname", "err-ct-fullname", "Họ và tên phải từ 3 đến 50 ký tự.") && isValid;
        } else if (/\d/.test(fullname)) {
            isValid = setFieldError("ct-fullname", "err-ct-fullname", "Họ và tên không được chứa chữ số.") && isValid;
        } else {
            setFieldError("ct-fullname", "err-ct-fullname", "");
        }

        if (email === "") {
            isValid = setFieldError("ct-email", "err-ct-email", "Vui lòng nhập email liên hệ.") && isValid;
        } else if (!EMAIL_REGEX.test(email)) {
            isValid = setFieldError("ct-email", "err-ct-email", "Email không đúng định dạng (VD: ten@gmail.com).") && isValid;
        } else {
            setFieldError("ct-email", "err-ct-email", "");
        }

        if (phone === "") {
            isValid = setFieldError("ct-phone", "err-ct-phone", "Vui lòng nhập số điện thoại.") && isValid;
        } else if (!PHONE_REGEX.test(phone)) {
            isValid = setFieldError("ct-phone", "err-ct-phone", "Số điện thoại không đúng định dạng (10 chữ số).") && isValid;
        } else {
            setFieldError("ct-phone", "err-ct-phone", "");
        }

        if (message === "") {
            isValid = setFieldError("ct-message", "err-ct-message", "Vui lòng nhập nội dung liên hệ.") && isValid;
        } else if (message.length < 10 || message.length > 500) {
            isValid = setFieldError("ct-message", "err-ct-message", "Nội dung liên hệ phải từ 10 đến 500 ký tự.") && isValid;
        } else {
            setFieldError("ct-message", "err-ct-message", "");
        }

        if (isValid && success) {
            success.textContent = "✓ Gửi liên hệ thành công! Anh Phát sẽ phản hồi sớm nhất.";
            form.reset();
        }
    });
}

// ════════════════════════════════════════════════════
// ── PAGE ROUTER ─────────────────────────────────────
// Tự động nhận biết trang và khởi chạy đúng module
// ════════════════════════════════════════════════════

function initPage() {
    highlightActiveNav();
    initializeCart();
    initMiniCart();

    if (document.getElementById("hero-slider"))    initBannerSlider();
    if (document.getElementById("featured-list"))  initHomePage();
    if (document.getElementById("search-input"))   initProductsPage();
    if (document.getElementById("detail-root"))    initDetailPage();
    if (document.getElementById("cart-list"))      initCartPage();

    if (document.getElementById("auth-tabs"))      initAuthTabs();
    if (document.getElementById("register-form"))  initRegisterForm();
    if (document.getElementById("login-form"))     initLoginForm();
    if (document.getElementById("contact-form"))   initContactForm();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage, { once: true });
} else {
    initPage();
}
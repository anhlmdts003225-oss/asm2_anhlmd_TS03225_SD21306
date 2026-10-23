// auth.js - Quản lý Đăng ký, Đăng nhập thực tế & Phân quyền (ASM2)
const USERS_KEY        = "ap_users";
const CURRENT_USER_KEY = "ap_current_user";

export function getUsers() {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    // Tạo sẵn tài khoản Admin mặc định
    const defaultUsers = [
        {
            id: 1,
            fullname: "Quản trị viên",
            email: "admin@gmail.com",
            phone: "0901234567",
            password: "123456",
            role: "admin"
        }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
}

export function getCurrentUser() {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
}

export function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "login.html";
}

// Cập nhật thanh điều hướng (Header) theo trạng thái đăng nhập
function renderAuthNav() {
    const navList = document.querySelector(".nav-list");
    if (!navList) return;

    const user = getCurrentUser();
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf("/") + 1) || "index.html";

    // Thêm link "Lịch sử đơn" nếu chưa có trên menu
    if (!navList.querySelector('a[href="orders.html"]')) {
        const liOrders = document.createElement("li");
        liOrders.innerHTML = `<a href="orders.html" class="${currentPage === "orders.html" ? "active" : ""}">Lịch sử đơn</a>`;
        const loginLi = navList.querySelector('a[href="login.html"]')?.parentElement;
        if (loginLi) navList.insertBefore(liOrders, loginLi);
        else navList.appendChild(liOrders);
    }

    // Nếu là Admin thì thêm link "Quản trị"
    if (user && user.role === "admin" && !navList.querySelector('a[href="admin.html"]')) {
        const liAdmin = document.createElement("li");
        liAdmin.innerHTML = `<a href="admin.html" class="${currentPage === "admin.html" ? "active" : ""}">Quản trị</a>`;
        const loginLi = navList.querySelector('a[href="login.html"]')?.parentElement;
        if (loginLi) navList.insertBefore(liAdmin, loginLi);
        else navList.appendChild(liAdmin);
    }

    // Thay nút "Đăng nhập" bằng tên User + nút "Đăng xuất"
    const loginLink = navList.querySelector('a[href="login.html"]');
    if (user && loginLink) {
        const li = loginLink.parentElement;
        li.className = "user-nav-item";
        li.innerHTML = `
            <span class="user-badge">👤 ${user.fullname}</span>
            <button type="button" class="btn-logout" id="logout-btn">Đăng xuất</button>
        `;
        document.getElementById("logout-btn")?.addEventListener("click", logoutUser);
    }
}

// Kết nối với form Đăng ký và Đăng nhập sẵn có ở login.html
function bindAuthForms() {
    const regForm   = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // 1. Xử lý lưu tài khoản Đăng ký vào LocalStorage
    if (regForm) {
        let draftReg = null;
        // Bắt dữ liệu ở pha Capture trước khi app.js gọi form.reset()
        regForm.addEventListener("submit", () => {
            draftReg = {
                fullname: document.getElementById("reg-fullname")?.value.trim() || "",
                email:    document.getElementById("reg-email")?.value.trim().toLowerCase() || "",
                phone:    document.getElementById("reg-phone")?.value.trim() || "",
                password: document.getElementById("reg-password")?.value || ""
            };
        }, true);

        regForm.addEventListener("submit", () => {
            const successEl = document.getElementById("register-success");
            const errEmail  = document.getElementById("err-reg-email");
            if (!successEl || ! successEl.textContent.includes("thành công") || !draftReg) return;

            const users = getUsers();
            if (users.some(u => u.email.toLowerCase() === draftReg.email)) {
                successEl.textContent = "";
                if (errEmail) errEmail.textContent = "Email này đã được đăng ký. Vui lòng dùng email khác.";
                return;
            }

            users.push({
                id: Date.now(),
                fullname: draftReg.fullname,
                email: draftReg.email,
                phone: draftReg.phone,
                password: draftReg.password,
                role: "customer"
            });
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            successEl.textContent = "✓ Đăng ký thành công! Bạn có thể chuyển sang tab Đăng nhập.";
        });
    }

    // 2. Xử lý kiểm tra tài khoản Đăng nhập từ LocalStorage
    if (loginForm) {
        let draftLogin = null;
        loginForm.addEventListener("submit", () => {
            draftLogin = {
                email:    document.getElementById("login-email")?.value.trim().toLowerCase() || "",
                password: document.getElementById("login-password")?.value || ""
            };
        }, true);

        loginForm.addEventListener("submit", () => {
            const successEl = document.getElementById("login-success");
            const errPass   = document.getElementById("err-login-password");
            if (!successEl || !successEl.textContent.includes("thành công") || !draftLogin) return;

            const users = getUsers();
            const found = users.find(
                u => u.email.toLowerCase() === draftLogin.email && u.password === draftLogin.password
            );

            if (!found) {
                successEl.textContent = "";
                if (errPass) errPass.textContent = "Email hoặc mật khẩu không chính xác!";
                return;
            }

            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
            successEl.textContent = `✓ Xin chào ${found.fullname}! Đang chuyển hướng...`;

            setTimeout(() => {
                window.location.href = found.role === "admin" ? "admin.html" : "index.html";
            }, 800);
        });
    }
}

function initAuth() {
    getUsers(); // Khởi tạo tài khoản Admin mặc định nếu chưa có
    renderAuthNav();
    bindAuthForms();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuth, { once: true });
} else {
    initAuth();
}
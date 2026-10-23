// cart.js - Module xử lý toàn bộ nghiệp vụ giỏ hàng với localStorage
import { products } from "./data.js";

const CART_STORAGE_KEY = "cart";

// Khởi tạo biến giỏ hàng bằng cách đọc từ localStorage
let cart = loadAndNormalizeCart();

// Hàm đọc và chuẩn hóa dữ liệu giỏ hàng từ localStorage
function loadAndNormalizeCart() {
    let savedCart = [];

    try {
        const storedValue = localStorage.getItem(CART_STORAGE_KEY);
        savedCart = storedValue ? JSON.parse(storedValue) : [];
    } catch {
        return [];
    }

    if (!Array.isArray(savedCart)) return [];

    const normalizedCart = [];

    // Kiểm tra từng sản phẩm trong localStorage xem có tồn tại trong data.js không
    savedCart.forEach(item => {
        const product = products.find(
            candidate => candidate.id === Number(item?.id)
        );

        if (!product) return;

        const quantity = Math.max(1, Number(item.quantity) || 1);
        const existingItem = normalizedCart.find(
            candidate => candidate.id === product.id
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            normalizedCart.push({ ...product, quantity });
        }
    });

    return normalizedCart;
}

// Hàm lưu giỏ hàng hiện tại vào localStorage
function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Không thể lưu giỏ hàng:", error);
    }
}

// Lấy danh sách sản phẩm trong giỏ hàng
export function getCart() {
    return cart.map(item => ({ ...item }));
}

// Tính tổng số lượng sản phẩm đang có trong giỏ
export function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Cập nhật số hiển thị trên thanh menu: Giỏ hàng (0)
export function updateCartCount() {
    const countElement = document.getElementById("cartcount");

    if (countElement) {
        countElement.textContent = String(getCartCount());
    }
}

// Thêm sản phẩm vào giỏ (mặc định số lượng thêm là 1)
export function addToCart(id, quantity = 1) {
    const product = products.find(
        candidate => candidate.id === Number(id)
    );

    if (!product) return;

    const addQty = Math.max(1, Number(quantity) || 1);
    const existingItem = cart.find(item => item.id === product.id);

    // Nếu đã có trong giỏ thì cộng dồn số lượng, chưa có thì thêm mới
    if (existingItem) {
        existingItem.quantity += addQty;
    } else {
        cart.push({ ...product, quantity: addQty });
    }

    saveCart();
    updateCartCount();
}

// Xóa 1 sản phẩm khỏi giỏ hàng theo id
export function removeFromCart(id) {
    cart = cart.filter(item => item.id !== Number(id));
    saveCart();
    updateCartCount();
}

// Thay đổi số lượng sản phẩm trong trang giỏ hàng
export function setCartItemQuantity(id, quantity) {
    const item = cart.find(candidate => candidate.id === Number(id));

    if (!item) return;

    const nextQuantity = Number(quantity);

    // Nếu số lượng nhỏ hơn 1 thì xóa luôn sản phẩm
    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
        removeFromCart(id);
        return;
    }

    item.quantity = Math.floor(nextQuantity);
    saveCart();
    updateCartCount();
}

// Tính tổng tiền tạm tính của giỏ hàng
export function getCartTotal() {
    return cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
}

// Khởi tạo giỏ hàng khi mới tải trang
export function initializeCart() {
    saveCart();
    updateCartCount();
}   
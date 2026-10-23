// data.js - Module lưu trữ 12 sản phẩm gốc, banners (Lab 8) và đồng bộ LocalStorage (ASM2)

const defaultProducts = [
    {
        id: 1,
        name: "Bộ nồi inox 5 món",
        price: 1290000,
        category: "Nồi & Chảo",
        description: "Bộ nồi inox 304 cao cấp 5 món đáy 3 lớp truyền nhiệt nhanh, dùng được trên mọi loại bếp kể cả bếp từ.",
        image: "hinh1.jpg"
    },
    {
        id: 2,
        name: "Chảo chống dính",
        price: 369000,
        category: "Nồi & Chảo",
        description: "Chảo phủ lớp chống dính vân đá an toàn sức khỏe, tay cầm cách nhiệt chắc chắn, dễ dàng vệ sinh.",
        image: "hinh2.jpg"
    },
    {
        id: 3,
        name: "Nồi lẩu inox",
        price: 599000,
        category: "Nồi & Chảo",
        description: "Nồi lẩu inox nắp kính cường lực trong suốt, thiết kế sang trọng phù hợp cho bữa ăn gia đình từ 4-6 người.",
        image: "hinh3.jpg"
    },
    {
        id: 4,
        name: "Nồi hấp 2 tầng",
        price: 749000,
        category: "Nồi & Chảo",
        description: "Nồi hấp 2 tầng tiện lợi giúp giữ trọn hương vị và dinh dưỡng món ăn, chất liệu inox sáng bóng bền bỉ.",
        image: "hinh4.jpg"
    },
    {
        id: 5,
        name: "Ấm đun nước",
        price: 329000,
        category: "Phụ kiện bếp",
        description: "Ấm đun nước inox có còi báo khi nước sôi, đáy từ đun sôi nhanh chóng và tiết kiệm năng lượng.",
        image: "hinh5.jpg"
    },
    {
        id: 6,
        name: "Bộ dao nhà bếp",
        price: 459000,
        category: "Dụng cụ bếp",
        description: "Bộ dao thép không gỉ sắc bén kèm hộp cắm gỗ tự nhiên, đáp ứng đầy đủ nhu cầu cắt thái trong gian bếp.",
        image: "hinh6.jpg"
    },
    {
        id: 7,
        name: "Bộ bát đĩa sứ",
        price: 699000,
        category: "Phụ kiện bếp",
        description: "Bộ bát đĩa sứ tráng men cao cấp phong cách tối giản, an toàn khi sử dụng trong lò vi sóng và máy rửa chén.",
        image: "hinh7.jpg"
    },
    {
        id: 8,
        name: "Dụng cụ nhà bếp",
        price: 249000,
        category: "Dụng cụ bếp",
        description: "Bộ muôi vá sạn chịu nhiệt cao cấp, không làm trầy xước bề mặt nồi chảo chống dính.",
        image: "hinh8.jpg"
    },
    // ── 4 SẢN PHẨM MỚI (HÌNH ẢNH CHUẨN KHỚP 100%) ──
    {
        id: 9,
        name: "Nồi gang tráng men đúc nguyên khối",
        price: 1150000,
        category: "Nồi & Chảo",
        description: "Nồi gang đúc tráng men cao cấp giữ nhiệt vượt trội, thích hợp cho các món hầm, kho và nấu súp gia đình.",
        image: "hinh9.jpg"
    },
    {
        id: 10,
        name: "Bộ máy pha cà phê & xay hạt tự động",
        price: 2490000,
        category: "Phụ kiện bếp",
        description: "Bộ đôi máy pha cà phê bình giữ nhiệt inox kèm máy xay hạt chuyên dụng cho hương vị cà phê nguyên bản mỗi sáng.",
        image: "hinh10.jpg"
    },
    {
        id: 11,
        name: "Bộ dao đầu bếp cán gỗ 5 món kèm túi da",
        price: 850000,
        category: "Dụng cụ bếp",
        description: "Bộ 5 món dao, nĩa và cây liếc mài dao thép nguyên khối cán gỗ tự nhiên, đi kèm túi cuộn da bảo quản chuyên nghiệp.",
        image: "hinh11.jpg"
    },
    {
        id: 12,
        name: "Combo nồi hầm & chảo inox 304 bếp từ",
        price: 1450000,
        category: "Nồi & Chảo",
        description: "Bộ đôi nồi hầm dung tích lớn và chảo chiên inox 304 sáng bóng, truyền nhiệt nhanh và dùng bền bỉ trên mọi loại bếp.",
        image: "hinh12.jpg"
    }
];

// ════════════════════════════════════════════════════
// ── DỮ LIỆU SLIDER BANNER (LAB 8 - 8.1) ──────────────
// ════════════════════════════════════════════════════
export const banners = [
    {
        id: 1,
        tag: "🌿 BỘ SƯU TẬP BẾP MỘC 2026",
        title: "Nâng tầm gian bếp,",
        highlight: "giữ lửa yêu thương",
        description: "Khám phá các dòng nồi chảo inox 304, phụ kiện sứ cao cấp và thiết bị bếp thông minh. Nhập mã MYSHOP50 để được giảm ngay 50.000đ cho đơn hàng hôm nay!",
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80",
        floatingIcon: "🎁",
        floatingTitle: "Ưu đãi MYSHOP50",
        floatingDesc: "Giảm 50.000đ mọi đơn hàng"
    },
    {
        id: 2,
        tag: "✨ INOX 304 CHUẨN CHÂU ÂU",
        title: "Bền bỉ theo năm tháng,",
        highlight: "an toàn cho sức khỏe",
        description: "Bộ sưu tập nồi chảo đáy 3 lớp truyền nhiệt nhanh, giữ trọn dinh dưỡng trong từng món ăn và tương thích hoàn hảo với mọi loại bếp từ.",
        image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1000&q=80",
        floatingIcon: "🛡️",
        floatingTitle: "Bảo hành 24 tháng",
        floatingDesc: "1 đổi 1 nếu lỗi nhà sản xuất"
    },
    {
        id: 3,
        tag: "☕ PHONG CÁCH SỐNG HIỆN ĐẠI",
        title: "Khởi đầu ngày mới,",
        highlight: "trọn vị tinh tế",
        description: "Trải nghiệm thiết bị pha chế tự động và bộ dụng cụ làm bếp chuyên nghiệp giúp việc vào bếp mỗi ngày trở thành niềm cảm hứng.",
        image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80",
        floatingIcon: "🚚",
        floatingTitle: "Giao nhanh 2 giờ",
        floatingDesc: "Miễn phí nội thành đơn từ 500k"
    }
];

// ════════════════════════════════════════════════════
// ── ĐỒNG BỘ DỮ LIỆU CRUD VỚI LOCALSTORAGE (ASM2) ────
// ════════════════════════════════════════════════════
const PRODUCTS_KEY   = "ap_products";
const CATEGORIES_KEY = "ap_categories";

function loadProducts() {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Nếu dính dữ liệu 8 món mẫu cũ thì tự động ghi đè lại bằng 12 món chuẩn của bạn
            const isOldMock = parsed.some(p => p.id === 7 && p.name === "Bình giữ nhiệt Inox");
            if (!isOldMock && Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch { /* ignore */ }
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
}

function loadCategories(productList) {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    const initialCats = [...new Set(productList.map(p => p.category))].map((name, idx) => ({
        id: idx + 1,
        name
    }));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(initialCats));
    return initialCats;
}

export const products   = loadProducts();
export const categories = loadCategories(products);
window.app = (() => {
    const key = "products";
    const favKey = "favorites";
    const themeKey = "darkMode";
    const cats = {
        shirts: { name: "shirts", bg: "#dbeafe", color: "#1d4ed8" },
        pants: { name: "pants", bg: "#ede9fe", color: "#6d28d9" },
        accessories: { name: "accessories", bg: "#d1fae5", color: "#065f46" }
    };

    function read(name, backup) {
        try {
            return JSON.parse(localStorage.getItem(name)) || backup;
        } catch (e) {
            return backup;
        }
    }

    function write(name, data) {
        localStorage.setItem(name, JSON.stringify(data));
    }

    function makeId() {
        return Date.now() + Math.random();
    }

    function category(value) {
        const text = String(value || "").trim().toLowerCase();
        if (text.includes("shirt") || text.includes("t-shirt") || text.includes("hoodie") || text.includes("jacket") || text === "men") return "shirts";
        if (text.includes("pant") || text.includes("jean") || text.includes("trouser") || text.includes("short") || text === "women") return "pants";
        if (text.includes("access") || text.includes("watch") || text.includes("cap") || text.includes("belt") || text.includes("bag") || text === "kids") return "accessories";
        return "accessories";
    }

    function clean(product) {
        const item = product || {};
        return {
            id: item.id || makeId(),
            name: String(item.name || "unnamed cloth").trim() || "unnamed cloth",
            category: category(item.category || item.name),
            price: Number(item.price) || 0,
            image: item.image || "",
            createdAt: item.createdAt || new Date().toISOString()
        };
    }

    function products() {
        const list = read(key, []).map(clean);
        write(key, list);
        return list;
    }

    function saveProducts(list) {
        write(key, list.map(clean));
        updateCounters();
    }

    function addProduct(product) {
        const list = products();
        const item = clean(product);
        list.push(item);
        saveProducts(list);
        return item;
    }

    function editProduct(id, data) {
        const list = products().map(item => String(item.id) === String(id) ? clean({ ...item, ...data, id: item.id }) : item);
        saveProducts(list);
    }

    function deleteProduct(id) {
        const list = products().filter(item => String(item.id) !== String(id));
        const favList = favorites().filter(item => String(item.id) !== String(id));
        saveProducts(list);
        write(favKey, favList);
    }

    function favorites() {
        return read(favKey, []);
    }

    function isFavorite(id) {
        return favorites().some(item => String(item.id) === String(id));
    }

    function toggleFavorite(product) {
        let list = favorites();
        if (isFavorite(product.id)) {
            list = list.filter(item => String(item.id) !== String(product.id));
        } else {
            list.push(clean(product));
        }
        write(favKey, list);
        return isFavorite(product.id);
    }

    function color(cat) {
        return cats[category(cat)] || cats.accessories;
    }

    function money(price) {
        return "$" + (Number(price) || 0).toFixed(2);
    }

    function title(cat) {
        return cats[category(cat)].name;
    }

    function updateCounters() {
        const list = read(key, []).map(clean);
        const data = {
            totalProducts: list.length,
            totalCategories: new Set(list.map(item => item.category)).size,
            totalOutfits: list.length,
            totalWorth: list.reduce((sum, item) => sum + item.price, 0).toFixed(2),
            shirts: list.filter(item => item.category === "shirts").length,
            pants: list.filter(item => item.category === "pants").length,
            accessories: list.filter(item => item.category === "accessories").length,
            imagesUploaded: list.filter(item => item.image).length
        };
        write("dashboardCounters", data);
        return data;
    }

    function applyTheme() {
        const dark = localStorage.getItem(themeKey) === "enabled";
        document.body.classList.toggle("dark", dark);
        document.querySelectorAll(".themeBtn").forEach(btn => {
            btn.textContent = dark ? "light mode" : "dark mode";
        });
    }

    function toggleTheme() {
        const dark = localStorage.getItem(themeKey) === "enabled";
        localStorage.setItem(themeKey, dark ? "disabled" : "enabled");
        applyTheme();
    }

    function setupTheme() {
        applyTheme();
        document.querySelectorAll(".themeBtn").forEach(btn => {
            btn.onclick = toggleTheme;
        });
    }

    return { products, addProduct, editProduct, deleteProduct, favorites, isFavorite, toggleFavorite, color, money, title, category, updateCounters, setupTheme, applyTheme };
})();

document.addEventListener("DOMContentLoaded", () => app.setupTheme());

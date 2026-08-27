// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 1/7
// =====================================================

"use strict";

// =====================================================
// SUPABASE CONNECTION
// =====================================================

let db = null;

// =====================================================
// GET SUPABASE CLIENT
// =====================================================

function getSupabaseClient() {

    // If already available, use existing client
    if (db) {
        return db;
    }

    // Use the client created by supabase.js
    if (
        window.supabaseClient &&
        typeof window.supabaseClient.from === "function"
    ) {
        db =
            window.supabaseClient;

        console.log(
            "Everything 400: Supabase client ready."
        );

        return db;
    }

    // Fallback: check Supabase library
    if (
        typeof window.supabase === "undefined" ||
        typeof window.supabase.createClient !== "function"
    ) {
        console.error(
            "Everything 400: Supabase library is not loaded."
        );

        return null;
    }

    console.error(
        "Everything 400: Supabase client was not initialized."
    );

    return null;
}

// =====================================================
// GLOBAL ELEMENTS
// =====================================================

const productContainer =
    document.getElementById(
        "product-container"
    );

const cartItemsContainer =
    document.getElementById(
        "cart-items"
    );

const cartTotalElement =
    document.getElementById(
        "cart-total"
    );

const checkoutItemsContainer =
    document.getElementById(
        "checkout-items"
    );

const checkoutTotalElement =
    document.getElementById(
        "checkout-total"
    );

const checkoutForm =
    document.getElementById(
        "checkout-form"
    );

const checkoutButton =
    document.getElementById(
        "checkout-button"
    );

const customerOrderStatus =
    document.getElementById(
        "customer-order-status"
    );

// =====================================================
// CART
// =====================================================

let cart = [];

try {

    const savedCart =
        localStorage.getItem(
            "cart"
        );

    cart = savedCart
        ? JSON.parse(savedCart)
        : [];

    if (
        !Array.isArray(cart)
    ) {
        cart = [];
    }

}
catch (error) {

    console.error(
        "Cart loading error:",
        error
    );

    cart = [];
}

// =====================================================
// SAVE CART
// =====================================================

function saveCart() {

    try {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    }
    catch (error) {

        console.error(
            "Cart saving error:",
            error
        );

    }
}

// =====================================================
// UPDATE CART COUNT
// =====================================================

function updateCartCount() {

    const cartCountElements =
        document.querySelectorAll(
            ".cart-count"
        );

    const totalQuantity =
        Array.isArray(cart)
            ? cart.reduce(
                  function(
                      total,
                      product
                  ) {

                      return (
                          total +
                          Math.max(
                              1,
                              Number(
                                  product.quantity
                              ) || 1
                          )
                      );

                  },
                  0
              )
            : 0;

    cartCountElements.forEach(
        function(element) {

            element.textContent =
                String(
                    totalQuantity
                );

        }
    );

    // Also update Cart link if it exists
    const cartLink =
        document.getElementById(
            "cart-link"
        );

    if (cartLink) {

        cartLink.innerHTML =
            `Cart (${totalQuantity})`;

    }
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

// =====================================================
// FORMAT PRICE
// =====================================================

function formatPrice(price) {

    const number =
        Number(price) || 0;

    return number.toLocaleString(
        "en-PK"
    );
}

// =====================================================
// GET PRODUCTS
// =====================================================

async function getProducts() {

    const database =
        getSupabaseClient();

    if (!database) {

        console.error(
            "Products cannot load: Supabase client unavailable."
        );

        return [];

    }

    try {

        console.log(
            "Everything 400: Loading products..."
        );

        const {
            data,
            error
        } = await database
            .from("products")
            .select("*")
            .order(
                "id",
                {
                    ascending: true
                }
            );

        if (error) {

            console.error(
                "Products loading error:",
                error
            );

            return [];

        }

        console.log(
            "Everything 400: Products received:",
            data
        );

        return Array.isArray(data)
            ? data
            : [];

    }
    catch (error) {

        console.error(
            "Products loading exception:",
            error
        );

        return [];

    }
}

// =====================================================
// ADD TO CART
// =====================================================

function addToCart(
    product,
    quantity = 1
) {

    if (!product) {
        return false;
    }

    const productId =
        String(product.id);

    const stock =
        Math.max(
            0,
            Number(
                product.stock
            ) || 0
        );

    if (stock <= 0) {

        alert(
            "Sorry, this product is out of stock."
        );

        return false;
    }

    const requestedQuantity =
        Math.max(
            1,
            Number(quantity) || 1
        );

    const existingIndex =
        cart.findIndex(
            function(item) {

                return (
                    String(item.id) ===
                    productId
                );

            }
        );

    if (
        existingIndex !== -1
    ) {

        const existingProduct =
            cart[existingIndex];

        const currentQuantity =
            Math.max(
                1,
                Number(
                    existingProduct.quantity
                ) || 1
            );

        const newQuantity =
            currentQuantity +
            requestedQuantity;

        if (
            newQuantity >
            stock
        ) {

            alert(
                `Only ${stock} item(s) are available.`
            );

            return false;
        }

        existingProduct.quantity =
            newQuantity;

        existingProduct.stock =
            stock;

    }
    else {

        if (
            requestedQuantity >
            stock
        ) {

            alert(
                `Only ${stock} item(s) are available.`
            );

            return false;
        }

        cart.push({

            id:
                product.id,

            name:
                product.name ||
                "Unnamed Product",

            price:
                Number(
                    product.price
                ) || 0,

            category:
                product.category ||
                "other",

            image:
                product.image ||
                "",

            description:
                product.description ||
                "",

            stock:
                stock,

            quantity:
                requestedQuantity

        });

    }

    saveCart();

    updateCartCount();

    alert(
        "Product added to cart!"
    );

    return true;
}

// =====================================================
// REMOVE FROM CART
// =====================================================

function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            function(product) {

                return (
                    String(
                        product.id
                    ) !==
                    String(
                        productId
                    )
                );

            }
        );

    saveCart();

    updateCartCount();

    if (
        typeof displayCart ===
        "function"
    ) {
        displayCart();
    }

    if (
        typeof displayCheckout ===
        "function"
    ) {
        displayCheckout();
    }
}

// =====================================================
// UPDATE CART QUANTITY
// =====================================================

function updateCartQuantity(
    productId,
    quantity
) {

    const product =
        cart.find(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        productId
                    )
                );

            }
        );

    if (!product) {
        return;
    }

    const stock =
        Math.max(
            0,
            Number(
                product.stock
            ) || 0
        );

    const newQuantity =
        Math.max(
            1,
            Number(quantity) || 1
        );

    if (
        stock > 0 &&
        newQuantity > stock
    ) {

        alert(
            `Only ${stock} item(s) are available.`
        );

        return;
    }

    product.quantity =
        newQuantity;

    saveCart();

    updateCartCount();

    if (
        typeof displayCart ===
        "function"
    ) {
        displayCart();
    }

    if (
        typeof displayCheckout ===
        "function"
    ) {
        displayCheckout();
    }
}

// =====================================================
// CLEAR CART
// =====================================================

function clearCart() {

    cart = [];

    saveCart();

    updateCartCount();

    if (
        typeof displayCart ===
        "function"
    ) {
        displayCart();
    }

    if (
        typeof displayCheckout ===
        "function"
    ) {
        displayCheckout();
    }
}

// =====================================================
// INITIAL CART COUNT
// =====================================================

updateCartCount();

// =====================================================
// PART 1/7 END
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 2/7
// PRODUCT FILTER + SEARCH + SORT
// =====================================================

// =====================================================
// GET PRODUCT CONTAINER
// =====================================================

function getProductContainer() {
    return document.querySelector(
        ".product-container"
    );
}

// =====================================================
// UPDATE FILTER STATUS
// =====================================================

function updateFilterStatus(count) {
    const statusElement =
        document.getElementById(
            "filter-status"
        );

    if (!statusElement) {
        return;
    }

    statusElement.textContent =
        `${count} product(s) found`;
}

// =====================================================
// FILTER PRODUCTS
// =====================================================

function filterProducts() {

    const container =
        getProductContainer();

    if (!container) {
        return;
    }

    const searchInput =
        document.getElementById(
            "product-search"
        );

    const categorySelect =
        document.getElementById(
            "category-filter"
        );

    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const selectedCategory =
        categorySelect
            ? categorySelect.value
                .trim()
                .toLowerCase()
            : "all";

    const productCards =
        Array.from(
            container.querySelectorAll(
                ".product-card"
            )
        );

    let visibleCount = 0;

    productCards.forEach(
        function(card) {

            const name =
                (
                    card.dataset.name ||
                    getProductName(card) ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            const category =
                (
                    card.dataset.category ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            const description =
                (
                    card.dataset.description ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            const matchesSearch =
                !searchTerm ||
                name.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm);

            const matchesCategory =
                selectedCategory === "all" ||
                selectedCategory === "" ||
                category === selectedCategory;

            if (
                matchesSearch &&
                matchesCategory
            ) {
                card.style.display = "";
                visibleCount++;
            }
            else {
                card.style.display = "none";
            }
        }
    );

    updateFilterStatus(
        visibleCount
    );

    // =================================================
    // NO PRODUCTS MESSAGE
    // =================================================

    const oldMessage =
        container.querySelector(
            ".filter-empty-message"
        );

    if (
        visibleCount === 0 &&
        productCards.length > 0
    ) {

        if (!oldMessage) {

            const message =
                document.createElement(
                    "div"
                );

            message.className =
                "filter-empty-message";

            message.innerHTML = `
                <h3>
                    No products found
                </h3>

                <p>
                    Try another search or category.
                </p>
            `;

            container.appendChild(
                message
            );
        }

    }
    else if (oldMessage) {

        oldMessage.remove();
    }
}

// =====================================================
// SORT PRODUCTS
// =====================================================

function sortProducts() {

    const container =
        getProductContainer();

    if (!container) {
        return;
    }

    const sortSelect =
        document.getElementById(
            "sort-products"
        );

    if (!sortSelect) {
        return;
    }

    const sortValue =
        sortSelect.value;

    const productCards =
        Array.from(
            container.querySelectorAll(
                ".product-card"
            )
        );

    productCards.sort(
        function(a, b) {

            if (
                sortValue ===
                "price-low"
            ) {
                return (
                    getProductPrice(a) -
                    getProductPrice(b)
                );
            }

            if (
                sortValue ===
                "price-high"
            ) {
                return (
                    getProductPrice(b) -
                    getProductPrice(a)
                );
            }

            if (
                sortValue ===
                "name-az"
            ) {

                const nameA =
                    getProductName(a);

                const nameB =
                    getProductName(b);

                return nameA.localeCompare(
                    nameB
                );
            }

            if (
                sortValue ===
                "name-za"
            ) {

                const nameA =
                    getProductName(a);

                const nameB =
                    getProductName(b);

                return nameB.localeCompare(
                    nameA
                );
            }

            return (
                Number(
                    a.dataset.originalIndex ||
                    0
                ) -
                Number(
                    b.dataset.originalIndex ||
                    0
                )
            );
        }
    );

    productCards.forEach(
        function(card) {

            container.appendChild(
                card
            );
        }
    );

    filterProducts();
}

// =====================================================
// GET PRODUCT PRICE
// =====================================================

function getProductPrice(card) {

    if (!card) {
        return 0;
    }

    const priceElement =
        card.querySelector(
            ".product-price"
        );

    if (!priceElement) {
        return 0;
    }

    const priceText =
        priceElement.textContent
            .replace(
                /[^0-9.]/g,
                ""
            );

    return (
        Number(priceText) ||
        0
    );
}

// =====================================================
// GET PRODUCT NAME
// =====================================================

function getProductName(card) {

    if (!card) {
        return "";
    }

    const nameElement =
        card.querySelector(
            "h3"
        );

    return nameElement
        ? nameElement.textContent
            .trim()
            .toLowerCase()
        : "";
}

// =====================================================
// SEARCH EVENTS
// =====================================================

const productSearch =
    document.getElementById(
        "product-search"
    );

if (productSearch) {

    productSearch.addEventListener(
        "input",
        function() {

            filterProducts();
        }
    );
}

// =====================================================
// CATEGORY FILTER EVENT
// =====================================================

const categoryFilter =
    document.getElementById(
        "category-filter"
    );

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function() {

            filterProducts();
        }
    );
}

// =====================================================
// SORT EVENT
// =====================================================

const sortProductsSelect =
    document.getElementById(
        "sort-products"
    );

if (sortProductsSelect) {

    sortProductsSelect.addEventListener(
        "change",
        function() {

            sortProducts();
        }
    );
}

// =====================================================
// RESET FILTERS
// =====================================================

const resetFiltersButton =
    document.getElementById(
        "reset-filters"
    );

if (resetFiltersButton) {

    resetFiltersButton.addEventListener(
        "click",
        function() {

            if (productSearch) {
                productSearch.value = "";
            }

            if (categoryFilter) {
                categoryFilter.value =
                    "all";
            }

            if (sortProductsSelect) {
                sortProductsSelect.value =
                    "default";
            }

            filterProducts();
        }
    );
}

// =====================================================
// PART 2/7 END
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 3A/7
// DISPLAY PRODUCTS
// =====================================================

// =====================================================
// GET PRODUCT CONTAINER
// =====================================================

function getDisplayProductContainer() {
    return document.querySelector(
        ".product-container"
    );
}

// =====================================================
// DISPLAY PRODUCTS
// =====================================================
console.log("PART 3A LOADED");
async function displayProducts() {

    const container =
        getDisplayProductContainer();

    if (!container) {
        console.warn(
            "Product container not found."
        );
        return;
    }

    container.innerHTML = `
        <div class="loading-products">
            <p>Loading products...</p>
        </div>
    `;

    try {

        const products =
            await getProducts();

        container.innerHTML = "";

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-products">
                    <h3>No products available.</h3>
                    <p>
                        Please check your products database.
                    </p>
                </div>
            `;

            if (
                typeof updateFilterStatus ===
                "function"
            ) {
                updateFilterStatus(0);
            }

            return;
        }

        products.forEach(
            function(product, index) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "product-card";

                card.dataset.originalIndex =
                    String(index);

                card.dataset.id =
                    String(
                        product.id || ""
                    );

                card.dataset.category =
                    String(
                        product.category ||
                        "other"
                    )
                        .toLowerCase()
                        .trim();

                card.dataset.name =
                    String(
                        product.name ||
                        "Unnamed Product"
                    )
                        .toLowerCase()
                        .trim();

                card.dataset.description =
                    String(
                        product.description ||
                        ""
                    )
                        .toLowerCase()
                        .trim();

                // =================================================
                // PRODUCT DATA
                // =================================================

                const productName =
                    String(
                        product.name ||
                        "Unnamed Product"
                    );

                const price =
                    Number(
                        product.price || 0
                    );

                const stock =
                    Math.max(
                        0,
                        Number(
                            product.stock
                        ) || 0
                    );

                const description =
                    String(
                        product.description ||
                        "No description available."
                    );

                // =================================================
                // IMAGE
                // =================================================

                let imageHTML = "";

                if (product.image) {

                    imageHTML = `
                        <img
                            src="${escapeHTML(
                                String(product.image)
                            )}"
                            alt="${escapeHTML(
                                productName
                            )}"
                            loading="lazy"
                        >
                    `;

                } else {

                    imageHTML = `
                        <span>🛍️</span>
                    `;
                }

                // =================================================
                // STOCK TEXT
                // =================================================

                let stockText = "";

                if (stock <= 0) {

                    stockText =
                        "Out of Stock";

                } else if (stock <= 5) {

                    stockText =
                        `Only ${stock} left`;

                } else {

                    stockText =
                        "In Stock";
                }

                // =================================================
                // PRODUCT CARD
                // =================================================

                card.innerHTML = `
                    <div class="product-image">
                        ${imageHTML}
                    </div>

                    <div class="product-info">

                        <span class="product-category">
                            ${escapeHTML(
                                String(
                                    product.category ||
                                    "Other"
                                )
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                productName
                            )}
                        </h3>

                        <p class="product-description">
                            ${escapeHTML(
                                description
                            )}
                        </p>

                        <p class="product-price">
                            Rs. ${formatPrice(price)}
                        </p>

                        <p class="product-stock">
                            ${escapeHTML(stockText)}
                        </p>

                        <div class="quantity-control">

                            <button
                                type="button"
                                class="quantity-minus"
                            >
                                −
                            </button>

                            <span class="quantity-value">
                                1
                            </span>

                            <button
                                type="button"
                                class="quantity-plus"
                            >
                                +
                            </button>

                        </div>

                        <div class="product-actions">

                            <button
                                type="button"
                                class="add-cart-btn"
                                ${stock <= 0
                                    ? "disabled"
                                    : ""}
                            >
                                Add to Cart
                            </button>

                            <button
                                type="button"
                                class="buy-now-btn"
                                ${stock <= 0
                                    ? "disabled"
                                    : ""}
                            >
                                Buy Now
                            </button>

                            <button
                                type="button"
                                class="wishlist-btn"
                            >
                                ♡ Add to Wishlist
                            </button>

                            <button
                                type="button"
                                class="product-details-trigger"
                                data-id="${escapeHTML(
                                    String(
                                        product.id || ""
                                    )
                                )}"
                            >
                                View Details
                            </button>

                        </div>

                    </div>
                `;

                container.appendChild(card);

                // =================================================
                // QUANTITY CONTROLS
                // =================================================

                const minusButton =
                    card.querySelector(
                        ".quantity-minus"
                    );

                const plusButton =
                    card.querySelector(
                        ".quantity-plus"
                    );

                const quantityValue =
                    card.querySelector(
                        ".quantity-value"
                    );

                let quantity = 1;

                // =================================================
                // DECREASE
                // =================================================

                if (minusButton) {

                    minusButton.addEventListener(
                        "click",
                        function() {

                            if (quantity > 1) {

                                quantity--;

                                if (
                                    quantityValue
                                ) {

                                    quantityValue.textContent =
                                        String(
                                            quantity
                                        );
                                }
                            }
                        }
                    );
                }

                // =================================================
                // INCREASE
                // =================================================

                if (plusButton) {

                    plusButton.addEventListener(
                        "click",
                        function() {

                            if (stock <= 0) {
                                return;
                            }

                            if (
                                quantity <
                                stock
                            ) {

                                quantity++;

                                if (
                                    quantityValue
                                ) {

                                    quantityValue.textContent =
                                        String(
                                            quantity
                                        );
                                }

                            } else {

                                alert(
                                    `Only ${stock} item(s) are available.`
                                );
                            }
                        }
                    );
                }

                // =================================================
                // ADD TO CART
                // =================================================

                const addButton =
                    card.querySelector(
                        ".add-cart-btn"
                    );

                if (addButton) {

                    addButton.addEventListener(
                        "click",
                        function() {

                            if (stock <= 0) {

                                alert(
                                    "This product is out of stock."
                                );

                                return;
                            }

                            if (
                                typeof addToCart ===
                                "function"
                            ) {

                                addToCart(
                                    product,
                                    quantity
                                );

                            } else {

                                console.error(
                                    "addToCart function is not defined."
                                );
                            }
                        }
                    );
                }

                // =================================================
                // BUY NOW
                // =================================================

                const buyButton =
                    card.querySelector(
                        ".buy-now-btn"
                    );

                if (buyButton) {

                    buyButton.addEventListener(
                        "click",
                        function() {

                            if (stock <= 0) {

                                alert(
                                    "This product is out of stock."
                                );

                                return;
                            }

                            if (
                                typeof addToCart !==
                                "function"
                            ) {

                                console.error(
                                    "addToCart function is not defined."
                                );

                                return;
                            }

                            const added =
                                addToCart(
                                    product,
                                    quantity
                                );

                            if (
                                added !== false
                            ) {

                                window.location.href =
                                    "checkout.html";
                            }
                        }
                    );
                }// =================================================
                // WISHLIST
                // =================================================

                const wishlistButton =
                    card.querySelector(
                        ".wishlist-btn"
                    );

                if (wishlistButton) {

                    let wishlist = [];

                    try {

                        wishlist =
                            JSON.parse(
                                localStorage.getItem(
                                    "wishlist"
                                )
                            ) || [];

                        if (
                            !Array.isArray(
                                wishlist
                            )
                        ) {
                            wishlist = [];
                        }

                    } catch (error) {

                        console.error(
                            "Wishlist loading error:",
                            error
                        );

                        wishlist = [];
                    }

                    const productId =
                        String(
                            product.id || ""
                        );

                    const alreadyAdded =
                        wishlist.some(
                            function(item) {

                                return (
                                    String(
                                        item.id
                                    ) ===
                                    productId
                                );
                            }
                        );

                    if (alreadyAdded) {

                        wishlistButton.textContent =
                            "♥ In Wishlist";
                    }

                    wishlistButton.addEventListener(
                        "click",
                        function() {

                            let currentWishlist =
                                [];

                            try {

                                currentWishlist =
                                    JSON.parse(
                                        localStorage.getItem(
                                            "wishlist"
                                        )
                                    ) || [];

                                if (
                                    !Array.isArray(
                                        currentWishlist
                                    )
                                ) {
                                    currentWishlist =
                                        [];
                                }

                            } catch (error) {

                                console.error(
                                    "Wishlist error:",
                                    error
                                );

                                currentWishlist =
                                    [];
                            }

                            const existingIndex =
                                currentWishlist.findIndex(
                                    function(item) {

                                        return (
                                            String(
                                                item.id
                                            ) ===
                                            productId
                                        );
                                    }
                                );

                            // =========================================
                            // ADD TO WISHLIST
                            // =========================================

                            if (
                                existingIndex === -1
                            ) {

                                currentWishlist.push({

                                    id:
                                        product.id,

                                    name:
                                        product.name ||
                                        "Unnamed Product",

                                    price:
                                        Number(
                                            product.price
                                        ) || 0,

                                    image:
                                        product.image ||
                                        "",

                                    category:
                                        product.category ||
                                        "other",

                                    description:
                                        product.description ||
                                        ""
                                });

                                localStorage.setItem(
                                    "wishlist",
                                    JSON.stringify(
                                        currentWishlist
                                    )
                                );

                                wishlistButton.textContent =
                                    "♥ In Wishlist";

                                alert(
                                    "Product added to Wishlist!"
                                );

                            } else {

                                // =====================================
                                // REMOVE FROM WISHLIST
                                // =====================================

                                currentWishlist.splice(
                                    existingIndex,
                                    1
                                );

                                localStorage.setItem(
                                    "wishlist",
                                    JSON.stringify(
                                        currentWishlist
                                    )
                                );

                                wishlistButton.textContent =
                                    "♡ Add to Wishlist";

                                alert(
                                    "Product removed from Wishlist."
                                );
                            }
                        }
                    );
                }
            }
        );

        // =================================================
        // APPLY FILTERS
        // =================================================

        if (
            typeof filterProducts ===
            "function"
        ) {

            filterProducts();

        } else if (
            typeof updateFilterStatus ===
            "function"
        ) {

            updateFilterStatus(
                products.length
            );
        }

    } catch (error) {

        console.error(
            "Display products error:",
            error
        );

        container.innerHTML = `
            <div class="empty-products">

                <p>
                    Unable to load products.
                </p>

                <p>
                    Please try again later.
                </p>

            </div>
        `;

        if (
            typeof updateFilterStatus ===
            "function"
        ) {

            updateFilterStatus(0);
        }
    }
}

// =====================================================
// LOAD PRODUCTS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayProducts();

    }
);

// =====================================================
// PART 3/7 END
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 4/7
// CART DISPLAY
// =====================================================

// =====================================================
// DISPLAY CART
// =====================================================

function displayCart() {

    if (!cartItemsContainer) {
        return;
    }

    cartItemsContainer.innerHTML = "";

    // =================================================
    // EMPTY CART
    // =================================================

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        cartItemsContainer.innerHTML = `
            <div class="empty-cart">

                <p>
                    Your shopping cart is empty.
                </p>

                <a href="index.html#products">
                    <button type="button">
                        Continue Shopping
                    </button>
                </a>

            </div>
        `;

        if (cartTotalElement) {
            cartTotalElement.textContent = "0";
        }

        return;
    }

    // =================================================
    // NORMALIZE CART
    // =================================================

    const groupedCart = [];

    cart.forEach(
        function(product) {

            if (!product) {
                return;
            }

            const productId =
                String(product.id);

            const existing =
                groupedCart.find(
                    function(item) {
                        return (
                            String(item.id) ===
                            productId
                        );
                    }
                );

            const productQuantity =
                Math.max(
                    1,
                    Number(
                        product.quantity
                    ) || 1
                );

            if (existing) {

                existing.quantity +=
                    productQuantity;

            }
            else {

                groupedCart.push({

                    id:
                        product.id,

                    name:
                        product.name ||
                        "Unnamed Product",

                    price:
                        Number(
                            product.price
                        ) || 0,

                    category:
                        product.category ||
                        "other",

                    image:
                        product.image ||
                        "",

                    description:
                        product.description ||
                        "",

                    stock:
                        Number(
                            product.stock
                        ) || 0,

                    quantity:
                        productQuantity
                });
            }
        }
    );

    cart = groupedCart;

    let total = 0;

    // =================================================
    // CREATE CART ITEMS
    // =================================================

    groupedCart.forEach(
        function(product) {

            const price =
                Number(
                    product.price
                ) || 0;

            const quantity =
                Math.max(
                    1,
                    Number(
                        product.quantity
                    ) || 1
                );

            const stock =
                Number(
                    product.stock
                ) || 0;

            const itemTotal =
                price * quantity;

            total += itemTotal;

            const cartItem =
                document.createElement(
                    "div"
                );

            cartItem.className =
                "cart-item";

            // =================================================
            // IMAGE
            // =================================================

            const imageHTML =
                product.image
                    ? `
                        <img
                            src="${escapeHTML(
                                product.image
                            )}"
                            alt="${escapeHTML(
                                product.name
                            )}"
                            class="cart-product-image"
                        >
                    `
                    : `
                        <div class="cart-product-placeholder">
                            🛍️
                        </div>
                    `;

            // =================================================
            // CART ITEM HTML
            // =================================================

            cartItem.innerHTML = `

                <div class="cart-product-info">

                    ${imageHTML}

                    <div>

                        <h3>
                            ${escapeHTML(
                                product.name
                            )}
                        </h3>

                        <p>
                            Rs.
                            ${price.toLocaleString()}
                        </p>

                    </div>

                </div>

                <!-- QUANTITY -->

                <div class="cart-quantity-controls">

                    <button
                        type="button"
                        class="quantity-btn decrease-btn"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >
                        −
                    </button>

                    <span class="cart-quantity">
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-btn increase-btn"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >
                        +
                    </button>

                </div>

                <!-- ITEM TOTAL -->

                <div class="cart-item-total">

                    <strong>
                        Rs.
                        ${itemTotal.toLocaleString()}
                    </strong>

                </div>

                <!-- REMOVE -->

                <button
                    type="button"
                    class="remove-btn"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                >
                    Remove
                </button>

            `;

            // =================================================
            // INCREASE QUANTITY
            // =================================================

            const increaseButton =
                cartItem.querySelector(
                    ".increase-btn"
                );

            if (increaseButton) {

                increaseButton.addEventListener(
                    "click",
                    function() {

                        const productId =
                            String(
                                this.dataset.id
                            );

                        const existingProduct =
                            cart.find(
                                function(item) {
                                    return (
                                        String(
                                            item.id
                                        ) ===
                                        productId
                                    );
                                }
                            );

                        if (!existingProduct) {
                            return;
                        }

                        const currentQuantity =
                            Math.max(
                                1,
                                Number(
                                    existingProduct.quantity
                                ) || 1
                            );

                        const stock =
                            Number(
                                existingProduct.stock
                            ) || 0;

                        if (
                            stock > 0 &&
                            currentQuantity >= stock
                        ) {

                            alert(
                                `Only ${stock} item(s) are available.`
                            );

                            return;
                        }

                        existingProduct.quantity =
                            currentQuantity + 1;

                        saveCart();

                        updateCartCount();

                        displayCart();

                        displayCheckout();

                    }
                );
            }

            // =================================================
            // DECREASE QUANTITY
            // =================================================

            const decreaseButton =
                cartItem.querySelector(
                    ".decrease-btn"
                );

            if (decreaseButton) {

                decreaseButton.addEventListener(
                    "click",
                    function() {

                        const productId =
                            String(
                                this.dataset.id
                            );

                        const existingProduct =
                            cart.find(
                                function(item) {
                                    return (
                                        String(
                                            item.id
                                        ) ===
                                        productId
                                    );
                                }
                            );

                        if (!existingProduct) {
                            return;
                        }

                        const currentQuantity =
                            Math.max(
                                1,
                                Number(
                                    existingProduct.quantity
                                ) || 1
                            );

                        if (
                            currentQuantity > 1
                        ) {

                            existingProduct.quantity =
                                currentQuantity - 1;

                        }
                        else {

                            cart =
                                cart.filter(
                                    function(item) {
                                        return (
                                            String(
                                                item.id
                                            ) !==
                                            productId
                                        );
                                    }
                                );
                        }

                        saveCart();

                        updateCartCount();

                        displayCart();

                        displayCheckout();

                    }
                );
            }

            // =================================================
            // REMOVE PRODUCT
            // =================================================

            const removeButton =
                cartItem.querySelector(
                    ".remove-btn"
                );

            if (removeButton) {

                removeButton.addEventListener(
                    "click",
                    function() {

                        const productId =
                            this.dataset.id;

                        removeFromCart(
                            productId
                        );

                    }
                );
            }

            // =================================================
            // APPEND CART ITEM
            // =================================================

            cartItemsContainer.appendChild(
                cartItem
            );

        }
    );

    // =================================================
    // UPDATE CART TOTAL
    // =================================================

    if (cartTotalElement) {

        cartTotalElement.textContent =
            total.toLocaleString();

    }

    saveCart();
}

// =====================================================
// DISPLAY CHECKOUT
// =====================================================

function displayCheckout() {

    if (!checkoutItemsContainer) {
        return;
    }

    checkoutItemsContainer.innerHTML = "";

    // =================================================
    // EMPTY CHECKOUT
    // =================================================

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        checkoutItemsContainer.innerHTML = `
            <div class="empty-checkout">

                <p>
                    Your cart is empty.
                </p>

                <a href="index.html#products">
                    Continue Shopping
                </a>

            </div>
        `;

        if (checkoutTotalElement) {
            checkoutTotalElement.textContent =
                "0";
        }

        return;
    }

    let checkoutTotal = 0;

    // =================================================
    // CHECKOUT ITEMS
    // =================================================

    cart.forEach(
        function(product) {

            if (!product) {
                return;
            }

            const price =
                Number(
                    product.price
                ) || 0;

            const quantity =
                Math.max(
                    1,
                    Number(
                        product.quantity
                    ) || 1
                );

            const itemTotal =
                price * quantity;

            checkoutTotal +=
                itemTotal;

            const checkoutItem =
                document.createElement(
                    "div"
                );

            checkoutItem.className =
                "checkout-item";

            checkoutItem.innerHTML = `

                <div class="checkout-product-info">

                    ${
                        product.image
                            ? `
                                <img
                                    src="${escapeHTML(
                                        product.image
                                    )}"
                                    alt="${escapeHTML(
                                        product.name
                                    )}"
                                >
                            `
                            : `
                                <div>
                                    🛍️
                                </div>
                            `
                    }

                    <div>

                        <h3>
                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </h3>

                        <p>
                            Quantity:
                            ${quantity}
                        </p>

                        <p>
                            Rs.
                            ${price.toLocaleString()}
                        </p>

                    </div>

                </div>

                <div class="checkout-item-total">

                    <strong>
                        Rs.
                        ${itemTotal.toLocaleString()}
                    </strong>

                </div>

            `;

            checkoutItemsContainer.appendChild(
                checkoutItem
            );
        }
    );

    // =================================================
    // UPDATE CHECKOUT TOTAL
    // =================================================

    if (checkoutTotalElement) {

        checkoutTotalElement.textContent =
            checkoutTotal.toLocaleString();

    }
}

// =====================================================
// PART 4/7 END
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 5A/7
// CART + CHECKOUT
// =====================================================


// =====================================================
// INITIALIZE CART DISPLAY
// =====================================================

if (
    typeof cartItemsContainer !== "undefined" &&
    cartItemsContainer &&
    typeof displayCart === "function"
) {
    displayCart();
}


// =====================================================
// INITIALIZE CHECKOUT DISPLAY
// =====================================================

if (
    typeof checkoutItemsContainer !== "undefined" &&
    checkoutItemsContainer &&
    typeof displayCheckout === "function"
) {
    displayCheckout();
}


// =====================================================
// CLEAR CART BUTTON
// =====================================================

const clearCartButton =
    document.getElementById("clear-cart");

if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        function () {

            if (
                typeof cart === "undefined" ||
                !Array.isArray(cart) ||
                cart.length === 0
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to clear your cart?"
                );

            if (!confirmed) {
                return;
            }

            if (
                typeof clearCart === "function"
            ) {

                clearCart();

            } else {

                cart = [];

                if (
                    typeof saveCart === "function"
                ) {
                    saveCart();
                }

                if (
                    typeof updateCartCount === "function"
                ) {
                    updateCartCount();
                }

                if (
                    typeof displayCart === "function"
                ) {
                    displayCart();
                }
            }
        }
    );
}


// =====================================================
// PROCEED TO CHECKOUT
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const checkoutButton =
            event.target.closest("#checkout-btn");

        if (!checkoutButton) {
            return;
        }

        console.log(
            "Everything 400 - Proceed to Checkout clicked."
        );

        if (
            typeof cart === "undefined" ||
            !Array.isArray(cart) ||
            cart.length === 0
        ) {

            alert(
                "Your cart is empty."
            );

            return;
        }

        window.location.href =
            "checkout.html";
    }
);


// =====================================================
// CHECKOUT FORM
// =====================================================

const currentCheckoutForm =
    document.getElementById("checkout-form");


if (currentCheckoutForm) {

    console.log(
        "Everything 400 - Checkout form found."
    );


    if (
        typeof displayCheckout ===
        "function"
    ) {
        displayCheckout();
    }


    // =================================================
    // CHECKOUT SUBMIT
    // =================================================

    currentCheckoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "Everything 400 - Checkout submitted."
            );
            alert("CHECKOUT SUBMIT WORKING");
            return;


            // =============================================
            // CHECK CART
            // =============================================

            if (
                typeof cart === "undefined" ||
                !Array.isArray(cart) ||
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            // =============================================
            // GET CUSTOMER INPUTS
            // =============================================

            const nameInput =
                document.getElementById("name");

            const phoneInput =
                document.getElementById("phone");

            const emailInput =
                document.getElementById("email");

            const addressInput =
                document.getElementById("address");

            const cityInput =
                document.getElementById("city");


            // =============================================
            // READ CUSTOMER VALUES
            // =============================================

            const customerName =
                nameInput
                    ? String(
                        nameInput.value || ""
                    ).trim()
                    : "";

            const customerPhone =
                phoneInput
                    ? String(
                        phoneInput.value || ""
                    ).trim()
                    : "";

            const customerEmail =
                emailInput
                    ? String(
                        emailInput.value || ""
                    ).trim()
                    : "";

            const customerAddress =
                addressInput
                    ? String(
                        addressInput.value || ""
                    ).trim()
                    : "";

            const customerCity =
                cityInput
                    ? String(
                        cityInput.value || ""
                    ).trim()
                    : "";


            // =============================================
            // GET SELECTED PAYMENT METHOD
            // =============================================

            const selectedPayment =
                currentCheckoutForm.querySelector(
                    'input[type="radio"][name="payment_method"]:checked'
                );

            const paymentMethod =
                selectedPayment
                    ? String(
                        selectedPayment.value || ""
                    ).trim()
                    : "";


            // =============================================
            // DEBUG
            // =============================================

            console.log(
                "Everything 400 - Checkout data:",
                {
                    customerName,
                    customerPhone,
                    customerEmail,
                    customerAddress,
                    customerCity,
                    paymentMethod
                }
            );


            // =============================================
            // VALIDATE NAME
            // =============================================

            if (!customerName) {

                alert(
                    "Please enter your name."
                );

                if (nameInput) {
                    nameInput.focus();
                }

                return;
            }


            // =============================================
            // VALIDATE PHONE
            // =============================================

            if (!customerPhone) {

                alert(
                    "Please enter your phone number."
                );

                if (phoneInput) {
                    phoneInput.focus();
                }

                return;
            }


            // =============================================
            // VALIDATE EMAIL
            // =============================================

            if (!customerEmail) {

                alert(
                    "Please enter your email address."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;
            }


            // =============================================
            // VALIDATE ADDRESS
            // =============================================

            if (!customerAddress) {

                alert(
                    "Please enter your complete address."
                );

                if (addressInput) {
                    addressInput.focus();
                }

                return;
            }


            // =============================================
            // VALIDATE CITY
            // =============================================

            if (!customerCity) {

                alert(
                    "Please enter your city."
                );

                if (cityInput) {
                    cityInput.focus();
                }

                return;
            }


            // =============================================
            // VALIDATE PAYMENT METHOD
            // =============================================

            if (!paymentMethod) {

                alert(
                    "Please select a payment method."
                );

                return;
            }


            // =============================================
            // CALCULATE TOTAL
            // =============================================

            let orderTotal = 0;

            cart.forEach(
                function (product) {

                    if (!product) {
                        return;
                    }

                    const price =
                        Number(
                            product.price
                        ) || 0;

                    const quantity =
                        Math.max(
                            1,
                            Number(
                                product.quantity
                            ) || 1
                        );

                    orderTotal +=
                        price * quantity;
                }
            );


            // =============================================
            // CHECK TOTAL
            // =============================================

            if (orderTotal <= 0) {

                alert(
                    "Unable to calculate your order total."
                );

                return;
            }


            // =============================================
            // PLACE ORDER BUTTON
            // =============================================

            const placeOrderButton =
                document.getElementById(
                    "checkout-btn"
                );


            if (placeOrderButton) {

                placeOrderButton.disabled =
                    true;

                placeOrderButton.textContent =
                    "Placing Order...";
            }


            // =============================================
            // PART 5B CONTINUES
            // =============================================// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 5B/7
// CHECKOUT CONTINUED
// =====================================================


            try {

                // =============================================
                // SUPABASE CLIENT
                // =============================================

                if (
                    typeof getSupabaseClient !==
                    "function"
                ) {

                    throw new Error(
                        "getSupabaseClient() is not defined."
                    );
                }


                const database =
                    getSupabaseClient();


                if (!database) {

                    throw new Error(
                        "Supabase client is not available."
                    );
                }


                console.log(
                    "Everything 400 - Supabase connected."
                );


                // =============================================
                // PREPARE PRODUCTS
                // =============================================

                const orderProducts =
                    cart.map(
                        function (product) {

                            if (!product) {
                                return null;
                            }

                            return {

                                id:
                                    product.id || null,

                                name:
                                    product.name ||
                                    "Unnamed Product",

                                price:
                                    Number(
                                        product.price
                                    ) || 0,

                                quantity:
                                    Math.max(
                                        1,
                                        Number(
                                            product.quantity
                                        ) || 1
                                    ),

                                image:
                                    product.image ||
                                    "",

                                category:
                                    product.category ||
                                    "other"
                            };
                        }
                    ).filter(
                        function (item) {
                            return item !== null;
                        }
                    );


                // =============================================
                // CREATE ORDER DATA
                // =============================================

                const orderData = {

                    customer_name:
                        customerName,

                    customer_phone:
                        customerPhone,

                    customer_address:
                        customerAddress,

                    customer_city:
                        customerCity,

                    customer_email:
                        customerEmail,

                    payment_method:
                        paymentMethod,

                    payment_status:
                        "Pending",

                    total_amount:
                        orderTotal,

                    product:
                        orderProducts,

                    status:
                        "Pending"
                };


                console.log(
                    "Everything 400 - Order data:",
                    orderData
                );


                // =============================================
                // INSERT ORDER INTO SUPABASE
                // =============================================

                const {
                    data: order,
                    error: orderError
                } = await database
                    .from("orders")
                    .insert(orderData)
                    .select()
                    .single();


                // =============================================
                // CHECK ORDER ERROR
                // =============================================

                if (orderError) {

                    console.error(
                        "Order creation error:",
                        orderError
                    );

                    throw new Error(
                        orderError.message ||
                        "Unable to create order."
                    );
                }


                // =============================================
                // ORDER CREATED
                // =============================================

                console.log(
                    "Everything 400 - Order created:",
                    order
                );


                const orderId =
                    order &&
                    order.id
                        ? String(order.id)
                        : "";


                // =============================================
                // CLEAR CART
                // =============================================

                cart = [];


                // =============================================
                // SAVE CART
                // =============================================

                if (
                    typeof saveCart ===
                    "function"
                ) {

                    saveCart();
                }


                // =============================================
                // UPDATE CART COUNT
                // =============================================

                if (
                    typeof updateCartCount ===
                    "function"
                ) {

                    updateCartCount();
                }


                // =============================================
                // UPDATE CART DISPLAY
                // =============================================

                if (
                    typeof displayCart ===
                    "function"
                ) {

                    displayCart();
                }


                // =============================================
                // UPDATE CHECKOUT DISPLAY
                // =============================================

                if (
                    typeof displayCheckout ===
                    "function"
                ) {

                    displayCheckout();
                }


                // =============================================
                // SUCCESS MESSAGE
                // =============================================

                const statusElement =
                    document.getElementById(
                        "customer-order-status"
                    );


                if (statusElement) {

                    statusElement.innerHTML = `

                        <div class="order-success">

                            <h3>
                                Order placed successfully!
                            </h3>

                            <p>
                                Thank you,
                                ${
                                    typeof escapeHTML ===
                                    "function"
                                        ? escapeHTML(
                                            customerName
                                        )
                                        : customerName
                                }.
                            </p>

                            ${
                                orderId
                                    ? `
                                        <p>
                                            Order ID:
                                            <strong>
                                                ${
                                                    typeof escapeHTML ===
                                                    "function"
                                                        ? escapeHTML(
                                                            orderId
                                                        )
                                                        : orderId
                                                }
                                            </strong>
                                        </p>
                                    `
                                    : ""
                            }

                            <p>
                                Total:
                                <strong>
                                    Rs.
                                    ${orderTotal.toLocaleString()}
                                </strong>
                            </p>

                            <p>
                                Payment Method:
                                <strong>
                                    ${
                                        typeof escapeHTML ===
                                        "function"
                                            ? escapeHTML(
                                                paymentMethod
                                            )
                                            : paymentMethod
                                    }
                                </strong>
                            </p>

                        </div>
                    `;

                }
                else {

                    alert(
                        "Order placed successfully!\n\n" +
                        (
                            orderId
                                ? "Order ID: " +
                                  orderId +
                                  "\n"
                                : ""
                        ) +
                        "Total: Rs. " +
                        orderTotal.toLocaleString() +
                        "\nPayment: " +
                        paymentMethod
                    );
                }


                // =============================================
                // RESET FORM
                // =============================================

                currentCheckoutForm.reset();


            }
            catch (error) {

                console.error(
                    "Everything 400 - Checkout error:",
                    error
                );


                // =============================================
                // SHOW ERROR
                // =============================================

                const statusElement =
                    document.getElementById(
                        "customer-order-status"
                    );


                if (statusElement) {

                    const errorMessage =
                        error &&
                        error.message
                            ? error.message
                            : "Please try again.";

                    statusElement.innerHTML = `

                        <div class="order-error">

                            <h3>
                                Unable to place your order.
                            </h3>

                            <p>
                                ${
                                    typeof escapeHTML ===
                                    "function"
                                        ? escapeHTML(
                                            errorMessage
                                        )
                                        : errorMessage
                                }
                            </p>

                        </div>
                    `;
                }


                alert(
                    "Unable to place your order. Please try again."
                );

            }


            // =============================================
            // ENABLE BUTTON AGAIN
            // =============================================

            finally {

                if (placeOrderButton) {

                    placeOrderButton.disabled =
                        false;

                    placeOrderButton.textContent =
                        "Place Order";
                }
            }

        }
    );
}


// =====================================================
// PART 5B/7 END
// =====================================================
// =====================================================
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 6/7
// ORDER STATUS + PRODUCT DETAILS
// =====================================================

// =====================================================
// CHECK ORDER STATUS
// =====================================================

const checkOrderButton =
    document.getElementById(
        "check-order-btn"
    );

const orderIdInput =
    document.getElementById(
        "order-id"
    );

if (checkOrderButton) {

    checkOrderButton.addEventListener(
        "click",
        async function() {

            const orderId =
                orderIdInput
                    ? orderIdInput.value.trim()
                    : "";

            if (!orderId) {

                alert(
                    "Please enter your Order ID."
                );

                return;
            }

            const database =
                getSupabaseClient();

            if (!database) {

                alert(
                    "Database is not configured."
                );

                return;
            }

            checkOrderButton.disabled =
                true;

            checkOrderButton.textContent =
                "Checking...";

            try {

                const {
                    data,
                    error
                } = await database
                    .from("orders")
                    .select("*")
                    .eq(
                        "id",
                        orderId
                    )
                    .single();

                if (error) {

                    console.error(
                        "Order status error:",
                        error
                    );

                    if (
                        customerOrderStatus
                    ) {

                        customerOrderStatus.innerHTML = `
                            <div class="order-error">
                                <p>
                                    Order not found.
                                </p>
                            </div>
                        `;
                    }

                    return;
                }

                if (
                    customerOrderStatus
                ) {

                    customerOrderStatus.innerHTML = `

                        <div class="order-status-result">

                            <h3>
                                Order Status
                            </h3>

                            <p>
                                <strong>
                                    Order ID:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        data.id || ""
                                    )
                                )}
                            </p>

                            <p>
                                <strong>
                                    Customer:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        data.customer_name ||
                                        ""
                                    )
                                )}
                            </p>

                            <p>
                                <strong>
                                    Status:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        data.status ||
                                        "Pending"
                                    )
                                )}
                            </p>

                            <p>
                                <strong>
                                    Total:
                                </strong>

                                Rs.
                                ${Number(
                                    data.total_amount ||
                                    0
                                ).toLocaleString()}

                            </p>

                        </div>

                    `;
                }

            }
            catch (error) {

                console.error(
                    "Order status exception:",
                    error
                );

                alert(
                    "Unable to check order status."
                );

            }
            finally {

                checkOrderButton.disabled =
                    false;

                checkOrderButton.textContent =
                    "Check Order";
            }
        }
    );
}

// =====================================================
// PRODUCT DETAILS MODAL
// =====================================================

async function showProductDetails(
    productId
) {

    if (!productId) {
        return;
    }

    try {

        const products =
            await getProducts();

        const product =
            products.find(
                function(item) {

                    return (
                        String(item.id) ===
                        String(productId)
                    );
                }
            );

        if (!product) {

            alert(
                "Product details not found."
            );

            return;
        }

        // =================================================
        // CREATE MODAL
        // =================================================

        let modal =
            document.getElementById(
                "product-details-modal"
            );

        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );

            modal.id =
                "product-details-modal";

            modal.className =
                "product-details-modal";

            document.body.appendChild(
                modal
            );
        }

        const price =
            Number(
                product.price
            ) || 0;

        const stock =
            Math.max(
                0,
                Number(
                    product.stock
                ) || 0
            );

        const productName =
            String(
                product.name ||
                "Unnamed Product"
            );

        const description =
            String(
                product.description ||
                "No description available."
            );

        // =================================================
        // MODAL CONTENT
        // =================================================

        modal.innerHTML = `

            <div class="product-details-overlay">

                <div class="product-details-content">

                    <button
                        type="button"
                        class="product-details-close"
                        aria-label="Close"
                    >
                        ×
                    </button>

                    <div class="product-details-image">

                        ${
                            product.image
                                ? `
                                    <img
                                        src="${escapeHTML(
                                            String(
                                                product.image
                                            )
                                        )}"
                                        alt="${escapeHTML(
                                            productName
                                        )}"
                                    >
                                `
                                : `
                                    <div>
                                        🛍️
                                    </div>
                                `
                        }

                    </div>

                    <div class="product-details-info">

                        <span>
                            ${escapeHTML(
                                String(
                                    product.category ||
                                    "Other"
                                )
                            )}
                        </span>

                        <h2>
                            ${escapeHTML(
                                productName
                            )}
                        </h2>

                        <p class="product-details-price">
                            Rs.
                            ${price.toLocaleString()}
                        </p>

                        <p class="product-details-description">
                            ${escapeHTML(
                                description
                            )}
                        </p>

                        <p class="product-details-stock">

                            ${
                                stock > 0
                                    ? `In Stock: ${stock}`
                                    : "Out of Stock"
                            }

                        </p>

                        <button
                            type="button"
                            class="details-add-cart-btn"
                            ${
                                stock <= 0
                                    ? "disabled"
                                    : ""
                            }
                        >
                            Add to Cart
                        </button>

                    </div>

                </div>

            </div>

        `;

        modal.style.display =
            "block";

        // =================================================
        // CLOSE BUTTON
        // =================================================

        const closeButton =
            modal.querySelector(
                ".product-details-close"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function() {

                    modal.style.display =
                        "none";
                }
            );
        }

        // =================================================
        // OVERLAY CLOSE
        // =================================================

        const overlay =
            modal.querySelector(
                ".product-details-overlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        overlay
                    ) {

                        modal.style.display =
                            "none";
                    }
                }
            );
        }

        // =================================================
        // ADD TO CART FROM DETAILS
        // =================================================

        const detailsAddButton =
            modal.querySelector(
                ".details-add-cart-btn"
            );

        if (detailsAddButton) {

            detailsAddButton.addEventListener(
                "click",
                function() {

                    if (
                        stock <= 0
                    ) {

                        alert(
                            "This product is out of stock."
                        );

                        return;
                    }

                    if (
                        typeof addToCart !==
                        "function"
                    ) {

                        console.error(
                            "addToCart function is not defined."
                        );

                        return;
                    }

                    const added =
                        addToCart(
                            product,
                            1
                        );

                    if (
                        added !== false
                    ) {

                        modal.style.display =
                            "none";
                    }
                }
            );
        }

    }
    catch (error) {

        console.error(
            "Product details error:",
            error
        );

        alert(
            "Unable to load product details."
        );
    }
}

// =====================================================
// PRODUCT DETAILS BUTTON CLICK
// =====================================================

document.addEventListener(
    "click",
    function(event) {

        const detailsButton =
            event.target.closest(
                ".product-details-trigger"
            );

        if (!detailsButton) {
            return;
        }

        const productId =
            detailsButton.dataset.id;

        if (!productId) {

            console.error(
                "Product ID is missing."
            );

            return;
        }

        showProductDetails(
            productId
        );
    }
);

// =====================================================
// PRODUCT IMAGE CLICK
// =====================================================

document.addEventListener(
    "click",
    function(event) {

        const imageContainer =
            event.target.closest(
                ".product-card .product-image"
            );

        if (!imageContainer) {
            return;
        }

        const card =
            imageContainer.closest(
                ".product-card"
            );

        if (!card) {
            return;
        }

        const productId =
            card.dataset.id;

        if (!productId) {

            console.error(
                "Product ID is missing from product card."
            );

            return;
        }

        showProductDetails(
            productId
        );
    }
);

// =====================================================
// ESC KEY CLOSE MODAL
// =====================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Escape"
        ) {
            return;
        }

        const modal =
            document.getElementById(
                "product-details-modal"
            );

        if (modal) {

            modal.style.display =
                "none";
        }
    }
);

// =====================================================
// PART 6/7 END
// =====================================================
// =====================================================
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 7/7
// INITIALIZATION + FINAL EVENT HANDLERS
// =====================================================

// =====================================================
// WISHLIST COUNT
// =====================================================

function updateWishlistCount() {

    const wishlistCountElements =
        document.querySelectorAll(
            ".wishlist-count"
        );

    let wishlist = [];

    try {

        wishlist =
            JSON.parse(
                localStorage.getItem(
                    "wishlist"
                )
            ) || [];

        if (
            !Array.isArray(
                wishlist
            )
        ) {
            wishlist = [];
        }

    }
    catch (error) {

        console.error(
            "Wishlist count error:",
            error
        );

        wishlist = [];
    }

    wishlistCountElements.forEach(
        function(element) {

            element.textContent =
                String(
                    wishlist.length
                );

        }
    );
}

// =====================================================
// UPDATE COUNTS
// =====================================================

updateCartCount();

updateWishlistCount();

// =====================================================
// CART PAGE
// =====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function() {

            updateCartCount();

            updateWishlistCount();

            displayCart();

            displayCheckout();

        }
    );

}
else {

    updateCartCount();

    updateWishlistCount();

    displayCart();

    displayCheckout();

}

// =====================================================
// WISHLIST BUTTONS / LINKS
// =====================================================

document.addEventListener(
    "click",
    function(event) {

        const wishlistLink =
            event.target.closest(
                ".wishlist-link"
            );

        if (!wishlistLink) {
            return;
        }

        updateWishlistCount();

    }
);

// =====================================================
// CART LINKS
// =====================================================

document.addEventListener(
    "click",
    function(event) {

        const cartLink =
            event.target.closest(
                ".cart-link"
            );

        if (!cartLink) {
            return;
        }

        updateCartCount();

    }
);

// =====================================================
// STORAGE EVENT
// =====================================================

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key === "cart"
        ) {

            try {

                const updatedCart =
                    JSON.parse(
                        event.newValue
                    ) || [];

                cart =
                    Array.isArray(
                        updatedCart
                    )
                        ? updatedCart
                        : [];

            }
            catch (error) {

                cart = [];

            }

            updateCartCount();

            displayCart();

            displayCheckout();

        }

        if (
            event.key === "wishlist"
        ) {

            updateWishlistCount();

        }

    }
);

// =====================================================
// BEFORE PAGE UNLOAD
// =====================================================

window.addEventListener(
    "beforeunload",
    function() {

        saveCart();

    }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

window.addEventListener(
    "error",
    function(event) {

        console.error(
            "JavaScript error:",
            event.error ||
            event.message
        );

    }
);

// =====================================================
// PROMISE ERROR HANDLER
// =====================================================

window.addEventListener(
    "unhandledrejection",
    function(event) {

        console.error(
            "Unhandled Promise error:",
            event.reason
        );

    }
);

// =====================================================
// FINAL INITIALIZATION
// =====================================================

(function initializeEverything400() {

    updateCartCount();

    updateWishlistCount();

    if (productContainer) {

        const hasProducts =
            productContainer.querySelector(
                ".product-card"
            );

        if (!hasProducts) {

            displayProducts();

        }

    }

})();

// =====================================================
// SCRIPT.JS COMPLETE
// =====================================================
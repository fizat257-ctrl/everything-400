// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 1/6
// CART + ELEMENTS + SUPABASE + HELPER FUNCTIONS
// =====================================================

let cart = [];

try {
    cart = JSON.parse(
        localStorage.getItem("cart")
    ) || [];
} catch (error) {
    console.error("Cart loading error:", error);
    cart = [];
}


// =====================================================
// ELEMENTS
// =====================================================

const cartLink =
    document.getElementById("cart-link");

const cartItemsContainer =
    document.getElementById("cart-items");

const cartTotalElement =
    document.getElementById("cart-total");

const checkoutItemsContainer =
    document.getElementById("checkout-items");

const checkoutTotalElement =
    document.getElementById("checkout-total");

const searchInput =
    document.getElementById("product-search");

const searchButton =
    document.getElementById("search-btn");

const productContainer =
    document.querySelector(".product-container");

const checkoutForm =
    document.getElementById("checkout-form");

const checkoutButton =
    document.getElementById("checkout-btn");

const customerOrderStatus =
    document.getElementById(
        "customer-order-status"
    );

const categoryFilter =
    document.getElementById(
        "category-filter"
    );

const filterStatus =
    document.getElementById(
        "filter-status"
    );

const clearFiltersButton =
    document.getElementById(
        "clear-filters"
    );

const sortProducts =
    document.getElementById(
        "sort-products"
    );


// =====================================================
// SUPABASE
// =====================================================

function getSupabaseClient() {

    const db =
        window.supabaseClient;

    if (!db) {

        console.error(
            "Supabase client not found."
        );

        return null;
    }

    return db;
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// SAVE CART
// =====================================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// =====================================================
// UPDATE CART COUNT
// =====================================================

function updateCartCount() {

    if (!cartLink) return;

    const quantity =
        cart.reduce(
            function(total, item) {

                return total +
                    Number(
                        item.quantity || 1
                    );

            },
            0
        );

    cartLink.textContent =
        `Cart (${quantity})`;

}


// =====================================================
// GET PRODUCTS
// =====================================================

async function getProducts() {

    const db =
        getSupabaseClient();

    if (!db) return [];

    try {

        const {
            data,
            error
        } = await db
            .from("products")
            .select("*")
            .order("id", {
                ascending: true
            });

        if (error) {

            console.error(
                "Products loading error:",
                error
            );

            return [];
        }

        return data || [];

    } catch (error) {

        console.error(
            "Products error:",
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

        alert(
            "Product could not be found."
        );

        return;
    }

    const stock =
        Number(
            product.stock || 0
        );

    if (stock <= 0) {

        alert(
            "Sorry, this product is out of stock."
        );

        return;
    }

    quantity =
        Math.max(
            1,
            Number(quantity) || 1
        );

    if (quantity > stock) {

        alert(
            `Only ${stock} item(s) are available in stock.`
        );

        return;
    }

    const existingIndex =
        cart.findIndex(
            function(item) {

                return String(item.id) ===
                    String(product.id);

            }
        );

    if (existingIndex !== -1) {

        const existingQuantity =
            Number(
                cart[existingIndex].quantity || 1
            );

        const newQuantity =
            existingQuantity +
            quantity;

        if (newQuantity > stock) {

            alert(
                `Only ${stock} item(s) are available in stock.`
            );

            return;
        }

        cart[existingIndex].quantity =
            newQuantity;

    } else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

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
                quantity

        });

    }

    saveCart();

    updateCartCount();

    alert(
        `${product.name} added to cart!`
    );

}


// =====================================================
// PART 1 END
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 2/6
// DISPLAY PRODUCTS + QUANTITY + CART + WISHLIST
// =====================================================


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

async function displayProducts() {

    if (!productContainer) {

        console.error(
            "Product container not found."
        );

        return;
    }


    // -------------------------------------------------
    // SHOW LOADING
    // -------------------------------------------------

    productContainer.innerHTML = `

        <div class="loading-products">

            <p>
                Loading products...
            </p>

        </div>

    `;


    try {

        // -------------------------------------------------
        // GET PRODUCTS FROM SUPABASE
        // -------------------------------------------------

        const products =
            await getProducts();


        // -------------------------------------------------
        // CLEAR LOADING
        // -------------------------------------------------

        productContainer.innerHTML = "";


        // -------------------------------------------------
        // NO PRODUCTS
        // -------------------------------------------------

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            productContainer.innerHTML = `

                <div class="empty-products">

                    <p>
                        No products available.
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


        // -------------------------------------------------
        // CREATE PRODUCT CARDS
        // -------------------------------------------------

        products.forEach(
            function(product, index) {

                const card =
                    document.createElement("div");


                card.className =
                    "product-card";


                card.dataset.originalIndex =
                    String(index);


                card.dataset.category =
                    String(
                        product.category ||
                        "other"
                    ).toLowerCase();


                const stock =
                    Number(
                        product.stock || 0
                    );


                const price =
                    Number(
                        product.price || 0
                    );


                const description =
                    product.description ||
                    "No description available.";


                // -------------------------------------------------
                // IMAGE
                // -------------------------------------------------

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
                            >

                        `
                        : `

                            <span>
                                🛍️
                            </span>

                        `;


                // -------------------------------------------------
                // STOCK
                // -------------------------------------------------

                let stockHTML = "";


                if (stock <= 0) {

                    stockHTML = `

                        <p class="out-of-stock">
                            Out of Stock
                        </p>

                    `;

                } else if (stock === 1) {

                    stockHTML = `

                        <p class="low-stock">
                            Only 1 left in stock
                        </p>

                    `;

                } else if (stock <= 5) {

                    stockHTML = `

                        <p class="low-stock">
                            Only ${stock} left in stock
                        </p>

                    `;

                } else {

                    stockHTML = `

                        <p class="in-stock">
                            ${stock} available in stock
                        </p>

                    `;

                }


                // -------------------------------------------------
                // PRODUCT CARD
                // -------------------------------------------------

                card.innerHTML = `

                    <div
                        class="product-image product-details-trigger"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                        style="cursor: pointer;"
                    >

                        ${imageHTML}

                    </div>


                    <h3
                        class="product-details-trigger"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                        style="cursor: pointer;"
                    >

                        ${escapeHTML(
                            product.name
                        )}

                    </h3>


                    <p class="product-price">

                        Rs.
                        ${price.toLocaleString()}

                    </p>


                    <p class="product-description">

                        ${escapeHTML(
                            description
                        )}

                    </p>


                    ${stockHTML}


                    <div
                        class="quantity-control"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        <button
                            type="button"
                            class="quantity-minus"
                            ${stock <= 0 ? "disabled" : ""}
                        >
                            −
                        </button>


                        <span class="quantity-value">
                            1
                        </span>


                        <button
                            type="button"
                            class="quantity-plus"
                            ${stock <= 0 ? "disabled" : ""}
                        >
                            +
                        </button>

                    </div>


                    <button
                        type="button"
                        class="add-cart-btn"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                        ${stock <= 0 ? "disabled" : ""}
                    >

                        Add to Cart

                    </button>


                    <button
                        type="button"
                        class="buy-now-btn"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                        ${stock <= 0 ? "disabled" : ""}
                    >

                        Buy Now

                    </button>


                    <button
                        type="button"
                        class="wishlist-btn"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        ♡ Add to Wishlist

                    </button>

                `;


                productContainer.appendChild(
                    card
                );
        


                // -------------------------------------------------
                // QUANTITY
                // -------------------------------------------------

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


                if (minusButton) {

                    minusButton.addEventListener(
                        "click",
                        function() {

                            if (quantity > 1) {

                                quantity--;

                                quantityValue.textContent =
                                    quantity;

                            }

                        }
                    );

                }


                if (plusButton) {

                    plusButton.addEventListener(
                        "click",
                        function() {

                            if (quantity < stock) {

                                quantity++;

                                quantityValue.textContent =
                                    quantity;

                            } else {

                                alert(
                                    `Only ${stock} item(s) are available.`
                                );

                            }

                        }
                    );

                }


                // -------------------------------------------------
                // ADD TO CART
                // -------------------------------------------------

                const addButton =
                    card.querySelector(
                        ".add-cart-btn"
                    );


                if (addButton) {

                    addButton.addEventListener(
                        "click",
                        function() {

                            addToCart(
                                product,
                                quantity
                            );

                        }
                    );

                }


                // -------------------------------------------------
                // BUY NOW
                // -------------------------------------------------

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


                            const added =
                                addToCart(
                                    product,
                                    quantity
                                );


                            if (added !== false) {

                                window.location.href =
                                    "checkout.html";

                            }

                        }
                    );

                }


                // -------------------------------------------------
                // WISHLIST
                // -------------------------------------------------

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

                    } catch (error) {

                        console.error(
                            "Wishlist loading error:",
                            error
                        );

                        wishlist = [];

                    }


                    const productId =
                        String(
                            product.id
                        );


                    const alreadyAdded =
                        wishlist.some(
                            function(item) {

                                return String(
                                    item.id
                                ) === productId;

                            }
                        );


                    if (alreadyAdded) {

                        wishlistButton.textContent =
                            "♥ In Wishlist";

                    }


                    wishlistButton.addEventListener(
                        "click",
                        function() {

                            let currentWishlist = [];


                            try {

                                currentWishlist =
                                    JSON.parse(
                                        localStorage.getItem(
                                            "wishlist"
                                        )
                                    ) || [];

                            } catch (error) {

                                currentWishlist = [];

                            }


                            const existingIndex =
                                currentWishlist.findIndex(
                                    function(item) {

                                        return String(
                                            item.id
                                        ) === productId;

                                    }
                                );


                            if (
                                existingIndex === -1
                            ) {

                                currentWishlist.push({

                                    id:
                                        product.id,

                                    name:
                                        product.name,

                                    price:
                                        price,

                                    image:
                                        product.image ||
                                        "",

                                    category:
                                        product.category ||
                                        "other"

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


        // -------------------------------------------------
        // APPLY FILTERS
        // -------------------------------------------------

        if (
            typeof filterProducts ===
            "function"
        ) {

            filterProducts();

        }

    } catch (error) {

        console.error(
            "Display products error:",
            error
        );


        productContainer.innerHTML = `

            <div class="empty-products">

                <p>
                    Unable to load products.
                </p>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// =====================================================
// PART 2 END
// =====================================================

// =====================================================
// PART 2 END
// =====================================================
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 3 - DISPLAY PRODUCTS + QUANTITY + CART BUTTONS
// =====================================================


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

async function displayProducts() {

    if (!productContainer) return;


    // Show loading message

    productContainer.innerHTML = `
        <div class="loading-products">
            <p>Loading products...</p>
        </div>
    `;


    // Get products from Supabase

    const products =
        await getProducts();


    // Clear loading message

    productContainer.innerHTML = "";


    // If no products

    if (!products || products.length === 0) {

        productContainer.innerHTML = `
            <div class="empty-products">

                <h3>
                    No products available.
                </h3>

                <p>
                    Please check your products database.
                </p>

            </div>
        `;

        updateFilterStatus(0);

        return;
    }


    // =================================================
    // CREATE PRODUCT CARDS
    // =================================================

    products.forEach(
        function(product, index) {

            const card =
                document.createElement("div");


            card.className =
                "product-card";


            // Original position for sorting

            card.dataset.originalIndex =
                String(index);


            // Product category

            card.dataset.category =
                String(
                    product.category ||
                    "other"
                )
                .toLowerCase()
                .trim();


            // Product ID

            card.dataset.id =
                String(product.id);


            // =================================================
            // PRODUCT DATA
            // =================================================

            const productName =
                product.name ||
                "Unnamed Product";


            const price =
                Number(
                    product.price || 0
                );


            const stock =
                Number(
                    product.stock || 0
                );


            const description =
                product.description ||
                "No description available.";


            // =================================================
            // IMAGE
            // =================================================

            let imageHTML = "";


            if (product.image) {

                imageHTML = `
                    <img
                        src="${escapeHTML(
                            product.image
                        )}"
                        alt="${escapeHTML(
                            productName
                        )}"
                        loading="lazy"
                    >
                `;

            }
            else {

                imageHTML = `
                    <span>
                        🛍️
                    </span>
                `;

            }


            // =================================================
            // STOCK
            // =================================================

            let stockHTML = "";


            if (stock <= 0) {

                stockHTML = `
                    <p class="out-of-stock">
                        Out of Stock
                    </p>
                `;

            }

            else if (stock === 1) {

                stockHTML = `
                    <p class="low-stock">
                        Only 1 left in stock
                    </p>
                `;

            }

            else if (stock <= 5) {

                stockHTML = `
                    <p class="low-stock">
                        Only ${stock} left in stock
                    </p>
                `;

            }

            else {

                stockHTML = `
                    <p class="in-stock">
                        ${stock} available in stock
                    </p>
                `;

            }


            // =================================================
            // PRODUCT CARD HTML
            // =================================================

            card.innerHTML = `

                <div
                    class="product-image product-details-trigger"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                    style="cursor: pointer;"
                >

                    ${imageHTML}

                </div>


                <h3
                    class="product-details-trigger"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                    style="cursor: pointer;"
                >

                    ${escapeHTML(
                        productName
                    )}

                </h3>


                <p class="product-price">

                    Rs.
                    ${price.toLocaleString()}

                </p>


                <p class="product-description">

                    ${escapeHTML(
                        description
                    )}

                </p>


                ${stockHTML}


                <!-- QUANTITY -->

                <div
                    class="quantity-control"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                >

                    <button
                        type="button"
                        class="quantity-minus"
                        ${stock <= 0 ? "disabled" : ""}
                    >
                        −
                    </button>


                    <span class="quantity-value">
                        1
                    </span>


                    <button
                        type="button"
                        class="quantity-plus"
                        ${stock <= 0 ? "disabled" : ""}
                    >
                        +
                    </button>

                </div>


                <!-- ADD TO CART -->

                <button
                    class="add-cart-btn"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                    type="button"
                    ${stock <= 0 ? "disabled" : ""}
                >

                    Add to Cart

                </button>


                <!-- BUY NOW -->

                <button
                    class="buy-now-btn"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                    type="button"
                    ${stock <= 0 ? "disabled" : ""}
                >

                    Buy Now

                </button>


                <!-- WISHLIST -->

                <button
                    class="wishlist-btn"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                    type="button"
                >

                    ♡ Add to Wishlist

                </button>

            `;


            // Add card to container

            productContainer.appendChild(
                card
            );


            // =================================================
            // QUANTITY
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
            // DECREASE QUANTITY
            // =================================================

            if (minusButton) {

                minusButton.addEventListener(
                    "click",
                    function() {

                        if (quantity > 1) {

                            quantity--;

                            quantityValue.textContent =
                                quantity;

                        }

                    }
                );

            }


            // =================================================
            // INCREASE QUANTITY
            // =================================================

            if (plusButton) {

                plusButton.addEventListener(
                    "click",
                    function() {

                        if (quantity < stock) {

                            quantity++;

                            quantityValue.textContent =
                                quantity;

                        }
                        else {

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

                        addToCart(
                            product,
                            quantity
                        );

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
                                "Sorry, this product is out of stock."
                            );

                            return;
                        }


                        addToCart(
                            product,
                            quantity
                        );


                        window.location.href =
                            "checkout.html";

                    }
                );

            }


            // =================================================
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

                }
                catch (error) {

                    console.error(
                        "Wishlist loading error:",
                        error
                    );

                    wishlist = [];

                }


                const productId =
                    String(
                        product.id
                    );


                const alreadyAdded =
                    wishlist.some(
                        function(item) {

                            return String(
                                item.id
                            ) === productId;

                        }
                    );


                if (alreadyAdded) {

                    wishlistButton.textContent =
                        "♥ In Wishlist";

                }


                wishlistButton.addEventListener(
                    "click",
                    function() {

                        let currentWishlist = [];


                        try {

                            currentWishlist =
                                JSON.parse(
                                    localStorage.getItem(
                                        "wishlist"
                                    )
                                ) || [];

                        }
                        catch (error) {

                            currentWishlist = [];

                        }


                        const existingIndex =
                            currentWishlist.findIndex(
                                function(item) {

                                    return String(
                                        item.id
                                    ) === productId;

                                }
                            );


                        // ADD

                        if (existingIndex === -1) {

                            currentWishlist.push({

                                id:
                                    product.id,

                                name:
                                    product.name,

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

                        }

                        // REMOVE

                        else {

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
    // APPLY SEARCH + CATEGORY FILTER
    // =================================================

    filterProducts();

}


// =====================================================
// INITIAL PRODUCT DISPLAY
// =====================================================

displayProducts();
// =====================================================
// PART 4 - SEARCH + CATEGORY FILTER + SORT
// =====================================================


// =====================================================
// FILTER PRODUCTS
// =====================================================

function filterProducts() {

    const productCards =
        document.querySelectorAll(
            ".product-card"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
                .toLowerCase()
                .trim()
            : "all";


    let visibleCount = 0;


    productCards.forEach(function(card) {

        const category =
            String(
                card.dataset.category || ""
            )
            .toLowerCase()
            .trim();


        const title =
            card.querySelector("h3");


        const descriptionElement =
            card.querySelector(
                ".product-description"
            );


        const productName =
            title
                ? title.textContent
                    .toLowerCase()
                    .trim()
                : "";


        const productDescription =
            descriptionElement
                ? descriptionElement.textContent
                    .toLowerCase()
                    .trim()
                : "";


        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;


        const matchesSearch =
            !searchText ||
            productName.includes(searchText) ||
            productDescription.includes(searchText);


        if (
            matchesCategory &&
            matchesSearch
        ) {

            card.style.display = "";

            visibleCount++;

        }
        else {

            card.style.display = "none";

        }

    });


    updateFilterStatus(
        visibleCount
    );

}


// =====================================================
// FILTER STATUS
// =====================================================

function updateFilterStatus(
    visibleCount
) {

    if (!filterStatus) return;


    if (visibleCount === 0) {

        filterStatus.textContent =
            "No products found.";

        return;

    }


    filterStatus.textContent =
        `Showing ${visibleCount} product${
            visibleCount === 1
                ? ""
                : "s"
        }.`;

}


// =====================================================
// SEARCH INPUT
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            filterProducts();

        }
    );

}


// =====================================================
// SEARCH BUTTON
// =====================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        function() {

            filterProducts();

        }
    );

}


// =====================================================
// CATEGORY DROPDOWN
// =====================================================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function() {

            filterProducts();

        }
    );

}


// =====================================================
// CLEAR FILTERS
// =====================================================

if (clearFiltersButton) {

    clearFiltersButton.addEventListener(
        "click",
        function() {

            if (searchInput) {

                searchInput.value = "";

            }


            if (categoryFilter) {

                categoryFilter.value =
                    "all";

            }


            filterProducts();

        }
    );

}


// =====================================================
// SHOP NOW
// =====================================================

const shopNowButton =
    document.getElementById(
        "shop-now"
    );


if (shopNowButton) {

    shopNowButton.addEventListener(
        "click",
        function() {

            const productsSection =
                document.getElementById(
                    "products"
                );


            if (productsSection) {

                productsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// =====================================================
// SORT PRODUCTS
// =====================================================

// IMPORTANT:
// sortProducts is already declared in your
// previous code, so DO NOT declare it again.


if (sortProducts) {

    sortProducts.addEventListener(
        "change",
        function() {

            if (!productContainer) {
                return;
            }


            const productCards =
                Array.from(
                    productContainer.querySelectorAll(
                        ".product-card"
                    )
                );


            const sortValue =
                sortProducts.value;


            // PRICE

            if (
                sortValue === "price-low" ||
                sortValue === "price-high"
            ) {

                productCards.sort(
                    function(a, b) {

                        const priceA =
                            getProductPrice(a);


                        const priceB =
                            getProductPrice(b);


                        return sortValue ===
                            "price-low"

                            ? priceA - priceB

                            : priceB - priceA;

                    }
                );

            }


            // NAME

            else if (
                sortValue === "name-a-z" ||
                sortValue === "name-z-a"
            ) {

                productCards.sort(
                    function(a, b) {

                        const nameA =
                            getProductName(a);


                        const nameB =
                            getProductName(b);


                        return sortValue ===
                            "name-a-z"

                            ? nameA.localeCompare(nameB)

                            : nameB.localeCompare(nameA);

                    }
                );

            }


            // DEFAULT

            else {

                productCards.sort(
                    function(a, b) {

                        return (
                            Number(
                                a.dataset.originalIndex || 0
                            ) -
                            Number(
                                b.dataset.originalIndex || 0
                            )
                        );

                    }
                );

            }


            // REORDER CARDS

            productCards.forEach(
                function(card) {

                    productContainer.appendChild(
                        card
                    );

                }
            );


            // APPLY FILTER AGAIN

            filterProducts();

        }
    );

}


// =====================================================
// GET PRODUCT PRICE
// =====================================================

function getProductPrice(card) {

    if (!card) return 0;


    const priceElement =
        card.querySelector(
            ".product-price"
        );


    if (!priceElement) return 0;


    const priceText =
        priceElement.textContent
            .replace(
                /[^0-9.]/g,
                ""
            );


    return Number(
        priceText
    ) || 0;

}


// =====================================================
// GET PRODUCT NAME
// =====================================================

function getProductName(card) {

    if (!card) return "";


    const nameElement =
        card.querySelector("h3");


    return nameElement
        ? nameElement.textContent
            .trim()
            .toLowerCase()
        : "";

}
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 5/6 - CART + CHECKOUT DISPLAY
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

    if (!Array.isArray(cart) || cart.length === 0) {

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

    cart.forEach(function(product) {

        if (!product) {
            return;
        }

        const productId =
            String(product.id);

        const existing =
            groupedCart.find(function(item) {

                return String(item.id) === productId;

            });


        const productQuantity =
            Math.max(
                1,
                Number(product.quantity) || 1
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
                    Number(product.price) || 0,

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
                    Number(product.stock) || 0,

                quantity:
                    productQuantity

            });

        }

    });


    // Keep cart in clean quantity format

    cart = groupedCart;


    let total = 0;


    // =================================================
    // CREATE CART ITEMS
    // =================================================

    groupedCart.forEach(function(product) {

        const price =
            Number(product.price) || 0;


        const quantity =
            Math.max(
                1,
                Number(product.quantity) || 1
            );


        const stock =
            Number(product.stock) || 0;


        const itemTotal =
            price * quantity;


        total += itemTotal;


        const cartItem =
            document.createElement("div");


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
                        cart.find(function(item) {

                            return String(item.id) ===
                                productId;

                        });


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
                        cart.find(function(item) {

                            return String(item.id) ===
                                productId;

                        });


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


                    if (currentQuantity > 1) {

                        existingProduct.quantity =
                            currentQuantity - 1;

                    }
                    else {

                        cart =
                            cart.filter(function(item) {

                                return String(item.id) !==
                                    productId;

                            });

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
                        String(
                            this.dataset.id
                        );


                    cart =
                        cart.filter(function(item) {

                            return String(item.id) !==
                                productId;

                        });


                    saveCart();

                    updateCartCount();

                    displayCart();

                    displayCheckout();

                }
            );

        }


        // =================================================
        // APPEND CART ITEM
        // =================================================

        cartItemsContainer.appendChild(
            cartItem
        );

    });


    // =================================================
    // CART TOTAL
    // =================================================

    if (cartTotalElement) {

        cartTotalElement.textContent =
            total.toLocaleString();

    }


    saveCart();

}


// =====================================================
// REMOVE FROM CART BY INDEX
// =====================================================

function removeFromCart(index) {

    if (
        index < 0 ||
        index >= cart.length
    ) {

        return;
    }


    cart.splice(
        index,
        1
    );


    saveCart();

    updateCartCount();

    displayCart();

    displayCheckout();

}


window.removeFromCart =
    removeFromCart;


// =====================================================
// DISPLAY CHECKOUT
// =====================================================

function displayCheckout() {

    if (!checkoutItemsContainer) {
        return;
    }


    checkoutItemsContainer.innerHTML =
        "";


    // =================================================
    // EMPTY CHECKOUT
    // =================================================

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        checkoutItemsContainer.innerHTML = `

            <p>
                Your cart is empty.
            </p>

            <a href="index.html#products">
                Continue Shopping
            </a>

        `;


        if (checkoutTotalElement) {

            checkoutTotalElement.textContent =
                "0";

        }

        return;
    }


    let total = 0;


    // =================================================
    // CHECKOUT ITEMS
    // =================================================

    cart.forEach(function(product) {

        const price =
            Number(
                product.price || 0
            );


        const quantity =
            Math.max(
                1,
                Number(
                    product.quantity
                ) || 1
            );


        const itemTotal =
            price * quantity;


        total += itemTotal;


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "checkout-item";


        item.innerHTML = `

            <div>

                <h4>
                    ${escapeHTML(
                        product.name
                    )}
                </h4>


                <p>

                    Rs.
                    ${price.toLocaleString()}

                    ×

                    ${quantity}

                </p>


                <p>

                    Item Total:

                    Rs.
                    ${itemTotal.toLocaleString()}

                </p>

            </div>

        `;


        checkoutItemsContainer.appendChild(
            item
        );

    });


    // =================================================
    // CHECKOUT TOTAL
    // =================================================

    if (checkoutTotalElement) {

        checkoutTotalElement.textContent =
            total.toLocaleString();

    }

}


// =====================================================
// PART 5 END
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 6A/6 - CHECKOUT + ORDER STATUS
// PART 1 OF 2
// =====================================================


// =====================================================
// SAVE CUSTOMER ORDER ID
// =====================================================

function saveCustomerOrderId(orderId) {

    if (!orderId) {
        return;
    }

    localStorage.setItem(
        "lastOrderId",
        String(orderId)
    );

}


// =====================================================
// GET CUSTOMER ORDER ID
// =====================================================

function getCustomerOrderId() {

    return localStorage.getItem(
        "lastOrderId"
    );

}


// =====================================================
// FORMAT ORDER DATE
// =====================================================

function formatOrderDate(dateValue) {

    if (!dateValue) {
        return "Date not available";
    }

    const orderDate =
        new Date(dateValue);

    if (Number.isNaN(orderDate.getTime())) {
        return "Date not available";
    }

    return orderDate.toLocaleString();

}


// =====================================================
// LOAD CUSTOMER ORDER STATUS
// =====================================================

async function loadCustomerOrderStatus() {

    if (!customerOrderStatus) {
        return;
    }

    const db =
        getSupabaseClient();

    if (!db) {

        customerOrderStatus.innerHTML = `
            <p>
                Database connection is not available.
            </p>
        `;

        return;
    }

    const orderId =
        getCustomerOrderId();

    if (!orderId) {

        customerOrderStatus.innerHTML = `
            <p>
                No recent order found.
            </p>
        `;

        return;
    }

    customerOrderStatus.innerHTML = `
        <p>
            Loading your order status...
        </p>
    `;

    try {

        const {
            data: orderData,
            error: orderError
        } = await db
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .maybeSingle();


        if (orderError) {

            console.error(
                "Order status error:",
                orderError
            );

            customerOrderStatus.innerHTML = `
                <p>
                    Unable to load order status.
                </p>
            `;

            return;
        }


        if (!orderData) {

            customerOrderStatus.innerHTML = `
                <p>
                    Order not found.
                </p>
            `;

            return;
        }


        const orderStatus =
            String(
                orderData.status ||
                "Pending"
            );


        const normalizedStatus =
            orderStatus
                .toLowerCase()
                .trim();


        let statusMessage =
            "Your order has been received.";


        if (normalizedStatus === "pending") {

            statusMessage =
                "Your order is pending.";

        }
        else if (
            normalizedStatus === "confirm" ||
            normalizedStatus === "confirmed"
        ) {

            statusMessage =
                "Your order has been confirmed.";

        }
        else if (
            normalizedStatus === "ship" ||
            normalizedStatus === "shipped"
        ) {

            statusMessage =
                "Your order has been shipped.";

        }
        else if (
            normalizedStatus === "delivery" ||
            normalizedStatus === "delivered"
        ) {

            statusMessage =
                "Your order has been delivered.";

        }
        else if (
            normalizedStatus === "cancel" ||
            normalizedStatus === "cancelled" ||
            normalizedStatus === "canceled"
        ) {

            statusMessage =
                "Your order has been cancelled.";

        }


        customerOrderStatus.innerHTML = `

            <div class="customer-order-status">

                <h3>
                    My Order Status
                </h3>

                <p>
                    <strong>
                        Order ID:
                    </strong>

                    ${escapeHTML(
                        orderData.id
                    )}
                </p>

                <p>
                    <strong>
                        Status:
                    </strong>

                    <span
                        class="order-status-badge status-${escapeHTML(
                            normalizedStatus
                        )}"
                    >
                        ${escapeHTML(
                            orderStatus
                        )}
                    </span>
                </p>

                <p>
                    ${escapeHTML(
                        statusMessage
                    )}
                </p>

                <p>
                    <strong>
                        Order Date:
                    </strong>

                    ${escapeHTML(
                        formatOrderDate(
                            orderData.created_at
                        )
                    )}
                </p>

                <p>
                    <strong>
                        Total:
                    </strong>

                    Rs.
                    ${Number(
                        orderData.total || 0
                    ).toLocaleString()}
                </p>

            </div>

        `;

    }
    catch (error) {

        console.error(
            "Customer order status error:",
            error
        );

        customerOrderStatus.innerHTML = `
            <p>
                Something went wrong while loading your order.
            </p>
        `;

    }

}


// =====================================================
// CHECKOUT FORM
// =====================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty!"
                );

                return;
            }


            // =================================================
            // CUSTOMER INFORMATION
            // =================================================

            const nameInput =
                document.getElementById("name");

            const emailInput =
                document.getElementById("email");

            const phoneInput =
                document.getElementById("phone");

            const addressInput =
                document.getElementById("address");

            const cityInput =
                document.getElementById("city");


            const customerName =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const customerEmail =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const customerPhone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";

            const customerAddress =
                addressInput
                    ? addressInput.value.trim()
                    : "";

            const customerCity =
                cityInput
                    ? cityInput.value.trim()
                    : "";


            // =================================================
            // PAYMENT METHOD
            // =================================================

            const paymentMethodInput =
                document.querySelector(
                    'input[name="payment_method"]:checked'
                );


            const paymentMethod =
                paymentMethodInput
                    ? paymentMethodInput.value
                    : "";


            if (!paymentMethod) {

                alert(
                    "Please select a payment method."
                );

                return;
            }


            // =================================================
            // REQUIRED FIELDS
            // =================================================

            if (
                !customerName ||
                !customerEmail ||
                !customerPhone ||
                !customerAddress ||
                !customerCity
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


            // =================================================
            // SUPABASE
            // =================================================

            const db =
                getSupabaseClient();


            if (!db) {

                alert(
                    "Database connection is not available."
                );

                return;
            }


            // =================================================
            // CALCULATE TOTAL
            // =================================================

            const orderTotal =
                cart.reduce(
                    function(sum, product) {

                        const productPrice =
                            Number(
                                product.price || 0
                            );

                        const productQuantity =
                            Math.max(
                                1,
                                Number(
                                    product.quantity
                                ) || 1
                            );

                        return sum +
                            (
                                productPrice *
                                productQuantity
                            );

                    },
                    0
                );


            // =================================================
            // PRODUCTS DATA
            // =================================================

            const productsData =
                cart.map(
                    function(product) {

                        return {

                            id:
                                product.id,

                            name:
                                product.name ||
                                "Unnamed Product",

                            price:
                                Number(
                                    product.price || 0
                                ),

                            quantity:
                                Math.max(
                                    1,
                                    Number(
                                        product.quantity
                                    ) || 1
                                ),

                            category:
                                product.category ||
                                "other",

                            image:
                                product.image ||
                                ""

                        };

                    }
                );


            // =================================================
            // CHECK STOCK
            // =================================================

            for (
                const cartProduct of cart
            ) {

                const {
                    data: stockProduct,
                    error: stockError
                } = await db
                    .from("products")
                    .select("id, name, stock")
                    .eq("id", cartProduct.id)
                    .maybeSingle();


                if (stockError) {

                    console.error(
                        "Stock checking error:",
                        stockError
                    );

                    alert(
                        "Unable to check product stock. Please try again."
                    );

                    return;
                }


                if (!stockProduct) {

                    alert(
                        `${cartProduct.name} is no longer available.`
                    );

                    return;
                }


                const availableStock =
                    Number(
                        stockProduct.stock || 0
                    );


                const requestedQuantity =
                    Math.max(
                        1,
                        Number(
                            cartProduct.quantity
                        ) || 1
                    );


                if (
                    availableStock <
                    requestedQuantity
                ) {

                    alert(
                        `${stockProduct.name} has only ${availableStock} item(s) available.`
                    );

                    return;
                }

            }


            // =================================================
            // DISABLE CHECKOUT BUTTON
            // =================================================

            if (checkoutButton) {

                checkoutButton.disabled =
                    true;

                checkoutButton.textContent =
                    "Placing Order...";

            }


            // =================================================
            // INSERT ORDER
            // =================================================

            try {

                const {
                    data: createdOrder,
                    error: orderError
                } = await db
                    .from("orders")
                    .insert([
                        {

                            customer_name:
                                customerName,

                            customer_email:
                                customerEmail,

                            customer_phone:
                                customerPhone,

                            customer_address:
                                customerAddress,

                            customer_city:
                                customerCity,

                            total:
                                orderTotal,

                            status:
                                "Pending",

                            payment_method:
                                paymentMethod,

                            payment_status:
                                "Pending",

                            products:
                                productsData

                        }
                    ])
                    .select()
                    .single();


                if (orderError) {

                    console.error(
                        "ORDER INSERT ERROR:",
                        orderError
                    );

                    alert(
                        `Order could not be placed: ${orderError.message}`
                    );

                    return;
                }


                if (
                    !createdOrder ||
                    !createdOrder.id
                ) {

                    alert(
                        "Order was created but no Order ID was returned."
                    );

                    return;
                }


                console.log(
                    "Order successfully saved:",
                    createdOrder
                );


                // =================================================
                // SAVE ORDER ID
                // =================================================

                saveCustomerOrderId(
                    createdOrder.id
                );// =====================================================
// PART 6A/6 - CHECKOUT + ORDER STATUS
// PART 2 OF 2
// =====================================================


                // =================================================
                // REDUCE STOCK
                // =================================================

                for (
                    const cartProduct of cart
                ) {

                    const productQuantity =
                        Math.max(
                            1,
                            Number(
                                cartProduct.quantity
                            ) || 1
                        );


                    const {
                        data: currentProduct,
                        error: currentProductError
                    } = await db
                        .from("products")
                        .select("id, stock")
                        .eq("id", cartProduct.id)
                        .maybeSingle();


                    if (currentProductError) {

                        console.error(
                            "Stock fetch error:",
                            currentProductError
                        );

                        continue;
                    }


                    if (!currentProduct) {

                        console.error(
                            "Product not found:",
                            cartProduct.id
                        );

                        continue;
                    }


                    const currentStock =
                        Number(
                            currentProduct.stock || 0
                        );


                    const newStock =
                        Math.max(
                            0,
                            currentStock -
                            productQuantity
                        );


                    const {
                        error: stockUpdateError
                    } = await db
                        .from("products")
                        .update({
                            stock: newStock
                        })
                        .eq(
                            "id",
                            cartProduct.id
                        );


                    if (stockUpdateError) {

                        console.error(
                            "Stock update error:",
                            stockUpdateError
                        );

                    }

                }


                // =================================================
                // SUCCESS MESSAGE
                // =================================================

                alert(
                    `Thank you ${customerName}! Your order has been placed successfully.\n\nOrder ID: ${createdOrder.id}`
                );


                // =================================================
                // CLEAR CART
                // =================================================

                cart = [];


                saveCart();


                updateCartCount();


                // =================================================
                // RESET CHECKOUT FORM
                // =================================================

                if (checkoutForm) {

                    checkoutForm.reset();

                }


                // =================================================
                // REFRESH CART
                // =================================================

                displayCart();


                displayCheckout();


                // =================================================
                // LOAD ORDER STATUS
                // =================================================

                loadCustomerOrderStatus();


                // =================================================
                // REFRESH PRODUCTS
                // =================================================

                if (
                    typeof displayProducts ===
                    "function"
                ) {

                    displayProducts();

                }


            }
            catch (error) {

                console.error(
                    "Checkout error:",
                    error
                );


                alert(
                    `Something went wrong: ${
                        error.message ||
                        error
                    }`
                );

            }
            finally {

                if (checkoutButton) {

                    checkoutButton.disabled =
                        false;

                    checkoutButton.textContent =
                        "Place Order";

                }

            }

        }
    );

}


// =====================================================
// INITIAL ORDER STATUS LOAD
// =====================================================

loadCustomerOrderStatus();


// =====================================================
// PART 6A END
// =====================================================
// =====================================================
// PART 6B/6 - PRODUCT DETAILS + REVIEWS
// PART 1
// =====================================================


// =====================================================
// LOAD PRODUCT DETAILS
// =====================================================

async function loadProductDetails() {

    const detailsContainer =
        document.getElementById(
            "product-details"
        );


    if (!detailsContainer) {
        return;
    }


    // =================================================
    // GET PRODUCT ID FROM URL
    // =================================================

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    if (!productId) {

        detailsContainer.innerHTML = `

            <div class="empty-products">

                <h2>
                    Product not found
                </h2>

                <p>
                    No product was selected.
                </p>

                <a href="index.html#products">
                    Back to Shop
                </a>

            </div>

        `;

        return;
    }


    const productIdNumber =
        Number(productId);


    if (Number.isNaN(productIdNumber)) {

        detailsContainer.innerHTML = `
            <p>
                Invalid product ID.
            </p>
        `;

        return;
    }


    // =================================================
    // SUPABASE
    // =================================================

    const db =
        getSupabaseClient();


    if (!db) {

        detailsContainer.innerHTML = `
            <p>
                Database connection is not available.
            </p>
        `;

        return;
    }


    detailsContainer.innerHTML = `
        <p>
            Loading product details...
        </p>
    `;


    try {

        // =================================================
        // LOAD PRODUCT
        // =================================================

        const {
            data: product,
            error: productError
        } = await db
            .from("products")
            .select("*")
            .eq("id", productIdNumber)
            .maybeSingle();


        if (productError) {

            console.error(
                "Product details error:",
                productError
            );

            detailsContainer.innerHTML = `
                <p>
                    Unable to load product.
                </p>
            `;

            return;
        }


        if (!product) {

            detailsContainer.innerHTML = `

                <div class="empty-products">

                    <h2>
                        Product not found
                    </h2>

                    <a href="index.html#products">
                        Back to Shop
                    </a>

                </div>

            `;

            return;
        }


        // =================================================
        // PRODUCT DATA
        // =================================================

        const productStock =
            Number(
                product.stock || 0
            );


        const productPrice =
            Number(
                product.price || 0
            );


        const productDescription =
            product.description ||
            "No description available.";


        let stockMessage = "";


        if (productStock <= 0) {

            stockMessage =
                "Out of Stock";

        }
        else if (productStock === 1) {

            stockMessage =
                "Only 1 left in stock";

        }
        else if (productStock <= 5) {

            stockMessage =
                `Only ${productStock} left in stock`;

        }
        else {

            stockMessage =
                `${productStock} available in stock`;

        }


        // =================================================
        // PRODUCT IMAGE
        // =================================================

        const productImageHTML =
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
                `;


        // =================================================
        // LOAD REVIEWS
        // =================================================

        const {
            data: productReviews,
            error: reviewsError
        } = await db
            .from("review")
            .select("*")
            .eq(
                "product_id",
                productIdNumber
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (reviewsError) {

            console.error(
                "Reviews loading error:",
                reviewsError
            );

        }


        const safeReviews =
            productReviews || [];


        // =================================================
        // REVIEW SUMMARY
        // =================================================

        const reviewRatings =
            [1, 2, 3, 4, 5];


        const totalReviews =
            safeReviews.length;


        const totalRating =
            safeReviews.reduce(
                function(total, review) {

                    return total +
                        Number(
                            review.rating || 0
                        );

                },
                0
            );


        const averageRating =
            totalReviews > 0
                ? (
                    totalRating /
                    totalReviews
                ).toFixed(1)
                : "0.0";


        // =================================================
        // REVIEWS HTML
        // =================================================

        let reviewsHTML = "";


        if (totalReviews === 0) {

            reviewsHTML = `
                <p class="no-reviews">
                    No reviews yet.
                </p>
            `;

        }
        else {

            reviewsHTML =
                safeReviews
                    .map(
                        function(review) {

                            const rating =
                                Math.max(
                                    0,
                                    Math.min(
                                        5,
                                        Number(
                                            review.rating || 0
                                        )
                                    )
                                );


                            const stars =
                                "⭐".repeat(
                                    rating
                                );


                            const reviewDate =
                                review.created_at
                                    ? new Date(
                                        review.created_at
                                    ).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        }
                                    )
                                    : "";


                            return `

                                <div class="single-review">

                                    <h4>
                                        ${escapeHTML(
                                            review.customer_name ||
                                            "Customer"
                                        )}
                                    </h4>

                                    <p>
                                        ${stars}
                                    </p>

                                    <p>
                                        ${escapeHTML(
                                            review.review_text ||
                                            ""
                                        )}
                                    </p>

                                    <small>
                                        ${escapeHTML(
                                            reviewDate
                                        )}
                                    </small>

                                </div>

                            `;

                        }
                    )
                    .join("");

        }// =====================================================
// PART 6B/6 - PRODUCT DETAILS + REVIEWS
// PART 2
// =====================================================


// =====================================================
// PRODUCT DETAILS HTML
// =====================================================

        detailsContainer.innerHTML = `

            <div class="product-detail-card">

                <div class="product-detail-image">

                    ${productImageHTML}

                </div>


                <div class="product-detail-info">

                    <h2>
                        ${escapeHTML(product.name)}
                    </h2>


                    <p class="product-detail-price">
                        Rs.
                        ${productPrice.toLocaleString()}
                    </p>


                    <p class="product-detail-category">
                        Category:
                        ${escapeHTML(
                            product.category || "Other"
                        )}
                    </p>


                    <div class="product-detail-description">

                        <h3>
                            Description
                        </h3>

                        <p>
                            ${escapeHTML(
                                productDescription
                            )}
                        </p>

                    </div>


                    <p class="product-detail-stock">
                        📦
                        ${escapeHTML(
                            stockMessage
                        )}
                    </p>


                    <div class="detail-quantity">

                        <button
                            type="button"
                            id="detail-minus"
                            ${productStock <= 0 ? "disabled" : ""}
                        >
                            −
                        </button>


                        <span id="detail-quantity">
                            1
                        </span>


                        <button
                            type="button"
                            id="detail-plus"
                            ${productStock <= 0 ? "disabled" : ""}
                        >
                            +
                        </button>

                    </div>


                    <div class="detail-buttons">

                        <button
                            type="button"
                            id="detail-add-cart"
                            ${productStock <= 0 ? "disabled" : ""}
                        >
                            Add to Cart
                        </button>


                        <button
                            type="button"
                            id="detail-buy-now"
                            ${productStock <= 0 ? "disabled" : ""}
                        >
                            Buy Now
                        </button>

                    </div>


                    <!-- =========================================
                         REVIEWS
                    ========================================== -->

                    <div class="product-reviews">

                        <h3>
                            Reviews
                        </h3>


                        <div id="review-summary">

                            ${
                                totalReviews > 0
                                    ? `
                                        <div class="review-average">

                                            <strong>
                                                ⭐ ${averageRating} / 5
                                            </strong>

                                            <p>
                                                Based on
                                                ${totalReviews}
                                                review${
                                                    totalReviews === 1
                                                        ? ""
                                                        : "s"
                                                }
                                            </p>

                                        </div>
                                    `
                                    : `
                                        <p>
                                            No ratings yet.
                                        </p>
                                    `
                            }

                        </div>


                        <div id="reviews-list">

                            ${reviewsHTML}

                        </div>


                        <!-- =====================================
                             REVIEW FORM
                        ====================================== -->

                        <div class="review-form">

                            <h3>
                                Write a Review
                            </h3>


                            <input
                                type="text"
                                id="review-customer-name"
                                placeholder="Your Name"
                            >


                            <div
                                class="star-rating"
                                id="star-rating"
                            >

                                <button
                                    type="button"
                                    data-rating="1"
                                >
                                    ☆
                                </button>


                                <button
                                    type="button"
                                    data-rating="2"
                                >
                                    ☆
                                </button>


                                <button
                                    type="button"
                                    data-rating="3"
                                >
                                    ☆
                                </button>


                                <button
                                    type="button"
                                    data-rating="4"
                                >
                                    ☆
                                </button>


                                <button
                                    type="button"
                                    data-rating="5"
                                >
                                    ☆
                                </button>

                            </div>


                            <input
                                type="hidden"
                                id="review-rating"
                                value=""
                            >


                            <textarea
                                id="review-text"
                                placeholder="Write your review..."
                                rows="4"
                            ></textarea>


                            <button
                                type="button"
                                id="submit-review"
                            >
                                Submit Review
                            </button>


                            <p
                                id="review-message"
                            ></p>

                        </div>

                    </div>

                </div>

            </div>

        `;


        // =====================================================
        // QUANTITY CONTROLS
        // =====================================================

        let detailQuantity = 1;


        const detailQuantityElement =
            document.getElementById(
                "detail-quantity"
            );


        const detailMinusButton =
            document.getElementById(
                "detail-minus"
            );


        const detailPlusButton =
            document.getElementById(
                "detail-plus"
            );


        const detailAddCartButton =
            document.getElementById(
                "detail-add-cart"
            );


        const detailBuyNowButton =
            document.getElementById(
                "detail-buy-now"
            );
            


        if (detailMinusButton) {

            detailMinusButton.addEventListener(
                "click",
                function() {

                    if (detailQuantity > 1) {

                        detailQuantity--;

                        detailQuantityElement.textContent =
                            detailQuantity;

                    }

                }
            );

        }


        if (detailPlusButton) {

            detailPlusButton.addEventListener(
                "click",
                function() {

                    if (detailQuantity < productStock) {

                        detailQuantity++;

                        detailQuantityElement.textContent =
                            detailQuantity;

                    }
                    else {

                        alert(
                            `Only ${productStock} item(s) are available.`
                        );

                    }

                }
            );

        }


        // =====================================================
        // ADD TO CART
        // =====================================================

        if (detailAddCartButton) {

            detailAddCartButton.addEventListener(
                "click",
                function() {

                    addToCart(
                        product,
                        detailQuantity
                    );

                }
            );

        }


        // =====================================================
        // BUY NOW
        // =====================================================

        if (detailBuyNowButton) {

            detailBuyNowButton.addEventListener(
                "click",
                function() {

                    if (productStock <= 0) {

                        alert(
                            "Sorry, this product is out of stock."
                        );

                        return;
                    }


                    const added =
                        addToCart(
                            product,
                            detailQuantity
                        );


                    if (added !== false) {

                        window.location.href =
                            "checkout.html";

                    }

                }
            );

        }// =====================================================} // ← PRODUCT DETAILS wala try CLOSE

        
// PART 6B/6 - PRODUCT DETAILS + REVIEWS
// PART 3 OF 3
// =====================================================


// =====================================================
// STAR RATING
// =====================================================

const starRating =
    document.getElementById(
        "star-rating"
    );

const reviewRatingInput =
    document.getElementById(
        "review-rating"
    );


if (starRating && reviewRatingInput) {

    const starButtons =
        starRating.querySelectorAll(
            "button[data-rating]"
        );


    starButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const selectedRating =
                        Number(
                            button.dataset.rating
                        );


                    reviewRatingInput.value =
                        String(
                            selectedRating
                        );


                    starButtons.forEach(
                        function(starButton) {

                            const starValue =
                                Number(
                                    starButton.dataset.rating
                                );


                            starButton.textContent =
                                starValue <= selectedRating
                                    ? "★"
                                    : "☆";

                        }
                    );

                }
            );

        }
    );

}


// =====================================================
// SUBMIT REVIEW
// =====================================================

const submitReviewButton =
    document.getElementById(
        "submit-review"
    );


if (submitReviewButton) {

    submitReviewButton.addEventListener(
        "click",
        async function() {

            const reviewNameInput =
                document.getElementById(
                    "review-customer-name"
                );


            const reviewTextInput =
                document.getElementById(
                    "review-text"
                );


            const reviewMessage =
                document.getElementById(
                    "review-message"
                );


            const customerName =
                reviewNameInput
                    ? reviewNameInput.value.trim()
                    : "";


            const reviewText =
                reviewTextInput
                    ? reviewTextInput.value.trim()
                    : "";


            const selectedRating =
                Number(
                    reviewRatingInput
                        ? reviewRatingInput.value
                        : 0
                );


            if (!customerName) {

                if (reviewMessage) {

                    reviewMessage.textContent =
                        "Please enter your name.";

                }

                return;
            }


            if (
                selectedRating < 1 ||
                selectedRating > 5
            ) {

                if (reviewMessage) {

                    reviewMessage.textContent =
                        "Please select a rating.";

                }

                return;
            }


            if (!reviewText) {

                if (reviewMessage) {

                    reviewMessage.textContent =
                        "Please write your review.";

                }

                return;
            }


            const db =
                getSupabaseClient();


            if (!db) {

                if (reviewMessage) {

                    reviewMessage.textContent =
                        "Database connection is not available.";

                }

                return;
            }


            submitReviewButton.disabled =
                true;


            submitReviewButton.textContent =
                "Submitting...";


            if (reviewMessage) {

                reviewMessage.textContent =
                    "";

            }


            try {

                const {
                    error: reviewInsertError
                } = await db
                    .from("review")
                    .insert([
                        {

                            product_id:
                                productIdNumber,

                            customer_name:
                                customerName,

                            rating:
                                selectedRating,

                            review_text:
                                reviewText

                        }
                    ]);


                if (reviewInsertError) {

                    console.error(
                        "Review insert error:",
                        reviewInsertError
                    );


                    if (reviewMessage) {

                        reviewMessage.textContent =
                            `Review could not be submitted: ${reviewInsertError.message}`;

                    }

                    return;
                }


                if (reviewMessage) {

                    reviewMessage.textContent =
                        "Thank you! Your review has been submitted.";

                }


                if (reviewNameInput) {

                    reviewNameInput.value =
                        "";

                }


                if (reviewTextInput) {

                    reviewTextInput.value =
                        "";

                }


                if (reviewRatingInput) {

                    reviewRatingInput.value =
                        "";

                }


                starButtons.forEach(
                    function(starButton) {

                        starButton.textContent =
                            "☆";

                    }
                );


                // Reload product details
                // so the new review appears

                await loadProductDetails();

            }
            catch (error) {

                console.error(
                    "Review submission error:",
                    error
                );


                if (reviewMessage) {

                    reviewMessage.textContent =
                        "Something went wrong while submitting your review.";

                }

            }
            finally {

                submitReviewButton.disabled =
                    false;


                submitReviewButton.textContent =
                    "Submit Review";

            }

        }
    );

}


// =====================================================
// PRODUCT DETAILS PAGE INITIALIZATION
// =====================================================

if (
    document.getElementById(
        "product-details"
    )
) {

    loadProductDetails();

}


// =====================================================
// PART 6B END
// =====================================================
// =====================================================
// PART 7 - PRODUCT DETAILS NAVIGATION
// + CART INITIALIZATION
// =====================================================


// =====================================================
// OPEN PRODUCT DETAILS
// =====================================================

document.addEventListener(
    "click",
    function(event) {

        const detailsTrigger =
            event.target.closest(
                ".product-details-trigger"
            );


        if (!detailsTrigger) {
            return;
        }


        const productId =
            detailsTrigger.dataset.id;


        if (!productId) {
            return;
        }


        window.location.href =
            `product-details.html?id=${encodeURIComponent(
                productId
            )}`;

    }
);


// =====================================================
// CART INITIALIZATION
// =====================================================

updateCartCount();


// =====================================================
// DISPLAY CART PAGE
// =====================================================

if (cartItemsContainer) {

    displayCart();

}


// =====================================================
// DISPLAY CHECKOUT PAGE
// =====================================================

if (checkoutItemsContainer) {

    displayCheckout();

}


// =====================================================
// PART 7 END
// =====================================================
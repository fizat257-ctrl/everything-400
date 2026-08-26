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


    productContainer.innerHTML = `

        <div class="loading-products">

            <p>
                Loading products...
            </p>

        </div>

    `;


    const products =
        await getProducts();


    productContainer.innerHTML = "";


    if (!products || products.length === 0) {

        productContainer.innerHTML = `

            <div class="empty-products">

                <p>
                    No products available.
                </p>

            </div>

        `;

        updateFilterStatus(0);

        return;
    }


    products.forEach(
        function(product, index) {

            // =================================================
            // CREATE CARD
            // =================================================

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


            const description =
                product.description ||
                "No description available.";


            // =================================================
            // PRODUCT IMAGE
            // =================================================

            let imageHTML = "";


            if (product.image) {

                imageHTML = `

                    <img
                        src="${escapeHTML(
                            product.image
                        )}"
                        alt="${escapeHTML(
                            product.name
                        )}"
                    >

                `;

            } else {

                imageHTML = `

                    <span>
                        🛍️
                    </span>

                `;

            }


            // =================================================
            // STOCK MESSAGE
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
                        product.name
                    )}

                </h3>


                <p class="product-price">

                    Rs.
                    ${Number(
                        product.price
                    ) || 0}

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


            productContainer.appendChild(
                card
            );


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
            // ADD TO CART BUTTON
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
            // BUY NOW BUTTON
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
            // IMPORTANT:
            // THIS CODE IS INSIDE products.forEach()
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
                                    Number(
                                        product.price
                                    ) || 0,

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

                        }
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
    // APPLY FILTERS AFTER PRODUCTS LOAD
    // =================================================

    filterProducts();

}


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
// PART 5 - CART + CHECKOUT DISPLAY
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

    if (cart.length === 0) {

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

            cartTotalElement.textContent =
                "0";

        }


        return;
    }


    // =================================================
    // GROUP CART ITEMS
    // =================================================

    const groupedCart = [];


    cart.forEach(function(product) {

        const existing =
            groupedCart.find(
                function(item) {

                    return String(item.id) ===
                        String(product.id);

                }
            );


        if (existing) {

            existing.quantity += 1;

        }
        else {

            groupedCart.push({

                id:
                    product.id,

                name:
                    product.name,

                price:
                    Number(product.price) || 0,

                category:
                    product.category || "other",

                image:
                    product.image || "",

                description:
                    product.description || "",

                stock:
                    Number(product.stock) || 0,

                quantity:
                    1

            });

        }

    });


    let total = 0;


    // =================================================
    // CREATE CART ITEMS
    // =================================================

    groupedCart.forEach(function(product) {

        const price =
            Number(product.price) || 0;


        const quantity =
            Number(product.quantity) || 1;


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
                        this.dataset.id;


                    const existingProduct =
                        cart.find(
                            function(item) {

                                return String(
                                    item.id
                                ) ===
                                String(
                                    productId
                                );

                            }
                        );


                    if (!existingProduct) {
                        return;
                    }


                    const currentQuantity =
                        cart.filter(
                            function(item) {

                                return String(
                                    item.id
                                ) ===
                                String(
                                    productId
                                );

                            }
                        ).length;


                    const stock =
                        Number(
                            existingProduct.stock || 0
                        );


                    if (
                        stock > 0 &&
                        currentQuantity >= stock
                    ) {

                        alert(
                            `Only ${stock} item(s) are available.`
                        );

                        return;

                    }


                    cart.push({

                        id:
                            existingProduct.id,

                        name:
                            existingProduct.name,

                        price:
                            Number(
                                existingProduct.price
                            ) || 0,

                        category:
                            existingProduct.category ||
                            "other",

                        image:
                            existingProduct.image ||
                            "",

                        description:
                            existingProduct.description ||
                            "",

                        stock:
                            existingProduct.stock ||
                            0

                    });


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
                        this.dataset.id;


                    const productIndex =
                        cart.findIndex(
                            function(item) {

                                return String(
                                    item.id
                                ) ===
                                String(
                                    productId
                                );

                            }
                        );


                    if (
                        productIndex !== -1
                    ) {

                        cart.splice(
                            productIndex,
                            1
                        );


                        saveCart();

                        updateCartCount();

                        displayCart();

                        displayCheckout();

                    }

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


                    cart =
                        cart.filter(
                            function(item) {

                                return String(
                                    item.id
                                ) !==
                                String(
                                    productId
                                );

                            }
                        );


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
    // UPDATE CART TOTAL
    // =================================================

    if (cartTotalElement) {

        cartTotalElement.textContent =
            total.toLocaleString();

    }


    // Save

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


// Make available globally

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

    if (cart.length === 0) {

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

    cart.forEach(
        function(product) {

            const price =
                Number(
                    product.price || 0
                );


            total += price;


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

                    </p>

                </div>

            `;


            checkoutItemsContainer.appendChild(
                item
            );

        }
    );


    // =================================================
    // CHECKOUT TOTAL
    // =================================================

    if (checkoutTotalElement) {

        checkoutTotalElement.textContent =
            total.toLocaleString();

    }

}
// =====================================================
// PART 6A - CHECKOUT + ORDER STATUS
// =====================================================


// =====================================================
// SAVE CUSTOMER ORDER ID
// =====================================================

function saveCustomerOrderId(orderId) {

    if (!orderId) return;

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

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date not available";
    }

    return date.toLocaleString();
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
            data,
            error
        } = await db
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .maybeSingle();

        if (error) {

            console.error(
                "Order status error:",
                error
            );

            customerOrderStatus.innerHTML = `
                <p>
                    Unable to load order status.
                </p>
            `;

            return;
        }

        if (!data) {

            customerOrderStatus.innerHTML = `
                <p>
                    Order not found.
                </p>
            `;

            return;
        }

        const status =
            String(
                data.status || "Pending"
            );

        const normalizedStatus =
            status.toLowerCase();

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

                    ${escapeHTML(data.id)}
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
                        ${escapeHTML(status)}
                    </span>
                </p>

                <p>
                    ${escapeHTML(statusMessage)}
                </p>

                <p>
                    <strong>
                        Order Date:
                    </strong>

                    ${escapeHTML(
                        formatOrderDate(
                            data.created_at
                        )
                    )}
                </p>

                <p>
                    <strong>
                        Total:
                    </strong>

                    Rs.
                    ${Number(
                        data.total || 0
                    ).toLocaleString()}
                </p>

            </div>

        `;

    }
    catch (error) {

        console.error(
            "Customer status error:",
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

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";

            const address =
                addressInput
                    ? addressInput.value.trim()
                    : "";

            const city =
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
                !name ||
                !email ||
                !phone ||
                !address ||
                !city
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


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

            const total =
                cart.reduce(
                    function(sum, product) {

                        return sum +
                            Number(
                                product.price || 0
                            );

                    },
                    0
                );


            // =================================================
            // PRODUCTS DATA
            // =================================================

            const productsData =
                cart.map(function(product) {

                    return {

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
                            ""

                    };

                });


            try {

                const {
                    data,
                    error
                } = await db
                    .from("orders")
                    .insert([
                        {

                            customer_name:
                                name,

                            customer_email:
                                email,

                            customer_phone:
                                phone,

                            customer_address:
                                address,

                            customer_city:
                                city,

                            total:
                                total,

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


                if (error) {

                    console.error(
                        "ORDER ERROR:",
                        error
                    );

                    alert(
                        `Order could not be placed: ${error.message}`
                    );

                    return;
                }


                console.log(
                    "Order successfully saved:",
                    data
                );


                if (
                    data &&
                    data.id
                ) {

                    saveCustomerOrderId(
                        data.id
                    );

                }


                alert(
                    `Thank you ${name}! Your order has been placed successfully.\n\nOrder ID: ${data.id}`
                );


                cart = [];

                saveCart();

                updateCartCount();

                checkoutForm.reset();

                displayCart();

                displayCheckout();

                loadCustomerOrderStatus();

            }
            catch (error) {

                console.error(
                    "Checkout error:",
                    error
                );

                alert(
                    `Something went wrong: ${
                        error.message || error
                    }`
                );

            }

        }
    );

}


// =====================================================
// LOAD ORDER STATUS
// =====================================================

loadCustomerOrderStatus();
// =====================================================
        // PRODUCT HTML
        // =====================================================

        detailsContainer.innerHTML = `

            <div class="product-detail-card">

                <div class="product-detail-image">
                    ${imageHTML}
                </div>

                <div class="product-detail-info">

                    <h2>
                        ${escapeHTML(product.name)}
                    </h2>

                    <p class="product-detail-price">
                        Rs. ${price.toLocaleString()}
                    </p>

                    <p class="product-detail-category">
                        Category:
                        ${escapeHTML(product.category || "Other")}
                    </p>

                    <div class="product-detail-description">

                        <h3>Description</h3>

                        <p>
                            ${escapeHTML(description)}
                        </p>

                    </div>

                    <p class="product-detail-stock">
                        📦 ${escapeHTML(stockMessage)}
                    </p>

                    <div class="detail-quantity">

                        <button
                            type="button"
                            id="detail-minus"
                            ${stock <= 0 ? "disabled" : ""}
                        >
                            −
                        </button>

                        <span id="detail-quantity">
                            1
                        </span>

                        <button
                            type="button"
                            id="detail-plus"
                            ${stock <= 0 ? "disabled" : ""}
                        >
                            +
                        </button>

                    </div>

                    <div class="detail-buttons">

                        <button
                            type="button"
                            id="detail-add-cart"
                            ${stock <= 0 ? "disabled" : ""}
                        >
                            Add to Cart
                        </button>

                        <button
                            type="button"
                            id="detail-buy-now"
                            ${stock <= 0 ? "disabled" : ""}
                        >
                            Buy Now
                        </button>

                    </div>


                    <!-- =====================================================
                         REVIEWS
                    ====================================================== -->

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
                                                Based on ${totalReviews}
                                                review${totalReviews === 1 ? "" : "s"}
                                            </p>

                                        </div>


                                        <div class="rating-distribution">

                                            ${
                                                reviewRatings
                                                    .slice()
                                                    .reverse()
                                                    .map(function(star) {

                                                        const count =
                                                            reviews.filter(
                                                                function(review) {

                                                                    return Number(
                                                                        review.rating
                                                                    ) === star;

                                                                }
                                                            ).length;


                                                        const percentage =
                                                            totalReviews > 0
                                                                ? (count / totalReviews) * 100
                                                                : 0;


                                                        return `
                                                            <div class="rating-row">

                                                                <span>
                                                                    ${star} ⭐
                                                                </span>

                                                                <div class="rating-bar">

                                                                    <div
                                                                        class="rating-bar-fill"
                                                                        style="width: ${percentage}%"
                                                                    ></div>

                                                                </div>

                                                                <span>
                                                                    ${count}
                                                                </span>

                                                            </div>
                                                        `;

                                                    })
                                                    .join("")
                                            }

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


                        <!-- REVIEW FORM -->

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

        let quantity = 1;


        const quantityElement =
            document.getElementById(
                "detail-quantity"
            );


        const minusButton =
            document.getElementById(
                "detail-minus"
            );


        const plusButton =
            document.getElementById(
                "detail-plus"
            );


        const addCartButton =
            document.getElementById(
                "detail-add-cart"
            );


        const buyNowButton =
            document.getElementById(
                "detail-buy-now"
            );


        if (minusButton) {

            minusButton.addEventListener(
                "click",
                function() {

                    if (quantity > 1) {

                        quantity--;

                        quantityElement.textContent =
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

                        quantityElement.textContent =
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
        
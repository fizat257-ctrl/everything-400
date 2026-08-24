// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 1 - SUPABASE + CART + PRODUCTS
// =====================================================

let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
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

const categoryButtons =
    document.querySelectorAll(".category-btn");

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

let selectedCategory = "all";


// =====================================================
// SUPABASE
// =====================================================

function getSupabaseClient() {

    const db = window.supabaseClient;

    if (!db) {

        console.error(
            "Supabase client not found."
        );

        console.error(
            "Make sure supabase.js is loaded BEFORE script.js."
        );

        return null;
    }

    return db;
}


function checkSupabase() {

    return !!getSupabaseClient();

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
// CART COUNT
// =====================================================

function updateCartCount() {

    if (!cartLink) return;

    cartLink.textContent =
        `Cart (${cart.length})`;
}


// =====================================================
// GET PRODUCTS
// =====================================================

async function getProducts() {

    const db = getSupabaseClient();

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

function addToCart(product) {

    if (!product) {

        alert(
            "Product could not be found."
        );

        return;
    }

    cart.push({

        id: product.id,

        name: product.name,

        price:
            Number(product.price) || 0,

        category:
            product.category || "other",

        image:
            product.image || ""

    });

    saveCart();

    updateCartCount();

    alert(
        `${product.name} added to cart!`
    );
}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

async function displayProducts() {

    if (!productContainer) return;

    productContainer.innerHTML = `
        <div class="loading-products">
            <p>Loading products...</p>
        </div>
    `;

    const products =
        await getProducts();

    productContainer.innerHTML = "";

    if (products.length === 0) {

        productContainer.innerHTML = `
            <div class="empty-products">
                <p>No products available.</p>
            </div>
        `;

        return;
    }

    products.forEach(function(product) {

        const card =
            document.createElement("div");

        card.className =
            "product-card";

        card.dataset.category =
            String(
                product.category || "other"
            ).toLowerCase();

        let imageHTML = "";

        if (product.image) {

            imageHTML = `
                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                >
            `;

        } else {

            imageHTML = `
                <span>🛍️</span>
            `;
        }

        card.innerHTML = `

            <div class="product-image">
                ${imageHTML}
            </div>

            <h3>
                ${escapeHTML(product.name)}
            </h3>

            <p>
                Rs. ${Number(product.price) || 0}
            </p>

            <button
                class="add-cart-btn"
                data-id="${escapeHTML(product.id)}"
                type="button"
            >
                Add to Cart
            </button>

        `;

        productContainer.appendChild(card);
    });

    const addButtons =
        productContainer.querySelectorAll(
            ".add-cart-btn"
        );

    addButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            async function() {

                const productId =
                    this.dataset.id;

                const products =
                    await getProducts();

                const product =
                    products.find(function(item) {

                        return String(item.id) ===
                            String(productId);

                    });

                addToCart(product);
            }
        );
    });

    filterProducts();
}
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 2 - SEARCH + CATEGORY + CART
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

    productCards.forEach(function(card) {

        const category =
            String(
                card.dataset.category || ""
            ).toLowerCase();

        const title =
            card.querySelector("h3");

        const productName =
            title
                ? title.textContent
                    .toLowerCase()
                    .trim()
                : "";

        const matchesCategory =
            selectedCategory === "all" ||
            category ===
            selectedCategory.toLowerCase();

        const matchesSearch =
            productName.includes(
                searchText
            );

        card.style.display =
            matchesCategory &&
            matchesSearch
                ? ""
                : "none";
    });
}


// =====================================================
// CATEGORY BUTTONS
// =====================================================

categoryButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            selectedCategory =
                this.dataset.filter ||
                "all";

            categoryButtons.forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );
                }
            );

            this.classList.add(
                "active"
            );

            filterProducts();
        }
    );
});


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProducts
    );
}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        filterProducts
    );
}


// =====================================================
// SHOP NOW
// =====================================================

const shopNowButton =
    document.getElementById("shop-now");

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
// DISPLAY CART
// =====================================================

function displayCart() {

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `

            <div class="empty-cart">

                <p>
                    Your shopping cart is empty.
                </p>

                <a href="index.html">
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

    let total = 0;

    cart.forEach(function(product, index) {

        const price =
            Number(product.price) || 0;

        total += price;

        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";

        cartItem.innerHTML = `

            <div>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    Rs. ${price}
                </p>

            </div>

            <button
                class="remove-btn"
                type="button"
                onclick="removeFromCart(${index})"
            >
                Remove
            </button>

        `;

        cartItemsContainer.appendChild(
            cartItem
        );
    });

    if (cartTotalElement) {

        cartTotalElement.textContent =
            total;
    }
}


// =====================================================
// REMOVE FROM CART
// =====================================================

function removeFromCart(index) {

    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }

    cart.splice(index, 1);

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

    if (!checkoutItemsContainer) return;

    checkoutItemsContainer.innerHTML = "";

    if (cart.length === 0) {

        checkoutItemsContainer.innerHTML = `

            <p>
                Your cart is empty.
            </p>

            <a href="index.html">
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

    cart.forEach(function(product) {

        const price =
            Number(product.price) || 0;

        total += price;

        const item =
            document.createElement("div");

        item.className =
            "checkout-item";

        item.innerHTML = `

            <div>

                <h4>
                    ${escapeHTML(product.name)}
                </h4>

                <p>
                    Rs. ${price}
                </p>

            </div>

        `;

        checkoutItemsContainer.appendChild(
            item
        );
    });

    if (checkoutTotalElement) {

        checkoutTotalElement.textContent =
            total;
    }
}
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 3 - CHECKOUT + SUPABASE ORDERS
// =====================================================


// =====================================================
// CHECKOUT FORM
// =====================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            // -----------------------------
            // CHECK CART
            // -----------------------------

            if (cart.length === 0) {

                alert(
                    "Your cart is empty!"
                );

                return;
            }


            // -----------------------------
            // CUSTOMER DATA
            // -----------------------------

            const name =
                document
                    .getElementById("name")
                    ?.value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    ?.value
                    .trim();

            const address =
                document
                    .getElementById("address")
                    ?.value
                    .trim();

            const city =
                document
                    .getElementById("city")
                    ?.value
                    .trim();


            // -----------------------------
            // VALIDATION
            // -----------------------------

            if (
                !name ||
                !phone ||
                !address ||
                !city
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


            // -----------------------------
            // SUPABASE
            // -----------------------------

            const db =
                getSupabaseClient();

            if (!db) {

                alert(
                    "Database connection is not available."
                );

                return;
            }


            // -----------------------------
            // TOTAL
            // -----------------------------

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


            // -----------------------------
            // PRODUCTS DATA
            // -----------------------------

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


            // -----------------------------
            // SAVE ORDER
            // -----------------------------

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

                            products:
                                productsData

                        }
                    ])
                    .select();


                // -----------------------------
                // ERROR
                // -----------------------------

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


                // -----------------------------
                // SUCCESS
                // -----------------------------

                console.log(
                    "Order successfully saved:",
                    data
                );

                alert(
                    `Thank you ${name}! Your order has been placed successfully.`
                );


                // -----------------------------
                // CLEAR CART
                // -----------------------------

                cart = [];

                saveCart();

                updateCartCount();

                checkoutForm.reset();

                displayCart();

                displayCheckout();

            } catch (error) {

                console.error(
                    "Checkout error:",
                    error
                );

                alert(
                    `Something went wrong: ${error.message || error}`
                );
            }
        }
    );
}


// =====================================================
// CHECKOUT BUTTON
// =====================================================

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        function() {

            if (cart.length === 0) {

                alert(
                    "Your cart is empty!"
                );

                return;
            }

            window.location.href =
                "checkout.html";
        }
    );
}


// =====================================================
// INITIALIZE WEBSITE
// =====================================================

updateCartCount();

displayProducts();

displayCart();

displayCheckout();


// =====================================================
// DEBUG
// =====================================================

console.log(
    "Everything 400 script.js loaded."
);

console.log(
    "Supabase available:",
    !!window.supabaseClient
);
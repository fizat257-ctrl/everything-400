// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 1 - SUPABASE + PRODUCTS + CART + STOCK
// =====================================================

let cart = [];

try {
    cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

} catch (error) {

    console.error(
        "Cart loading error:",
        error
    );

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

const customerOrderStatus =
    document.getElementById(
        "customer-order-status"
    );

let selectedCategory = "all";


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
        Number(product.stock || 0);


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
                <p>
                    No products available.
                </p>
            </div>
        `;

        return;
    }


    products.forEach(
        function(product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


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


            // -----------------------------------------
            // IMAGE
            // -----------------------------------------

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


            // -----------------------------------------
            // STOCK MESSAGE
            // -----------------------------------------

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


            // -----------------------------------------
            // PRODUCT CARD
            // -----------------------------------------

            card.innerHTML = `

              <div
    class="product-image product-details-trigger"
    data-id="${escapeHTML(product.id)}"
    style="cursor: pointer;"
>
    ${imageHTML}
</div>

               <h3
    class="product-details-trigger"
    data-id="${escapeHTML(product.id)}"
    style="cursor: pointer;"
>
    ${escapeHTML(product.name)}
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


                <div
                    class="quantity-control"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                >

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

            `;


            productContainer.appendChild(
                card
            );


            // -----------------------------------------
            // QUANTITY
            // -----------------------------------------

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


            // -----------------------------------------
            // ADD TO CART
            // -----------------------------------------

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


            // -----------------------------------------
            // BUY NOW
            // -----------------------------------------

            const buyButton =
                card.querySelector(
                    ".buy-now-btn"
                );


            if (buyButton) {

                buyButton.addEventListener(
                    "click",
                    function() {

                        addToCart(
                            product,
                            quantity
                        );


                        window.location.href =
                            "checkout.html";

                    }
                );

            }

        }
    );


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
            productName.includes(searchText);

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
                this.dataset.filter || "all";


            categoryButtons.forEach(function(btn) {

                btn.classList.remove("active");

            });


            this.classList.add("active");

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
                document.getElementById("products");

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

// =====================================================
// DISPLAY CART - UPDATED
// Quantity Increase / Decrease
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
            cartTotalElement.textContent = "0";
        }

        return;
    }


    let total = 0;


    // Group products by ID
    const groupedCart = [];

    cart.forEach(function(product) {

        const existing =
            groupedCart.find(function(item) {

                return String(item.id) ===
                    String(product.id);

            });


        if (existing) {

            existing.quantity += 1;

        } else {

            groupedCart.push({

                ...product,

                quantity: 1

            });

        }

    });


    // Rebuild cart with quantities
    cart = [];

    groupedCart.forEach(function(item) {

        for (
            let i = 0;
            i < item.quantity;
            i++
        ) {

            cart.push({

                id: item.id,

                name: item.name,

                price: Number(item.price) || 0,

                category: item.category || "other",

                image: item.image || "",

                description:
                    item.description || ""

            });

        }

    });


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


        const imageHTML =
            product.image
                ? `
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        class="cart-product-image"
                    >
                `
                : `
                    <div class="cart-product-placeholder">
                        🛍️
                    </div>
                `;


        cartItem.innerHTML = `

            <div class="cart-product-info">

                ${imageHTML}

                <div>

                    <h3>
                        ${escapeHTML(product.name)}
                    </h3>

                    <p>
                        Rs. ${price.toLocaleString()}
                    </p>

                </div>

            </div>


            <div class="cart-quantity-controls">

                <button
                    type="button"
                    class="quantity-btn decrease-btn"
                    data-id="${escapeHTML(product.id)}"
                >
                    −
                </button>


                <span class="cart-quantity">
                    ${quantity}
                </span>


                <button
                    type="button"
                    class="quantity-btn increase-btn"
                    data-id="${escapeHTML(product.id)}"
                >
                    +
                </button>

            </div>


            <div class="cart-item-total">

                <strong>
                    Rs. ${itemTotal.toLocaleString()}
                </strong>

            </div>


            <button
                type="button"
                class="remove-btn"
                data-id="${escapeHTML(product.id)}"
            >
                Remove
            </button>

        `;


        // ================================
        // INCREASE
        // ================================

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


                    if (productIndex !== -1) {

                        const productToAdd =
                            cart[productIndex];


                        cart.push({

                            id:
                                productToAdd.id,

                            name:
                                productToAdd.name,

                            price:
                                Number(
                                    productToAdd.price
                                ) || 0,

                            category:
                                productToAdd.category ||
                                "other",

                            image:
                                productToAdd.image ||
                                "",

                            description:
                                productToAdd.description ||
                                ""

                        });


                        saveCart();

                        updateCartCount();

                        displayCart();

                        displayCheckout();

                    }

                }
            );

        }


        // ================================
        // DECREASE
        // ================================

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


                    if (productIndex !== -1) {

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


        // ================================
        // REMOVE
        // ================================

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


        cartItemsContainer.appendChild(
            cartItem
        );

    });


    // ================================
    // UPDATE TOTAL
    // ================================

    if (cartTotalElement) {

        cartTotalElement.textContent =
            total.toLocaleString();

    }


    saveCart();

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

    if (!checkoutItemsContainer) {
        return;
    }


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

            checkoutTotalElement.textContent = "0";

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


        checkoutItemsContainer.appendChild(item);

    });


    if (checkoutTotalElement) {

        checkoutTotalElement.textContent =
            total;

    }
}
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 3 - CHECKOUT + ORDER STATUS
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
// FORMAT DATE
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

    } catch (error) {

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
                    // =====================================================
// PAYMENT METHOD
// =====================================================

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
                            product.category || "other",

                        image:
                            product.image || ""

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

            } catch (error) {

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
// INITIALIZE
// =====================================================

updateCartCount();

displayProducts();

displayCart();

displayCheckout();

loadCustomerOrderStatus();


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
// =====================================================
// PRODUCT DETAILS PAGE
// =====================================================

async function loadProductDetails() {

    const detailsContainer =
        document.getElementById("product-details");

    if (!detailsContainer) return;


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

        // =====================================================
        // LOAD PRODUCT
        // =====================================================

        const {
            data: product,
            error
        } = await db
            .from("products")
            .select("*")
            .eq("id", productIdNumber)
            .maybeSingle();


        if (error) {

            console.error(
                "Product details error:",
                error
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


        let stockMessage = "";


        if (stock <= 0) {

            stockMessage =
                "Out of Stock";

        }
        else if (stock === 1) {

            stockMessage =
                "Only 1 left in stock";

        }
        else if (stock <= 5) {

            stockMessage =
                `Only ${stock} left in stock`;

        }
        else {

            stockMessage =
                `${stock} available in stock`;

        }


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
                    <div>
                        🛍️
                    </div>
                `;


        // =====================================================
        // LOAD REVIEWS
        // =====================================================

        const {
            data: reviews,
            error: reviewsError
        } = await db
            .from("review")
            .select("*")
            .eq("product_id", productIdNumber)
            .order("created_at", {
                ascending: false
            });


        if (reviewsError) {

            console.error(
                "Reviews loading error:",
                reviewsError
            );

        }


        let reviewsHTML = "";


        if (
            !reviews ||
            reviews.length === 0
        ) {

            reviewsHTML = `
                <p class="no-reviews">
                    No reviews yet.
                </p>
            `;

        }
        else {

            reviewsHTML =
                reviews
                    .map(function(review) {

                        const rating =
                            Number(
                                review.rating || 0
                            );

                        const stars =
                            "⭐".repeat(
                                Math.max(
                                    0,
                                    Math.min(
                                        5,
                                        rating
                                    )
                                )
                            );


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
            ${
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
                    : ""
            }
        </small>

    </div>
`;

                    })
                    .join("");

        }


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

                        ${escapeHTML(
                            product.name
                        )}

                    </h2>


                    <p class="product-detail-price">

                        Rs.
                        ${price.toLocaleString()}

                    </p>


                    <p class="product-detail-category">

                        Category:
                        ${escapeHTML(
                            product.category ||
                            "Other"
                        )}

                    </p>


                    <div class="product-detail-description">

                        <h3>
                            Description
                        </h3>

                        <p>
                            ${escapeHTML(
                                description
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
            reviews && reviews.length > 0
                ? `
                    <p>
                        ⭐ ${
                            (
                                reviews.reduce(
                                    (total, review) =>
                                        total + Number(review.rating || 0),
                                    0
                                ) / reviews.length
                            ).toFixed(1)
                        } / 5
                    </p>

                    <p>
                        Based on ${reviews.length}
                        review${reviews.length === 1 ? "" : "s"}
                    </p>
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


                           <div class="star-rating" id="star-rating">

    <button type="button" data-rating="1">☆</button>
    <button type="button" data-rating="2">☆</button>
    <button type="button" data-rating="3">☆</button>
    <button type="button" data-rating="4">☆</button>
    <button type="button" data-rating="5">☆</button>

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
        // QUANTITY
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


        if (addCartButton) {

            addCartButton.addEventListener(
                "click",
                function() {

                    addToCart(
                        product,
                        quantity
                    );

                }
            );

        }


        if (buyNowButton) {

            buyNowButton.addEventListener(
                "click",
                function() {

                    addToCart(
                        product,
                        quantity
                    );

                    window.location.href =
                        "checkout.html";

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


        const customerNameInput =
            document.getElementById(
                "review-customer-name"
            );


        const ratingInput =
            document.getElementById(
                "review-rating"
            );
const starButtons =
    document.querySelectorAll(
        "#star-rating button"
    );


let selectedRating = 0;


starButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            selectedRating =
                Number(
                    button.dataset.rating
                );


            ratingInput.value =
                selectedRating;


            starButtons.forEach(
                function(star) {

                    const starRating =
                        Number(
                            star.dataset.rating
                        );


                    star.textContent =
                        starRating <= selectedRating
                            ? "★"
                            : "☆";

                }
            );

        }
    );

});

        const reviewTextInput =
            document.getElementById(
                "review-text"
            );


        const reviewMessage =
            document.getElementById(
                "review-message"
            );


        if (submitReviewButton) {

            submitReviewButton.addEventListener(
                "click",
                async function() {

                    const customerName =
                        customerNameInput.value.trim();


                    const rating =
                        Number(
                            ratingInput.value
                        );


                    const reviewText =
                        reviewTextInput.value.trim();


                    if (!customerName) {

                        reviewMessage.textContent =
                            "Please enter your name.";

                        return;
                    }


                    if (
                        !rating ||
                        rating < 1 ||
                        rating > 5
                    ) {

                        reviewMessage.textContent =
                            "Please select a rating.";

                        return;
                    }


                    if (!reviewText) {

                        reviewMessage.textContent =
                            "Please write a review.";

                        return;
                    }


                    submitReviewButton.disabled =
                        true;


                    submitReviewButton.textContent =
                        "Submitting...";


                    reviewMessage.textContent =
                        "";


                    try {

                        const {
                            error: insertError
                        } = await db
                            .from("review")
                            .insert([
                                {
                                    product_id:
                                        productIdNumber,

                                    customer_name:
                                        customerName,

                                    rating:
                                        rating,

                                    review_text:
                                        reviewText
                                }
                            ]);


                        if (insertError) {

                            console.error(
                                "Review insert error:",
                                insertError
                            );


                            reviewMessage.textContent =
                                "Unable to submit review. Please try again.";

                            return;
                        }


                        reviewMessage.textContent =
                            "Review submitted successfully!";


                        customerNameInput.value =
                            "";

                        ratingInput.value =
                            "";

                        reviewTextInput.value =
                            "";


                        // Reload product details
                        await loadProductDetails();


                    }
                    catch (reviewError) {

                        console.error(
                            "Review submission exception:",
                            reviewError
                        );


                        reviewMessage.textContent =
                            "Something went wrong. Please try again.";

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


    }
    catch (error) {

        console.error(
            "Product details exception:",
            error
        );


        detailsContainer.innerHTML = `
            <p>
                Something went wrong while loading this product.
            </p>
        `;

    }

}


// =====================================================
// LOAD PRODUCT DETAILS
// =====================================================

loadProductDetails();
// =====================================================
// OPEN PRODUCT DETAILS PAGE
// =====================================================

document.addEventListener("click", function(event) {

    const trigger =
        event.target.closest(".product-details-trigger");

    if (!trigger) return;

    const productId =
        trigger.dataset.id;

    if (!productId) return;

    window.location.href =
        `product-details.html?id=${encodeURIComponent(productId)}`;

});
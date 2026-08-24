// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 3 - CHECKOUT + CUSTOMER ORDER STATUS
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

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date not available";
    }

    return date.toLocaleString();
}


// =====================================================
// GET STATUS MESSAGE
// =====================================================

function getCustomerStatusMessage(status) {

    const normalizedStatus =
        String(status || "Pending")
            .toLowerCase()
            .trim();


    if (normalizedStatus === "pending") {

        return "Your order is pending.";

    }


    if (
        normalizedStatus === "confirm" ||
        normalizedStatus === "confirmed"
    ) {

        return "Your order has been confirmed.";

    }


    if (
        normalizedStatus === "ship" ||
        normalizedStatus === "shipped"
    ) {

        return "Your order has been shipped.";

    }


    if (
        normalizedStatus === "delivery" ||
        normalizedStatus === "delivered"
    ) {

        return "Your order has been delivered.";

    }


    if (
        normalizedStatus === "cancel" ||
        normalizedStatus === "cancelled" ||
        normalizedStatus === "canceled"
    ) {

        return "Your order has been cancelled.";

    }


    return "Your order has been received.";

}


// =====================================================
// SHOW TRACKING STEPS
// =====================================================

function getTrackingSteps(status) {

    const current =
        String(status || "Pending")
            .toLowerCase()
            .trim();


    const steps = [
        "pending",
        "confirmed",
        "shipped",
        "delivered"
    ];


    let currentIndex =
        steps.indexOf(current);


    if (current === "confirm") {
        currentIndex = 1;
    }


    if (current === "ship") {
        currentIndex = 2;
    }


    if (current === "delivery") {
        currentIndex = 3;
    }


    if (current === "cancelled" ||
        current === "canceled" ||
        current === "cancel") {

        return `

            <div class="tracking-steps cancelled">

                <div class="tracking-step active">
                    Cancelled
                </div>

            </div>

        `;

    }


    return `

        <div class="tracking-steps">

            <div class="tracking-step ${
                currentIndex >= 0
                    ? "completed"
                    : ""
            }">

                1. Pending

            </div>


            <div class="tracking-step ${
                currentIndex >= 1
                    ? "completed"
                    : ""
            }">

                2. Confirmed

            </div>


            <div class="tracking-step ${
                currentIndex >= 2
                    ? "completed"
                    : ""
            }">

                3. Shipped

            </div>


            <div class="tracking-step ${
                currentIndex >= 3
                    ? "completed"
                    : ""
            }">

                4. Delivered

            </div>

        </div>

    `;

}


// =====================================================
// SHOW CUSTOMER ORDER STATUS
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
                "Customer order status error:",
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
            status
                .toLowerCase()
                .trim();


        const statusMessage =
            getCustomerStatusMessage(
                status
            );


        const orderDate =
            formatOrderDate(
                data.created_at
            );


        const total =
            Number(
                data.total || 0
            ).toLocaleString();


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
                        Customer:
                    </strong>

                    ${escapeHTML(
                        data.customer_name ||
                        "Customer"
                    )}

                </p>


                <p>

                    <strong>
                        Phone:
                    </strong>

                    ${escapeHTML(
                        data.customer_phone ||
                        "Not available"
                    )}

                </p>


                <p>

                    <strong>
                        Address:
                    </strong>

                    ${escapeHTML(
                        data.customer_address ||
                        "Not available"
                    )}

                </p>


                <p>

                    <strong>
                        City:
                    </strong>

                    ${escapeHTML(
                        data.customer_city ||
                        "Not available"
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

                        ${escapeHTML(status)}

                    </span>

                </p>


                <p class="status-message">

                    ${escapeHTML(
                        statusMessage
                    )}

                </p>


                <p>

                    <strong>
                        Order Date:
                    </strong>

                    ${escapeHTML(orderDate)}

                </p>


                <p>

                    <strong>
                        Total:
                    </strong>

                    Rs. ${total}

                </p>


                ${getTrackingSteps(status)}


                <button
                    type="button"
                    id="refresh-order-status"
                    class="refresh-order-status"
                >
                    Refresh Status
                </button>

            </div>

        `;


        const refreshButton =
            document.getElementById(
                "refresh-order-status"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                function() {

                    loadCustomerOrderStatus();

                }
            );

        }


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
            // CUSTOMER INFORMATION
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
                                product.price || 0
                            ),

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
                    .select()
                    .single();


                // -----------------------------
                // DATABASE ERROR
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
                // SAVE ORDER ID
                // -----------------------------

                if (
                    data &&
                    data.id
                ) {

                    saveCustomerOrderId(
                        data.id
                    );

                }


                console.log(
                    "Order successfully saved:",
                    data
                );


                // -----------------------------
                // SUCCESS
                // -----------------------------

                alert(
                    `Thank you ${name}! Your order has been placed successfully. Your Order ID is ${data.id}.`
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


                // -----------------------------
                // SHOW STATUS
                // -----------------------------

                loadCustomerOrderStatus();

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

console.log(
    "Last Customer Order ID:",
    getCustomerOrderId()
);
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


        if (
            matchesCategory &&
            matchesSearch
        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

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
// SHOP NOW BUTTON
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
// DISPLAY CART
// =====================================================

function displayCart() {

    if (!cartItemsContainer) {
        return;
    }


    cartItemsContainer.innerHTML =
        "";


    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `

            <div class="empty-cart">

                <p>
                    Your shopping cart is empty.
                </p>


                <a href="index.html">

                    <button
                        type="button"
                    >
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


    cart.forEach(
        function(product, index) {

            const price =
                Number(
                    product.price || 0
                );


            total += price;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div class="cart-item-info">

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        Rs. ${price.toLocaleString()}
                    </p>

                </div>


                <button
                    class="remove-btn"
                    type="button"
                    data-index="${index}"
                >
                    Remove
                </button>

            `;


            const removeButton =
                cartItem.querySelector(
                    ".remove-btn"
                );


            if (removeButton) {

                removeButton.addEventListener(
                    "click",
                    function() {

                        removeFromCart(
                            index
                        );

                    }
                );

            }


            cartItemsContainer.appendChild(
                cartItem
            );

        }
    );


    if (cartTotalElement) {

        cartTotalElement.textContent =
            total.toLocaleString();

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


    cart.splice(
        index,
        1
    );


    saveCart();

    updateCartCount();

    displayCart();

    displayCheckout();

}


// =====================================================
// MAKE FUNCTION AVAILABLE GLOBALLY
// =====================================================

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

                <div class="checkout-item-info">

                    <h4>
                        ${escapeHTML(
                            product.name
                        )}
                    </h4>


                    <p>
                        Rs. ${price.toLocaleString()}
                    </p>

                </div>

            `;


            checkoutItemsContainer.appendChild(
                item
            );

        }
    );


    if (checkoutTotalElement) {

        checkoutTotalElement.textContent =
            total.toLocaleString();

    }

}


// =====================================================
// UPDATE CART COUNT
// =====================================================

updateCartCount();
// =====================================================
// EVERYTHING 400 - SCRIPT.JS
// PART 3 - CHECKOUT + CUSTOMER ORDER STATUS
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

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date not available";
    }

    return date.toLocaleString();

}


// =====================================================
// GET STATUS MESSAGE
// =====================================================

function getCustomerStatusMessage(status) {

    const normalizedStatus =
        String(status || "Pending")
            .toLowerCase()
            .trim();


    if (normalizedStatus === "pending") {

        return "Your order is pending.";

    }


    if (
        normalizedStatus === "confirm" ||
        normalizedStatus === "confirmed"
    ) {

        return "Your order has been confirmed.";

    }


    if (
        normalizedStatus === "ship" ||
        normalizedStatus === "shipped"
    ) {

        return "Your order has been shipped.";

    }


    if (
        normalizedStatus === "delivery" ||
        normalizedStatus === "delivered"
    ) {

        return "Your order has been delivered.";

    }


    if (
        normalizedStatus === "cancel" ||
        normalizedStatus === "cancelled" ||
        normalizedStatus === "canceled"
    ) {

        return "Your order has been cancelled.";

    }


    return "Your order has been received.";

}


// =====================================================
// GET TRACKING STEPS
// =====================================================

function getTrackingSteps(status) {

    const current =
        String(status || "Pending")
            .toLowerCase()
            .trim();


    let currentIndex = 0;


    if (
        current === "confirm" ||
        current === "confirmed"
    ) {

        currentIndex = 1;

    }
    else if (
        current === "ship" ||
        current === "shipped"
    ) {

        currentIndex = 2;

    }
    else if (
        current === "delivery" ||
        current === "delivered"
    ) {

        currentIndex = 3;

    }


    if (
        current === "cancel" ||
        current === "cancelled" ||
        current === "canceled"
    ) {

        return `

            <div class="tracking-steps cancelled">

                <div class="tracking-step completed">
                    Cancelled
                </div>

            </div>

        `;

    }


    return `

        <div class="tracking-steps">

            <div class="tracking-step ${
                currentIndex >= 0
                    ? "completed"
                    : ""
            }">

                1. Pending

            </div>


            <div class="tracking-step ${
                currentIndex >= 1
                    ? "completed"
                    : ""
            }">

                2. Confirmed

            </div>


            <div class="tracking-step ${
                currentIndex >= 2
                    ? "completed"
                    : ""
            }">

                3. Shipped

            </div>


            <div class="tracking-step ${
                currentIndex >= 3
                    ? "completed"
                    : ""
            }">

                4. Delivered

            </div>

        </div>

    `;

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
                "Customer order status error:",
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
            status
                .toLowerCase()
                .trim();


        const statusMessage =
            getCustomerStatusMessage(
                status
            );


        const orderDate =
            formatOrderDate(
                data.created_at
            );


        const total =
            Number(
                data.total || 0
            ).toLocaleString();


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
                        Customer:
                    </strong>

                    ${escapeHTML(
                        data.customer_name ||
                        "Customer"
                    )}

                </p>


                <p>

                    <strong>
                        Phone:
                    </strong>

                    ${escapeHTML(
                        data.customer_phone ||
                        "Not available"
                    )}

                </p>


                <p>

                    <strong>
                        Address:
                    </strong>

                    ${escapeHTML(
                        data.customer_address ||
                        "Not available"
                    )}

                </p>


                <p>

                    <strong>
                        City:
                    </strong>

                    ${escapeHTML(
                        data.customer_city ||
                        "Not available"
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
                        ${escapeHTML(status)}
                    </span>

                </p>


                <p class="status-message">

                    ${escapeHTML(
                        statusMessage
                    )}

                </p>


                <p>

                    <strong>
                        Order Date:
                    </strong>

                    ${escapeHTML(orderDate)}

                </p>


                <p>

                    <strong>
                        Total:
                    </strong>

                    Rs. ${total}

                </p>


                ${getTrackingSteps(status)}


                <button
                    type="button"
                    id="refresh-order-status"
                    class="refresh-order-status"
                >
                    Refresh Status
                </button>

            </div>

        `;


        const refreshButton =
            document.getElementById(
                "refresh-order-status"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                function() {

                    loadCustomerOrderStatus();

                }
            );

        }


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


            // -----------------------------
            // CUSTOMER INFORMATION
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


            const db =
                getSupabaseClient();


            if (!db) {

                alert(
                    "Database connection is not available."
                );

                return;

            }


            // -----------------------------
            // CALCULATE TOTAL
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
                cart.map(
                    function(product) {

                        return {

                            id:
                                product.id,

                            name:
                                product.name,

                            price:
                                Number(
                                    product.price || 0
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


                // -----------------------------
                // SAVE ORDER ID
                // -----------------------------

                if (
                    data &&
                    data.id
                ) {

                    saveCustomerOrderId(
                        data.id
                    );

                }


                console.log(
                    "Order successfully saved:",
                    data
                );


                // -----------------------------
                // SUCCESS
                // -----------------------------

                alert(
                    `Thank you ${name}! Your order has been placed successfully. Order ID: ${data.id}`
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


                // -----------------------------
                // LOAD ORDER STATUS
                // -----------------------------

                loadCustomerOrderStatus();

            }
            catch (error) {

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

console.log(
    "Last Customer Order ID:",
    getCustomerOrderId()
);
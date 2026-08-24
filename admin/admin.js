// =====================================================
// EVERYTHING 400 - ADMIN.JS
// PART 1 - SUPABASE + PRODUCTS
// =====================================================

const db = window.supabaseClient;

let products = [];
let orders = [];


// =====================================================
// ELEMENTS
// =====================================================

const productForm =
    document.getElementById("product-form");

const productsContainer =
    document.getElementById("admin-products");

const productCount =
    document.getElementById("product-count");

const imageInput =
    document.getElementById("product-image");

const ordersContainer =
    document.getElementById("admin-orders");

const orderCount =
    document.getElementById("order-count");


// =====================================================
// DASHBOARD
// =====================================================

const dashboardProductCount =
    document.getElementById("dashboard-product-count");

const dashboardOrderCount =
    document.getElementById("dashboard-order-count");

const dashboardPendingCount =
    document.getElementById("dashboard-pending-count");

const dashboardTotalSales =
    document.getElementById("dashboard-total-sales");


// =====================================================
// SUPABASE CHECK
// =====================================================

if (!db) {
    console.error(
        "Supabase client not found. Make sure supabase.js is loaded before admin.js."
    );
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
// FORMAT PRICE
// =====================================================

function formatPrice(price) {

    return Number(price || 0).toLocaleString();
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Date not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date not available";
    }

    return date.toLocaleString();
}


// =====================================================
// UPDATE DASHBOARD
// =====================================================

function updateDashboardSummary() {

    if (dashboardProductCount) {
        dashboardProductCount.textContent =
            products.length;
    }

    if (dashboardOrderCount) {
        dashboardOrderCount.textContent =
            orders.length;
    }

    const pendingOrders =
        orders.filter(function(order) {

            return String(
                order.status || "Pending"
            ).toLowerCase() === "pending";

        }).length;

    if (dashboardPendingCount) {
        dashboardPendingCount.textContent =
            pendingOrders;
    }

    let totalSales = 0;

    orders.forEach(function(order) {

        totalSales +=
            Number(order.total || 0);

    });

    if (dashboardTotalSales) {

        dashboardTotalSales.textContent =
            `Rs. ${formatPrice(totalSales)}`;

    }
}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    if (!db) {

        showProductError(
            "Supabase connection is not available."
        );

        return;
    }

    if (productsContainer) {

        productsContainer.innerHTML = `
            <p class="loading-products">
                Loading products...
            </p>
        `;

    }

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
                "Products load error:",
                error
            );

            products = [];

            showProductError(
                "Products could not be loaded."
            );

            updateDashboardSummary();

            return;
        }

        products =
            data || [];

        displayProducts();

        updateProductCount();

        updateDashboardSummary();

    } catch (error) {

        console.error(
            "Load products error:",
            error
        );

        showProductError(
            "Something went wrong while loading products."
        );
    }
}


// =====================================================
// PRODUCT ERROR
// =====================================================

function showProductError(message) {

    if (!productsContainer) return;

    productsContainer.innerHTML = `
        <p class="no-products">
            ${escapeHTML(message)}
        </p>
    `;

    updateProductCount();
}


// =====================================================
// PRODUCT COUNT
// =====================================================

function updateProductCount() {

    if (!productCount) return;

    const count =
        products.length;

    productCount.textContent =
        `${count} Product${count !== 1 ? "s" : ""}`;
}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function displayProducts() {

    if (!productsContainer) return;

    productsContainer.innerHTML = "";

    if (products.length === 0) {

        productsContainer.innerHTML = `
            <div class="no-products">

                <p>
                    No products available.
                </p>

                <small>
                    Add your first product using the form above.
                </small>

            </div>
        `;

        updateProductCount();

        return;
    }

    products.forEach(function(product) {

        const card =
            document.createElement("div");

        card.className =
            "admin-product-card";

        const imageHTML =
            product.image
                ? `
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        class="admin-product-image"
                    >
                `
                : `
                    <div class="admin-product-placeholder">
                        🛍️
                    </div>
                `;

        card.innerHTML = `

            <div class="admin-product-info">

                <div class="admin-product-image-wrapper">
                    ${imageHTML}
                </div>

                <div class="admin-product-details">

                    <h3>
                        ${escapeHTML(product.name)}
                    </h3>

                    <p class="admin-product-price">
                        Rs. ${formatPrice(product.price)}
                    </p>

                    <small class="admin-product-category">
                        ${escapeHTML(
                            product.category || "other"
                        )}
                    </small>

                </div>

            </div>

            <div class="admin-product-actions">

                <button
                    type="button"
                    class="edit-product"
                    data-id="${escapeHTML(product.id)}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-product"
                    data-id="${escapeHTML(product.id)}"
                >
                    Delete
                </button>

            </div>
        `;

        const editButton =
            card.querySelector(".edit-product");

        const deleteButton =
            card.querySelector(".delete-product");

        if (editButton) {

            editButton.addEventListener(
                "click",
                function() {

                    editProduct(product.id);

                }
            );

        }

        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function() {

                    deleteProduct(product.id);

                }
            );

        }

        productsContainer.appendChild(card);

    });

    updateProductCount();
}


// =====================================================
// IMAGE TO BASE64
// =====================================================

function convertImageToBase64(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function() {

                    resolve(
                        reader.result
                    );

                };

            reader.onerror =
                function() {

                    reject(
                        reader.error
                    );

                };

            reader.readAsDataURL(file);

        }
    );
}


// =====================================================
// ADD PRODUCT
// =====================================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            if (!db) {

                alert(
                    "Supabase connection is not available."
                );

                return;
            }

            const nameInput =
                document.getElementById(
                    "product-name"
                );

            const priceInput =
                document.getElementById(
                    "product-price"
                );

            const categoryInput =
                document.getElementById(
                    "product-category"
                );

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const price =
                priceInput
                    ? Number(priceInput.value)
                    : 0;

            const category =
                categoryInput
                    ? categoryInput.value
                        .trim()
                        .toLowerCase()
                    : "";

            if (!name) {

                alert(
                    "Please enter product name."
                );

                return;
            }

            if (!category) {

                alert(
                    "Please select a category."
                );

                return;
            }

            if (!price || price <= 0) {

                alert(
                    "Please enter a valid price."
                );

                return;
            }

            let image = null;

            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
            ) {

                const file =
                    imageInput.files[0];

                if (
                    file.size >
                    2 * 1024 * 1024
                ) {

                    alert(
                        "Image size must be less than 2MB."
                    );

                    return;
                }

                if (
                    !file.type.startsWith("image/")
                ) {

                    alert(
                        "Please select a valid image file."
                    );

                    return;
                }

                try {

                    image =
                        await convertImageToBase64(
                            file
                        );

                } catch (error) {

                    console.error(
                        "Image processing error:",
                        error
                    );

                    alert(
                        "Image could not be processed."
                    );

                    return;
                }
            }

            try {

                const productData = {

                    name: name,

                    price: price,

                    category: category,

                    image: image

                };

                const {
                    data,
                    error
                } = await db
                    .from("products")
                    .insert(productData)
                    .select();

                if (error) {

                    console.error(
                        "Product insert error:",
                        error
                    );

                    alert(
                        `Supabase Error:\n\n${error.message}`
                    );

                    return;
                }

                console.log(
                    "Product added:",
                    data
                );

                productForm.reset();

                await loadProducts();

                alert(
                    "Product added successfully!"
                );

            } catch (error) {

                console.error(
                    "Add product error:",
                    error
                );

                alert(
                    `Unexpected error:\n\n${error.message}`
                );
            }
        }
    );
}


// =====================================================
// EDIT PRODUCT
// =====================================================

async function editProduct(id) {

    if (!db) {

        alert(
            "Supabase connection is not available."
        );

        return;
    }

    const product =
        products.find(function(item) {

            return String(item.id) ===
                String(id);

        });

    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }

    const newName =
        prompt(
            "Enter new product name:",
            product.name
        );

    if (newName === null) return;

    const cleanName =
        newName.trim();

    if (!cleanName) {

        alert(
            "Product name cannot be empty."
        );

        return;
    }

    const newPrice =
        prompt(
            "Enter new price:",
            product.price
        );

    if (newPrice === null) return;

    const price =
        Number(newPrice);

    if (!price || price <= 0) {

        alert(
            "Please enter a valid price."
        );

        return;
    }

    try {

        const {
            error
        } = await db
            .from("products")
            .update({
                name: cleanName,
                price: price
            })
            .eq("id", id);

        if (error) {

            console.error(
                "Update product error:",
                error
            );

            alert(
                `Update failed:\n\n${error.message}`
            );

            return;
        }

        await loadProducts();

        alert(
            "Product updated successfully!"
        );

    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );

        alert(
            `Something went wrong:\n\n${error.message}`
        );
    }
}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {

    if (!db) {

        alert(
            "Supabase connection is not available."
        );

        return;
    }

    const product =
        products.find(function(item) {

            return String(item.id) ===
                String(id);

        });

    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }

    const confirmDelete =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

    if (!confirmDelete) return;

    try {

        const {
            error
        } = await db
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "Delete product error:",
                error
            );

            alert(
                `Delete failed:\n\n${error.message}`
            );

            return;
        }

        await loadProducts();

        alert(
            "Product deleted successfully!"
        );

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            `Something went wrong:\n\n${error.message}`
        );
    }
}
// =====================================================
// EVERYTHING 400 - ADMIN.JS
// PART 2 - ORDERS
// =====================================================


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    if (!db) {

        showOrderError(
            "Supabase connection is not available."
        );

        return;
    }

    if (!ordersContainer) return;

    ordersContainer.innerHTML = `
        <p class="loading-orders">
            Loading orders...
        </p>
    `;

    try {

        const {
            data,
            error
        } = await db
            .from("orders")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "Orders load error:",
                error
            );

            orders = [];

            showOrderError(
                "Orders could not be loaded."
            );

            updateDashboardSummary();

            return;
        }

        orders =
            data || [];

        displayOrders();

        updateOrderCount();

        updateDashboardSummary();

    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );

        orders = [];

        showOrderError(
            "Something went wrong while loading orders."
        );
    }
}


// =====================================================
// ORDER ERROR
// =====================================================

function showOrderError(message) {

    if (!ordersContainer) return;

    ordersContainer.innerHTML = `
        <p class="no-orders">
            ${escapeHTML(message)}
        </p>
    `;

    updateOrderCount();
}


// =====================================================
// ORDER COUNT
// =====================================================

function updateOrderCount() {

    if (!orderCount) return;

    const count =
        orders.length;

    orderCount.textContent =
        `${count} Order${count !== 1 ? "s" : ""}`;
}


// =====================================================
// GET CUSTOMER DATA
// =====================================================

function getCustomerData(order) {

    let customer = {};

    if (
        order.customer &&
        typeof order.customer === "object"
    ) {

        customer =
            order.customer;

    } else if (
        typeof order.customer === "string"
    ) {

        try {

            customer =
                JSON.parse(
                    order.customer
                );

        } catch {

            customer = {};

        }
    }

    return {

        name:
            order.customer_name ||
            order.name ||
            customer.name ||
            "Unknown Customer",

        phone:
            order.customer_phone ||
            order.phone ||
            customer.phone ||
            "Not provided",

        address:
            order.customer_address ||
            order.address ||
            customer.address ||
            "Not provided",

        city:
            order.customer_city ||
            order.city ||
            customer.city ||
            "Not provided"

    };
}


// =====================================================
// GET ORDER PRODUCTS
// =====================================================

function getOrderProducts(order) {

    let orderProducts =
        order.products ||
        order.items ||
        [];

    if (
        typeof orderProducts === "string"
    ) {

        try {

            orderProducts =
                JSON.parse(
                    orderProducts
                );

        } catch {

            orderProducts = [];

        }
    }

    return Array.isArray(orderProducts)
        ? orderProducts
        : [];
}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    return String(
        status || "Pending"
    )
        .toLowerCase()
        .replace(/\s+/g, "-");
}


// =====================================================
// DISPLAY ORDERS
// =====================================================

function displayOrders() {

    if (!ordersContainer) return;

    ordersContainer.innerHTML = "";

    if (orders.length === 0) {

        ordersContainer.innerHTML = `
            <div class="no-orders">

                <p>
                    No orders available.
                </p>

                <small>
                    Customer orders will appear here.
                </small>

            </div>
        `;

        updateOrderCount();

        return;
    }

    orders.forEach(function(order) {

        const card =
            document.createElement("div");

        card.className =
            "admin-order-card";

        const customer =
            getCustomerData(order);

        const total =
            Number(order.total || 0);

        const createdAt =
            order.created_at ||
            order.createdAt;

        const orderDate =
            formatDate(createdAt);

        const status =
            String(
                order.status || "Pending"
            );

        const statusClass =
            getStatusClass(status);

        const orderProducts =
            getOrderProducts(order);

        let productsHTML = "";

        if (orderProducts.length > 0) {

            productsHTML = `

                <div class="order-products">

                    <strong>
                        Products
                    </strong>

                    <ul>

                        ${orderProducts.map(
                            function(item) {

                                const itemName =
                                    item.name ||
                                    item.product_name ||
                                    "Product";

                                const quantity =
                                    Number(
                                        item.quantity || 1
                                    );

                                const itemPrice =
                                    Number(
                                        item.price || 0
                                    );

                                return `

                                    <li>

                                        ${escapeHTML(itemName)}
                                        × ${quantity}

                                        ${
                                            itemPrice
                                                ? ` - Rs. ${formatPrice(itemPrice)}`
                                                : ""
                                        }

                                    </li>

                                `;

                            }
                        ).join("")}

                    </ul>

                </div>

            `;
        }

        card.innerHTML = `

            <div class="admin-order-info">

                <h3>
                    ${escapeHTML(customer.name)}
                </h3>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(customer.phone)}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${escapeHTML(customer.address)}
                </p>

                <p>
                    <strong>City:</strong>
                    ${escapeHTML(customer.city)}
                </p>

                <p>
                    <strong>Order Date:</strong>
                    ${escapeHTML(orderDate)}
                </p>

                ${productsHTML}

                <p class="order-total">

                    <strong>
                        Total:
                    </strong>

                    Rs. ${formatPrice(total)}

                </p>

                <div class="order-status-section">

                    <strong>
                        Status:
                    </strong>

                    <span
                        class="order-status ${statusClass}"
                    >
                        ${escapeHTML(status)}
                    </span>

                    <div class="order-status-buttons">

                        <button
                            type="button"
                            class="status-btn"
                            data-id="${escapeHTML(order.id)}"
                            data-status="Pending"
                        >
                            Pending
                        </button>

                        <button
                            type="button"
                            class="status-btn"
                            data-id="${escapeHTML(order.id)}"
                            data-status="Confirmed"
                        >
                            Confirm
                        </button>

                        <button
                            type="button"
                            class="status-btn"
                            data-id="${escapeHTML(order.id)}"
                            data-status="Shipped"
                        >
                            Ship
                        </button>

                        <button
                            type="button"
                            class="status-btn"
                            data-id="${escapeHTML(order.id)}"
                            data-status="Delivered"
                        >
                            Delivery
                        </button>

                        <button
                            type="button"
                            class="status-btn"
                            data-id="${escapeHTML(order.id)}"
                            data-status="Cancelled"
                        >
                            Cancel
                        </button>

                    </div>

                </div>

            </div>
        `;

        const statusButtons =
            card.querySelectorAll(
                ".status-btn"
            );

        statusButtons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const orderId =
                            this.dataset.id;

                        const newStatus =
                            this.dataset.status;

                        updateOrderStatus(
                            orderId,
                            newStatus
                        );

                    }
                );

            }
        );

        ordersContainer.appendChild(card);

    });

    updateOrderCount();
}
// =====================================================
// EVERYTHING 400 - ADMIN.JS
// PART 3 - STATUS + LOGOUT + INITIALIZE
// =====================================================


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(
    orderId,
    newStatus
) {

    if (!db) {

        alert(
            "Supabase connection is not available."
        );

        return;
    }

    if (!orderId) {

        alert(
            "Order ID is missing."
        );

        return;
    }

    const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (
        !allowedStatuses.includes(
            newStatus
        )
    ) {

        alert(
            "Invalid order status."
        );

        return;
    }

    const confirmChange =
        confirm(
            `Change order status to "${newStatus}"?`
        );

    if (!confirmChange) return;

    try {

        console.log(
            "Updating order ID:",
            orderId
        );

        console.log(
            "New status:",
            newStatus
        );


        // =================================================
        // UPDATE SUPABASE
        // =================================================

        const {
            data,
            error
        } = await db
            .from("orders")
            .update({
                status: newStatus
            })
            .eq(
                "id",
                orderId
            )
            .select("*");


        // =================================================
        // SUPABASE ERROR
        // =================================================

        if (error) {

            console.error(
                "ORDER STATUS UPDATE ERROR:",
                error
            );

            alert(
                "Status update failed:\n\n" +
                error.message
            );

            return;
        }


        // =================================================
        // IMPORTANT: CHECK ACTUAL UPDATED ROW
        // =================================================

        if (
            !data ||
            data.length === 0
        ) {

            console.error(
                "No order row was updated.",
                {
                    orderId: orderId,
                    newStatus: newStatus
                }
            );

            alert(
                "Status was not updated in the database.\n\n" +
                "Please check the UPDATE policy for the orders table in Supabase."
            );

            return;
        }


        // =================================================
        // VERIFY DATABASE VALUE
        // =================================================

        const updatedOrder =
            data[0];

        console.log(
            "Updated order from database:",
            updatedOrder
        );


        if (
            String(
                updatedOrder.status
            ).toLowerCase() !==
            String(
                newStatus
            ).toLowerCase()
        ) {

            alert(
                "The database did not save the new status."
            );

            return;
        }


        // =================================================
        // RELOAD ORDERS FROM DATABASE
        // =================================================

        await loadOrders();


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            `Order status changed to ${newStatus}.`
        );


    } catch (error) {

        console.error(
            "Status update exception:",
            error
        );

        alert(
            "Something went wrong:\n\n" +
            (error.message || error)
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

const logoutButton =
    document.getElementById(
        "admin-logout"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "../index.html";

        }
    );
}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "Everything 400 admin.js loaded."
        );

        console.log(
            "Supabase available:",
            !!window.supabaseClient
        );

        await loadProducts();

        await loadOrders();

    }
);
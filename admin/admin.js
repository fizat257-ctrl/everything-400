// =========================
// EVERYTHING 400 - ADMIN PANEL
// SUPABASE VERSION
// PART 1 - SETUP + PRODUCTS
// =========================


// =========================
// SUPABASE CLIENT
// =========================

// supabase.js must be loaded before admin.js

const db = window.supabaseClient;


// =========================
// DATA
// =========================

let products = [];

let orders = [];


// =========================
// PRODUCT ELEMENTS
// =========================

const productForm =
    document.getElementById("product-form");

const productsContainer =
    document.getElementById("admin-products");

const productCount =
    document.getElementById("product-count");

const imageInput =
    document.getElementById("product-image");


// =========================
// ORDER ELEMENTS
// =========================

const ordersContainer =
    document.getElementById("admin-orders");

const orderCount =
    document.getElementById("order-count");


// =========================
// CHECK SUPABASE
// =========================

if (!db) {

    console.error(
        "Supabase client not found. Make sure supabase.js is loaded before admin.js."
    );

}


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================
// FORMAT PRICE
// =========================

function formatPrice(price) {

    return Number(price || 0).toLocaleString();

}


// =========================
// FORMAT DATE
// =========================

function formatDate(dateValue) {

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


// =========================
// LOAD PRODUCTS
// =========================

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
                "Products could not be loaded. Please check Supabase policies."
            );

            return;

        }


        products = data || [];


        displayProducts();

        updateProductCount();


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


// =========================
// PRODUCT ERROR
// =========================

function showProductError(message) {

    if (!productsContainer) return;


    productsContainer.innerHTML = `

        <p class="no-products">
            ${escapeHTML(message)}
        </p>

    `;


    updateProductCount();

}


// =========================
// PRODUCT COUNT
// =========================

function updateProductCount() {

    if (!productCount) return;


    const count =
        products.length;


    productCount.textContent =
        `${count} Product${count !== 1 ? "s" : ""}`;

}


// =========================
// DISPLAY PRODUCTS
// =========================

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


    products.forEach(function (product) {

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
                        ${escapeHTML(product.category)}
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
                function () {

                    editProduct(product.id);

                }
            );

        }


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function () {

                    deleteProduct(product.id);

                }
            );

        }


        productsContainer.appendChild(card);

    });


    updateProductCount();

}
// =========================
// PART 2 - ADD / EDIT / DELETE PRODUCTS
// =========================


// =========================
// ADD PRODUCT
// =========================

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

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
                    : "";


            // =========================
            // VALIDATION
            // =========================

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


            // =========================
            // IMAGE
            // =========================

            let image = "";


            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
            ) {

                const file =
                    imageInput.files[0];


                // Maximum 2MB

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
                        "Image error:",
                        error
                    );

                    alert(
                        "Image could not be processed."
                    );

                    return;

                }

            }


            // =========================
            // INSERT INTO SUPABASE
            // =========================

            try {

                const {
                    data,
                    error
                } = await db
                    .from("products")
                    .insert([
                        {
                            name: name,
                            price: price,
                            category: category,
                            image: image
                        }
                    ])
                    .select();


                if (error) {

                    console.error(
                        "Insert product error:",
                        error
                    );

                    alert(
                        "Product could not be added. Please check Supabase INSERT policy."
                    );

                    return;

                }


                console.log(
                    "Product added:",
                    data
                );


                // Clear form

                productForm.reset();


                // Reload products

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
                    "Something went wrong while adding the product."
                );

            }

        }
    );

}


// =========================
// IMAGE TO BASE64
// =========================

function convertImageToBase64(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        reader.error
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


// =========================
// EDIT PRODUCT
// =========================

async function editProduct(id) {

    if (!db) {

        alert(
            "Supabase connection is not available."
        );

        return;

    }


    const product =
        products.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    // =========================
    // NEW NAME
    // =========================

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


    // =========================
    // NEW PRICE
    // =========================

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


    // =========================
    // UPDATE
    // =========================

    try {

        const {
            error
        } = await db
            .from("products")
            .update({

                name: cleanName,

                price: price

            })
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Update product error:",
                error
            );

            alert(
                "Product could not be updated. Check Supabase UPDATE policy."
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
            "Something went wrong while updating the product."
        );

    }

}


// =========================
// DELETE PRODUCT
// =========================

async function deleteProduct(id) {

    if (!db) {

        alert(
            "Supabase connection is not available."
        );

        return;

    }


    const product =
        products.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


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


    // =========================
    // DELETE
    // =========================

    try {

        const {
            error
        } = await db
            .from("products")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Delete product error:",
                error
            );

            alert(
                "Product could not be deleted. Check Supabase DELETE policy."
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
            "Something went wrong while deleting the product."
        );

    }

}


// =========================
// LOGOUT
// =========================

const logoutButton =
    document.getElementById(
        "admin-logout"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "../index.html";

        }
    );

}
// =========================
// PART 3 - ORDERS MANAGEMENT
// =========================


// =========================
// LOAD ORDERS
// =========================

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
                "Orders could not be loaded. Please check Supabase SELECT policy."
            );

            return;

        }


        orders = data || [];


        displayOrders();

        updateOrderCount();


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


// =========================
// ORDER ERROR
// =========================

function showOrderError(message) {

    if (!ordersContainer) return;


    ordersContainer.innerHTML = `

        <p class="no-orders">
            ${escapeHTML(message)}
        </p>

    `;


    updateOrderCount();

}


// =========================
// ORDER COUNT
// =========================

function updateOrderCount() {

    if (!orderCount) return;


    const count =
        orders.length;


    orderCount.textContent =
        `${count} Order${count !== 1 ? "s" : ""}`;

}


// =========================
// DISPLAY ORDERS
// =========================

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


    orders.forEach(function (order) {

        const card =
            document.createElement("div");


        card.className =
            "admin-order-card";


        // =========================
        // CUSTOMER DATA
        // =========================

        let customer = {};


        if (
            order.customer &&
            typeof order.customer === "object"
        ) {

            customer =
                order.customer;

        }
        else if (
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


        const customerName =
            order.name ||
            customer.name ||
            "Unknown Customer";


        const phone =
            order.phone ||
            customer.phone ||
            "Not provided";


        const address =
            order.address ||
            customer.address ||
            "Not provided";


        const city =
            order.city ||
            customer.city ||
            "Not provided";


        // =========================
        // ORDER TOTAL
        // =========================

        const total =
            Number(
                order.total || 0
            );


        // =========================
        // ORDER DATE
        // =========================

        const createdAt =
            order.created_at ||
            order.createdAt;


        const orderDate =
            formatDate(createdAt);


        // =========================
        // ORDER PRODUCTS
        // =========================

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


        let productsHTML = "";


        if (
            Array.isArray(orderProducts) &&
            orderProducts.length > 0
        ) {

            productsHTML = `

                <div class="order-products">

                    <strong>
                        Products
                    </strong>

                    <ul>

                        ${orderProducts
                            .map(function (product) {

                                const productName =
                                    product.name ||
                                    "Product";


                                const productPrice =
                                    Number(
                                        product.price || 0
                                    );


                                return `

                                    <li>

                                        ${escapeHTML(
                                            productName
                                        )}

                                        — Rs.
                                        ${formatPrice(
                                            productPrice
                                        )}

                                    </li>

                                `;

                            })
                            .join("")}

                    </ul>

                </div>

            `;

        }
        else {

            productsHTML = `

                <div class="order-products">

                    <strong>
                        Products
                    </strong>

                    <p>
                        Order details unavailable.
                    </p>

                </div>

            `;

        }


        // =========================
        // ORDER CARD
        // =========================

        card.innerHTML = `

            <div class="admin-order-info">

                <div class="order-header">

                    <h3>
                        Order #${escapeHTML(order.id)}
                    </h3>

                    <span class="order-status">
                        New Order
                    </span>

                </div>


                <div class="customer-details">

                    <p>

                        <strong>
                            Customer:
                        </strong>

                        ${escapeHTML(
                            customerName
                        )}

                    </p>


                    <p>

                        <strong>
                            Phone:
                        </strong>

                        ${escapeHTML(
                            phone
                        )}

                    </p>


                    <p>

                        <strong>
                            Address:
                        </strong>

                        ${escapeHTML(
                            address
                        )}

                    </p>


                    <p>

                        <strong>
                            City:
                        </strong>

                        ${escapeHTML(
                            city
                        )}

                    </p>

                </div>


                ${productsHTML}


                <div class="order-footer">

                    <p class="order-total">

                        <strong>
                            Total:
                        </strong>

                        Rs. ${formatPrice(total)}

                    </p>


                    <small>

                        Order Date:
                        ${escapeHTML(
                            orderDate
                        )}

                    </small>

                </div>

            </div>

        `;


        ordersContainer.appendChild(
            card
        );

    });


    updateOrderCount();

}


// =========================
// REFRESH ORDERS
// =========================

async function refreshOrders() {

    await loadOrders();

}


// =========================
// INITIALIZE ADMIN PANEL
// =========================

async function initializeAdmin() {

    if (!db) {

        console.error(
            "Admin panel cannot initialize because Supabase is unavailable."
        );

        return;

    }


    // Load products

    await loadProducts();


    // Load orders

    await loadOrders();

}


// =========================
// START ADMIN PANEL
// =========================

initializeAdmin();
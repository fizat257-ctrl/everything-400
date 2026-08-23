// =========================
// EVERYTHING 400 - MAIN SCRIPT
// SUPABASE VERSION
// =========================


// =========================
// CART DATA
// =========================

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


// =========================
// ELEMENTS
// =========================

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


// =========================
// CURRENT CATEGORY
// =========================

let selectedCategory = "all";


// =========================
// SUPABASE CHECK
// =========================

function checkSupabase() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client not found. Make sure supabase.js is loaded before script.js."
        );

        return false;

    }

    return true;

}


// =========================
// SAVE CART
// =========================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// =========================
// UPDATE CART COUNT
// =========================

function updateCartCount() {

    if (!cartLink) return;

    cartLink.textContent =
        `Cart (${cart.length})`;

}


// =========================
// GET PRODUCTS FROM SUPABASE
// =========================

async function getProducts() {

    if (!checkSupabase()) {

        return [];

    }


    try {

        const { data, error } =
            await supabaseClient
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


// =========================
// ADD PRODUCT TO CART
// =========================

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

        price: Number(product.price) || 0,

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


// =========================
// DISPLAY PRODUCTS
// =========================

async function displayProducts() {

    if (!productContainer) return;


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


    products.forEach((product) => {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.dataset.category =
            String(
                product.category || "other"
            ).toLowerCase();


        // =========================
        // PRODUCT IMAGE
        // =========================

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

                <span>
                    🛍️
                </span>

            `;

        }


        // =========================
        // PRODUCT CARD
        // =========================

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
                data-id="${product.id}"
            >

                Add to Cart

            </button>

        `;


        productContainer.appendChild(
            card
        );

    });


    // =========================
    // ADD TO CART BUTTONS
    // =========================

    const addButtons =
        productContainer.querySelectorAll(
            ".add-cart-btn"
        );


    addButtons.forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                const productId =
                    this.dataset.id;


                const products =
                    await getProducts();


                const product =
                    products.find(
                        item =>
                            String(item.id) ===
                            String(productId)
                    );


                addToCart(product);

            }
        );

    });


    filterProducts();

}


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(value) {

    return String(value || "")
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


// =========================
// FILTER PRODUCTS
// =========================

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


    productCards.forEach((card) => {

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


// =========================
// CATEGORY BUTTONS
// =========================

categoryButtons.forEach((button) => {

    button.addEventListener(
        "click",
        function () {

            selectedCategory =
                this.dataset.filter ||
                "all";


            categoryButtons.forEach(
                (btn) => {

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


// =========================
// SEARCH INPUT
// =========================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProducts
    );

}


// =========================
// SEARCH BUTTON
// =========================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        filterProducts
    );

}


// =========================
// SHOP NOW BUTTON
// =========================

const shopNowButton =
    document.getElementById(
        "shop-now"
    );


if (shopNowButton) {

    shopNowButton.addEventListener(
        "click",
        function () {

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


// =========================
// DISPLAY CART
// =========================

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
                    Your cart is empty.
                </p>


                <a href="index.html">

                    <button>
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
        (product, index) => {

            const price =
                Number(
                    product.price
                ) || 0;


            total += price;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div>

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        Rs. ${price}
                    </p>

                </div>


                <button
                    class="remove-btn"
                    onclick="removeFromCart(${index})"
                >

                    Remove

                </button>

            `;


            cartItemsContainer.appendChild(
                cartItem
            );

        }
    );


    if (cartTotalElement) {

        cartTotalElement.textContent =
            total;

    }

}


// =========================
// REMOVE FROM CART
// =========================

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


// =========================
// DISPLAY CHECKOUT
// =========================

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


    cart.forEach((product) => {

        const price =
            Number(
                product.price
            ) || 0;


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


// =========================
// CHECKOUT FORM
// SAVE ORDER TO SUPABASE
// =========================

const checkoutForm =
    document.getElementById(
        "checkout-form"
    );


if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =========================
            // CHECK CART
            // =========================

            if (cart.length === 0) {

                alert(
                    "Your cart is empty!"
                );

                return;

            }


            // =========================
            // CUSTOMER DATA
            // =========================

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


            // =========================
            // VALIDATION
            // =========================

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


            // =========================
            // CHECK SUPABASE
            // =========================

            if (!checkSupabase()) {

                alert(
                    "Database connection is not available."
                );

                return;

            }


            // =========================
            // CALCULATE TOTAL
            // =========================

            const total =
                cart.reduce(
                    (
                        sum,
                        product
                    ) =>
                        sum +
                        Number(
                            product.price || 0
                        ),
                    0
                );


            // =========================
            // SAVE ORDER
            // =========================

            try {

                const { data, error } =
                    await supabaseClient
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

                                products:
                                    cart

                            }
                        ])
                        .select();


                // =========================
                // SUPABASE ERROR
                // =========================

                if (error) {

                    console.error(
                        "Order save error:",
                        error
                    );


                    alert(
                        "Order could not be placed. Please try again."
                    );

                    return;

                }


                // =========================
                // SUCCESS
                // =========================

                console.log(
                    "Order saved:",
                    data
                );


                alert(
                    `Thank you ${name}! Your order has been placed successfully.`
                );


                // Clear cart
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
                    "Something went wrong while placing the order."
                );

            }

        }
    );

}


// =========================
// CHECKOUT BUTTON
// =========================

const checkoutButton =
    document.getElementById(
        "checkout-btn"
    );


if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        function () {

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


// =========================
// INITIALIZE WEBSITE
// =========================

updateCartCount();

displayProducts();

displayCart();

displayCheckout();
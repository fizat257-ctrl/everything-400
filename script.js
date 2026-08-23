// =========================
// CART DATA
// =========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];


// =========================
// PRODUCTS DATA
// =========================

let adminProducts =
    JSON.parse(localStorage.getItem("products")) || [];


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
// CURRENT FILTER
// =========================

let selectedCategory = "all";


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

    if (cartLink) {

        cartLink.textContent =
            `Cart (${cart.length})`;

    }

}


// =========================
// DISPLAY PRODUCTS
// =========================

function displayProducts() {

    if (!productContainer) {
        return;
    }

    productContainer.innerHTML = "";

    // Default products
    const defaultProducts = [

        {
            id: 1,
            name: "Elegant Earrings",
            price: 400,
            category: "jewelry",
            icon: "💎"
        },

        {
            id: 2,
            name: "Fashion Necklace",
            price: 400,
            category: "jewelry",
            icon: "📿"
        },

        {
            id: 3,
            name: "Fashion Ring",
            price: 400,
            category: "jewelry",
            icon: "💍"
        },

        {
            id: 4,
            name: "Lip Gloss",
            price: 400,
            category: "cosmetics",
            icon: "💄"
        },

        {
            id: 5,
            name: "Beauty Cream",
            price: 400,
            category: "cosmetics",
            icon: "🧴"
        },

        {
            id: 6,
            name: "Nail Care Set",
            price: 400,
            category: "cosmetics",
            icon: "💅"
        },

        {
            id: 7,
            name: "Decorative Candle",
            price: 400,
            category: "home",
            icon: "🕯️"
        },

        {
            id: 8,
            name: "Ceramic Mug",
            price: 400,
            category: "home",
            icon: "☕"
        },

        {
            id: 9,
            name: "Home Decor Item",
            price: 400,
            category: "home",
            icon: "🏠"
        },

        {
            id: 10,
            name: "Mini Handbag",
            price: 400,
            category: "accessories",
            icon: "👜"
        },

        {
            id: 11,
            name: "Fashion Sunglasses",
            price: 400,
            category: "accessories",
            icon: "🕶️"
        },

        {
            id: 12,
            name: "Fashion Watch",
            price: 400,
            category: "accessories",
            icon: "⌚"
        }

    ];


    // If Admin products exist,
    // use Admin products.
    // Otherwise show default products.

    let productsToDisplay =
        adminProducts.length > 0
            ? adminProducts
            : defaultProducts;


    productsToDisplay.forEach((product) => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";

        card.dataset.category =
            String(product.category).toLowerCase();


        const image =
            product.image
                ? `<img src="${product.image}" alt="${product.name}">`
                : `<span>${product.icon || "🛍️"}</span>`;


        card.innerHTML = `

            <div class="product-image">

                ${image}

            </div>

            <h3>
                ${product.name}
            </h3>

            <p>
                Rs. ${product.price}
            </p>

            <button
                class="add-cart-btn"
                data-id="${product.id}">

                Add to Cart

            </button>

        `;


        productContainer.appendChild(card);

    });


    // Add Cart Events

    const addToCartButtons =
        document.querySelectorAll(".add-cart-btn");


    addToCartButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const card =
                    button.closest(".product-card");

                if (!card) return;


                const name =
                    card
                        .querySelector("h3")
                        .textContent
                        .trim();


                const price =
                    parseInt(
                        card
                            .querySelector("p")
                            .textContent
                            .replace("Rs. ", "")
                    );


                const category =
                    card.dataset.category || "other";


                const product = {

                    name: name,

                    price: price,

                    category: category

                };


                cart.push(product);

                saveCart();

                updateCartCount();


                alert(
                    name +
                    " added to cart!"
                );

            }
        );

    });


    filterProducts();

}


// =========================
// FILTER PRODUCTS
// =========================

function filterProducts() {

    const productCards =
        document.querySelectorAll(".product-card");


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    productCards.forEach((card) => {

        const category =
            card.dataset.category || "";


        const name =
            card.querySelector("h3")
                ? card.querySelector("h3")
                    .textContent
                    .toLowerCase()
                : "";


        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;


        const matchesSearch =
            name.includes(searchText);


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
// CATEGORY FILTER
// =========================

categoryButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            selectedCategory =
                button.dataset.filter;


            categoryButtons.forEach((btn) => {

                btn.classList.remove("active");

            });


            button.classList.add("active");


            filterProducts();

        }
    );

});


// =========================
// SEARCH
// =========================

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


// =========================
// SHOP NOW
// =========================

const shopNowButton =
    document.getElementById("shop-now");


if (shopNowButton) {

    shopNowButton.addEventListener(
        "click",
        () => {

            const productsSection =
                document.getElementById("products");


            if (productsSection) {

                productsSection.scrollIntoView({
                    behavior: "smooth"
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


    cartItemsContainer.innerHTML = "";


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

            cartTotalElement.textContent = "0";

        }

        return;

    }


    let total = 0;


    cart.forEach((product, index) => {

        total += Number(product.price);


        const cartItem =
            document.createElement("div");


        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div>

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Rs. ${product.price}
                </p>

            </div>

            <button
                class="remove-btn"
                onclick="removeFromCart(${index})">

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


// =========================
// REMOVE FROM CART
// =========================

function removeFromCart(index) {

    cart.splice(index, 1);

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


    cart.forEach((product) => {

        total += Number(product.price);


        const item =
            document.createElement("div");


        item.className =
            "checkout-item";


        item.innerHTML = `

            <div>

                <h4>
                    ${product.name}
                </h4>

                <p>
                    Rs. ${product.price}
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
// PLACE ORDER
// =========================

const checkoutForm =
    document.getElementById("checkout-form");


if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty!"
                );

                return;

            }


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const address =
                document
                    .getElementById("address")
                    .value
                    .trim();


            const city =
                document
                    .getElementById("city")
                    .value
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


            alert(
                "Thank you " +
                name +
                "! Your order has been placed successfully."
            );


            console.log(
                "Customer Name:",
                name
            );

            console.log(
                "Phone:",
                phone
            );

            console.log(
                "Address:",
                address
            );

            console.log(
                "City:",
                city
            );

            console.log(
                "Order:",
                cart
            );


            cart = [];

            saveCart();

            updateCartCount();

            checkoutForm.reset();

            displayCheckout();

        }
    );

}


// =========================
// CHECKOUT BUTTON
// =========================

const checkoutButton =
    document.getElementById("checkout-btn");


if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        () => {

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
// INITIALIZE
// =========================

updateCartCount();

displayProducts();

displayCart();

displayCheckout();
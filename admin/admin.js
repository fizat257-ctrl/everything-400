// =========================
// ADMIN PANEL
// =========================

// Get saved products
let products =
    JSON.parse(localStorage.getItem("products")) || [];


// =========================
// DEFAULT PRODUCTS
// =========================

if (products.length === 0) {

    products = [

        {
            id: 1,
            name: "Elegant Earrings",
            price: 400,
            category: "jewelry",
            image: ""
        },

        {
            id: 2,
            name: "Fashion Necklace",
            price: 400,
            category: "jewelry",
            image: ""
        },

        {
            id: 3,
            name: "Fashion Ring",
            price: 400,
            category: "jewelry",
            image: ""
        },

        {
            id: 4,
            name: "Lip Gloss",
            price: 400,
            category: "cosmetics",
            image: ""
        },

        {
            id: 5,
            name: "Beauty Cream",
            price: 400,
            category: "cosmetics",
            image: ""
        },

        {
            id: 6,
            name: "Nail Care Set",
            price: 400,
            category: "cosmetics",
            image: ""
        },

        {
            id: 7,
            name: "Decorative Candle",
            price: 400,
            category: "home",
            image: ""
        },

        {
            id: 8,
            name: "Ceramic Mug",
            price: 400,
            category: "home",
            image: ""
        },

        {
            id: 9,
            name: "Home Decor Item",
            price: 400,
            category: "home",
            image: ""
        },

        {
            id: 10,
            name: "Mini Handbag",
            price: 400,
            category: "accessories",
            image: ""
        },

        {
            id: 11,
            name: "Fashion Sunglasses",
            price: 400,
            category: "accessories",
            image: ""
        },

        {
            id: 12,
            name: "Fashion Watch",
            price: 400,
            category: "accessories",
            image: ""
        }

    ];

    saveProducts();
}


// =========================
// SAVE PRODUCTS
// =========================

function saveProducts() {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

}


// =========================
// PRODUCT COUNT
// =========================

function updateProductCount() {

    const countElement =
        document.getElementById("product-count");

    if (!countElement) return;

    countElement.textContent =
        `${products.length} Product${products.length !== 1 ? "s" : ""}`;

}


// =========================
// DISPLAY PRODUCTS
// =========================

function displayProducts() {

    const container =
        document.getElementById("admin-products");

    if (!container) return;


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `
            <p class="no-products">
                No products available.
            </p>
        `;

        updateProductCount();

        return;
    }


    products.forEach((product) => {

        const productCard =
            document.createElement("div");

        productCard.className =
            "admin-product-card";


        const imageHTML = product.image
            ? `
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="admin-product-image"
                >
              `
            : `
                <div class="admin-product-placeholder">
                    🛍️
                </div>
              `;


        productCard.innerHTML = `

            <div class="admin-product-info">

                ${imageHTML}

                <div>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        Rs. ${product.price}
                    </p>

                    <small>
                        ${product.category}
                    </small>

                </div>

            </div>


            <div class="admin-product-actions">

                <button
                    class="edit-product"
                    onclick="editProduct(${product.id})">

                    Edit

                </button>


                <button
                    class="delete-product"
                    onclick="deleteProduct(${product.id})">

                    Delete

                </button>

            </div>

        `;


        container.appendChild(productCard);

    });


    updateProductCount();

}


// =========================
// ADD PRODUCT
// =========================

const productForm =
    document.getElementById("product-form");


if (productForm) {

    productForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("product-name")
                    .value
                    .trim();


            const price =
                Number(
                    document
                        .getElementById("product-price")
                        .value
                );


            const category =
                document
                    .getElementById("product-category")
                    .value;


            const imageInput =
                document.getElementById("product-image");


            if (!name || price <= 0 || !category) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            // =========================
            // IMAGE READER
            // =========================

            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
            ) {

                const file =
                    imageInput.files[0];

                const reader =
                    new FileReader();


                reader.onload = function () {

                    createNewProduct(
                        name,
                        price,
                        category,
                        reader.result
                    );

                };


                reader.readAsDataURL(file);

            } else {

                createNewProduct(
                    name,
                    price,
                    category,
                    ""
                );

            }

        }
    );

}


// =========================
// CREATE NEW PRODUCT
// =========================

function createNewProduct(
    name,
    price,
    category,
    image
) {

    const newProduct = {

        id: Date.now(),

        name: name,

        price: price,

        category: category,

        image: image

    };


    products.push(newProduct);

    saveProducts();

    displayProducts();


    if (productForm) {

        productForm.reset();

    }


    alert(
        "Product added successfully!"
    );

}


// =========================
// EDIT PRODUCT
// =========================

function editProduct(id) {

    const product =
        products.find(
            item => item.id === id
        );


    if (!product) return;


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


    product.name =
        cleanName;

    product.price =
        price;


    saveProducts();

    displayProducts();


    alert(
        "Product updated successfully!"
    );

}


// =========================
// DELETE PRODUCT
// =========================

function deleteProduct(id) {

    const product =
        products.find(
            item => item.id === id
        );


    if (!product) return;


    const confirmDelete =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmDelete) return;


    products =
        products.filter(
            item => item.id !== id
        );


    saveProducts();

    displayProducts();


    alert(
        "Product deleted successfully!"
    );

}


// =========================
// ADMIN LOGOUT
// =========================

const logoutButton =
    document.getElementById("admin-logout");


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
// INITIALIZE
// =========================

displayProducts();

updateProductCount();
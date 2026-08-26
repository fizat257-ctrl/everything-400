// =====================================================
// DISPLAY PRODUCTS
// =====================================================

async function displayProducts() {
    if (!productContainer) {
        console.error("Product container not found.");
        return;
    }

    // Show loading message
    productContainer.innerHTML = `
        <div class="loading-products">
            <p>Loading products...</p>
        </div>
    `;

    try {
        // Get products from Supabase
        const products = await getProducts();

        // Clear loading message
        productContainer.innerHTML = "";

        // If no products
        if (!Array.isArray(products) || products.length === 0) {
            productContainer.innerHTML = `
                <div class="empty-products">
                    <p>No products available.</p>
                </div>
            `;
            if (typeof updateFilterStatus === "function") {
                updateFilterStatus(0);
            }
            return;
        }

        // Create product cards
        products.forEach(function (product, index) {
            const card = document.createElement("div");
            card.className = "product-card";
            card.dataset.originalIndex = String(index);
            card.dataset.category = String(product.category || "other").toLowerCase();
            card.dataset.id = String(product.id);

            const productName = product.name || "Unnamed Product";
            const price = Number(product.price || 0);
            const stock = Number(product.stock || 0);
            const description = product.description || "No description available.";

            // Image
            const imageHTML = product.image
                ? `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(productName)}" loading="lazy">`
                : `<span>🛍️</span>`;

            // Stock message
            let stockHTML = "";
            if (stock <= 0) {
                stockHTML = `<p class="out-of-stock">Out of Stock</p>`;
            } else if (stock === 1) {
                stockHTML = `<p class="low-stock">Only 1 left in stock</p>`;
            } else if (stock <= 5) {
                stockHTML = `<p class="low-stock">Only ${stock} left in stock</p>`;
            } else {
                stockHTML = `<p class="in-stock">${stock} available in stock</p>`;
            }

            // Product card HTML
            card.innerHTML = `
                <div class="product-image product-details-trigger"
                     data-id="${escapeHTML(product.id)}"
                     style="cursor: pointer;">
                    ${imageHTML}
                </div>

                <h3 class="product-details-trigger"
                    data-id="${escapeHTML(product.id)}"
                    style="cursor: pointer;">
                    ${escapeHTML(productName)}
                </h3>

                <p class="product-price">Rs. ${price.toLocaleString()}</p>
                <p class="product-description">${escapeHTML(description)}</p>
                ${stockHTML}

                <div class="quantity-control" data-id="${escapeHTML(product.id)}">
                    <button type="button" class="quantity-minus" ${stock <= 0 ? "disabled" : ""}>−</button>
                    <span class="quantity-value">1</span>
                    <button type="button" class="quantity-plus" ${stock <= 0 ? "disabled" : ""}>+</button>
                </div>

                <button type="button" class="add-cart-btn" data-id="${escapeHTML(product.id)}" ${stock <= 0 ? "disabled" : ""}>Add to Cart</button>
                <button type="button" class="buy-now-btn" data-id="${escapeHTML(product.id)}" ${stock <= 0 ? "disabled" : ""}>Buy Now</button>
                <button type="button" class="wishlist-btn" data-id="${escapeHTML(product.id)}">♡ Add to Wishlist</button>
            `;

            productContainer.appendChild(card);

            // Quantity controls
            const minusButton = card.querySelector(".quantity-minus");
            const plusButton = card.querySelector(".quantity-plus");
            const quantityValue = card.querySelector(".quantity-value");
            let quantity = 1;

            if (minusButton) {
                minusButton.addEventListener("click", function () {
                    if (quantity > 1) {
                        quantity--;
                        quantityValue.textContent = quantity;
                    }
                });
            }

            if (plusButton) {
                plusButton.addEventListener("click", function () {
                    if (quantity < stock) {
                        quantity++;
                        quantityValue.textContent = quantity;
                    } else {
                        alert(`Only ${stock} item(s) are available.`);
                    }
                });
            }

            // Add to Cart
            const addButton = card.querySelector(".add-cart-btn");
            if (addButton) {
                addButton.addEventListener("click", function () {
                    addToCart(product, quantity);
                });
            }

            // Buy Now
            const buyButton = card.querySelector(".buy-now-btn");
            if (buyButton) {
                buyButton.addEventListener("click", function () {
                    if (stock <= 0) {
                        alert("This product is out of stock.");
                        return;
                    }
                    const added = addToCart(product, quantity);
                    if (added !== false) {
                        window.location.href = "checkout.html";
                    }
                });
            }

            // Wishlist
            const wishlistButton = card.querySelector(".wishlist-btn");
            if (wishlistButton) {
                let wishlist = [];
                try {
                    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
                } catch (error) {
                    wishlist = [];
                }

                const productId = String(product.id);
                const alreadyAdded = wishlist.some(item => String(item.id) === productId);

                if (alreadyAdded) {
                    wishlistButton.textContent = "♥ In Wishlist";
                }

                wishlistButton.addEventListener("click", function () {
                    let currentWishlist = [];
                    try {
                        currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
                    } catch (error) {
                        currentWishlist = [];
                    }

                    const existingIndex = currentWishlist.findIndex(item => String(item.id) === productId);

                    if (existingIndex === -1) {
                        currentWishlist.push({
                            id: product.id,
                            name: product.name,
                            price: price,
                            image: product.image || "",
                            category: product.category || "other"
                        });
                        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
                        wishlistButton.textContent = "♥ In Wishlist";
                        alert("Product added to Wishlist!");
                    } else {
                        currentWishlist.splice(existingIndex, 1);
                        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
                        wishlistButton.textContent = "♡ Add to Wishlist";
                        alert("Product removed from Wishlist.");
                    }
                });
            }
        });

        // Apply filters if available
        if (typeof filterProducts === "function") {
            filterProducts();
        }
    } catch (error) {
        console.error("Display products error:", error);
        productContainer.innerHTML = `
            <div class="empty-products">
                <p>Unable to load products.</p>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

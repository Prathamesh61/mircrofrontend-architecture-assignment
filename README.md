# React Microfrontend Architecture with Webpack 5 Module Federation

A production-style microfrontend architecture consisting of three independently running React applications:

| Application      | Type                 |  Port  | URL                                            |
| :--------------- | :------------------- | :----: | :--------------------------------------------- |
| **Host App**     | Container / Shell    | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Products App** | Remote Microfrontend | `3001` | [http://localhost:3001](http://localhost:3001) |
| **Cart App**     | Remote Microfrontend | `3002` | [http://localhost:3002](http://localhost:3002) |

---

## 1. Architecture Overview

```text
                        ┌────────────────────────┐
                        │       Host :3000       │
                        │   (Container / Shell)  │
                        │                        │
                        │  • App Layout & Nav    │
                        │  • React Router DOM 6  │
                        │  • Live Cart Counter   │
                        │  • Remote ErrorBoundary│
                        └───────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │ Runtime Module Federation         │
                  ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │  Products :3001  │                │    Cart :3002    │
        │                  │                │                  │
        │ Exposes:         │                │ Exposes:         │
        │  ./ProductsList  │                │  ./CartList      │
        └─────────┬────────┘                └─────────▲────────┘
                  │                                   │
                  │   CustomEvent("cart:add")         │
                  └───────────────────────────────────┘
                           Browser Event Bus
```

### Module Federation Configuration

- **Host (`host-app`)**: Declares `products` and `cart` as remote entries (`http://localhost:3001/remoteEntry.js` and `http://localhost:3002/remoteEntry.js`). Uses `React.lazy()` and `Suspense` inside `RemoteLoader` to dynamically stream the remote components.
- **Products (`products-app`)**: Exposes `./ProductsList` pointing to `./src/components/ProductsList`.
- **Cart (`cart-app`)**: Exposes `./CartList` pointing to `./src/components/CartList`.
- **Shared Singletons**: `react`, `react-dom`, and `react-router-dom` are shared with `singleton: true` across all three apps to prevent multiple React instances, duplicate contexts, or Hook mismatch errors.

---

## 2. Decoupled Communication Architecture

The microfrontends are **completely decoupled** at compile-time and runtime. Neither application imports code or files from another application.

Instead, they communicate using native **browser CustomEvents**:

```text
User clicks "Add to Cart"
           │
           ▼
[Products Microfrontend]
   Dispatches: window.dispatchEvent(new CustomEvent("cart:add", { detail: product }))
           │
           ▼
[Browser Event Bus]
           │
           ▼
[Cart State & localStorage]
   Listens: window.addEventListener("cart:add", handler)
   Persists to localStorage key: "microfrontend-cart"
   Broadcasts: window.dispatchEvent(new CustomEvent("cart:updated", { detail: { items, count, total } }))
           │
           ├──────────────────────────────────────┐
           ▼                                      ▼
    [Cart Microfrontend UI]             [Host App Navbar]
     Re-renders item list & totals       Updates Cart (N) count in real-time
```

### Supported Events

| Event          | Dispatched By                | Detail Payload                  | Purpose                                          |
| :------------- | :--------------------------- | :------------------------------ | :----------------------------------------------- |
| `cart:add`     | `products-app`               | `{ id, name, price, category }` | Request item addition to cart                    |
| `cart:remove`  | `cart-app`                   | `productId` (e.g. `1`)          | Request item removal from cart                   |
| `cart:updated` | `cart-app` / storage handler | `{ items, count, total }`       | Broadcast updated cart state to Host & listeners |

---

## 3. Project Structure

```text
microfrontend-architecture-assignment/
│
├── host-app/                                # Container / Shell Application (Port 3000)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                   # Navigation with live Cart (N) badge
│   │   │   ├── ErrorBoundary.jsx            # Remote failure handling & retry button
│   │   │   └── RemoteLoader.jsx             # Suspense + ErrorBoundary wrapper
│   │   ├── pages/
│   │   │   ├── Home.jsx                     # Interactive architecture overview
│   │   │   ├── ProductsPage.jsx             # Lazy loads products/ProductsList
│   │   │   └── CartPage.jsx                 # Lazy loads cart/CartList
│   │   ├── hooks/
│   │   │   └── useCartCount.js              # Syncs navbar cart count with localStorage/events
│   │   ├── App.jsx                          # Router configuration
│   │   ├── bootstrap.jsx                    # Asynchronous React 18 mount
│   │   ├── index.jsx                        # Async import boundary for Webpack Federation
│   │   └── index.css                        # Host shell styles
│   ├── package.json
│   └── webpack.config.js
│
├── products-app/                            # Products Remote Microfrontend (Port 3001)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── ProductsList.jsx             # Product catalog & Add to Cart dispatch
│   │   ├── data/
│   │   │   └── products.js                  # Dummy product data with ₹ INR pricing
│   │   ├── App.jsx                          # Standalone runner shell
│   │   ├── bootstrap.jsx                    # Asynchronous React 18 mount
│   │   ├── index.jsx                        # Async import boundary
│   │   └── index.css                        # Products microfrontend styles
│   ├── package.json
│   └── webpack.config.js                    # Exposes ./ProductsList
│
├── cart-app/                                # Cart Remote Microfrontend (Port 3002)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── CartList.jsx                 # Cart items, totals, remove & checkout
│   │   ├── hooks/
│   │   │   └── useCart.js                   # Event listener bus & state sync
│   │   ├── utils/
│   │   │   └── cartStorage.js               # Safe localStorage persistence
│   │   ├── App.jsx                          # Standalone runner shell
│   │   ├── bootstrap.jsx                    # Asynchronous React 18 mount
│   │   ├── index.jsx                        # Async import boundary
│   │   └── index.css                        # Cart microfrontend styles
│   ├── package.json
│   └── webpack.config.js                    # Exposes ./CartList
│
├── package.json                             # Root workspace runner with concurrent scripts
└── README.md                                # Full documentation
```

---

## 4. Running the Applications

### Option A: Run All Simultaneously (Recommended)

1. Install root dependencies and all application dependencies:

   ```bash
   cd microfrontend-architecture-assignment
   npm install
   npm run install:all
   ```

2. Start all three microfrontends together:

   ```bash
   npm run start:all
   ```

   Or simply:

   ```bash
   npm start
   ```

3. Open **`http://localhost:3000`** in your browser.

---

### Option B: Run Each Application Independently in Separate Terminals

#### 1. Start Products Remote (Port 3001)

```bash
cd microfrontend-architecture-assignment/products-app
npm install
npm start
```

_Standalone URL:_ [http://localhost:3001](http://localhost:3001)  
_Remote Entry URL:_ [http://localhost:3001/remoteEntry.js](http://localhost:3001/remoteEntry.js)

#### 2. Start Cart Remote (Port 3002)

```bash
cd microfrontend-architecture-assignment/cart-app
npm install
npm start
```

_Standalone URL:_ [http://localhost:3002](http://localhost:3002)  
_Remote Entry URL:_ [http://localhost:3002/remoteEntry.js](http://localhost:3002/remoteEntry.js)

#### 3. Start Host Shell (Port 3000)

```bash
cd microfrontend-architecture-assignment/host-app
npm install
npm start
```

_Host Application URL:_ [http://localhost:3000](http://localhost:3000)

---

## 5. Verification Checklist

- [x] Host starts on port `3000`
- [x] Products starts on port `3001`
- [x] Cart starts on port `3002`
- [x] Products `remoteEntry.js` is publicly accessible at `http://localhost:3001/remoteEntry.js`
- [x] Cart `remoteEntry.js` is publicly accessible at `http://localhost:3002/remoteEntry.js`
- [x] Host dynamically loads `products/ProductsList` via Module Federation
- [x] Host dynamically loads `cart/CartList` via Module Federation
- [x] React is configured and shared as a singleton (`singleton: true`)
- [x] React DOM is configured and shared as a singleton (`singleton: true`)
- [x] React Router DOM is shared
- [x] Products can add items to cart via `window.dispatchEvent(new CustomEvent("cart:add"))`
- [x] Cart displays added products with names, unit prices, and quantities
- [x] Cart can remove products via `cart:remove`
- [x] Cart total is calculated accurately in Indian Rupees (₹)
- [x] Cart persists across page reloads using `localStorage` key `microfrontend-cart`
- [x] Host navbar displays live cart count badge updating immediately
- [x] Suspense loading state displays clean centered indicator ("Loading Products...", "Loading Cart...")
- [x] Remote error boundary catches remote crashes and displays a friendly error card with troubleshooting steps
- [x] Applications run independently in standalone mode on their respective ports

---

## 6. Manual Testing Scenarios

### Scenario 1: Dynamic Loading of Products MFE

1. Open `http://localhost:3000`.
2. Click **Products** in the navbar (or navigate to `/products`).
3. **Expected:** Suspense briefly displays _"Loading Products..."_ followed by the product catalog rendered dynamically from `http://localhost:3001`.

### Scenario 2: Add to Cart Cross-App Communication

1. While on `http://localhost:3000/products`, click **Add to Cart** on "MacBook Pro 16\" M3".
2. **Expected:**
   - Button shows "Added! ✓" visual feedback.
   - Host navbar cart badge immediately increments: `Cart (1)`.
   - No direct import from Cart code is made.

### Scenario 3: Viewing and Verifying Cart Items

1. Click **Cart (1)** in the navbar (navigates to `/cart`).
2. **Expected:**
   - Suspense displays _"Loading Cart..."_ and dynamically renders `cart/CartList` from `http://localhost:3002`.
   - The added MacBook Pro appears with unit price `₹75,000`, quantity `1`, subtotal `₹75,000`, and total amount `₹75,000`.

### Scenario 4: Removing Products & Live Synchronization

1. On `http://localhost:3000/cart`, click **Remove** on the item.
2. **Expected:**
   - Item disappears immediately.
   - Navbar badge updates to `Cart (0)`.
   - Cart transitions to the empty cart state: _"Your cart is empty. Add products from the Products page."_

### Scenario 5: Cart Persistence via localStorage

1. Add 2 products from the Products page.
2. Verify total count is `Cart (2)`.
3. Refresh the browser (`F5` or `Ctrl+R`).
4. **Expected:**
   - Both items remain in the cart.
   - Navbar badge still displays `Cart (2)`.
   - Corrupted or deleted storage is handled gracefully without crashing.

### Scenario 6: Fault Tolerance — Products Remote Server Down

1. Stop the Products development server (press `Ctrl+C` in the Products terminal).
2. Navigate to `http://localhost:3000/products`.
3. **Expected:**
   - The Host container does **not** crash or display a blank screen.
   - Friendly error card displays: _"Products Service Unavailable. Please make sure the remote application is running on port 3001."_
   - Host navigation bar, Home page, and Cart page remain 100% operational.

### Scenario 7: Fault Tolerance — Cart Remote Server Down

1. Stop the Cart development server (press `Ctrl+C` in the Cart terminal).
2. Navigate to `http://localhost:3000/cart`.
3. **Expected:**
   - Friendly error card displays: _"Cart Service Unavailable. Please make sure the remote application is running on port 3002."_
   - Host shell and Products page continue to function normally.

---

## 7. Deep-Dive Architectural Decisions

### 1. How Webpack 5 Module Federation Works

Webpack 5 Module Federation allows separate Webpack builds to form a single application at runtime without reloading the page or publishing npm packages.

- The remote apps (`products-app` and `cart-app`) produce a lightweight manifest file named `remoteEntry.js`.
- When the Host app mounts a route requiring a remote module (e.g. `import("products/ProductsList")`), Webpack's Module Federation runtime executes the getter from `remoteEntry.js` and downloads only the required chunks on-demand.

### 2. The Asynchronous Boundary (`index.jsx` vs `bootstrap.jsx`)

When sharing singletons like React across Module Federation boundaries, Webpack needs an asynchronous boundary to negotiate which application provides the shared module before application code executes.

- Every app has an `index.jsx` that simply does:
  ```js
  import("./bootstrap");
  ```
- All initialization, DOM mounting, and component imports happen inside `bootstrap.jsx`. This avoids the dreaded Webpack error: `Shared module is not available for eager consumption`.

### 3. Why React is Configured as a Singleton

```js
shared: {
  react: { singleton: true, requiredVersion: "^18.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
}
```

If React is loaded twice in memory:

- React Hook rules break (`Invalid hook call. Hooks can only be called inside the body of a function component`).
- React context providers cannot communicate with consumers across different React instances.
- By declaring `singleton: true`, Module Federation guarantees that the Host and all remotes share the **exact same runtime React instance**.

### 4. Browser CustomEvent Bus vs. Shared Store

Instead of forcing remotes to share a Zustand, Redux, or MobX store dependency, this architecture uses native browser `CustomEvent` objects:

- **True Loose Coupling:** Products only needs to know the event contract: `"cart:add"` with product payload. It has zero knowledge of how Cart stores, displays, or calculates orders.
- **Technology Agnostic:** If Products or Cart were rewritten tomorrow in Vue, Svelte, or vanilla JS, the exact same event contract would continue working seamlessly.

### 5. Production Considerations & CORS Note

- **CORS:** During local development, dev servers enable `Access-Control-Allow-Origin: *` so the Host on port 3000 can fetch bundles from ports 3001 and 3002. In production, configure specific allowed origins or serve all remotes behind a common reverse proxy (e.g., NGINX, Cloudflare, AWS CloudFront) under path prefixes like `/mfe/products/` and `/mfe/cart/`.
- **Dynamic Remotes:** In large-scale enterprise setups, remote URLs can be resolved dynamically via an API or service registry rather than static URLs in Webpack configs.

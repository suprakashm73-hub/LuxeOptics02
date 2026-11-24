# Leux Optics — local full-stack starter

This project includes a Node.js backend and a JSON file database. It has no npm dependencies.

## Run locally in VS Code

1. Extract the project ZIP and open the extracted folder in VS Code.
2. Install Node.js 18 or newer if needed.
3. Open **Terminal → New Terminal** in VS Code.
4. Run `npm start`.
5. Open the localhost address printed in the terminal (usually `http://localhost:8000`). If port 8000 is busy, the server automatically tries the next available port. Keep the terminal running while using the site.

The server stores the catalog, customer accounts (passwords are salted and hashed), orders, ratings, and helpline in a persistent Mac folder: `~/.leux-optics/store.json`; uploaded product photos live in `~/.leux-optics/uploads/`. This location is shared by project copies and survives refreshes and server restarts. On first launch, if the project contains an older `data/store.json`, the server migrates that database and its uploaded photos automatically. Startup prints the exact active data paths. Back up the whole `~/.leux-optics` folder regularly.

## Included backend features

- Separate customer account creation and sign-in screens, with clear validation messages (mobile number plus a password of at least 6 characters)
- Admin sign-in and protected catalog, order, and helpline endpoints
- Add/delete products, create and review orders, and store ratings
- Checkout form captures recipient, mobile, six-digit PIN, address, city, state, and COD/UPI selection
- Admin can upload up to 3 local product photos; uploads are stored in `uploads/` and catalog data references them
- Data persists between server restarts in `data/store.json`

Default local admin password: `admin555`. Change it by setting `ADMIN_PASSWORD` before starting the server. For macOS/Linux: `ADMIN_PASSWORD='your-long-password' npm start`.

## Important for a public launch

This is a locally runnable starter, not a production ecommerce service. For internet hosting, set `LEUX_DATA_DIR` to a persistent disk/volume path supplied by your hosting provider; app containers may be temporary and their home directories may be reset. The JSON database is for a single server and should be replaced with a managed database for a larger public store. The admin password defaults to the requested demo value. The checkout records COD or UPI orders, but does not charge or verify online payments; connect a payment gateway before accepting online payments. COD orders are recorded but no courier is booked. Add HTTPS, production-grade session management, rate limiting, backups, privacy/return policies, and deployment configuration before putting real customer data online.

Product photos and fonts load from Unsplash and Google Fonts, so the browser needs internet access for those assets.

Customer care opens a dialog with a `tel:` link and a copy-number button. On a Mac without a calling app, copy the number and call from your phone. Admin sets the number in the Helpline tab.

## Delivery updates

In Admin portal > Orders, choose a status (Order received, Packed, Shipped, Out for delivery, Delivered, or Cancelled), add an optional customer message, and save. Signed-in customers can open the account icon > View my orders to see the latest status and message. These updates appear inside the website; this starter does not send SMS or email notifications.

Customers can select **My orders** in the top navigation to see their order count, delivery status, and admin updates after signing in. The same page includes a direct phone link and one return/exchange request per order. Requests and admin replies are stored with the order and visible to the customer in My orders.

### Keeping existing local data when updating

Run the updated `server.js` from the same project folder that already has your `data/store.json` and `uploads/` directory. On startup, it copies those into `~/.leux-optics/`. If you extracted a fresh ZIP into a different folder, first copy the old project’s `data/store.json` and `uploads/` folder into the new project, then start it once. After migration, the stable Mac data folder is used across project copies.

## Age and frame fit finder

The storefront age finder filters products tagged Kids (0–12), Teen (13–17), Adult (18+), or All ages. Admin assigns each frame an age group and an approximate lens width: XS 40–44 mm, S 45–48 mm, M 49–52 mm, L 53–56 mm, or XL 57+ mm. The age result is a starting suggestion only; the actual face and frame fit should be checked before purchase. The header logo uses the supplied `logo.png`.

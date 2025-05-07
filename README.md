# Abelian Wallet React App

This is a simple React + TypeScript + Vite wallet UI for Abelian.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Development mode

Start the development server (with hot reload):

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### 3. Preview production build

Build and preview the production version:

```bash
npm run build
npm run preview
```

### 4. Configuration: RPC Credentials

By default, the app uses hardcoded RPC credentials for Abelian node in `src/postClient.ts`:

```ts
const RPC_USER = "obtYcddnEbugr2bm7j18iUsttpY=";
const RPC_PASS = "j/6naCJqdAnpRrnSPanF3awYdcU=";
```

**You should replace these values with your own Abelian node's RPC username and password:**

- Open `src/postClient.ts`
- Replace the values of `RPC_USER` and `RPC_PASS` with your own

```ts
const RPC_USER = "your_rpc_username";
const RPC_PASS = "your_rpc_password";
```

---

## Features
- View wallet balances
- Generate and convert addresses
- View transaction history
- Transfer funds
- Toast notifications for actions

## Notes
- Make sure your Abelian node is running and accessible from the app.
- The default proxy in `vite.config.ts` assumes your node is running on `https://127.0.0.1:18665`.
- You can adjust the proxy target as needed.

---

## License
MIT

# 💠 Halo Bank

**A calmer way to move money.**

Halo Bank is a premium personal banking experience concept — offering instant transfers, secure PIN-based authentication, and a clean, minimal interface designed to make everyday banking feel effortless.

🔗 **Live Demo:** [halobank.lovable.app](https://halobank.lovable.app)

![Halo Bank Preview](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d0b5d4f6-bfec-484d-aced-b6a0dc106c96/id-preview-eb8e37ef--2f086445-1153-4899-8906-ef73f3a4671d.lovable.app-1784802226352.png)

---

## ✨ Features

- 🏦 **Account Creation** — Open an account in seconds
- 🔐 **Secure PIN Authentication** — PINs are hashed using **PBKDF2**, never stored in plain text
- ⚡ **Instant Transfers** — Send money to other accounts in real time
- 💰 **Deposit & Withdraw** — Simple, intuitive balance management
- 📜 **Transaction History** — Track every deposit, withdrawal, and transfer
- 🎨 **Modern, Minimal UI** — Calm, distraction-free design focused on clarity

---

## 🖼️ Preview

| Balance Dashboard | Secure Access |
|---|---|
| View available balance at a glance | Sign in with your account + private PIN |

---

## 🛠️ Tech Stack

> _Update this section to match your actual implementation — defaults below are typical for a Lovable-built project._

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend / Auth / DB:** Supabase *(or your backend of choice)*
- **Security:** PBKDF2 password/PIN hashing
- **Deployment:** [Lovable](https://lovable.dev)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/halo-bank.git
cd halo-bank

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Environment Variables

Create a `.env` file in the root directory and add any required keys, e.g.:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📁 Project Structure

```
halo-bank/
├── src/
│   ├── components/     # UI components
│   ├── pages/           # App pages (Home, Create, Login, Dashboard)
│   ├── lib/              # Utilities, PIN hashing, API calls
│   └── App.tsx
├── public/
├── package.json
└── README.md
```

> _Adjust this tree to reflect your actual folder layout._

---

## 🔒 Security Notes

- PINs are **hashed with PBKDF2** before storage — plaintext PINs are never saved.
- Do not commit `.env` files or any secrets to version control.
- This project is a **demo/portfolio app** and is not intended for handling real financial transactions.

---

## 🗺️ Roadmap

- [ ] Multi-account support
- [ ] Spending analytics / insights
- [ ] Dark mode
- [ ] Two-factor authentication
- [ ] Export transaction history (CSV/PDF)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

Built with ❤️ by **[Your Name]**
- GitHub: [@your-username](https://github.com/your-username)
- Live Demo: [halobank.lovable.app](https://halobank.lovable.app)

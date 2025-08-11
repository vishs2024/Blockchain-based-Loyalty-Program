# Blockchain-Based Loyalty Program

A decentralized **loyalty rewards platform** that leverages blockchain technology to provide **transparency, security, and trust** between businesses and customers. Instead of relying on centralized systems, loyalty points are issued as **blockchain tokens**, enabling customers to **earn, redeem, and transfer rewards** securely and seamlessly.

---

## 🚀 Features

- **Smart Contract Powered** – Automates loyalty point issuance, redemption, and validation using Solidity.
- **Secure & Transparent** – All transactions are recorded on the blockchain, ensuring fraud prevention and verifiable histories.
- **User-Friendly Interface** – Responsive React-based frontend for smooth interaction.
- **Role-Based Access** – Admins (businesses) can issue points, customers can redeem them.
- **Local & Test Network Support** – Works with Ganache for local testing and deployable to Ethereum testnets.

---

## 🛠 Tech Stack

| Layer        | Technology |
|--------------|------------|
| **Frontend** | React.js, Tailwind CSS / Bootstrap |
| **Backend**  | Node.js, Express.js |
| **Blockchain** | Ethereum, Solidity, Truffle, Ganache, MetaMask |
| **Deployment** | Vercel (frontend), Truffle migrations (smart contracts) |

---

## 📦 Requirements

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
- [Truffle](https://trufflesuite.com/truffle/) (`npm install -g truffle`)
- [Ganache](https://trufflesuite.com/ganache/) (GUI or CLI version for local blockchain)
- [MetaMask](https://metamask.io/) browser extension
- A modern web browser (Google Chrome / Brave recommended)

**Optional but Recommended**
- [Visual Studio Code](https://code.visualstudio.com/) with Solidity and JavaScript/TypeScript extensions
- [Git](https://git-scm.com/) for version control


## 🔄 How It Works

1. **Admin (Business)** creates and assigns loyalty points to customers via the web app.
2. **Customers** earn and redeem points through blockchain-verified transactions.
3. All actions are **immutable** and **publicly verifiable** on the blockchain ledger.

---

## 📂 Project Structure

```
Blockchain-based-Loyalty-Program/
│
├── build/contracts/   # Compiled smart contract artifacts
├── contracts/         # Solidity smart contracts
├── migrations/        # Truffle migration scripts
├── public/            # Static assets for frontend
├── src/               # React frontend source code
├── test/              
├── .env               # Environment variables
├── README.md          # Project documentation
├── package-lock.json  # Auto-generated dependency lock file
├── package.json       # Project metadata and dependencies
└── truffle-config.js  # Truffle configuration file
```

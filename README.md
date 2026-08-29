# Razorpay AI Finance Controller

This project acts like a super-fast, automated accountant. 

Imagine you run an online store. Customers pay you through Razorpay. Razorpay then sends that money to your bank account. But how do you know you received every single penny you were supposed to? What if a refund was counted twice? What if a fee was charged incorrectly? 

Checking this by hand using spreadsheets is slow and boring. This project automates the checking process.

## What It Does
It takes four different lists of transactions and compares them:
1. **Payments**: The money customers sent you.
2. **Refunds**: The money you returned to customers.
3. **Settlements**: The money Razorpay promised they sent to your bank.
4. **Bank Credits**: The actual money that landed in your bank account.

It lines up all these records and uses strict math to make sure everything matches exactly. 

* **If the math is perfect**: The system automatically approves and records the match.
* **If a single penny is missing**: The system hits the brakes. It flags the transaction as an "Exception" and asks a human to review it. 

## Where the AI comes in
In money software, AI shouldn't make the final decisions—it can easily make a mistake and lose money. So, our AI does not do the math. 

Instead, the AI acts as an assistant for the human reviewer. When a transaction is blocked (for example, a missing settlement), the AI reads the official Razorpay policy documents and explains *why* it might be missing (like public holidays delaying bank transfers) so the human can decide what to do faster.

## How to Run It on Your Computer

You need Docker installed on your computer to run this. Docker packs the app and its database into easy-to-use boxes.

**Step 1: Start the application**
Open your terminal and run:
```bash
docker compose up -d
```
This starts the PostgreSQL database and the Python backend.

**Step 2: Setup the Database**
Once the database is running, tell the app to create all the tables:
```bash
docker compose exec api alembic upgrade head
```

**Step 3: Run the Tests**
To prove that the math works perfectly with zero mistakes, you can run the test system:
```bash
docker compose exec api pytest
```

## Built With
* **Python & FastAPI**: For the backend logic.
* **PostgreSQL**: To save the transaction data securely.
* **Alembic**: To manage the database structure.
* **Docker**: To run the project anywhere easily.

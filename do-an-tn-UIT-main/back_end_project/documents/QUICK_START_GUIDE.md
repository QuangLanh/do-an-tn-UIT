# 🚀 Quick Start Guide

Get your Grocery Store Management Backend up and running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] MongoDB Atlas account (or local MongoDB)
- [ ] Git installed

## 🏃 Fast Setup (5 Minutes)

### Step 1: Clone & Install (1 min)

```bash
# Clone the repository
git clone <repository-url>
cd back_end_project

# Install dependencies
npm install
```

### Step 2: Setup MongoDB Atlas (2 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a FREE cluster (M0)
3. Create database user:
   - Username: `taphoa_user`
   - Password: `<generate-strong-password>`
4. Network Access: Add IP `0.0.0.0/0` (allow all)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string

### Step 3: Configure Environment (1 min)

Create `.env` file:

```bash
# Copy template
cp .env.example .env

# Edit .env with your favorite editor
nano .env
# or
code .env
```

Update these values:
```env
MONGO_URI=mongodb+srv://taphoa_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/taphoa
JWT_SECRET=my_super_secret_key_change_in_production_123456789
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start the Server (1 min)

```bash
# Development mode with hot-reload
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:4000/api
📚 Swagger documentation: http://localhost:4000/api/docs
```

## ✅ Verify Installation

### Test 1: Health Check

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-10-30T10:30:00.000Z",
  "uptime": 123.456
}
```

### Test 2: Register First User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "fullName": "System Admin"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "fullName": "System Admin",
    "role": "staff"
  }
}
```

### Test 3: Access Swagger UI

Open in browser:
```
http://localhost:4000/api/docs
```

You should see the interactive API documentation!

## 🎯 Next Steps

### 1. Make First User an Admin

Connect to MongoDB Atlas:
1. Go to MongoDB Atlas → Clusters → Browse Collections
2. Find `taphoa` database → `users` collection
3. Edit your user document and change `role` from `"staff"` to `"admin"` (or use seeder users)

Or use MongoDB Compass:
```
mongodb+srv://taphoa_user:password@cluster0.xxxxx.mongodb.net/taphoa
```

### 2. Create Sample Products

Use the Swagger UI at `http://localhost:4000/api/docs`:

1. Click "Authorize" button
2. Paste your access_token
3. Try the `POST /api/products` endpoint

Or use curl:
```bash
# Save your token
TOKEN="your_access_token_here"

# Create a product
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Coca Cola 330ml",
    "sku": "COKE-330",
    "category": "Beverages",
    "purchasePrice": 8000,
    "salePrice": 12000,
    "stock": 100,
    "minStockLevel": 20,
    "unit": "bottle"
  }'
```

### 3. Create Your First Order

```bash
# Get the product ID from previous step
PRODUCT_ID="your_product_id_here"

# Create an order
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "productId": "'$PRODUCT_ID'",
        "quantity": 5
      }
    ],
    "customerName": "Nguyen Van A",
    "paymentMethod": "cash"
  }'
```

### 4. View Dashboard

```bash
curl -X GET http://localhost:4000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

## 🎨 Explore Features

### Available Endpoints

Visit Swagger UI for full documentation:
```
http://localhost:4000/api/docs
```

Key endpoints:
- 🔐 **Auth**: `/api/auth/login`, `/api/auth/register`
- 👥 **Users**: `/api/users` (Admin only)
- 📦 **Products**: `/api/products`
- 🛒 **Orders**: `/api/orders`
- 📥 **Purchases**: `/api/purchases`
- 💰 **Transactions**: `/api/transactions/summary`
- 📊 **Reports**: `/api/reports/revenue`
- 📈 **Dashboard**: `/api/dashboard/summary`

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution**:
1. Check your `MONGO_URI` in `.env`
2. Verify IP whitelist in MongoDB Atlas (Network Access)
3. Ensure correct username/password
4. Try connection with MongoDB Compass

### Issue: "Port 4000 already in use"

**Solution**:
```bash
# Option 1: Change port in .env
PORT=5000

# Option 2: Kill process using port 4000
# Mac/Linux:
lsof -ti:4000 | xargs kill

# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Issue: "JWT token expired"

**Solution**:
Login again to get a new token:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Issue: "Module not found"

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 Learn More

- **Full Documentation**: `README.md`
- **Vietnamese Guide**: `USER_GUIDE.md`
- **API Examples**: `API_USAGE_EXAMPLES.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Project Structure**: `PROJECT_STRUCTURE.md`

## 🆘 Get Help

If you're stuck:

1. **Check Logs**:
   ```bash
   # Server logs are in the terminal where you ran npm run start:dev
   ```

2. **Test MongoDB Connection**:
   - Use MongoDB Compass
   - Try connecting with the same URI

3. **Verify Environment**:
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 8+
   ```

4. **Check Service Status**:
   ```bash
   curl http://localhost:4000/api/health
   ```

## 🎉 You're Ready!

Your backend is now running and ready to integrate with the frontend!

**What to do next**:
1. ✅ Create more sample data (products, orders)
2. ✅ Test all endpoints in Swagger UI
3. ✅ Connect your React frontend
4. ✅ Read the full documentation
5. ✅ Start building your grocery store!

---

**Happy Coding! 🚀**

Need more help? Check the full `README.md` or contact the team.


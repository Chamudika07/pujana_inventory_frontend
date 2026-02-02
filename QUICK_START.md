# Frontend Quick Start Guide

## Setup in 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The frontend will be available at **http://localhost:3000**

### Step 3: Login
Use the credentials you created during backend registration:
- Email: your_email@example.com
- Password: your_password

---

## 📱 Mobile Responsive Features

✅ **Fully responsive** for:
- Mobile phones (320px and up)
- Tablets (768px and up)
- Desktops (992px and up)

✅ **Mobile-specific features**:
- Collapsible sidebar navigation
- Touch-friendly buttons and inputs
- Optimized form layouts
- Fast page loading

---

## 🎨 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Bootstrap 5** | CSS Framework |
| **Axios** | HTTP Client |
| **Zustand** | State Management |
| **React Router** | Navigation |
| **React Icons** | Icon Library |
| **React Toastify** | Notifications |

---

## 🚀 Available Commands

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript errors
npm run type-check

# Lint code
npm run lint
```

---

## 📚 Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── stores/        # Global state (Zustand)
├── types/         # TypeScript types
├── hooks/         # Custom hooks
├── utils/         # Helper functions
└── styles/        # Global styles
```

---

## 🔌 API Integration

The frontend connects to your FastAPI backend at `http://localhost:8000`

**Key endpoints used:**
- `POST /users/` - Register
- `POST /users/login` - Login
- `GET /items/` - List items
- `POST /items/` - Create item
- `GET /alerts/` - Get alerts
- `GET /bill/` - List bills
- `POST /bill/start` - Create bill

---

## 🛡️ Authentication

- Uses JWT tokens
- Token stored in browser localStorage
- Auto-logout on 401 response
- Protected routes require valid token

---

## 🎯 Key Features Implemented

✅ User Authentication (Login/Register)
✅ Dashboard with statistics
✅ Responsive navigation
✅ State management with Zustand
✅ API integration with Axios
✅ Error handling & notifications
✅ Mobile-first design
✅ Type-safe TypeScript

---

## 📈 Next Steps

1. **Develop Inventory Pages**:
   - Items CRUD operations
   - Categories management
   - Search and filter

2. **Develop Bill Module**:
   - Create buy/sell bills
   - Add items to bills
   - Print bill receipts

3. **Develop Alert System**:
   - Display low stock alerts
   - Mark alerts as resolved
   - Alert preferences

4. **Analytics Dashboard**:
   - Charts and graphs
   - Sales reports
   - Inventory trends

---

## 🐛 Troubleshooting

**Q: Port 3000 is already in use**
```bash
# Use different port
npm run dev -- --port 3001
```

**Q: API connection failed**
- Check backend is running: `http://localhost:8000`
- Verify `VITE_API_URL` in `.env.local`
- Check browser console for errors

**Q: Build errors**
```bash
npm run type-check
npm run lint
```

---

## 📞 Support

For questions or issues, check:
- Backend README
- React documentation: https://react.dev
- Bootstrap docs: https://getbootstrap.com
- Vite docs: https://vitejs.dev

---

**Happy Coding! ⚡**

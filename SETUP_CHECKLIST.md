# Frontend Setup Checklist

## ✅ Pre-Installation

- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm v7+ installed (`npm --version`)
- [ ] Backend API running on `http://localhost:8000`
- [ ] Git repository initialized

---

## 📦 Installation Steps

### Step 1: Navigate to Frontend Directory
```bash
cd /Users/chamudikapramod/FastAPI/pujana_electrical/frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

**Expected output:**
```
added XXX packages in X.XXs
```

### Step 3: Verify Installation
```bash
npm run type-check
npm run lint
```

---

## ⚙️ Configuration

### Step 1: Create Environment File
```bash
cp .env.example .env.local
```

### Step 2: Verify .env.local
```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

### Step 3: Test API Connection

Frontend is configured and ready to connect to backend.

---

## 🚀 Starting Development

### Option 1: Start Dev Server
```bash
npm run dev
```

**Output should show:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000
  ➜  Press h to show help
```

### Option 2: Build for Production
```bash
npm run build
```

### Option 3: Preview Production Build
```bash
npm run preview
```

---

## 🧪 Initial Testing

### Test 1: Access Frontend
- [ ] Open `http://localhost:3000` in browser
- [ ] Should see login page
- [ ] Page should be responsive

### Test 2: Authentication
- [ ] Try invalid credentials (should show error)
- [ ] Register new account
- [ ] Login with credentials
- [ ] Should redirect to dashboard

### Test 3: Dashboard
- [ ] Dashboard loads successfully
- [ ] Statistics cards display
- [ ] Quick action buttons visible
- [ ] Navigation sidebar works

### Test 4: Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle mobile view
- [ ] Navigation should collapse to hamburger menu
- [ ] Content should be readable

---

## 📁 Project Structure Verification

Verify all folders are created:

```bash
# Check directory structure
ls -la src/

# Should show:
# components/
# pages/
# services/
# stores/
# types/
# hooks/
# utils/
# styles/
# App.tsx
# main.tsx
```

---

## 🔧 Common Setup Issues

### Issue 1: "Port 3000 already in use"
```bash
# Use different port
npm run dev -- --port 3001
```

### Issue 2: "Cannot find module '@services/...'"
```bash
# Check tsconfig.json paths configuration
# Verify all path aliases are correct
npm run type-check
```

### Issue 3: "API connection failed"
1. Ensure backend is running: `http://localhost:8000`
2. Check `VITE_API_URL` in `.env.local`
3. Open browser console (F12) for CORS errors
4. Check Network tab for failed requests

### Issue 4: "Dependencies not installed"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: "Build fails with TypeScript errors"
```bash
# Run type check to see errors
npm run type-check

# Run linter
npm run lint
```

---

## 📚 Documentation Structure

- **README.md** - Main documentation
- **QUICK_START.md** - 3-step quick start
- **ARCHITECTURE.md** - Detailed architecture
- **SETUP_CHECKLIST.md** - This file

---

## 🎯 Next Steps After Setup

### Phase 1: Core Features (Week 1)
- [ ] Login/Register working
- [ ] Dashboard displaying data
- [ ] Navigation functioning

### Phase 2: Inventory Management (Week 2)
- [ ] Items listing and CRUD
- [ ] Categories management
- [ ] Search and filters

### Phase 3: Billing System (Week 3)
- [ ] Create bills (buy/sell)
- [ ] Bill printing
- [ ] Bill history

### Phase 4: Alerts & Analytics (Week 4)
- [ ] Low stock alerts display
- [ ] Alert preferences
- [ ] Dashboard charts

---

## 🚀 Deployment Preparation

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Responsive design verified
- [ ] API endpoints tested
- [ ] Environment variables configured
- [ ] Browser compatibility checked

### Build for Production

```bash
npm run build

# Output will be in dist/ folder
# Ready to deploy to any static host
```

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Connect Git repo
   - Build command: `npm run build`
   - Publish dir: `dist`

3. **Traditional Server**
   - Build production bundle
   - Serve dist/ folder with nginx/Apache
   - Configure API proxy

---

## 📞 Support & Help

### Getting Help

1. Check [QUICK_START.md](./QUICK_START.md)
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Review error message in console
4. Check [React Docs](https://react.dev)
5. Contact development team

### Useful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

---

## ✨ Features Checklist

### Authentication
- [ ] Login page
- [ ] Register page
- [ ] JWT token management
- [ ] Protected routes
- [ ] Auto-logout on 401

### Layout
- [ ] Navbar with user menu
- [ ] Sidebar navigation
- [ ] Mobile-responsive
- [ ] Smooth transitions

### Dashboard
- [ ] Statistics cards
- [ ] Inventory value
- [ ] Quick action buttons
- [ ] Low stock alerts preview

### API Integration
- [ ] Axios client setup
- [ ] Service layer
- [ ] Error handling
- [ ] Loading states

### State Management
- [ ] Zustand stores
- [ ] Auth state
- [ ] Item state
- [ ] Error states

### Styling
- [ ] Bootstrap integration
- [ ] Custom CSS
- [ ] Responsive design
- [ ] Dark/light aware

---

## 🎓 Learning Outcomes

By end of setup, you'll understand:

- ✅ React component structure
- ✅ TypeScript interfaces
- ✅ State management with Zustand
- ✅ API integration with Axios
- ✅ Responsive design with Bootstrap
- ✅ Routing with React Router
- ✅ Authentication flow
- ✅ Development workflow

---

## 📊 Performance Targets

- [ ] First load: < 3 seconds
- [ ] Bundle size: < 1MB
- [ ] Lighthouse score: > 90
- [ ] Mobile score: > 85

---

## 🔐 Security Setup

- [x] JWT authentication
- [x] Protected routes
- [x] HTTPS-ready
- [ ] Content Security Policy (Add)
- [ ] Rate limiting (Add)
- [ ] Input validation (Add)

---

## 📈 Version Control

### Initialize Git (if not done)
```bash
cd frontend
git init
git add .
git commit -m "Initial frontend setup"
```

### Branches

- `main` - Production ready
- `develop` - Development branch
- `feature/*` - Feature branches

---

## ✅ Final Verification

Run all checks:

```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Verify dist folder created
ls -la dist/
```

All should complete without errors.

---

## 🎉 You're All Set!

Your frontend is ready for:
- ✅ Local development
- ✅ Feature development
- ✅ Testing
- ✅ Production deployment

**Start the dev server:**
```bash
npm run dev
```

**Access at:** http://localhost:3000

---

**Setup Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Ready for Development

---

**Happy Coding! ⚡**

# Frontend Architecture & Setup Guide

## 📋 Project Overview

**Pujana Electrical Frontend** is a modern, mobile-responsive inventory management system built with:
- ⚛️ **React 18** - Modern UI framework
- 🔷 **TypeScript** - Type-safe development
- ⚡ **Vite** - Lightning-fast build tool
- 🎨 **Bootstrap 5** - Responsive CSS framework
- 📦 **Zustand** - Lightweight state management
- 🔄 **Axios** - HTTP client with interceptors
- 🎯 **React Router v6** - Client-side routing

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│          React Application (Frontend)        │
├─────────────────────────────────────────────┤
│                    App.tsx                   │
│         (Main component & Router)            │
├──────────────────┬──────────────────────────┤
│   Components     │      Pages                │
│                  │                           │
│ • Layout/        │ • Dashboard              │
│   - Navbar       │ • Auth (Login/Register)  │
│   - Sidebar      │ • Inventory (Items)      │
│ • ProtectedRoute │ • Bills                  │
│                  │ • Alerts                 │
│                  │ • Settings               │
├──────────────────┴──────────────────────────┤
│              Shared Layer                    │
├──────────────────┬──────────────────────────┤
│   Services       │      Stores               │
│                  │                           │
│ • authService    │ • authStore              │
│ • itemService    │ • itemStore              │
│ • billService    │                          │
│ • alertService   │                          │
│ • categoryService│                          │
├──────────────────┴──────────────────────────┤
│         Utilities & Helpers                  │
├──────────────────┬──────────────────────────┤
│     Utils        │      Hooks                │
│                  │                           │
│ • helpers.ts     │ • useAuth()              │
│ • formatters     │ • useDebounce()          │
│ • validators     │ • useLocalStorage()      │
├──────────────────┴──────────────────────────┤
│         Types & Interfaces                   │
├──────────────────┬──────────────────────────┤
│ • user.ts        │ • item.ts                 │
│ • bill.ts        │ • alert.ts                │
│ • category.ts    │                           │
├─────────────────────────────────────────────┤
│         API Layer (Axios Client)             │
├─────────────────────────────────────────────┤
│         FastAPI Backend (Port 8000)          │
└─────────────────────────────────────────────┘
```

---

## 📁 Detailed Directory Structure

```
frontend/
│
├── src/
│   ├── components/              # Reusable Components
│   │   ├── Layout/
│   │   │   ├── Navbar.tsx      # Top navigation bar
│   │   │   ├── Navbar.css      # Navbar styling
│   │   │   ├── Sidebar.tsx     # Side navigation
│   │   │   └── Sidebar.css     # Sidebar styling
│   │   └── ProtectedRoute.tsx  # Auth-protected routes
│   │
│   ├── pages/                  # Page Components
│   │   ├── Auth/
│   │   │   ├── Login.tsx       # Login page
│   │   │   ├── Register.tsx    # Registration page
│   │   │   └── Auth.css        # Auth pages styling
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Dashboard.css       # Dashboard styling
│   │   ├── Inventory/
│   │   │   ├── Items.tsx       # Items list & management
│   │   │   ├── ItemDetail.tsx  # Single item detail
│   │   │   └── Categories.tsx  # Categories management
│   │   ├── Bill/
│   │   │   ├── Bills.tsx       # Bills list
│   │   │   └── BillCreate.tsx  # Create bill
│   │   ├── Alerts/
│   │   │   └── Alerts.tsx      # Low stock alerts
│   │   ├── Settings.tsx        # User settings
│   │   └── NotFound.tsx        # 404 page
│   │
│   ├── services/               # API Services
│   │   ├── api.ts              # Axios client with interceptors
│   │   ├── authService.ts      # Auth API calls
│   │   ├── itemService.ts      # Item API calls
│   │   ├── categoryService.ts  # Category API calls
│   │   ├── billService.ts      # Bill API calls
│   │   └── alertService.ts     # Alert API calls
│   │
│   ├── stores/                 # Global State (Zustand)
│   │   ├── authStore.ts        # Auth state
│   │   └── itemStore.ts        # Items state
│   │
│   ├── types/                  # TypeScript Types
│   │   ├── user.ts             # User interfaces
│   │   ├── item.ts             # Item interfaces
│   │   ├── category.ts         # Category interfaces
│   │   ├── bill.ts             # Bill interfaces
│   │   └── alert.ts            # Alert interfaces
│   │
│   ├── hooks/                  # Custom Hooks
│   │   └── index.ts            # useAuth, useDebounce, useLocalStorage
│   │
│   ├── utils/                  # Helper Functions
│   │   └── helpers.ts          # Formatters, validators, utilities
│   │
│   ├── styles/                 # Global Styles
│   │   └── global.css          # Global CSS and animations
│   │
│   ├── App.tsx                 # Main App component with routing
│   └── main.tsx                # React DOM entry point
│
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript config for Node
├── vite.config.ts              # Vite build configuration
├── eslint.config.js            # ESLint configuration
├── .env.local                  # Local environment variables
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── QUICK_START.md              # Quick start guide
└── ARCHITECTURE.md             # This file
```

---

## 🔌 API Integration

### Service Layer Pattern

Each service file handles API calls for a specific domain:

```typescript
// Example: itemService.ts
export const itemService = {
  async getAll(): Promise<Item[]> { ... },
  async getById(id: number): Promise<Item> { ... },
  async create(itemData: ItemCreate): Promise<Item> { ... },
  async update(id: number, itemData: ItemUpdate): Promise<Item> { ... },
  async delete(id: number): Promise<void> { ... },
};
```

### Axios Interceptors

The API client (`api.ts`) includes:
- ✅ **Request interceptor**: Adds JWT token to headers
- ✅ **Response interceptor**: Handles 401 errors and redirects to login

---

## 🎯 State Management with Zustand

### Auth Store Example

```typescript
const { user, isAuthenticated, login, logout } = useAuthStore();
```

### Item Store Example

```typescript
const { items, fetchItems, addItem } = useItemStore();
```

### Store Structure

- **Minimal boilerplate**: No reducers or actions folders
- **TypeScript support**: Fully typed store actions
- **Devtools integration**: Easy debugging
- **Performance**: Only re-renders when subscribed data changes

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Login     │
│   Page      │
└──────┬──────┘
       │ User enters credentials
       ▼
┌──────────────────┐
│ Validate Input   │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────┐
│ Call authService.login()     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ POST /users/login            │
│ Returns: { access_token }    │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Save token to localStorage   │
│ Update authStore             │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Redirect to /                │
│ (Protected Route Guard)      │
└──────────────────────────────┘

Token is automatically added to
all subsequent API requests
via Axios interceptor
```

---

## 📱 Responsive Design System

### Breakpoints (Bootstrap 5)

| Device | Width | Breakpoint |
|--------|-------|-----------|
| Mobile | < 576px | `xs` (default) |
| Mobile | 576px - 767px | `sm` |
| Tablet | 768px - 991px | `md` |
| Tablet | 992px - 1199px | `lg` |
| Desktop | ≥ 1200px | `xl` |

### Mobile-First Approach

- Base CSS applies to all devices
- Use `@media (min-width: ...)` for larger screens
- Bootstrap grid system: `Col xs={12} md={6} lg={4}`

### Example Implementation

```tsx
<Row className="g-3">
  <Col xs={12} sm={6} lg={3}>
    {/* Full width on mobile, 2 cols on tablet, 4 cols on desktop */}
  </Col>
</Row>
```

---

## 🛣️ Routing Structure

```
/
├── /login                      [Public]
├── /register                   [Public]
├── /                           [Protected] Dashboard
├── /items                      [Protected] Items list
├── /items/:id                  [Protected] Item detail
├── /categories                 [Protected] Categories
├── /bills                      [Protected] Bills list
├── /bills/create/:type         [Protected] Create bill
├── /alerts                     [Protected] Alerts
├── /settings                   [Protected] Settings
├── /not-found                  [Public] 404
└── *                          [Catch-all] → /not-found
```

---

## 💾 Data Flow Example

### Getting All Items

```
1. Component mounts
   ↓
2. useEffect calls useItemStore.fetchItems()
   ↓
3. itemStore calls itemService.getAll()
   ↓
4. itemService makes GET request via axios
   ↓
5. Axios interceptor adds token to header
   ↓
6. Backend returns items array
   ↓
7. itemStore updates state
   ↓
8. Component re-renders with new items
```

---

## 🎨 Styling Strategy

### Global Styles (`styles/global.css`)

- CSS custom properties (variables)
- Base element styles
- Utility classes
- Animations and keyframes

### Component Styles

- CSS modules or BEM naming
- Scoped to component
- Responsive media queries

### Bootstrap Usage

- Utility classes for layout
- Grid system for responsiveness
- Pre-built components
- Custom CSS for brand colors

---

## 🚀 Performance Optimizations

1. **Code Splitting**: React Router lazy loads pages
2. **State Management**: Zustand only re-renders affected components
3. **API Caching**: Store items in state, avoid duplicate requests
4. **Debouncing**: Search inputs use debounced calls
5. **Production Build**: Minified bundle with Vite

---

## 🔍 Type Safety

### Type Definitions

All API responses have TypeScript interfaces:

```typescript
export interface Item {
  id: number;
  name: string;
  quantity: number;
  category: Category;
  created_at: string;
}
```

### Benefits

- ✅ IDE autocomplete
- ✅ Compile-time error checking
- ✅ Self-documenting code
- ✅ Refactoring safety

---

## 📦 Dependencies Breakdown

| Package | Purpose | Size |
|---------|---------|------|
| react | UI library | 42kb |
| react-dom | React DOM renderer | 39kb |
| react-router-dom | Client routing | 70kb |
| bootstrap | CSS framework | 160kb |
| react-bootstrap | React components | 70kb |
| axios | HTTP client | 13kb |
| zustand | State management | 2kb |
| react-toastify | Notifications | 50kb |
| react-icons | Icon library | 360kb |

**Total (minified)**: ~800kb

---

## 🔄 Development Workflow

### Adding a New Feature

1. **Create types** in `src/types/`
2. **Create service** in `src/services/`
3. **Create store** in `src/stores/` (if needed)
4. **Create pages** in `src/pages/`
5. **Create components** in `src/components/`
6. **Add routing** in `App.tsx`
7. **Add styling** with CSS files

### Example: Adding Item Management

```
1. types/item.ts       - Define Item interface
2. services/itemService.ts - API calls
3. stores/itemStore.ts - State management
4. pages/Inventory/Items.tsx - List page
5. App.tsx            - Add route
```

---

## 🧪 Testing Setup (Recommended)

Add testing libraries:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

---

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 🔒 Security Considerations

✅ **Implemented**:
- JWT token management
- HTTPS-ready
- XSS protection via React
- CSRF tokens in forms

⚠️ **To Add**:
- Helmet for security headers
- Rate limiting
- Input sanitization
- Content Security Policy

---

## 📈 Future Enhancements

- [ ] Advanced filtering and search
- [ ] PDF bill generation
- [ ] Charts and analytics
- [ ] Export to Excel/CSV
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Offline mode with Service Workers
- [ ] Real-time updates with WebSockets
- [ ] User role-based access control
- [ ] Audit logs

---

## 🐛 Debugging

### Chrome DevTools

1. **React DevTools**: Inspect component tree
2. **Redux DevTools**: Monitor state changes
3. **Network Tab**: View API calls
4. **Console**: Check for errors

### Local Storage

```javascript
// In browser console
localStorage.getItem('access_token')
localStorage.removeItem('access_token')
```

---

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com/)

---

## 🤝 Contributing Guidelines

1. Follow existing code style
2. Write TypeScript for type safety
3. Use meaningful component names
4. Add comments for complex logic
5. Test responsive design
6. Update this documentation

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active Development

---

**Happy Coding! ⚡**

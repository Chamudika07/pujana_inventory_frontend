# Pujana Electrical - Frontend

A modern, mobile-responsive inventory management system built with React, TypeScript, and Bootstrap.

## 🚀 Features

- **Authentication**: User login and registration with JWT token management
- **Dashboard**: Real-time inventory overview with statistics
- **Inventory Management**: View, create, and manage items and categories
- **Bill Management**: Create and track buy/sell bills
- **Low Stock Alerts**: Automatic notifications for low inventory levels
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Modern UI**: Bootstrap 5 with custom styling and animations
- **Type Safety**: Full TypeScript support for better development experience
- **State Management**: Zustand for efficient state management
- **API Integration**: Axios with interceptors for seamless backend communication

## 📋 Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Backend API running on `http://localhost:8000`

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env.local
```

3. **Configure API URL** (if backend is on different host):
```env
VITE_API_URL=http://your-backend-url:8000
```

## 🚀 Running the Application

**Development mode:**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

**Production build:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Type checking:**
```bash
npm run type-check
```

**Linting:**
```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout/         # Navigation & Sidebar
│   │   └── ProtectedRoute/ # Auth protection
│   ├── pages/              # Page components
│   │   ├── Auth/          # Login/Register
│   │   ├── Inventory/     # Items/Categories
│   │   ├── Bill/          # Bill management
│   │   └── Alerts/        # Alert management
│   ├── services/           # API services
│   ├── stores/             # Zustand stores (state management)
│   ├── types/              # TypeScript type definitions
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── styles/             # Global styles
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── README.md               # This file
```

## 🎨 UI Components Used

- **Bootstrap 5**: CSS framework for responsive design
- **React Bootstrap**: Bootstrap components for React
- **React Icons**: Icon library (Feather icons)
- **React Toastify**: Toast notifications
- **Recharts**: Chart library (for future analytics)

## 🔐 Authentication

The app uses JWT tokens for authentication:
- Token is stored in `localStorage` as `access_token`
- Protected routes require valid token
- Auto-redirect to login on 401 response
- Axios interceptors handle token injection

## 🛣️ Available Routes

### Public Routes
- `/login` - User login
- `/register` - User registration

### Protected Routes
- `/` - Dashboard
- `/items` - Items management
- `/items/:id` - Item detail
- `/categories` - Categories management
- `/bills` - Bills list
- `/bills/create/:type` - Create bill (buy/sell)
- `/alerts` - Low stock alerts
- `/settings` - Account settings

## 🔄 API Integration

All API calls are made through service files in `src/services/`:

- **authService**: Authentication endpoints
- **itemService**: Item CRUD operations
- **categoryService**: Category management
- **billService**: Bill operations
- **alertService**: Alert management

Example:
```typescript
import { itemService } from '@services/itemService';

const items = await itemService.getAll();
const item = await itemService.getById(1);
```

## 🎯 State Management

Using Zustand for global state:

```typescript
import { useAuthStore } from '@stores/authStore';
import { useItemStore } from '@stores/itemStore';

const { isAuthenticated, login } = useAuthStore();
const { items, fetchItems } = useItemStore();
```

## 📱 Responsive Design

The application is fully responsive:
- **Mobile** (< 576px): Full mobile-optimized layout
- **Tablet** (576px - 768px): Adaptive layout
- **Desktop** (> 768px): Full-featured layout

## 🚀 Performance Optimization

- Code splitting with React Router
- Lazy loading for pages
- Debounced search inputs
- Efficient state updates with Zustand
- Optimized API calls with caching strategies

## 🐛 Troubleshooting

### Backend connection issues
- Ensure backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

### Build errors
```bash
npm run type-check
npm run lint
```

### Development server issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

## 📦 Build & Deployment

### Build for production:
```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify:
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🔧 Environment Variables

Create `.env.local` file with:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Optional: API Timeout
VITE_API_TIMEOUT=30000

# Optional: Debug Mode
VITE_DEBUG=false
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Bootstrap Documentation](https://getbootstrap.com)
- [Vite Documentation](https://vitejs.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Submit pull request

## 📄 License

This project is part of Pujana Electrical Inventory System.

## 🤝 Support

For issues and questions, please contact the development team.

---

**Happy Coding! ⚡**

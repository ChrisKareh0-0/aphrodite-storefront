# Aphrodite Storefront - Deployment Guide

This is the customer-facing e-commerce storefront built with Next.js 15.

## 🚀 Quick Deploy to Vercel (Recommended)

### One-Click Deploy

1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Go to Vercel**: https://vercel.com
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure**:
   - Framework Preset: **Next.js**
   - Root Directory: **`./`** (or leave empty)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
6. **Add Environment Variable**:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
   ```
7. **Click "Deploy"**

That's it! Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to global CDN
- Give you a URL like `https://your-project.vercel.app`

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `www.aphrodite.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

## 🔐 Environment Variables

### Required

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
```

**Important**: 
- Must start with `NEXT_PUBLIC_` to be accessible in browser
- Use `https://` for production backend URL
- No trailing slash

### How to Update in Vercel

1. Go to Project Settings → Environment Variables
2. Add/Edit variables
3. Redeploy (or auto-deploys on next push)

## 🏗️ Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
aphrodite-storefront/
├── src/
│   └── app/
│       ├── api/            # API route handlers (proxy to backend)
│       ├── components/     # React components
│       ├── context/        # React context (Cart, etc.)
│       ├── cart/          # Cart page
│       ├── checkout/      # Checkout page
│       ├── products/      # Products listing
│       ├── product/[id]/  # Product details
│       └── order-confirmation/ # Order confirmation
├── public/                # Static files
├── next.config.ts         # Next.js configuration
├── package.json
└── .env.local            # Environment variables (local)
```

## 🔗 Pages

- **Home**: `/` - Landing page with hero, collections, featured products
- **Products**: `/products` - All products with filtering
- **Product Details**: `/product/[slug]` - Individual product page
- **Cart**: `/cart` - Shopping cart
- **Checkout**: `/checkout` - Checkout form
- **Order Confirmation**: `/order-confirmation/[orderNumber]` - Order success page

## 🎨 Features

- Server-side rendering (SSR) for SEO
- Image optimization with Next.js Image
- Shopping cart with localStorage persistence
- Real-time product filtering
- Responsive design (mobile, tablet, desktop)
- Order creation and confirmation

## 🔄 Continuous Deployment

Vercel automatically deploys when you:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments
- Open pull requests → Preview for each PR

## 🧪 Testing Before Deploy

```bash
# Build production version locally
npm run build

# Test production build
npm start

# Open http://localhost:3000
```

## 📊 Post-Deployment Checklist

- [ ] Test homepage loads
- [ ] Test products page shows items
- [ ] Test add to cart functionality
- [ ] Test checkout and order creation
- [ ] Test on mobile devices
- [ ] Test all images load correctly
- [ ] Check browser console for errors
- [ ] Verify backend API calls work

## 🐛 Troubleshooting

### Products Not Loading
- Check `NEXT_PUBLIC_BACKEND_URL` is correct
- Verify backend is running and accessible
- Check browser console for CORS errors
- Ensure backend has frontend URL in CORS config

### Images Not Loading
- Check backend URL in `next.config.ts`
- Verify image URLs from backend are correct
- Check Next.js Image configuration

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### API Routes Not Working
- Ensure `NEXT_PUBLIC_BACKEND_URL` is set
- Check API route files in `src/app/api/`
- Verify backend endpoints are accessible

## 💰 Cost

### Vercel Pricing
- **Hobby (Free)**: Perfect for personal projects
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic SSL
  - **Cost: $0/month**

- **Pro**: For production sites
  - Unlimited bandwidth
  - Advanced analytics
  - Team collaboration
  - **Cost: $20/month**

## 🚀 Performance Optimization

Vercel automatically provides:
- Global CDN (Edge Network)
- Image optimization
- Code splitting
- Automatic caching
- Gzip/Brotli compression

## 🔒 Security

- All traffic over HTTPS
- Environment variables encrypted
- Preview deployments are public (no sensitive data)
- Production uses environment variables

## 📈 Analytics (Optional)

Enable Vercel Analytics:
1. Go to Project → Analytics tab
2. Enable Web Analytics
3. Add to your app:
```bash
npm install @vercel/analytics
```

## 🆘 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Issues**: Create an issue in this repository

## 🔗 Connect Backend

Make sure your backend is deployed first and add the URL to Vercel:

1. Deploy backend to Railway/Render
2. Get backend URL (e.g., `https://aphrodite-backend.railway.app`)
3. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://aphrodite-backend.railway.app
   ```
4. Redeploy frontend

## 📝 Deployment Commands

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from command line
vercel

# Deploy to production
vercel --prod
```

## 🎯 Production Checklist

Before going live:
- [ ] Backend deployed and tested
- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] Environment variables set correctly
- [ ] SSL certificate active (automatic)
- [ ] Test order creation end-to-end
- [ ] Check all images load
- [ ] Test on multiple devices
- [ ] Monitor for errors in first 24 hours


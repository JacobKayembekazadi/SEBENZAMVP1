# 🏛️ Sebenza System - Advocate Operations Hub

<div align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.0+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License">
</div>

<p align="center">
  <strong>A modern, comprehensive law firm management platform that empowers legal teams to streamline operations, manage clients, and drive business growth.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-support">Support</a>
</p>

---

## 🌟 Overview

Sebenza System is a full-featured law firm management platform built with modern web technologies. It provides a comprehensive suite of tools for legal professionals to manage their practice efficiently, from client intake to case resolution and financial management.

### 🎯 Key Benefits

- **Increased Efficiency**: Streamline workflows and reduce administrative overhead
- **Better Client Service**: Provide clients with transparency and self-service capabilities
- **Financial Control**: Track time, expenses, and revenue with detailed analytics
- **Secure & Compliant**: Built with legal industry security standards in mind
- **Scalable**: Grows with your practice from solo practitioners to large firms

## ✨ Features

### 👥 Client Management
- **Complete Client Database**: Store contact information, case history, and communication logs
- **Client Portal**: Secure client access to case updates, documents, and invoices
- **Communication Tracking**: Log all client interactions and communications
- **Client Analytics**: Track client profitability and engagement metrics

### ⚖️ Case Management
- **Full Case Lifecycle**: From intake to resolution with milestone tracking
- **Task Management**: Assign tasks, set deadlines, and track progress
- **Document Association**: Link documents directly to cases and clients
- **Court Calendar Integration**: Track court dates and deadlines

### 📄 Document Management
- **Secure Upload & Storage**: Version control and secure document storage
- **Advanced Search**: Find documents quickly with powerful filtering
- **Access Control**: Role-based permissions for document access
- **Client Sharing**: Securely share documents with clients

### 📅 Calendar & Scheduling
- **Integrated Calendar**: Manage appointments, court dates, and deadlines
- **Automated Reminders**: Email and SMS reminders for important dates
- **Resource Booking**: Schedule conference rooms and equipment
- **Calendar Sync**: Integration with popular calendar applications

### ⏰ Time Tracking & Billing
- **Precise Time Tracking**: Track billable hours with detailed timesheets
- **Automated Invoicing**: Generate professional invoices with custom templates
- **Payment Processing**: Integrated payment gateway support
- **Expense Management**: Track and categorize business expenses

### 📊 Analytics & Reporting
- **Financial Dashboards**: Revenue, profitability, and cash flow analysis
- **Case Performance**: Track case outcomes and attorney performance
- **Client Analytics**: Client acquisition and retention metrics
- **Custom Reports**: Generate detailed reports for stakeholders

### 🛡️ Security & Compliance
- **Role-Based Access Control**: Granular permissions for different user types
- **Data Encryption**: End-to-end encryption for sensitive data
- **Audit Trails**: Complete activity logging for compliance
- **Regular Backups**: Automated data backup and recovery

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JacobKayembekazadi/SEBENZAMVP1.git
   cd advocate-ops-hub
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

5. **Start the development servers**
   
   **Frontend** (Terminal 1):
   ```bash
   npm run dev
   ```
   
   **Backend** (Terminal 2):
   ```bash
   cd backend
   npm start
   ```

6. **Access the application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001](http://localhost:3001)

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components
- **Vite** - Fast build tool and development server
- **React Query** - Data fetching and state management
- **React Hook Form** - Performant forms with validation
- **Recharts** - Composable charting library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite** - Lightweight, serverless database
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## 📁 Project Structure

```
advocate-ops-hub/
├── 📁 backend/                 # Node.js API server
│   ├── 📁 api/routes/         # API route handlers
│   ├── 📁 database/           # Database schema and migrations
│   ├── 📁 lib/                # Utility functions and middleware
│   ├── 📁 middleware/         # Express middleware
│   └── 📄 server.js           # Main server file
├── 📁 src/                    # React frontend application
│   ├── 📁 components/         # Reusable UI components
│   │   ├── 📁 auth/          # Authentication components
│   │   ├── 📁 cases/         # Case management components
│   │   ├── 📁 clients/       # Client management components
│   │   ├── 📁 dashboard/     # Dashboard components
│   │   ├── 📁 documents/     # Document management components
│   │   ├── 📁 invoices/      # Billing components
│   │   └── 📁 ui/            # Base UI components
│   ├── 📁 hooks/              # Custom React hooks
│   ├── 📁 lib/                # Utility functions and API
│   ├── 📁 pages/              # Main application pages
│   └── 📄 main.tsx            # Application entry point
├── 📁 public/                 # Static assets
├── 📄 package.json            # Frontend dependencies
├── 📄 tailwind.config.ts      # Tailwind CSS configuration
├── 📄 tsconfig.json           # TypeScript configuration
└── 📄 vite.config.ts          # Vite configuration
```

## 🎨 UI/UX Features

### Design System
- **Consistent Design Language**: Unified visual identity across all components
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support

### User Experience
- **Dialog-Driven Interface**: Modern modal-based interactions for CRUD operations
- **Progressive Loading**: Skeleton screens and loading states
- **Error Handling**: Graceful error messages and recovery options
- **Keyboard Navigation**: Full keyboard accessibility support

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Full user workflow testing with Cypress

## 🏗️ Building for Production

### Frontend Build
```bash
npm run build
```

### Backend Build
```bash
cd backend
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment

### Frontend Deployment
Deploy to any static hosting service:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **AWS S3**: Upload build files to S3 bucket
- **GitHub Pages**: Use GitHub Actions for automated deployment

### Backend Deployment
Deploy to any Node.js hosting service:
- **Heroku**: `git push heroku main`
- **Digital Ocean**: Use App Platform or Droplets
- **AWS**: Use EC2, Lambda, or Elastic Beanstalk
- **Railway**: Connect GitHub repository

### Environment Variables
Ensure these environment variables are set in production:
```bash
NODE_ENV=production
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
EMAIL_SERVICE_API_KEY=your_email_key
```

## 📚 Documentation

### API Documentation
- **Swagger UI**: Available at `/api-docs` when running the backend
- **Postman Collection**: Import the collection from `/docs/postman`

### User Guides
- **Admin Guide**: Complete setup and configuration guide
- **User Manual**: End-user documentation with screenshots
- **API Reference**: Detailed API endpoint documentation

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Getting Help
- **Documentation**: Check our comprehensive guides and API docs
- **GitHub Issues**: Report bugs and request features
- **Community**: Join our developer community discussions

### Contact Information
- **Email**: support@sebenza-system.com
- **Website**: [https://sebenza-system.com](https://sebenza-system.com)
- **Issues**: [GitHub Issues](https://github.com/JacobKayembekazadi/SEBENZAMVP1/issues)

### Professional Support
For enterprise customers, we offer:
- **Priority Support**: 24/7 technical support
- **Custom Development**: Tailored features and integrations
- **Training**: On-site and remote training sessions
- **Consulting**: Implementation and optimization services

---

<div align="center">
  <p><strong>Sebenza System</strong> – Empowering law firms with modern technology solutions.</p>
  <p>Made with ❤️ by the Sebenza Team</p>
  <p><em>Last Updated: January 2025</em></p>
</div>

#   U p d a t e d   0 5 / 2 9 / 2 0 2 5   0 1 : 5 6 : 5 7 
 
 


# Digital Evidence Framework Management (DEFM) - Frontend

A modern React-based frontend application for the Digital Evidence Framework Management system, designed for managing digital forensic evidence, chain of custody, and case management.

## Features

- **User Authentication**: Secure login with role-based access control
- **Dashboard**: Comprehensive overview with statistics and recent activities
- **Case Management**: Create, update, and track forensic cases
- **Evidence Management**: Upload, store, and catalog digital evidence
- **Chain of Custody**: Complete audit trail for evidence handling
- **Reporting**: Generate and download detailed reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## Technology Stack

- **Framework**: React 18
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Development**: Hot Module Replacement (HMR)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DEFM_Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Configuration

### Backend API Connection

The frontend is configured to connect to the DEFM backend API. Update the API base URL in your environment configuration:

- Development: `http://localhost:8000/api/v1`
- Production: Update according to your deployment

### Environment Variables

Create a `.env.local` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Digital Evidence Framework Management
```

## Default Users

The system comes with pre-configured users for testing:

- **admin/admin123** - System Administrator
- **manager/mgr123** - Manager (Ibrahim Isa)
- **investigator1/inv111** - Investigator (Solomon John)
- **investigator2/inv122** - Investigator (Ahmad Lawal)
- **investigator3/inv133** - Investigator (Mike Davis)

## Project Structure

```
DEFM_Frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useMobile.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Cases.jsx
│   │   ├── Evidence.jsx
│   │   ├── ChainOfCustody.jsx
│   │   └── Reports.jsx
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- Secure login system
- Role-based access control
- Session management
- Auto-logout on inactivity

### Dashboard
- Real-time statistics
- Recent activity feed
- Quick action buttons
- System status overview

### Case Management
- Create and manage cases
- Assign cases to investigators
- Track case status and priority
- Case timeline and history

### Evidence Management
- Upload digital evidence files
- Categorize by type (digital, physical, document, etc.)
- File integrity verification
- Evidence search and filtering

### Chain of Custody
- Complete audit trail
- Evidence transfer tracking
- Handler identification
- Location and time stamps

### Reports
- Generate case reports
- Export to PDF format
- Customizable report templates
- Evidence summaries

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact the development team or open an issue in the repository.

---

**Digital Evidence Framework Management (DEFM)**  
Professional Digital Forensics Case Management System
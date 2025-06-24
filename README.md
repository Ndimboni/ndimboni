# 🛡️ Ndimboni - Digital Scam Protection Platform

**Interactive Web and Mobile Platform to Combat Digital Scams in Rwanda Using Artificial Intelligence**

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.6-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.12.8-1890FF?style=for-the-badge&logo=antdesign)](https://ant.design/)

## 📖 About

Ndimboni is an AI-powered platform designed to combat digital scams in Rwanda by providing detection, reporting, and educational tools. This project is developed as a final year project by students from the University of Rwanda, College of Science and Technology.

### 🎯 Project Objectives

- **AI-Powered Detection**: Implement machine learning algorithms to detect and classify scams
- **User-Friendly Reporting**: Provide an intuitive interface for reporting and verifying scams
- **Educational Resources**: Offer comprehensive resources to raise awareness about digital scams
- **Real-Time Notifications**: Develop mechanisms to notify users of ongoing scam threats

## 👥 Development Team

| Name                        | Registration Number | Role           |
| --------------------------- | ------------------- | -------------- |
| **MUNEZERO BAGIRA Sostene** | 221000677           | Bakend Developer |
| **DUSHIME Gabriel**         | 221016855           | Frontend Developer   |

### 👨‍🏫 Supervisors

- **Dr. Richard MUSABE** - Supervisor
- **Mr. Placide MUCYO** - Co-Supervisor

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn**
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/GabrielDushime/Ndimboni-Digital-Scam-Protection
   cd ndimboni-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration values.

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: Javascript
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS
- **Icons**: Ant Design Icons
- **State Management**: Zustand (planned)
- **HTTP Client**: Axios
- **Date Handling**: Day.js

### Development Tools

- **Code Formatting**: Prettier (recommended)
- **Version Control**: Git

## 📁 Project Structure

```
frontend/
├── public/              # Static files
│   └── images/
├── src/
│   ├── Pages/
│   │   ├── index.js
│   │   ├── _app.js
│   │   └── _document
│   ├── components/      # Reusable components
│   ├── Layout/
│
├── .gitignore           # Git ignore rules
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── jsconfig.json        # Javascript configuration
backend/
├── .gitignore # Git ignore rules
├── eslint.config.mjs # ESLint configuration
├── package.json # Dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── tsconfig.build.json # TypeScript build configuration
├── .prettierrc # Prettier configuration
├── README.md # Backend documentation
└── src/
├── main.ts # Application entry point
├── app.module.ts # Root module
├── app.controller.ts # Main controller
├── app.controller.spec.ts # Controller tests
└── app.service.ts # Main service

```

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Runtime**: Node.js
- **Package Manager**: npm/yarn
- **Testing**: Jest (built-in)
- **Code Quality**: ESLint + Prettier
```

## 🎨 Design System

### Color Palette

- **Primary Blue**: `##2980B9`
- **Secondary Blue**: `#1A5276`
- **Accent Blue**: `#AED6F1`
- **Background**: `#EBF5FB` (Orange)
- **Gradient**: `linear-gradient(135deg, #2980B9, #1A5276);`

### Typography

- **Font Family**: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
- **Weights**: 300, 400, 500, 600, 700

## 📜 Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp API (for reporting)
NEXT_PUBLIC_WHATSAPP_API_URL=

# Analytics (optional)
NEXT_PUBLIC_GA_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_DETECTION=true
NEXT_PUBLIC_ENABLE_REPORTING=true
```

### Ant Design Theme

The project uses a custom Ant Design theme configured in `src/app/layout.jsx`:

```javascript
const antdTheme = {
  token: {
    colorPrimary: "#2980B9",
    fontFamily: "Inter, sans-serif",
    borderRadius: 8,
  },
};
```

## 🚀 Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically on every push

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Vercel**
- **AWS Amplify**
- **DigitalOcean App Platform**
- **Railway**

## 🧪 Testing

Testing setup is planned for future iterations:

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Component Tests**: Storybook

## 📱 Mobile Support

The application is built with responsive design principles and will support:

- **Progressive Web App (PWA)** features
- **Mobile-first** responsive design
- **Touch-friendly** interactions
- **Offline** capabilities (planned)

## 🔐 Security Features

- **Content Security Policy** headers
- **XSS Protection**
- **CSRF Protection**
- **Secure Headers** configuration
- **Input Validation** and sanitization

## 🤝 Contributing

This is an academic project, but contributions and suggestions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for academic purposes as part of a final year project at the University of Rwanda, College of Science and Technology.

## 📞 Contact

- **MUNEZERO BAGIRA Sostene** - [GitHub Profile](https://github.com/munezerobagirasostene)
- **DUSHIME Gabriel** - [GitHub Profile](https://github.com/GabrielDushime)

**Project Link**: [https://github.com/GabrielDushime/Ndimboni-Digital-Scam-Protection](https://github.com/GabrielDushime/Ndimboni-Digital-Scam-Protection)

---

## 🙏 Acknowledgments

- **University of Rwanda** - College of Science and Technology
- **Dr. Richard MUSABE** - Project Supervisor
- **Mr. Placide MUCYO** - Co-Supervisor
- **Ant Design Team** - For the excellent UI library
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework

---

<div align="center">
  <p><strong>Made with ❤️ for Rwanda's Digital Security</strong></p>
  <p><em>University of Rwanda - College of Science and Technology</em></p>
  <p><em>Academic Year 2024-2025</em></p>
</div>

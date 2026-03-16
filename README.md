# Paulo Brocco — Portfolio & AI Services

This project is a modern, interactive portfolio and AI services website for Paulo Brocco, Full Stack Engineer. It showcases professional experience, technical skills, and offers AI-powered solutions, all built with a focus on performance, accessibility, and clean code.

## 🛠️ Technologies Used

- **HTML5** & **Semantic Markup**
- **Tailwind CSS** (via CDN) for rapid, utility-first styling
- **Vanilla JavaScript** for all interactivity
- **Font Awesome** for icons
- **Google Fonts (Inter)** for typography
- **Node.js** (API endpoints for chat/newsletter)
- **@google/generative-ai** (Gemini Pro API)
- **Resend** (Transactional email API)
- **Vercel** (serverless deployment & API routing)

---

## 📂 Project Structure / Site Map

Here is an overview of the project's directory structure and the purpose of each file:

```text
.
├── api/                        # Serverless API endpoints (Vercel)
│   ├── chat.js                 # API endpoint for the AI Chat (Gemini Pro)
│   └── newsletter.js           # API endpoint for Newsletter subscriptions (Resend)
├── assets/                     # Static assets (images, etc.)
├── css/                        # Stylesheets
│   └── style.css               # Main custom stylesheet for the portfolio
├── js/                         # JavaScript files for interactivity and animations
│   ├── animations.js           # Custom animations logic
│   ├── explosion.js            # Specific explosion effects
│   └── script.js               # Main functionality, matrix rain, chat, and UI interactions
├── .env.example                # Example environment variables file
├── .gitignore                  # Git ignore rules
├── Paulo Brocco — Full Stack Engineer.pdf # Downloadable resume/CV
├── README.md                   # Project documentation and site map
├── digital-service.html        # Services & Pricing page
├── index.html                  # Main Portfolio landing page
├── package-lock.json           # NPM dependency lockfile
├── package.json                # NPM configuration and dependencies
└── vercel.json                 # Vercel deployment configuration
```

## 🚀 Key Pages

- **[index.html](./index.html)**: The main entry point. Showcases about me, skills, projects, experience, education, and contact information. Also features an interactive AI chatbot and newsletter subscription.
- **[digital-service.html](./digital-service.html)**: A dedicated page highlighting full-stack development and AI services offered, complete with pricing plans and client testimonials.

---

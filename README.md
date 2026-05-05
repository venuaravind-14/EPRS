# 💼 Employee Performance Review System (RevX)

RevX is a robust, full-stack performance management platform designed to streamline organizational evaluations, goal tracking, and team collaboration. Built with the **MERN Stack**, it offers a premium user experience tailored for modern workplaces.

## 🚀 Vision
To empower organizations with data-driven insights, ensuring every employee has clear goals, actionable feedback, and a pathway to growth.

## ✨ Key Modules
- **🎯 Strategic Goal Management**: Set high-level objectives and track their completion across departments.
- **🗂 Precision Task Alignment**: Break goals into actionable tasks assigned to specific team members.
- **📊 Advanced Analytics**: Visual dashboards for HR and Managers to monitor performance metrics in real-time.
- **📝 Multi-level Reviews**: Comprehensive feedback loops including self-assessments and peer reviews.
- **👥 Role-Specific Dashboards**: Tailored experiences for HR Admins, Managers, and Employees.

## 🛠 Tech Stack
- **Frontend**: Next.js, Material UI, NextAuth.js, Recharts, Framer Motion.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose.
- **Security**: JWT-based session management, Bcrypt hashing.

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Atlas or Local instance)
- npm or yarn

### 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd Employee-Performance-Review-System
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```
   - Create a `.env` file in the `Backend` directory.
   - Copy the contents from `.env.example` and fill in your credentials:
     ```env
     PORT=5101
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     MAIL_USER=your_email@gmail.com
     MAIL_PASS=your_email_app_password
     FRONTEND_URL=http://localhost:3000
     ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```
   - Create a `.env.local` file in the `Frontend` directory.
   - Copy the contents from `.env.example` and fill in your credentials:
     ```env
     NEXT_PUBLIC_BACKEND_URL=http://localhost:5101
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=your_nextauth_secret_key
     ```

### 🚀 Running the Application

1. **Start the Backend**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

---

## 🔒 Security Note
**Important:** Never commit your `.env` or `.env.local` files to version control. These files are already included in the `.gitignore` to prevent sensitive credentials from being leaked. Use the provided `.env.example` files as templates for your environment configuration.
# TourisMe

A full-stack tourism platform for exploring Egypt, built with the MERN stack. Discover attractions, book local services, plan trips with an AI-powered chatbot, and manage your travel — all in one place.

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-9.5-47A248?style=flat&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)

## Features

- **User Authentication** — Secure signup & login with JWT-based authentication and role selection (Tourist, Business Owner, Admin)
- **Attraction Discovery** — Browse, search, and filter Egyptian attractions by category, rating, and proximity
- **Service Marketplace** — Local business owners list services (tours, transport, accommodation) for tourists to explore and book
- **Booking System** — End-to-end booking flow with status tracking, confirmation, and cancellation
- **AI Trip Planner** — Intelligent chatbot powered by Groq (Llama 3.3) that builds personalized Egypt itineraries with pricing
- **Reviews & Ratings** — Star-based review system for attractions and services
- **Advertisements** — Business owners can create promotional ads with impression/click tracking and promo codes
- **Trip Planning** — Drag-and-drop itinerary builder with day-by-day planning, reordering, and export
- **Notifications** — Real-time notification system for bookings, reviews, and system events
- **Admin Dashboard** — Full platform management: user moderation, content approval, analytics, and system stats
- **Vendor Dashboard** — Business analytics, booking management, and service CRUD for local business owners
- **Tourist Dashboard** — Personalized travel hub with favorites, bookings, and trip history
- **Email Notifications** — Transactional emails via Nodemailer for booking confirmations and updates
- **Image Uploads** — Cloudinary-powered image management for services, attractions, and ads
- **Responsive Design** — Modern, animated UI built with React, Tailwind CSS, Framer Motion, and GSAP

## Tech Stack

### Frontend

- **React 18** — UI library
- **Vite** — Build tool and dev server
- **React Router 7** — Client-side routing
- **Tailwind CSS** — Utility-first CSS framework
- **Framer Motion** — Declarative animations
- **GSAP** — High-performance timeline animations
- **Lenis** — Smooth scroll library
- **Axios** — HTTP client
- **React Hook Form** — Form state management
- **Zod** — Schema validation
- **Lucide React** — Icon library
- **React Markdown** — Markdown rendering for chatbot responses
- **DOMPurify** — HTML sanitization

### Backend

- **Node.js** — Runtime environment
- **Express 5** — Web framework
- **MongoDB** — NoSQL database
- **Mongoose 9** — ODM for MongoDB
- **JWT** — Authentication tokens
- **bcryptjs** — Password hashing
- **Cloudinary** — Image upload and storage
- **Multer** — Multipart file handling
- **Groq SDK** — AI chatbot (Llama 3.3 70B)
- **Nodemailer** — Email delivery
- **CORS** — Cross-origin resource sharing
- **Cookie Parser** — Cookie-based auth support

## Project Structure

```
TourisMe/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── adsController.js
│   │   ├── attractionController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── notificationController.js
│   │   ├── reviewController.js
│   │   ├── serviceController.js
│   │   ├── tripPlanController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── ads.model.js
│   │   ├── attraction.model.js
│   │   ├── booking.model.js
│   │   ├── chatSession.model.js
│   │   ├── notification.model.js
│   │   ├── reviews.model.js
│   │   ├── service.model.js
│   │   ├── tripPlans.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── ads.routes.js
│   │   ├── attraction.routes.js
│   │   ├── authRoutes.js
│   │   ├── booking.routes.js
│   │   ├── chat.routes.js
│   │   ├── notification.routes.js
│   │   ├── review.routes.js
│   │   ├── service.routes.js
│   │   ├── tripPlan.routes.js
│   │   └── user.routes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── utils/
│   │   ├── notificationHelper.js
│   │   └── sendEmail.js
│   ├── env.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── assets/
│   │   │   └── logo.png
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AdminRoute.jsx
│   │   │   │   ├── DashboardRedirect.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── RoleBasedRoute.jsx
│   │   │   │   ├── RoleSelection.jsx
│   │   │   │   ├── TouristOnlyRoute.jsx
│   │   │   │   ├── TouristOrGuestRoute.jsx
│   │   │   │   ├── TouristOrVendorRoute.jsx
│   │   │   │   └── VendorRoute.jsx
│   │   │   ├── chatbot/
│   │   │   │   ├── ChatMarkdown.jsx
│   │   │   │   ├── ChatbotButton.jsx
│   │   │   │   ├── ChatbotButton.css
│   │   │   │   └── ChatbotPage.jsx
│   │   │   ├── common/
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── DiscountBadge.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── NotificationBanner.jsx
│   │   │   │   ├── ReviewSection.jsx
│   │   │   │   └── StarRating.jsx
│   │   │   └── layout/
│   │   │       ├── Footer.jsx
│   │   │       └── Navbar.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatbotContext.jsx
│   │   ├── data/
│   │   │   ├── attractionsData.js
│   │   │   ├── servicesConfig.js
│   │   │   └── tourPrograms.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminAttractions.jsx
│   │   │   │   ├── AdminPrograms.jsx
│   │   │   │   ├── AdminServices.jsx
│   │   │   │   ├── AdminSettings.jsx
│   │   │   │   ├── AdminTrips.jsx
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── ProgramApprovals.jsx
│   │   │   │   ├── ReportsManagement.jsx
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── provider/
│   │   │   │   ├── AddProgram.jsx
│   │   │   │   ├── ManageBookings.jsx
│   │   │   │   ├── ProviderAnalytics.jsx
│   │   │   │   ├── ProviderReports.jsx
│   │   │   │   └── ProviderSettings.jsx
│   │   │   ├── tourist/
│   │   │   │   └── ReportIssue.jsx
│   │   │   ├── vendor/
│   │   │   │   ├── VendorBookings.jsx
│   │   │   │   ├── VendorDashboard.jsx
│   │   │   │   └── VendorServiceDetail.jsx
│   │   │   ├── About.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AttractionDetail.jsx
│   │   │   ├── Attractions.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ServiceDetail.jsx
│   │   │   ├── ServiceProviderDashboard.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── SignupServiceProvider.jsx
│   │   │   ├── SignupTourist.jsx
│   │   │   ├── SignupWrapper.jsx
│   │   │   ├── TourDetail.jsx
│   │   │   ├── TouristDashboard.jsx
│   │   │   ├── Tours.jsx
│   │   │   └── TripPlanner.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── attractionsService.js
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── chatbotService.js
│   │   │   ├── individualServicesService.js
│   │   │   ├── notificationService.js
│   │   │   ├── reviewsService.js
│   │   │   ├── tripPlannerService.js
│   │   │   ├── userService.js
│   │   │   └── vendorService.js
│   │   ├── utils/
│   │   │   ├── ActivityLogger.js
│   │   │   ├── BookingManager.js
│   │   │   ├── NotificationManager.js
│   │   │   ├── chatHistoryStorage.js
│   │   │   ├── security.js
│   │   │   └── validation.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── .gitignore
├── package-lock.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- **Cloudinary** account (for image uploads)
- **Groq** API key (for AI chatbot)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/zeroXmoRamadan/TourisMe.git
   cd TourisMe
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the `backend/` directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Groq (for AI chatbot)
   GROQ_API_KEY=your_groq_api_key

   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

### Running the Application

#### Development Mode

**Backend:**

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

**Frontend:**

```bash
cd frontend
npm run dev
```

Client runs on `http://localhost:5173`

#### Production Build

```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

### Authentication

| Method | Endpoint                | Description              | Access  |
| ------ | ----------------------- | ------------------------ | ------- |
| POST   | `/api/auth/signup/tourist` | Register as tourist     | Public  |
| POST   | `/api/auth/signup/owner`   | Register as business owner | Public  |
| POST   | `/api/auth/login`          | User login              | Public  |
| POST   | `/api/auth/logout`         | User logout             | Auth    |
| GET    | `/api/auth/profile`        | Get current user        | Auth    |

### Users

| Method | Endpoint                          | Description           | Access  |
| ------ | --------------------------------- | --------------------- | ------- |
| GET    | `/api/users/profile`              | Get user profile      | Auth    |
| PUT    | `/api/users/profile`              | Update profile        | Auth    |
| DELETE | `/api/users/profile`              | Delete account        | Auth    |
| PUT    | `/api/users/password`             | Change password       | Auth    |
| GET    | `/api/users/favorites`            | Get favorites         | Tourist |
| POST   | `/api/users/favorites/:attractionId` | Add to favorites   | Tourist |
| DELETE | `/api/users/favorites/:attractionId` | Remove favorite    | Tourist |

### Attractions

| Method | Endpoint                              | Description              | Access |
| ------ | ------------------------------------- | ------------------------ | ------ |
| GET    | `/api/attractions`                    | List all attractions     | Public |
| GET    | `/api/attractions/categories`         | Get categories           | Public |
| GET    | `/api/attractions/nearby`             | Get nearby attractions   | Public |
| GET    | `/api/attractions/top-rated`          | Get top rated            | Public |
| GET    | `/api/attractions/category/:category` | Filter by category       | Public |
| GET    | `/api/attractions/:id`               | Get single attraction    | Public |
| POST   | `/api/attractions`                    | Create attraction        | Admin  |
| PUT    | `/api/attractions/:id`               | Update attraction        | Admin  |
| DELETE | `/api/attractions/:id`               | Delete attraction        | Admin  |

### Services

| Method | Endpoint                              | Description             | Access       |
| ------ | ------------------------------------- | ----------------------- | ------------ |
| GET    | `/api/services`                       | List all services       | Public       |
| GET    | `/api/services/top-rated`             | Get top rated services  | Public       |
| GET    | `/api/services/type/:serviceType`     | Filter by type          | Public       |
| GET    | `/api/services/:id`                   | Get single service      | Public       |
| GET    | `/api/services/owner/my-services`     | Get owner's services    | Owner        |
| POST   | `/api/services`                       | Create service          | Owner/Admin  |
| PUT    | `/api/services/:id`                   | Update service          | Owner/Admin  |
| PUT    | `/api/services/:id/status`            | Update service status   | Admin        |
| DELETE | `/api/services/:id`                   | Delete service          | Owner/Admin  |

### Bookings

| Method | Endpoint                        | Description           | Access       |
| ------ | ------------------------------- | --------------------- | ------------ |
| GET    | `/api/bookings`                 | Get all bookings      | Auth         |
| POST   | `/api/bookings`                 | Create booking        | Tourist      |
| GET    | `/api/bookings/stats/overview`  | Booking statistics    | Owner/Admin  |
| GET    | `/api/bookings/:id`             | Get single booking    | Auth         |
| PUT    | `/api/bookings/:id`             | Update booking        | Tourist      |
| PUT    | `/api/bookings/:id/status`      | Update booking status | Auth         |
| DELETE | `/api/bookings/:id`             | Delete booking        | Tourist/Admin|

### Reviews

| Method | Endpoint                       | Description            | Access  |
| ------ | ------------------------------ | ---------------------- | ------- |
| GET    | `/api/reviews/target/:targetId`| Get reviews for target | Public  |
| POST   | `/api/reviews`                 | Create review          | Tourist |
| GET    | `/api/reviews/my-reviews`      | Get my reviews         | Tourist |
| GET    | `/api/reviews/check/:targetId` | Check if user reviewed | Auth    |
| PUT    | `/api/reviews/:id`             | Update review          | Auth    |
| DELETE | `/api/reviews/:id`             | Delete review          | Auth    |

### Advertisements

| Method | Endpoint                              | Description           | Access |
| ------ | ------------------------------------- | --------------------- | ------ |
| GET    | `/api/advertisements`                 | Get active ads        | Public |
| POST   | `/api/advertisements/validate-promo`  | Validate promo code   | Public |
| POST   | `/api/advertisements/:id/impression`  | Track impression      | Public |
| POST   | `/api/advertisements/:id/click`       | Track click           | Public |
| POST   | `/api/advertisements`                 | Create ad             | Owner  |
| GET    | `/api/advertisements/stats/my-ads`    | Get ad stats          | Owner  |
| PUT    | `/api/advertisements/:id`             | Update ad             | Owner  |
| PUT    | `/api/advertisements/:id/status`      | Approve/reject ad     | Admin  |
| GET    | `/api/advertisements/:id`             | Get ad details        | Auth   |
| DELETE | `/api/advertisements/:id`             | Delete ad             | Auth   |

### Trip Plans

| Method | Endpoint                             | Description             | Access  |
| ------ | ------------------------------------ | ----------------------- | ------- |
| GET    | `/api/trip-plans`                    | Get user's trip plans   | Tourist |
| POST   | `/api/trip-plans`                    | Create trip plan        | Tourist |
| GET    | `/api/trip-plans/stats`              | Get trip statistics     | Tourist |
| GET    | `/api/trip-plans/:id`                | Get single trip plan    | Tourist |
| PUT    | `/api/trip-plans/:id`                | Update trip plan        | Tourist |
| DELETE | `/api/trip-plans/:id`                | Delete trip plan        | Tourist |
| PUT    | `/api/trip-plans/:id/confirm`        | Confirm trip plan       | Tourist |
| GET    | `/api/trip-plans/:id/export`         | Export trip plan        | Tourist |
| POST   | `/api/trip-plans/:id/items`          | Add itinerary item      | Tourist |
| PUT    | `/api/trip-plans/:id/items/:itemId`  | Update itinerary item   | Tourist |
| DELETE | `/api/trip-plans/:id/items/:itemId`  | Remove itinerary item   | Tourist |
| PUT    | `/api/trip-plans/:id/reorder`        | Reorder itinerary       | Tourist |

### Notifications

| Method | Endpoint                         | Description              | Access |
| ------ | -------------------------------- | ------------------------ | ------ |
| GET    | `/api/notifications`             | Get all notifications    | Auth   |
| GET    | `/api/notifications/unread-count`| Get unread count         | Auth   |
| PUT    | `/api/notifications/read-all`    | Mark all as read         | Auth   |
| PUT    | `/api/notifications/:id/read`    | Mark one as read         | Auth   |
| DELETE | `/api/notifications/clear-read`  | Clear read notifications | Auth   |
| DELETE | `/api/notifications/:id`         | Delete notification      | Auth   |

### AI Chatbot

| Method | Endpoint              | Description            | Access |
| ------ | --------------------- | ---------------------- | ------ |
| POST   | `/api/chat`           | Send message to AI     | Public / Auth |
| GET    | `/api/chat/history`   | Load chat history      | Auth   |
| DELETE | `/api/chat/history`   | Clear chat history     | Auth   |

### Admin

| Method | Endpoint                       | Description             | Access |
| ------ | ------------------------------ | ----------------------- | ------ |
| GET    | `/api/admin/dashboard`         | Dashboard analytics     | Admin  |
| GET    | `/api/admin/stats`             | System statistics       | Admin  |
| GET    | `/api/admin/trips`             | All trip plans          | Admin  |
| GET    | `/api/admin/trips/stats`       | Trip statistics         | Admin  |
| DELETE | `/api/admin/trips/:id`         | Delete trip plan        | Admin  |
| GET    | `/api/admin/users`             | List all users          | Admin  |
| GET    | `/api/admin/users/:id`         | Get user details        | Admin  |
| PUT    | `/api/admin/users/:id`         | Update user             | Admin  |
| PATCH  | `/api/admin/users/:id/suspend` | Suspend/unsuspend user  | Admin  |
| DELETE | `/api/admin/users/:id`         | Delete user             | Admin  |

## User Roles

| Role                  | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| **Tourist**           | Browse attractions, book services, write reviews, plan trips, use AI chatbot |
| **LocalBusinessOwner**| List services, manage bookings, create ads, view analytics              |
| **Admin**             | Full platform control — user management, content moderation, system analytics |

## License

This project is open source and available under the [MIT License](LICENSE).

## Authors

**Omar Wahid**, **Mohamed Ramadan**

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/zeroXmoRamadan/TourisMe/issues).

---

Built with ❤️ using the MERN stack

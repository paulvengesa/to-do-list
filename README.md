# To-Do App

## Description
A modern cloud-based To-Do web application that allows users to manage daily tasks with secure authentication and real-time database synchronization using Firebase.

## Features
- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed
- Task due dates
- Filter: All / Active / Completed
- Sort by due date
- Cloud synchronization
- User authentication (Email + Password)
- Per-user private task lists
- Responsive modern UI
- Export tasks to PDF
- Export tasks to Excel (CSV)

## Technologies Used
- HTML
- CSS
- JavaScript
- Firebase Authentication
- Firebase Firestore

## Architecture
Frontend web application with Firebase backend:
- Firestore database stores tasks
- Authentication ensures each user only accesses their own data
- App works securely in browser

## Security
- Firestore rules restrict access to authenticated users only
- Each user can access only their own documents

## Future Improvements
- Google Sign-In
- Dark Mode
- Notifications / Reminders
- Task categories / labels
- Overdue task alerts
- Drag & drop task ordering

## Screenshots
(You can add screenshots here)

## Deployment
Can be deployed using:
- GitHub Pages
- Netlify
- Vercel

If deployed, remember to add your domain in Firebase Authentication → Authorized Domains.


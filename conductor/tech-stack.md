# Technology Stack: V-Vortex

## Frontend
*   **Library:** [React](https://react.dev/) (v19) - Used for building the component-based user interface.
*   **Build Tool:** [Vite](https://vitejs.dev/) - Provides a fast development environment and optimized builds.
*   **Routing:** [React Router](https://reactrouter.com/) (v7) - Handles navigation between pages (login, registration, dashboards).
*   **Styling:** Custom CSS - Adheres to the established "Vortex" visual identity.

## Backend (Supabase-Only)
*   **Platform:** [Supabase](https://supabase.com/) - Integrated backend-as-a-service.
*   **Database:** PostgreSQL (via Supabase) - Relational database for storing user profiles, team data, and invitations.
*   **Authentication:** Supabase Auth - Handles passwordless Email OTP and invitation-based onboarding.
*   **Access Control:** Row Level Security (RLS) - Secures data at the database level based on user roles and identity.
*   **Logic:** Supabase Edge Functions - Executes privileged operations (e.g., inviting members using the Service Role key).

## State Management
*   **Context API:** React Context is used for global state, such as managing the authentication session (`AuthContext.jsx`).

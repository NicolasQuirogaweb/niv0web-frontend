Fullstack Web Platform for Music Producers and Artists 

Niv0 Web is a modular and scalable web application designed for music producers and artists to browse, organize, and play beats and sample packs. The platform provides an intuitive interface for managing audio catalogs, playlists, and dynamic content, with a mobile-first approach for optimal experience on all devices.

Features

Audio Catalogs & Playlists: Browse beats and sample packs organized in catalogs.

Dynamic Audio Playback: Play multiple tracks with global state management to avoid overlapping audio.

Reusable Components: Cards, playlists, audio players, and UI elements built for scalability.

Dynamic Routes: Access content based on the selected catalog or playlist.

Backend Management: Simple and clear backend structure with separated models per collection.

Scalable Architecture: Designed to easily add new sections like videos, products, or albums.

Tech Stack

Frontend:

React

JavaScript & CSS

Mobile-first design

Backend:

Node.js

Express.js

MongoDB (Compass)

Other Tools:

Git

Figma (UI design)

Local deployment environment

Project Structure
/client        -> React frontend code
/server        -> Node.js & Express backend
/models        -> MongoDB data models (Playlists, Beats, Samples)
/routes        -> Backend routes organized by collection
/public        -> Static assets (images, audio files, etc.)

Responsibilities & Contributions

Complete frontend development with a mobile-first approach.

Implementation of reusable UI components (cards, audio players, playlists).

Backend development with clear route organization and modular models.

Audio playback management using global state.

Integration of dynamic routes to display content based on playlists.

Scalable design for future additions: video catalogs, products, albums, etc.

Getting Started

Clone the repository:

git clone https://github.com/yourusername/niv0-web.git


Install backend dependencies:

cd server
npm install


Install frontend dependencies:

cd client
npm install


Run the backend:

cd server
npm start


Run the frontend:

cd client
npm start


Open your browser at http://localhost:3000

Future Improvements

Add video catalogs for visual content.

Integrate payment gateway for premium content.

Enhance user authentication and roles for producers and listeners.

License

MIT License © Nicolás Martín Quiroga

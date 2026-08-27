# 🏗️ New Prime General Construction

A modern, motion-driven construction company website built with **React, Vite, and Motion**. The design combines an industrial construction aesthetic with smooth page transitions, interactive elements, project showcases, and a structured service experience.

## ✨ Features

* 🏗️ Construction-focused modern UI
* 🎬 Motion-powered page transitions and animations
* 🔨 Construction tool animations and visual elements
* 📐 Blueprint-inspired design sections
* 🏠 Foundation, Structural, Exterior & Interior services
* 🖼️ Project portfolio with individual project pages
* 📋 Six-step construction process
* 🏢 Company / About page
* 📩 Estimate request form
* 📱 Responsive design
* ⚡ Fast Vite development environment
* 🧭 Client-side routing with React Router

## 🛠️ Tech Stack

* **React**
* **Vite**
* **Motion** (`motion/react`)
* **React Router**
* **Lucide React**
* **CSS**
* **JavaScript**

## 📂 Pages

| Page                   | Description                            |
| ---------------------- | -------------------------------------- |
| `/`                    | Animated construction-focused homepage |
| `/services`            | Overview of all construction services  |
| `/services/foundation` | Foundation services                    |
| `/services/structural` | Structural services                    |
| `/services/exterior`   | Exterior services                      |
| `/services/interior`   | Interior services                      |
| `/projects`            | Project portfolio                      |
| `/projects/:slug`      | Individual project pages               |
| `/process`             | Six-step construction process          |
| `/about`               | Company information                    |
| `/contact`             | Estimate request form                  |

## 🧱 Services

### Foundation

* Site excavation
* Footings
* Foundation walls
* Concrete slabs
* Foundation crack repair
* Underpinning
* Waterproofing
* Drainage systems
* Sump-pump preparation
* Crawl-space repair

### Structural

* Wood framing
* Steel framing
* Load-bearing wall work
* Beams and columns
* Lintel replacement
* Joist repair
* Structural masonry repair
* Stair structure repair

### Exterior

* Waterproofing
* Rubber roofs
* Carpentry
* Brick pointing
* Shingle roofs
* Siding
* Decks
* Stucco
* Gutters
* Paver stones
* Sidewalk & concrete

### Interior

* Floors
* Marble & tile
* Painting
* Kitchen remodeling
* Plaster
* Bathroom remodeling
* Finish carpentry
* Interior repairs

## 🎬 Motion & Animation

The website uses Motion to create a construction-inspired interaction system rather than relying only on standard fade-in animations.

Animations include:

* Page transition effects
* Scroll-triggered reveals
* Animated construction tools
* Crane movement
* Blueprint elements
* Parallax effects
* Project image interactions
* Process timeline animations
* Motion-based UI transitions

The goal is to make the website feel like a **construction site coming together**, rather than a generic corporate website.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd new-prime-construction
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## 📸 Adding Project Images

Project data is organized so project imagery can easily be replaced with real client/project photographs.

Example:

```js
{
  slug: "brooklyn-brownstone",
  title: "Brooklyn Brownstone",
  category: "FOUNDATION + MASONRY",
  location: "Brooklyn, NY",
  year: "2026",
  image: "YOUR-IMAGE-URL",
  text: "Project description"
}
```

Replace the sample image URL with your own project photography.

## 📁 Project Structure

```text
src/
├── App.jsx
├── main.jsx
└── styles.css

public/
└── assets/

index.html
package.json
```

## 🎯 Future AI Features

The website is also designed with a potential AI-powered second phase in mind.

Possible additions include:

* 🤖 AI construction assistant
* 📸 Project photo analysis
* 🧠 Intelligent service recommendations
* 📝 AI-assisted project descriptions
* 💬 AI lead qualification
* 📋 Smart estimate request intake
* 🏗️ AI-assisted construction project assessment

The idea is simple:

> **Build the website fast. Then make it smarter.**

## 📞 New Prime General Construction Corp.

**New Prime General Construction Corp.**

Free Estimates · Fully Insured · Exterior & Interior Work

Serving New York City and Westchester.

---

Built with **React + Vite + Motion** 🚀

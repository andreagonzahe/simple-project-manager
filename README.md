# Andrea's Project Manager ✨

A beautiful, dreamy personal project management system with a soft girly aesthetic. Built with Next.js 15, TypeScript, Tailwind CSS 4, and Supabase. Organize your life across different areas with a cute, modern interface featuring soft pastels, playful animations, and magical pink-purple themes.

![Andrea's Project Manager](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)

## 🎭 Try the Demo!

Want to see it in action before setting it up? **[View Live Demo →](#)** _(Coming soon!)_

The demo includes realistic sample data across multiple life areas (Career, Health, Personal Projects, etc.) and showcases all features including recurring tasks, reminders, goals, and more!

## 💖 Design Philosophy

**Cute, Fun & Professional** - A girly aesthetic that's delightful without being distracting. Soft pastel colors, dreamy pink-purple themes, extra rounded corners (28px!), and gentle animations create a warm, personal workspace that's both beautiful and functional.

## 🌟 Features

### 🎯 **Smart Navigation**
- **Collapsible Sidebar Menu**: Hidden by default, opens on demand
- **Hamburger Menu**: Quick access to all major sections (Home, Focus Mode, Areas, Projects, Tasks)
- **Smooth Animations**: Spring-based slide-in transitions with backdrop
- **Auto-Close**: Menu closes automatically after navigation
- **Backdrop Dismissal**: Click outside to close menu

### ✨ **Complete Hierarchy System**
- **Areas of Life** → **Domains** → **Projects (Subdomains)** → **Features/Bugs/Tasks** → **Sub-Tasks**
- Navigate seamlessly through your entire project structure
- Breadcrumb navigation for easy context switching

### 🎨 **Beautiful Girly Design**
- **Soft Pastel Colors**: Pink-purple dreamscape theme
- **Extra Rounded Corners**: 28px border radius for maximum softness
- **Dreamy Backgrounds**: Radial gradients with magical glows
- **Glass Morphism**: Soft, pink-tinted transparent cards
- **Playful Animations**: Gentle bounces, twinkles, and floats
- **Sparkle Effects**: Optional cute decorations (✨)
- **Pink-Purple Accents**: Cohesive, warm color palette
- **Smooth Framer Motion**: Buttery-smooth transitions
- **Two Themes**: Magical night (dark) and dreamy day (light)
- **Responsive design** (mobile, tablet, desktop)

### 🔍 **Powerful Organization**
- **Sorting**: Sort by status, priority, date started, date completed, or creation date
- **Filtering**: Filter by multiple statuses and priorities simultaneously
- **Tabs**: Organize items into Features, Bugs, and Tasks
- **Status Tracking**: Backlog → In Progress → Completed
- **Priority Levels**: Low, Medium, High
- **Bug Severity**: Minor, Major, Critical (for bugs only)
- **Commitment Levels**: Mark tasks as "Must Do" or "Optional" for better prioritization

### 📊 **Dashboard & Analytics**
- View counts for domains, projects, and items
- Active items tracking
- Real-time data updates
- Empty states with helpful prompts
- **Today's Tasks**: View all tasks scheduled for today plus overdue items
- **Tomorrow's Tasks**: Plan ahead with tomorrow's scheduled tasks
- **Important Reminders**: Keep track of critical items with optional due dates

### 🎯 **Subtask Management**
- Break down features and bugs into smaller subtasks
- Track subtask status and priority independently
- Inline subtask creation
- Quick delete with confirmation

### 🔔 **User Experience**
- Toast notifications for all actions
- Loading states and skeleton screens
- Empty state illustrations
- Keyboard shortcuts (ESC to close modals)
- Local storage for sort/filter preferences

### 🎨 **Customization**
- Choose custom colors for areas and domains
- Lucide React icons for visual distinction
- 8 default color palettes

## 🚀 Getting Started

### Two Options:

#### Option 1: Demo Version (Try First!)

Set up a public demo with sample data perfect for showcasing:

📖 **[Follow the Demo Setup Guide →](./DEMO-SETUP-GUIDE.md)**

Great for:
- 🎭 Testing all features with realistic data
- 🎪 Sharing with others
- 📱 Adding to your portfolio
- 🚀 Public demos without authentication

#### Option 2: Personal Installation (For Real Use)

Set up your own private instance:

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up free](https://supabase.com))
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/andreagonzalezh/Desktop/simple-project-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these credentials from your Supabase project settings:
   - Go to [supabase.com](https://supabase.com) and sign in
   - Create a new project or select an existing one
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

4. **Set up the database:**
   
   Run the migration file in your Supabase SQL Editor:
   - Open your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Copy the contents of `supabase/migrations/20260109_project_manager.sql`
   - Paste and run the SQL query
   
   This will create all tables, indexes, triggers, and sample data.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎭 Demo vs Personal Use

### Demo Version
- **Purpose**: Public showcase with sample data
- **Setup**: See [Demo Setup Guide](./DEMO-SETUP-GUIDE.md)
- **Features**: All features enabled, no authentication
- **Best for**: Portfolio, sharing, testing
- **Data**: Pre-populated realistic examples
- **Banner**: Shows "Demo Mode" notification

### Personal Version
- **Purpose**: Your private project manager
- **Setup**: See [Quick Start](./QUICK-START.md)
- **Features**: Full functionality for real work
- **Best for**: Daily use, actual project management
- **Data**: Your own projects and tasks
- **Banner**: No demo banner

## 📁 Project Structure

```
simple-project-manager/
├── app/
│   ├── components/
│   │   ├── badges/          # Status, Priority, Severity badges
│   │   ├── cards/           # All card components
│   │   ├── controls/        # Sort, Filter, Tab controls
│   │   ├── modals/          # Modal dialogs
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── types.ts         # TypeScript types
│   │   └── utils.ts         # Utility functions
│   ├── projects/
│   │   └── [areaId]/        # Dynamic routing
│   │       └── [domainId]/
│   │           └── [subdomainId]/
│   │               ├── page.tsx          # Items list
│   │               └── [type]/
│   │                   └── [itemId]/
│   │                       └── page.tsx  # Item detail
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (Areas Dashboard)
├── supabase/
│   └── migrations/
│       └── 20260109_project_manager.sql
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Tables

1. **areas_of_life** - Top-level organization (Career, Housing, Health, etc.)
2. **domains** - Categories within areas (Sparken, Freelancing, etc.)
3. **subdomains** - Projects within domains (Client Portal, etc.)
4. **features** - Feature requests/implementations
5. **bugs** - Bug reports and fixes
6. **tasks** - General tasks
7. **subtasks** - Sub-items for features and bugs

### Relationships

- Areas → Domains (one-to-many)
- Domains → Subdomains (one-to-many)
- Subdomains → Features/Bugs/Tasks (one-to-many each)
- Features/Bugs → Subtasks (one-to-many)

## 🎨 Customization

### Adding Custom Areas

1. Click "Add Area" on the home page
2. Enter a name (e.g., "Career", "Personal")
3. Choose a color from the palette
4. Optionally add a Lucide React icon name (e.g., "Briefcase", "Home")
5. Set a sort order for custom positioning

### Icon Names

Visit [lucide.dev](https://lucide.dev) to browse available icons. Use the PascalCase name (e.g., `Briefcase`, `Heart`, `Plane`).

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Utilities**: clsx, tailwind-merge

## 📱 Responsive Design

- **Mobile (<640px)**: Single column layout, bottom sheets for forms
- **Tablet (640px-1024px)**: 2-column grid
- **Desktop (>1024px)**: 3-column grid with full features

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Public policies for personal use (adjust for multi-user scenarios)
- Environment variables for sensitive credentials
- No hardcoded secrets in codebase

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contributing

This is a personal project template. Feel free to fork and customize for your needs!

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎯 Roadmap

Potential future enhancements:
- [ ] Drag-and-drop reordering
- [ ] Kanban board view
- [ ] Calendar integration
- [ ] Time tracking
- [ ] Export to PDF/CSV
- [ ] Dark mode
- [ ] Multi-user collaboration
- [ ] File attachments
- [ ] Comments system
- [ ] Email notifications

## 💡 Tips

1. **Sample Data**: The migration includes sample areas and domains to get you started
2. **Persistence**: Sort and filter preferences are saved in localStorage
3. **Keyboard Shortcuts**: Press ESC to close any modal
4. **Colors**: Use hex colors (#RRGGBB) for custom area/domain colors
5. **Icons**: Not all Lucide icons may work - test your selection

## 📞 Support

For issues or questions:
1. Check the Supabase connection in `.env.local`
2. Verify the migration ran successfully in Supabase SQL Editor
3. Check browser console for errors
4. Ensure all dependencies are installed

## 🙏 Acknowledgments

Built with inspiration from:
- Notion's beautiful UI
- Linear's smooth animations
- Todoist's simplicity

---

**Made with ❤️ using Next.js, TypeScript, and Supabase**

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FiHome, FiUsers, FiMap, FiSearch, FiPlus, FiBell, FiMessageSquare } from "react-icons/fi";

export default function Home() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [activeNav, setActiveNav] = useState("Home");

  return (
    <div className="w-full">

      {/* Main Content Layout */}
      <div className="flex max-w-7xl mx-auto px-4 py-6">
        
        {/* LEFT SIDEBAR - Navigation */}
        <div className="hidden lg:block w-64 flex-shrink-0 pr-6">
          <div className="sticky top-[calc(var(--header-height)+24px)]">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  U
                </div>
                <div>
                  <h3 className="font-semibold">Welcome!</h3>
                  <p className="text-sm text-gray-500">Join the community</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium transition">
                Create Post
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-lg shadow-sm p-3 border">
              <h3 className="font-semibold text-gray-700 mb-3 px-2">Menu</h3>
              <ul className="space-y-1">
                {[
                  { icon: <FiHome />, label: "Home", active: true },
                  { icon: <FiUsers />, label: "Communities" },
                  { icon: <FiMap />, label: "Locations" },
                  { icon: <FiSearch />, label: "Search" },
                  { icon: <FiPlus />, label: "Create Club" },
                  { icon: <FiBell />, label: "Notifications" },
                  { icon: <FiMessageSquare />, label: "Messages" },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                        activeNav === item.label
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => setActiveNav(item.label)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Quick Links */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-3 border">
              <h3 className="font-semibold text-gray-700 mb-3 px-2">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { label: "Recent Events", count: "12" },
                  { label: "Active Clubs", count: "45" },
                  { label: "Popular Discussions", count: "128" },
                  { label: "Help Center", badge: "New" },
                ].map((link) => (
                  <li key={link.label}>
                    <button className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 text-sm text-gray-600">
                      <span>{link.label}</span>
                      {link.count && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {link.count}
                        </span>
                      )}
                      {link.badge && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CENTER - Feed */}
        <div className="flex-1 max-w-2xl mx-auto">
          
          {/* Create Post Box */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                +
              </div>
              <button className="flex-1 text-left px-4 py-2.5 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition">
                Whats happening in your community?
              </button>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t">
              {[
                { icon: "📷", label: "Photo" },
                { icon: "📍", label: "Location" },
                { icon: "🏷️", label: "Tag" },
                { icon: "📊", label: "Poll" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600"
                >
                  <span>{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feed Content - Empty for now */}
          <div className="bg-white rounded-lg shadow-sm p-6 border text-center">
            <div className="text-gray-400 mb-3">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Your Feed is Empty</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Once you join communities or clubs, their activity will appear here.
                Start exploring to see citizen action in your area!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <button className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 rounded-lg py-3 px-4 font-medium transition">
                Explore Communities
              </button>
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-3 px-4 font-medium transition">
                Join a Club
              </button>
            </div>
          </div>

          {/* Sample Post Placeholders */}
          <div className="mt-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5 border">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center text-indigo-500">
                    C{i}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Community {i}</h4>
                      <span className="text-xs text-gray-500">• 2 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-500">Public Group</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  This is a sample post that will be replaced with real community updates.
                  Users will see action items from clubs they follow.
                </p>
                <div className="flex gap-4 pt-3 border-t text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-indigo-600">
                    👍 Like
                  </button>
                  <button className="flex items-center gap-1 hover:text-indigo-600">
                    💬 Comment
                  </button>
                  <button className="flex items-center gap-1 hover:text-indigo-600">
                    🔗 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR - Ads & Widgets */}
        <div className="hidden lg:block w-80 flex-shrink-0 pl-6">
          <div className="sticky top-[calc(var(--header-height)+24px)] space-y-6">
            
            {/* Ad Container 1 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Sponsored</span>
                <button className="text-gray-400 hover:text-gray-600 text-sm">ⓘ</button>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Support Local Businesses</h4>
              <p className="text-sm text-gray-600 mb-4">
                Discover eco-friendly products from community vendors.
              </p>
              <div className="w-full h-40 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg mb-4 flex items-center justify-center text-white font-bold">
                Ad Space
              </div>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2.5 text-sm font-medium transition">
                Learn More
              </button>
            </div>

            {/* Trending Now */}
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h3 className="font-semibold text-gray-800 mb-4">Trending in Civic Action</h3>
              <div className="space-y-4">
                {[
                  { tag: "#CleanStreet", posts: "142 posts" },
                  { tag: "#TrafficSolution", posts: "89 posts" },
                  { tag: "#ParkRenovation", posts: "204 posts" },
                  { tag: "#SafetyFirst", posts: "67 posts" },
                ].map((trend) => (
                  <button
                    key={trend.tag}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="font-medium text-gray-800">{trend.tag}</div>
                    <div className="text-sm text-gray-500">{trend.posts}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ad Container 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Promoted</span>
                <button className="text-gray-400 hover:text-gray-600 text-sm">ⓘ</button>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Community Tools</h4>
              <p className="text-sm text-gray-600 mb-4">
                Advanced analytics for your neighborhood projects.
              </p>
              <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg mb-4 flex items-center justify-center text-white font-bold">
                Your Ad Here
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition">
                  Try Free
                </button>
                <button className="flex-1 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg py-2 text-sm font-medium transition">
                  Details
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h3 className="font-semibold text-gray-800 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {[
                  { title: "Community Cleanup", date: "Sat, Mar 15", location: "Central Park" },
                  { title: "Town Hall Meeting", date: "Tue, Mar 18", location: "City Hall" },
                  { title: "Neighborhood Watch", date: "Thu, Mar 20", location: "Local Center" },
                ].map((event) => (
                  <div key={event.title} className="p-3 rounded-lg border">
                    <div className="font-medium text-gray-800">{event.title}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>📅 {event.date}</span>
                      <span>•</span>
                      <span>📍 {event.location}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg py-2.5 text-sm font-medium transition">
                View All Events
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function FloatingBlob({ className, delay }) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay }}
      className={`
        absolute rounded-full
        bg-gradient-to-br from-indigo-500/20 to-purple-600/20
        ${className}
      `}
    />
  );
}
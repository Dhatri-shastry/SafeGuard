import React, { useState } from "react";
import {
  Shield,
  MapPin,
  Heart,
  AlertTriangle,
  ThumbsUp,
  Loader2,
} from "lucide-react";

const CommunityPage = ({ userProfile }) => {
  // Initial demo posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      name: "Sarah",
      message: "⚠️ Spotted suspicious activity near Central Park. Stay alert!",
      location: "Central Park Area",
      reactions: { safe: 5, alert: 12, support: 8 },
      isAnonymous: false,
    },
    {
      id: 2,
      name: "Anonymous",
      message: "The streetlights on Oak Avenue are not working. Better avoid this route at night.",
      location: "Oak Avenue",
      reactions: { safe: 0, alert: 15, support: 3 },
      isAnonymous: true,
    }
  ]);
  const [newPost, setNewPost] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  // Add a new post
  const addPost = () => {
    if (!newPost.trim()) {
      alert("⚠️ Please write something before posting.");
      return;
    }

    const location = "Your current location"; // replace later with GPS data
    const post = {
      id: Date.now(),
      name: isAnonymous ? "Anonymous" : userProfile?.name || "User",
      message: newPost,
      location,
      reactions: { safe: 0, alert: 0, support: 0 },
      isAnonymous,
      createdAt: new Date().toISOString(),
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  // Add reactions
  const handleReaction = (id, type) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          reactions: {
            ...post.reactions,
            [type]: (post.reactions[type] || 0) + 1
          }
        };
      }
      return post;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Shield className="w-7 h-7 text-purple-600" />
        SafeCircle Community
      </h2>

      {/* Post creation box */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Share your experience or alert others
        </h3>

        <textarea
          placeholder="Type your message here..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows="3"
          className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3"
        />

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
            />
            Post Anonymously
          </label>

          <button
            onClick={addPost}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            Post Alert
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading community posts...
        </div>
      )}

      {/* Posts */}
      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No posts yet. Be the first to share 💬
        </p>
      )}

      <div className="space-y-5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800">
                {post.isAnonymous ? "Anonymous" : post.name}
              </h4>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-pink-500" />
                {post.location}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{post.message}</p>

            <div className="flex justify-between text-sm">
              <button
                onClick={() => handleReaction(post.id, "safe")}
                className="flex items-center gap-1 text-green-600 hover:scale-110 transition"
              >
                <ThumbsUp className="w-4 h-4" /> {post.reactions?.safe || 0} Safe
              </button>
              <button
                onClick={() => handleReaction(post.id, "alert")}
                className="flex items-center gap-1 text-red-600 hover:scale-110 transition"
              >
                <AlertTriangle className="w-4 h-4" /> {post.reactions?.alert || 0} Alert
              </button>
              <button
                onClick={() => handleReaction(post.id, "support")}
                className="flex items-center gap-1 text-purple-600 hover:scale-110 transition"
              >
                <Heart className="w-4 h-4" /> {post.reactions?.support || 0} Support
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-8 p-4 bg-purple-50 rounded-lg text-gray-700 text-sm flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" />
        Together we build safer communities 💜
      </footer>
    </div>
  );
};

export default CommunityPage;

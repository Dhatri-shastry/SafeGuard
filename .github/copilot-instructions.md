# Copilot Instructions: Women Safety Portal

## Project Overview
**SafeGuard** is a React-based women safety application with real-time emergency features, community support, and AI-powered safety tools. The app uses Firebase for authentication and data persistence.

## Architecture

### Core Stack
- **Frontend**: React 19 with React Router
- **Styling**: Tailwind CSS + custom CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI Icons**: Lucide React
- **Advanced Features**: Web Speech API, Device Shake Detection, Leaflet maps, Three.js (3D)

### Data Flow
1. **Authentication**: Firebase Auth with Google OAuth
2. **User Profile**: Stored in Firestore (`users/{uid}`) with name, profilePic (Base64), emergencyContacts
3. **Page Navigation**: Managed by `App.js` state (currentPage prop) - not React Router
4. **Emergency Contacts**: Stored in Firestore and cached in localStorage for quick access

### Key File Structure
- `src/App.js` - Main app shell, auth listener, page routing logic
- `src/components/` - Reusable UI (Header, BottomNav, Login)
- `src/pages/` - Feature pages (HomePage, SOSPage, LiveTrackingPage, etc.)
- `src/firebase.js` - Firebase config & exports (auth, db, googleProvider)

## Critical Development Patterns

### 1. Page Navigation (No React Router)
Pages are swapped via `currentPage` state in App.js. Pass `setCurrentPage` as a prop:
```javascript
// In App.js: currentPage prop controls what renders
{currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}

// In any page: navigate like this
<button onClick={() => setCurrentPage("sos")}>Go to SOS</button>
```
**Pages available**: home, sos, live-tracking, voice-activation, shake-detection, fake-call, help-centers, safe-walk, community, profile, emergency-dial

### 2. User Profile & Auth State
Always check for `currentUser` (Firebase user object) and `userProfile` (Firestore data):
```javascript
// On first login with no Firestore doc: create skeleton profile
// If profile is missing name field: force ProfileSetup page
// Google photos auto-update into profilePic if missing (non-blocking)
```
Profile picture is stored as **Base64 string** in Firestore (not external storage).

### 3. Emergency Contacts Pattern
Contacts live in Firestore with structure:
```javascript
{ name, phone, priority: boolean }
```
Both Firestore and localStorage caching used. When updating contacts, sync both.

### 4. Styling Conventions
- Gradient backgrounds: `from-purple-50 to-pink-50` or `from-purple-600 to-pink-600`
- Primary color: `purple-600`, secondary: `pink-600`
- Use Tailwind utilities; minimize custom CSS
- Buttons use `hover:` states with color transitions
- Icons from Lucide React (pre-imported in components)

### 5. Firebase Operations
Always import specific functions (not whole SDK):
```javascript
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
```
Profile updates use Base64 strings directly—no external storage URLs.

## Common Tasks

### Adding a New Feature Page
1. Create file in `src/pages/MyFeaturePage.js`
2. Accept props: `currentUser`, `userProfile`, `setCurrentPage`
3. Add conditional render in `App.js` main return block
4. Add button in HomePage or BottomNav to navigate to it
5. Add case name to navigation pages list above

### Managing Emergency Contacts
```javascript
// Fetch from Firestore
const contactsRef = collection(db, "users", currentUser.uid, "emergencyContacts");
const snapshot = await getDocs(contactsRef);
const contactList = snapshot.docs.map(doc => doc.data());

// Add new contact
await addDoc(contactsRef, { name, phone, priority });

// Cache in localStorage
localStorage.setItem("emergencyContacts", JSON.stringify(contactList));
```

### Handling User Profile Updates
```javascript
const userRef = doc(db, "users", currentUser.uid);
await updateDoc(userRef, { name: newName, profilePic: base64Data });
setUserProfile(prev => ({ ...prev, name: newName })); // Update local state
```

## Testing & Build
```bash
npm start        # Dev server on localhost:3000
npm test         # Jest with React Testing Library
npm run build    # Production build (minified)
```

## Important Gotchas
- **No external image storage**: Use Base64 for profile pictures
- **Page routing is state-based**: Not URL-based; back button won't work as expected
- **Shake detection & voice require user permissions**: Handle gracefully
- **localStorage used for caching**: Clear it during logout if needed
- **Firebase config is hardcoded**: Never commit actual secrets (this demo uses placeholder)

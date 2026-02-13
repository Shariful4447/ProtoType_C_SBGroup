import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  User,
  Bot,
  X,
  MessageSquare,
  Landmark,
  Car,
  Briefcase,
  Building,
  ArrowRight,
  Grid,
  Home,
  Menu,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  FileCheck,
  Phone,
  Users,
  Clock,
  Mail,
  Globe,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// --- Firebase Configuration ---
// FIX: Safely check for environment variable to prevent local crash
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: "G-9KDDVB1DVR",
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rawAppId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, "_");

// --- Configuration & Data ---

const SITE_BRAND = {
  name: "LocalSphere",
  domain: ".org",
  description: "Your Community Connection Portal",
};

// Theme: LocalSphere (Teal/Amber)
const THEME = {
  primary: "bg-teal-600",
  primaryHover: "hover:bg-teal-700",
  secondary: "bg-teal-50",
  text: "text-teal-700",
  border: "border-teal-200",
  gradient: "from-teal-600 to-emerald-500",
  chatHeader: "bg-teal-600 text-white",
  userBubble: "bg-teal-600 text-white",
  botAvatar: "bg-white border border-teal-200 text-teal-600",
  launcher: "bg-teal-600 hover:bg-teal-700",
};

const SCENARIOS = {
  tax: {
    id: "tax",
    name: "Local Tax",
    brand: "TaxConnect",
    icon: "Landmark",
    heroTitle: "Property & Business Tax",
    heroSubtitle: "Manage your local contributions and view assessments.",
    querySuggestion: "How to file taxes?",
  },
  vehicle: {
    id: "vehicle",
    name: "City Parking",
    brand: "MetroMove",
    color: "amber",
    icon: <Car size={24} />,
    defaultPrototype: "C",
    heroTitle: "Parking & Permits",
    heroSubtitle:
      "Resident permits, ticket payments, and street cleaning info.",
    querySuggestion: "Pay parking ticket",
  },
  benefits: {
    id: "benefits",
    name: "Community Aid",
    brand: "LocalSupport",
    color: "rose",
    icon: "Users",
    heroTitle: "Social Services",
    heroSubtitle: "Connecting neighbors with food banks, jobs, and support.",
    querySuggestion: "How to apply for child care?",
  },
  housing: {
    id: "housing",
    name: "Housing Help",
    brand: "NeighborHome",
    color: "indigo",
    icon: "Home",
    heroTitle: "Affordable Living",
    heroSubtitle: "Rent control info, section 8 local lists, and shelters.",
    querySuggestion: "Apply for housing",
  },
};

const CAROUSEL_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1492138786289-d35ea832da43?auto=format&fit=crop&q=80",
    title: "Community First",
    subtitle: "Connecting neighbors to local resources.",
  },
  {
    url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80",
    title: "Green Spaces",
    subtitle: "Maintaining our parks and public gardens.",
  },
  {
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80",
    title: "Local Business",
    subtitle: "Support the shops that make us unique.",
  },
  {
    url: "https://images.unsplash.com/photo-1577208293786-21798363717c?auto=format&fit=crop&q=80",
    title: "Public Transit",
    subtitle: "Efficient routes for a cleaner city.",
  },
];

const ICON_MAP = {
  FileText,
  DollarSign,
  Car,
  FileCheck,
  Calendar,
  Home,
  MapPin,
  Landmark,
  Grid,
  Users,
  Phone,
  ExternalLink,
  Mail,
  Globe,
  Briefcase,
};

// --- Helper: Markdown Link Parser ---
const parseMarkdownLinks = (text) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (match) {
      return (
        <a
          key={index}
          href={match[2]}
          className="text-teal-600 font-bold hover:underline decoration-teal-400 decoration-2 underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// --- Custom NLP API Simulation (Prototype C: Actionable Redirection) ---

async function mockNlpApi(query, scenarioId) {
  const delay = Math.floor(Math.random() * 800) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const text = query.toLowerCase();

  // --- Helper: Rich Response Generator ---
  const getRichResponse = (context) => {
    switch (context) {
      case "tax":
        return {
          text: "I've located the relevant tools for local taxation.",
          cards: [
            {
              title: "Pay Property Tax",
              desc: "Online portal",
              iconName: "DollarSign",
              action: "Pay Now",
            },
            {
              title: "Assessment Map",
              desc: "View parcel data",
              iconName: "MapPin",
              action: "View Map",
            },
          ],
          topics: [
            "Download Exemption Forms",
            "Payment Plan Options",
            "Dispute an Assessment",
          ],
          contact: {
            phone: "(555) 019-2834",
            email: "tax@localsphere.org",
            hours: "Mon-Fri, 9am - 5pm",
          },
        };
      case "vehicle":
        return {
          text: "Select a service below to proceed with parking or permits.",
          cards: [
            {
              title: "Pay Citation",
              desc: "Clear parking tickets",
              iconName: "FileCheck",
              action: "Pay Ticket",
            },
            {
              title: "Resident Permit",
              desc: "Zone A, B, & C",
              iconName: "Car",
              action: "Apply",
            },
          ],
          topics: [
            "Report Abandoned Vehicle",
            "Street Sweeping Schedule",
            "Contest a Ticket",
          ],
          contact: {
            phone: "(555) 019-5555",
            email: "parking@localsphere.org",
            hours: "Mon-Fri, 8am - 4pm",
          },
        };
      case "benefits":
        return {
          text: "Here are the direct links to apply for community aid.",
          cards: [
            {
              title: "Food Pantry",
              desc: "Find local distribution",
              iconName: "MapPin",
              action: "Search",
            },
            {
              title: "Cash Assistance",
              desc: "Emergency funds",
              iconName: "DollarSign",
              action: "Eligibility",
            },
          ],
          topics: [
            "Job Training Programs",
            "Child Care Subsidy",
            "Senior Services",
          ],
          contact: {
            phone: "(555) 019-9999",
            email: "support@localsphere.org",
            hours: "24/7 Hotline",
          },
        };
      case "housing":
        return {
          text: "Please use the portals below to manage housing applications.",
          cards: [
            {
              title: "Section 8 App",
              desc: "Waitlist status",
              iconName: "Home",
              action: "Check Status",
            },
            {
              title: "Available Units",
              desc: "Affordable listings",
              iconName: "Grid",
              action: "Browse",
            },
          ],
          topics: [
            "Landlord Registration",
            "Tenant Rights Handbook",
            "Emergency Shelter List",
          ],
          contact: {
            phone: "(555) 019-1234",
            email: "housing@localsphere.org",
            hours: "Mon-Fri, 9am - 4pm",
          },
        };
      default:
        return null;
    }
  };

  // --- Greeting ---
  if (
    text.match(
      /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/,
    )
  ) {
    if (scenarioId === "home") {
      return {
        text: "Welcome to askMe on LocalSphere. Select a department below to access services.",
        cards: [
          {
            title: "Tax Office",
            desc: "Property & Business",
            iconName: "Landmark",
            action: "Go to Tax",
          },
          {
            title: "City Parking",
            desc: "Tickets & Permits",
            iconName: "Car",
            action: "Go to Parking",
          },
        ],
        topics: ["Community Aid", "Housing Help", "City Events"],
      };
    } else {
      const rich = getRichResponse(scenarioId);
      return {
        text: `Hello! I am the askMe assistant for ${SCENARIOS[scenarioId].name}. How can I direct you?`,
        cards: rich.cards,
        topics: rich.topics,
        contact: rich.contact,
      };
    }
  }

  // --- Routing & Context Logic ---
  let context = scenarioId;

  if (scenarioId === "home") {
    // FIX: Prioritize 'child' or 'care' to benefits
    if (
      text.includes("child") ||
      text.includes("care") ||
      text.includes("benefit") ||
      text.includes("food")
    ) {
      context = "benefits";
    } else if (text.includes("tax")) {
      context = "tax";
    } else if (
      text.includes("vehicle") ||
      text.includes("car") ||
      text.includes("park")
    ) {
      context = "vehicle";
    } else if (text.includes("hous") || text.includes("rent")) {
      context = "housing";
    }
  }

  const response = getRichResponse(context);

  if (response) {
    // --- Detailed Process with INLINE LINKS ---

    // Tax
    if (
      text.includes("tax") &&
      (text.includes("file") ||
        text.includes("return") ||
        text.includes("how to"))
    ) {
      response.text =
        "To file your local taxes, start by gathering your income statements ([W-2s](https://www.irs.gov/forms-pubs/about-form-w-2), [1099s](https://www.irs.gov/forms-pubs/about-form-1099)) and previous year's return. Calculate your [local deduction](#deduction), then choose a digital filing option below for immediate processing.";
    }

    // Vehicle
    else if (
      text.includes("vehicle") ||
      text.includes("renew") ||
      text.includes("registration")
    ) {
      response.text =
        "Renewing takes minutes. Ensure your insurance is active and you have your [Renewal ID Number (RIN)](#rin). Select a service to complete the transaction.";
    }

    // Housing
    else if (text.includes("housing") || text.includes("section 8")) {
      response.text =
        "We offer several programs. You can [apply for Section 8 vouchers](#section8) or [view affordable housing listings](#listings) directly online.";
    }

    // Benefits / Child Care (FIXED LOGIC)
    else if (
      context === "benefits" ||
      text.includes("benefit") ||
      text.includes("child")
    ) {
      if (text.includes("child") || text.includes("care")) {
        response.text =
          "For **Child Care Assistance**, you must meet income eligibility requirements. You can [apply for a subsidy](#subsidy) online or find a [licensed provider](#provider) using the tools below.";
        // Override cards for specific child care context if needed, or keep generic benefits cards
        response.cards = [
          {
            title: "Apply for Subsidy",
            desc: "Child Care",
            iconName: "Users",
            action: "Apply",
          },
          {
            title: "Find Provider",
            desc: "Search Database",
            iconName: "MapPin",
            action: "Search",
          },
        ];
      } else {
        response.text =
          "The application requires your [SSN](#ssn) and employment history. Once you create a [secure account](#register), you can submit your initial claim using the links below.";
      }
    } else if (text.includes("pay")) {
      response.text = "Proceed to the secure payment gateway below.";
    } else if (text.includes("apply")) {
      response.text = "Start your application using the links below.";
    }

    return response;
  }

  // Fallback
  return {
    text: "I can help you locate that service. Try these quick links:",
    cards: [
      {
        title: "Browse Services",
        desc: "View all departments",
        iconName: "Grid",
        action: "View All",
      },
    ],
    topics: ["Tax Office", "City Parking", "Community Aid", "Housing Help"],
    contact: { phone: "311", email: "help@localsphere.org", hours: "24/7" },
  };
}

// --- Components ---

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % CAROUSEL_SLIDES.length),
    [],
  );
  const prev = useCallback(
    () =>
      setCurrent(
        (prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length,
      ),
    [],
  );
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl mb-10 group bg-teal-900 border-4 border-white/20">
      {CAROUSEL_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-transparent flex flex-col justify-center p-12">
            <h3 className="text-4xl font-black text-white mb-2 tracking-tight">
              {slide.title}
            </h3>
            <p className="text-teal-50 text-xl font-medium">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-teal-900/50 backdrop-blur-sm rounded-full text-white hover:bg-teal-800 transition-all opacity-0 group-hover:opacity-100 z-20"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-teal-900/50 backdrop-blur-sm rounded-full text-white hover:bg-teal-800 transition-all opacity-0 group-hover:opacity-100 z-20"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end mb-6">
        <div className="flex max-w-[85%] flex-row-reverse gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-teal-600 text-white shadow-sm mt-auto">
            <User size={14} />
          </div>
          <div className="relative p-4 rounded-2xl rounded-tr-none shadow-sm bg-teal-600 text-white text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  const data = message.data || { text: message.content };

  return (
    <div className="flex w-full justify-start mb-6">
      <div className="flex max-w-[95%] flex-row gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-teal-600 shadow-sm mt-auto">
          <Bot size={14} />
        </div>
        <div className="flex flex-col gap-3 w-full bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm overflow-hidden">
          {/* (1) Text Paragraph with Inline Links */}
          <div className="p-5 text-sm text-gray-700 leading-relaxed border-b border-gray-50">
            {parseMarkdownLinks(data.text)}
          </div>

          {/* (2) Full-Width Action Buttons */}
          {data.cards && data.cards.length > 0 && (
            <div className="flex flex-col gap-2 px-5 py-2">
              {data.cards.map((card, idx) => {
                const IconComponent = ICON_MAP[card.iconName] || ExternalLink;
                return (
                  <button
                    key={idx}
                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all ${THEME.primary}`}
                  >
                    <IconComponent size={18} className="text-white/90" />
                    {card.label || card.action}
                  </button>
                );
              })}
            </div>
          )}

          {/* (3) Related Topics List */}
          {data.topics && data.topics.length > 0 && (
            <div className="bg-white px-5 pb-3 pt-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-50 pb-1">
                Related Topics
              </div>
              <div className="divide-y divide-gray-100">
                {data.topics.map((topic, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left py-2 text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center justify-between group transition-colors"
                  >
                    {topic}
                    <ArrowRight
                      size={10}
                      className="text-teal-200 group-hover:text-teal-500 transition-colors"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* (4) Multi-Channel Directory Block */}
          {data.contact && (
            <div className="bg-slate-50 border-t border-gray-200 p-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="p-1.5 bg-white rounded-md shadow-sm text-teal-600">
                  <Globe size={14} />
                </div>
                <span className="font-medium truncate">
                  {data.contact.website}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="p-1.5 bg-white rounded-md shadow-sm text-teal-600">
                  <Phone size={14} />
                </div>
                <span className="font-medium">{data.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="p-1.5 bg-white rounded-md shadow-sm text-teal-600">
                  <Mail size={14} />
                </div>
                <span className="font-medium truncate">
                  {data.contact.email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="p-1.5 bg-white rounded-md shadow-sm text-teal-600">
                  <Clock size={14} />
                </div>
                <span className="font-medium truncate">
                  {data.contact.hours}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeScenario, setActiveScenario] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Session ID to isolate chats per page load
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const chatEndRef = useRef(null);

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Sync Chat History
  useEffect(() => {
    if (!user) return;
    const messagesRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "messages",
    );
    const q = query(messagesRef, where("scenarioId", "==", activeScenario));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map((doc) => doc.data());
      // Filter for current session ID
      const msgs = allMsgs
        .filter((m) => m.sessionId === sessionId)
        .sort((a, b) => {
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        });

      if (msgs.length === 0) {
        let welcomeMsg;
        if (activeScenario === "home") {
          welcomeMsg = {
            text: "Welcome to askMe on LocalSphere. Select a department to access services.",
            cards: [
              {
                title: "Tax Office",
                desc: "Property & Business",
                iconName: "Landmark",
                action: "Go to Tax",
              },
              {
                title: "City Parking",
                desc: "Tickets & Permits",
                iconName: "Car",
                action: "Go to Parking",
              },
            ],
            topics: ["Community Aid", "Housing Help", "City Events"],
            contact: {
              phone: "311",
              email: "info@localsphere.org",
              hours: "24/7 Citizen Support",
            },
          };
        } else {
          const scenario = SCENARIOS[activeScenario];
          welcomeMsg = {
            text: `Hello! I am the askMe assistant for ${scenario.name}. How can I direct you?`,
            // Default rich content for new dept chat
            cards: [
              {
                title: "Popular Services",
                desc: "Most used tools",
                iconName: "Grid",
                action: "View",
              },
              {
                title: "Contact Us",
                desc: "Get in touch",
                iconName: "Phone",
                action: "Call",
              },
            ],
            topics: ["FAQ", "Hours & Location", "Feedback"],
            contact: {
              phone: "311",
              email: `${activeScenario}@localsphere.org`,
              hours: "Mon-Fri 9-5",
            },
          };
        }
        addDoc(messagesRef, {
          role: "assistant",
          content: welcomeMsg.text,
          data: welcomeMsg,
          scenarioId: activeScenario,
          sessionId,
          createdAt: serverTimestamp(),
        });
      } else {
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, [user, activeScenario, sessionId]);

  const handleSend = async (e) => {
    // FIX: Core fix for form submission preventing reload
    if (e && e.preventDefault) e.preventDefault();

    const txt = inputValue;

    if (!txt.trim() || !user) return;

    setInputValue("");
    setIsTyping(true);

    try {
      const messagesRef = collection(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "messages",
      );
      await addDoc(messagesRef, {
        role: "user",
        content: txt,
        scenarioId: activeScenario,
        sessionId,
        createdAt: serverTimestamp(),
      });
      const aiResponse = await mockNlpApi(txt, activeScenario);
      await addDoc(messagesRef, {
        role: "assistant",
        content: aiResponse.text,
        data: aiResponse,
        scenarioId: activeScenario,
        sessionId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const scenario = activeScenario === "home" ? null : SCENARIOS[activeScenario];
  const getThemeClass = () => {
    if (activeScenario === "home") return "from-teal-800 to-teal-900";
    const map = {
      tax: "from-teal-600 to-emerald-500",
      vehicle: "from-amber-500 to-orange-400",
      benefits: "from-rose-500 to-pink-500",
      housing: "from-indigo-600 to-violet-500",
    };
    return map[activeScenario];
  };

  return (
    <div className="min-h-screen font-sans flex flex-col text-gray-800 relative bg-stone-50">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80"
          alt="LocalSphere Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 to-amber-50/50 backdrop-blur-[1px]"></div>
      </div>
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <nav className="bg-white/90 backdrop-blur-md border-b border-teal-100 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
            <button
              onClick={() => handleNavigate("home")}
              className="flex items-center gap-3 group"
            >
              <div
                className={`text-white p-2 rounded-xl transition-all shadow-md group-hover:scale-105 ${activeScenario === "home" ? "bg-teal-600" : `bg-gradient-to-br ${getThemeClass()}`}`}
              >
                {activeScenario === "home" ? <Grid size={24} /> : scenario.icon}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="font-black text-xl tracking-tight text-teal-900">
                  {activeScenario === "home" ? SITE_BRAND.name : scenario.brand}
                </span>
                <span className="text-xs text-teal-600 font-bold uppercase tracking-widest">
                  {activeScenario === "home" ? SITE_BRAND.domain : "Department"}
                </span>
              </div>
            </button>
            <div className="hidden md:flex items-center gap-2">
              {Object.values(SCENARIOS).map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => {
                    setActiveScenario(scen.id);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeScenario === scen.id ? "bg-teal-100 text-teal-800" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {scen.icon}
                  {scen.name}
                </button>
              ))}
            </div>
            <button
              className="md:hidden p-2 text-teal-800 bg-teal-50 rounded-lg"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto">
          {activeScenario === "home" && (
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-7xl font-black text-teal-900 mb-6 tracking-tight">
                  Your City.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-amber-500">
                    Connected.
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                  Access local services, pay bills, and find support in one
                  unified dashboard.
                </p>
              </div>
              <Carousel />
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.values(SCENARIOS).map((scen) => (
                  <div
                    key={scen.id}
                    onClick={() => {
                      setActiveScenario(scen.id);
                      setIsOpen(false);
                    }}
                    className="group bg-white border border-gray-100 rounded-3xl p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg bg-gradient-to-br ${scen.id === "tax" ? "from-teal-500 to-teal-400" : scen.id === "vehicle" ? "from-amber-500 to-amber-400" : scen.id === "benefits" ? "from-rose-500 to-rose-400" : "from-indigo-500 to-indigo-400"}`}
                    >
                      {scen.icon}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {scen.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">
                      {scen.heroSubtitle}
                    </p>
                    <div className="absolute bottom-6 right-6 text-gray-300 group-hover:text-teal-600 transition-colors">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeScenario !== "home" && (
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-teal-50 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-${SCENARIOS[activeScenario].color}-50 text-${SCENARIOS[activeScenario].color}-600`}
                  >
                    Official Department
                  </div>
                  <h1 className="text-5xl font-black text-gray-900 leading-none">
                    {scenario.heroTitle}
                  </h1>
                  <p className="text-lg text-gray-600 font-medium leading-relaxed">
                    {scenario.heroSubtitle}
                  </p>
                  <div className="flex gap-4 pt-4">
                    <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
                      Start Service
                    </button>
                    <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-md aspect-square bg-gray-100 rounded-3xl flex items-center justify-center text-gray-300">
                  {React.cloneElement(scenario.icon, {
                    size: 120,
                    className: "opacity-20",
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-6">
          {isOpen && (
            <div className="w-[90vw] md:w-[380px] h-[600px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="h-20 bg-teal-600 p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                    <MessageSquare size={20} className="fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">askMe</h3>
                    <div className="flex items-center gap-1.5 text-xs text-teal-100 font-medium">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Live Support
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 bg-stone-50 space-y-6">
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form
                onSubmit={handleSend}
                className="p-4 bg-white border-t border-gray-100"
              >
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="How can we help?"
                    className="w-full bg-gray-100 border-0 rounded-2xl py-4 pl-5 pr-4 text-base focus:ring-2 focus:ring-teal-500/20 text-gray-800 placeholder:text-gray-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className={`absolute right-2 p-2.5 rounded-xl transition-all shadow-sm ${inputValue.trim() ? "bg-teal-600 text-white hover:bg-teal-700 hover:scale-105" : "bg-gray-200 text-gray-400"}`}
                  >
                    <Send size={20} />
                  </button>
                </div>
                {activeScenario !== "home" && (
                  <button
                    type="button"
                    onClick={() =>
                      setInputValue(SCENARIOS[activeScenario].querySuggestion)
                    }
                    className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-800 w-full text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <HelpCircle size={12} /> Suggestion: "
                    {SCENARIOS[activeScenario].querySuggestion}"
                  </button>
                )}
              </form>
            </div>
          )}
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="group flex items-center justify-center h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 px-8 gap-3"
            >
              <MessageSquare size={28} className="fill-current" />
              <span className="font-bold text-lg">askMe</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

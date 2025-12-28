import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Search,
  MapPin,
  Camera,
  Video,
  Eye,
  X,
  Sparkles,
  Menu,
  Home as HomeIcon,
  Image as ImageIcon,
  Play,
  Loader2,
  Clock,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sun,
  Maximize2,
  Globe,
  ZoomIn,
  Upload,
  Images,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ============================================
// INDONESIA MAP SVG - Proper dengan provinsi
// ============================================
const IndonesiaMapSVG = ({ provinces, onProvinceClick, selectedProvince }) => {
  // Koordinat provinsi yang benar
  const PROVINCE_POSITIONS = {
    "ACEH": { x: 95, y: 85 },
    "SUMATERA UTARA": { x: 115, y: 110 },
    "SUMATERA BARAT": { x: 100, y: 145 },
    "RIAU": { x: 130, y: 130 },
    "JAMBI": { x: 125, y: 165 },
    "SUMATERA SELATAN": { x: 130, y: 195 },
    "BENGKULU": { x: 110, y: 190 },
    "LAMPUNG": { x: 140, y: 225 },
    "KEPULAUAN BANGKA BELITUNG": { x: 160, y: 200 },
    "KEPULAUAN RIAU": { x: 165, y: 120 },
    "DKI JAKARTA": { x: 175, y: 255 },
    "JAWA BARAT": { x: 190, y: 265 },
    "JAWA TENGAH": { x: 230, y: 275 },
    "DI YOGYAKARTA": { x: 225, y: 285 },
    "JAWA TIMUR": { x: 275, y: 275 },
    "BANTEN": { x: 165, y: 265 },
    "BALI": { x: 310, y: 290 },
    "NUSA TENGGARA BARAT": { x: 345, y: 295 },
    "NUSA TENGGARA TIMUR": { x: 400, y: 305 },
    "KALIMANTAN BARAT": { x: 210, y: 165 },
    "KALIMANTAN TENGAH": { x: 255, y: 185 },
    "KALIMANTAN SELATAN": { x: 275, y: 215 },
    "KALIMANTAN TIMUR": { x: 290, y: 150 },
    "KALIMANTAN UTARA": { x: 305, y: 110 },
    "SULAWESI UTARA": { x: 385, y: 135 },
    "SULAWESI TENGAH": { x: 375, y: 175 },
    "SULAWESI SELATAN": { x: 360, y: 220 },
    "SULAWESI TENGGARA": { x: 390, y: 215 },
    "GORONTALO": { x: 395, y: 150 },
    "SULAWESI BARAT": { x: 350, y: 200 },
    "MALUKU": { x: 465, y: 195 },
    "MALUKU UTARA": { x: 455, y: 145 },
    "PAPUA": { x: 580, y: 190 },
    "PAPUA BARAT": { x: 510, y: 175 },
    "PAPUA BARAT DAYA": { x: 495, y: 195 },
  };

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 700 380" className="w-full h-auto">
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#B8962E" stopOpacity="0.9" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background ocean */}
        <rect width="700" height="380" fill="#f0f4f8" rx="16"/>
        
        {/* Simplified Indonesia silhouette */}
        {/* Sumatra */}
        <path d="M60,70 Q80,60 100,70 L120,85 Q140,100 145,130 L150,170 Q155,200 145,230 L130,260 Q115,280 95,275 L80,250 Q65,220 60,180 L55,130 Q55,90 60,70 Z" 
          fill="url(#mapGradient)" stroke="#002F6C" strokeWidth="1" filter="url(#shadow)" className="hover:brightness-110 transition-all"/>
        
        {/* Kalimantan */}
        <path d="M180,100 Q220,85 260,95 L300,110 Q320,130 315,170 L305,210 Q290,240 250,235 L210,220 Q180,200 175,160 L175,130 Q175,110 180,100 Z" 
          fill="url(#mapGradient)" stroke="#002F6C" strokeWidth="1" filter="url(#shadow)" className="hover:brightness-110 transition-all"/>
        
        {/* Sulawesi */}
        <path d="M340,120 Q360,110 380,115 L400,130 Q410,145 400,170 L395,190 Q400,210 395,235 L380,255 Q360,265 345,250 L340,220 Q335,190 345,165 L350,145 Q345,130 340,120 Z" 
          fill="url(#mapGradient)" stroke="#002F6C" strokeWidth="1" filter="url(#shadow)" className="hover:brightness-110 transition-all"/>
        
        {/* Java */}
        <path d="M150,250 L180,245 Q220,240 260,245 L300,250 Q330,255 345,265 L340,280 Q310,290 270,285 L220,280 Q180,275 155,265 L150,250 Z" 
          fill="url(#mapGradient)" stroke="#002F6C" strokeWidth="1" filter="url(#shadow)" className="hover:brightness-110 transition-all"/>
        
        {/* Bali & Nusa Tenggara */}
        <path d="M350,280 Q370,275 400,280 L450,290 Q480,300 470,315 L430,320 Q390,315 360,305 L350,280 Z" 
          fill="url(#mapGradient)" stroke="#002F6C" strokeWidth="1" filter="url(#shadow)" className="hover:brightness-110 transition-all"/>
        
        {/* Maluku */}
        <path d="M440,140 Q460,135 475,145 L485,165 Q490,185 480,205 L465,215 Q445,220 435,200 L430,170 Q430,150 440,140 Z" 
          fill="url(#mapGradient)" stroke="#002F6C" strokeWidth="1" filter="url(#shadow)" className="hover:brightness-110 transition-all"/>
        
        {/* Papua */}
        <path d="M490,130 Q540,115 590,125 L630,145 Q650,170 640,210 L620,250 Q580,270 530,260 L500,240 Q480,210 485,170 L490,130 Z" 
          fill="url(#mapGradient)" stroke="#002F6C" strokeWidth="1" filter="url(#shadow)" className="hover:brightness-110 transition-all"/>

        {/* Province markers */}
        {provinces.map((province) => {
          const pos = PROVINCE_POSITIONS[province.name];
          if (!pos) return null;
          const isSelected = selectedProvince?.id === province.id;
          
          return (
            <g key={province.id} onClick={() => onProvinceClick(province)} className="cursor-pointer">
              {/* Pulse animation for selected */}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r="20" fill="#FFCC00" opacity="0.3" className="animate-ping"/>
              )}
              {/* Main marker */}
              <circle 
                cx={pos.x} 
                cy={pos.y} 
                r={isSelected ? 14 : 10}
                fill="#002F6C" 
                stroke="#FFCC00" 
                strokeWidth={isSelected ? 3 : 2}
                filter={isSelected ? "url(#glow)" : ""}
                className="hover:r-14 transition-all"
              />
              {/* Count */}
              <text 
                x={pos.x} 
                y={pos.y + 4} 
                textAnchor="middle" 
                fill="#FFCC00" 
                fontSize="8" 
                fontWeight="bold"
              >
                {province.article_count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ============================================
// STATISTICS BANNER
// ============================================
const StatsBanner = ({ stats }) => {
  if (!stats) return null;
  
  const items = [
    { icon: <Camera size={24} />, value: stats.total_photos?.toLocaleString() || "0", label: "Foto", color: "from-blue-500 to-blue-600" },
    { icon: <Video size={24} />, value: stats.total_videos?.toLocaleString() || "0", label: "Video", color: "from-purple-500 to-purple-600" },
    { icon: <Eye size={24} />, value: "3.4M+", label: "Total Views", color: "from-green-500 to-green-600" },
    { icon: <Download size={24} />, value: "52K+", label: "Downloads", color: "from-orange-500 to-orange-600" },
    { icon: <Images size={24} />, value: "42K+", label: "High-Res", color: "from-pink-500 to-pink-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-white shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">{item.icon}</div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-white/80 text-sm">{item.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// HEADER
// ============================================
const Header = ({ onOpenSearch, onOpenVisualSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.svg/120px-Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.svg.png"
                alt="Kemenpar"
                className="h-12 w-12 object-contain"
                onError={(e) => { e.target.src = "https://woni.sklmb.co/kemenpar.png"; }}
              />
              <div>
                <h1 className="text-navy font-bold text-lg leading-tight">Kementerian Pariwisata</h1>
                <p className="text-navy/70 text-sm">Galeri Wonderful Indonesia</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <button onClick={onOpenVisualSearch} className="flex items-center gap-2 px-4 py-2 bg-navy/5 hover:bg-navy/10 rounded-lg transition text-navy">
                <Upload size={18} />
                <span className="text-sm">Cari dengan Gambar</span>
              </button>
              <button onClick={onOpenSearch} className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold-dark rounded-lg transition text-navy font-semibold shadow-md">
                <Sparkles size={18} />
                <span className="text-sm">Pencarian AI</span>
              </button>
            </div>

            <button className="md:hidden text-navy p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-navy">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-11">
            <div className="hidden md:flex items-center">
              <NavLink to="/" icon={<HomeIcon size={16} />} label="Beranda" />
              <NavLink to="/gallery" icon={<ImageIcon size={16} />} label="Galeri Foto" />
              <NavLink to="/videos" icon={<Play size={16} />} label="Video" />
              <NavLink to="/stats" icon={<BarChart3 size={16} />} label="Statistik" />
            </div>
            <p className="text-gold text-sm font-medium">Download Gratis untuk Semua</p>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-navy px-4 py-3 space-y-2">
          <Link to="/" className="block py-2 text-white hover:text-gold">Beranda</Link>
          <Link to="/gallery" className="block py-2 text-white hover:text-gold">Galeri Foto</Link>
          <Link to="/videos" className="block py-2 text-white hover:text-gold">Video</Link>
          <button onClick={onOpenSearch} className="w-full mt-2 bg-gold text-navy py-2 rounded-lg font-semibold">
            Pencarian AI
          </button>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-2 px-4 py-3 text-white hover:text-gold transition text-sm">
    {icon}
    <span>{label}</span>
  </Link>
);

// ============================================
// AI SEARCH MODAL
// ============================================
const AISearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/search`, { query });
      setResults(response.data);
    } catch (e) {
      console.error("AI search error:", e);
    }
    setLoading(false);
  };

  const goToDetail = (id) => {
    onClose();
    navigate(`/detail/${id}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
        <div className="absolute inset-0 bg-navy/80 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
          
          <div className="bg-gradient-to-r from-navy to-navy-light p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gold p-2 rounded-xl"><Sparkles size={24} className="text-navy" /></div>
                <div>
                  <h2 className="text-xl font-bold text-white">Pencarian Cerdas AI</h2>
                  <p className="text-white/70 text-sm">Temukan destinasi impian Anda</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white p-2"><X size={24} /></button>
            </div>
            <div className="relative">
              <input type="text" placeholder='Contoh: "pantai indah di Bali" atau "wisata budaya Yogyakarta"'
                value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-5 py-4 pr-14 rounded-xl text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button onClick={handleSearch} disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-navy p-3 rounded-lg hover:bg-gold-dark transition disabled:opacity-50">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[55vh] bg-gray-50">
            {results ? (
              <div>
                {results.interpreted_query && (
                  <p className="text-sm text-navy/70 mb-4 p-3 bg-navy/5 rounded-lg">
                    <span className="font-semibold">AI memahami:</span> {results.interpreted_query.province || ""} {results.interpreted_query.category || ""} {results.interpreted_query.keywords || ""}
                  </p>
                )}
                {results.articles?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {results.articles.map((article) => (
                      <div key={article.id} onClick={() => goToDetail(article.id)}
                        className="cursor-pointer group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        <div className="aspect-video overflow-hidden">
                          <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-navy line-clamp-2 group-hover:text-gold">{article.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{article.province_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Tidak ditemukan hasil.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles size={48} className="mx-auto mb-4 text-gold/50" />
                <p className="text-navy font-medium">Ketik pencarian dengan bahasa natural</p>
                <p className="text-sm text-gray-500 mt-2">Contoh: "tempat romantis untuk honeymoon"</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// VISUAL SEARCH MODAL (AI Image Search)
// ============================================
const VisualSearchModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleSearch = async () => {
    if (!preview) return;
    setLoading(true);
    // Simulate AI visual search - in real implementation, send to backend
    setTimeout(() => {
      setLoading(false);
      onClose();
      navigate('/gallery');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-navy/80 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          
          <div className="bg-gradient-to-r from-navy to-navy-light p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gold p-2 rounded-xl"><Upload size={24} className="text-navy" /></div>
                <div>
                  <h2 className="text-xl font-bold text-white">Pencarian Visual AI</h2>
                  <p className="text-white/70 text-sm">Upload gambar, temukan yang serupa</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white p-2"><X size={24} /></button>
            </div>
          </div>

          <div className="p-6">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
              ${isDragActive ? 'border-gold bg-gold/10' : 'border-gray-300 hover:border-gold'}`}>
              <input {...getInputProps()} />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              ) : (
                <>
                  <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-navy font-medium">Drag & drop gambar di sini</p>
                  <p className="text-sm text-gray-500 mt-1">atau klik untuk memilih file</p>
                </>
              )}
            </div>
            
            {preview && (
              <button onClick={handleSearch} disabled={loading}
                className="w-full mt-4 bg-gold hover:bg-gold-dark text-navy py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                {loading ? "Mencari..." : "Cari Gambar Serupa"}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// PROVINCE PANEL
// ============================================
const ProvincePanel = ({ province, recommendation, loading, onClose, onViewAll }) => {
  const navigate = useNavigate();
  
  if (!province) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gold/20">
      <div className="bg-gradient-to-br from-navy to-navy-light p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">{province.name}</h3>
            <p className="text-gold text-sm">{province.article_count} destinasi</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100%-130px)]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-gold" />
          </div>
        ) : (
          <>
            {recommendation?.recommendation && (
              <div className="mb-4 p-3 bg-gold/10 rounded-lg border border-gold/20">
                <p className="text-sm text-navy leading-relaxed">{recommendation.recommendation}</p>
              </div>
            )}
            {recommendation?.articles?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-navy/60 uppercase">Destinasi Populer</h4>
                {recommendation.articles.slice(0, 4).map((article) => (
                  <Link key={article.id} to={`/detail/${article.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition group">
                    <img src={article.thumbnail} alt={article.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy line-clamp-2 group-hover:text-gold">{article.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Eye size={10} /> {article.total_view?.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button onClick={onViewAll}
          className="w-full bg-navy text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-navy-light transition">
          Lihat Semua <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// ARTICLE CARD (untuk homepage - klik ke detail)
// ============================================
const ArticleCard = ({ article }) => {
  return (
    <Link to={`/detail/${article.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={article.thumbnail} alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        {article.is_video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white/90 p-3 rounded-full"><Play size={24} className="text-navy" /></div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-navy/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Eye size={12} /> {article.total_view?.toLocaleString()}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
          <div className="bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition transform scale-75 group-hover:scale-100">
            <ArrowRight size={24} className="text-navy" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-navy line-clamp-2 group-hover:text-gold transition text-sm">{article.title}</h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <MapPin size={12} className="text-gold" />
          <span className="truncate">{article.province_name || "Indonesia"}</span>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// LIGHTBOX (untuk di halaman detail)
// ============================================
const Lightbox = ({ images, currentIndex, onClose, onNavigate }) => {
  const [downloading, setDownloading] = useState(false);
  
  if (!images || images.length === 0 || currentIndex < 0) return null;
  
  const currentImage = images[currentIndex];
  
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = currentImage.image_url || currentImage.thumbnail;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `wonderful_indonesia_${currentImage.id || currentIndex}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      window.open(currentImage.image_url || currentImage.thumbnail, '_blank');
    }
    setDownloading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col" onClick={onClose}>
      
      <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{currentIndex + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={downloading}
            className="bg-gold hover:bg-gold-dark text-navy px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download HD
          </button>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2"><X size={24} /></button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-16" onClick={(e) => e.stopPropagation()}>
        {currentIndex > 0 && (
          <button onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition">
            <ChevronLeft size={32} />
          </button>
        )}

        <img src={currentImage.image_url || currentImage.thumbnail} alt=""
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl" />

        {currentIndex < images.length - 1 && (
          <button onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition">
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center gap-2 overflow-x-auto max-w-4xl mx-auto scrollbar-hide">
          {images.slice(0, 12).map((img, idx) => (
            <button key={img.id || idx} onClick={() => onNavigate(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all
                ${idx === currentIndex ? 'ring-2 ring-gold scale-110' : 'opacity-50 hover:opacity-80'}`}>
              <img src={img.thumbnail} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          {images.length > 12 && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-white text-sm">
              +{images.length - 12}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// HOMEPAGE
// ============================================
const HomePage = () => {
  const [provinces, setProvinces] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [filter, setFilter] = useState({ sortBy: "recent", isVideo: null });
  const [loadingArticles, setLoadingArticles] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { loadArticles(); }, [filter]);

  const loadInitialData = async () => {
    try {
      const [provRes, statsRes, catRes] = await Promise.all([
        axios.get(`${API}/provinces`),
        axios.get(`${API}/stats`),
        axios.get(`${API}/categories`),
      ]);
      setProvinces(provRes.data);
      setStats(statsRes.data);
      setCategories(catRes.data);
    } catch (e) { console.error(e); }
  };

  const loadArticles = async () => {
    setLoadingArticles(true);
    try {
      const params = new URLSearchParams();
      params.append("sort_by", filter.sortBy);
      params.append("limit", "12");
      if (filter.isVideo !== null) params.append("is_video", filter.isVideo);
      const res = await axios.get(`${API}/articles?${params.toString()}`);
      setArticles(res.data);
    } catch (e) { console.error(e); }
    setLoadingArticles(false);
  };

  const handleProvinceClick = async (province) => {
    setSelectedProvince(province);
    setRecLoading(true);
    try {
      const res = await axios.get(`${API}/ai/recommend/${province.id}`);
      setRecommendation(res.data);
    } catch (e) { console.error(e); }
    setRecLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => setSearchOpen(true)} onOpenVisualSearch={() => setVisualSearchOpen(true)} />
      <AISearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <VisualSearchModal isOpen={visualSearchOpen} onClose={() => setVisualSearchOpen(false)} />

      {/* Hero + Stats */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-2">Galeri Wonderful Indonesia</h2>
            <p className="text-gray-600">Download gratis foto & video pariwisata Indonesia berkualitas tinggi</p>
          </div>
          <StatsBanner stats={stats} />
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-navy">Jelajahi Peta Indonesia</h3>
                <p className="text-gray-500 text-sm">Klik provinsi untuk melihat rekomendasi destinasi</p>
              </div>
              <button onClick={() => setSearchOpen(true)}
                className="bg-gold hover:bg-gold-dark text-navy px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-md">
                <Sparkles size={18} /> Pencarian AI
              </button>
            </div>
            
            <div className="relative">
              <IndonesiaMapSVG provinces={provinces} onProvinceClick={handleProvinceClick} selectedProvince={selectedProvince} />
              
              <AnimatePresence>
                {selectedProvince && (
                  <ProvincePanel
                    province={selectedProvince}
                    recommendation={recommendation}
                    loading={recLoading}
                    onClose={() => setSelectedProvince(null)}
                    onViewAll={() => { setSelectedProvince(null); navigate(`/gallery?province=${selectedProvince.id}`); }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-navy font-semibold whitespace-nowrap">Kategori:</span>
            {categories.map((cat) => (
              <button key={cat.id}
                className="px-4 py-2 rounded-full bg-white hover:bg-gold/20 transition whitespace-nowrap text-sm border border-gray-200 hover:border-gold">
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy">Galeri Terbaru</h2>
              <p className="text-gray-500 text-sm">Klik untuk melihat detail & download gambar</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-lg border overflow-hidden">
                <button onClick={() => setFilter(f => ({ ...f, sortBy: "recent" }))}
                  className={`px-4 py-2 text-sm flex items-center gap-1 ${filter.sortBy === "recent" ? "bg-navy text-white" : "text-gray-600"}`}>
                  <Clock size={14} /> Terbaru
                </button>
                <button onClick={() => setFilter(f => ({ ...f, sortBy: "popular" }))}
                  className={`px-4 py-2 text-sm flex items-center gap-1 ${filter.sortBy === "popular" ? "bg-navy text-white" : "text-gray-600"}`}>
                  <TrendingUp size={14} /> Populer
                </button>
              </div>
              <div className="flex bg-white rounded-lg border overflow-hidden">
                <button onClick={() => setFilter(f => ({ ...f, isVideo: null }))}
                  className={`px-4 py-2 text-sm ${filter.isVideo === null ? "bg-navy text-white" : "text-gray-600"}`}>Semua</button>
                <button onClick={() => setFilter(f => ({ ...f, isVideo: false }))}
                  className={`px-4 py-2 text-sm flex items-center gap-1 ${filter.isVideo === false ? "bg-navy text-white" : "text-gray-600"}`}>
                  <Camera size={14} />
                </button>
                <button onClick={() => setFilter(f => ({ ...f, isVideo: true }))}
                  className={`px-4 py-2 text-sm flex items-center gap-1 ${filter.isVideo === true ? "bg-navy text-white" : "text-gray-600"}`}>
                  <Video size={14} />
                </button>
              </div>
            </div>
          </div>

          {loadingArticles ? (
            <div className="flex justify-center py-12"><Loader2 size={40} className="animate-spin text-gold" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/gallery" className="inline-block bg-navy text-white px-8 py-3 rounded-full hover:bg-navy-light transition font-medium shadow-lg">
              Lihat Semua Galeri
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img src="https://woni.sklmb.co/wonderful-indonesia.svg" alt="Wonderful Indonesia" className="h-12 mb-4" />
              <p className="text-gray-400 text-sm">Galeri Resmi Kementerian Pariwisata Republik Indonesia</p>
              <p className="text-gold text-sm mt-2">Semua foto dan video gratis untuk diunduh</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gold">Tautan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-gold">Beranda</Link></li>
                <li><Link to="/gallery" className="hover:text-gold">Galeri</Link></li>
                <li><a href="/privacy-policy" className="hover:text-gold">Kebijakan Privasi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gold">Ikuti Kami</h4>
              <div className="flex gap-4 text-gray-400 text-sm">
                <a href="https://www.facebook.com/KemenPariwisata" className="hover:text-gold">Facebook</a>
                <a href="http://instagram.com/kemenpar.ri" className="hover:text-gold">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 Galeri Kementerian Pariwisata Republik Indonesia
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// DETAIL PAGE - dengan semua gambar artikel
// ============================================
const DetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/articles/${id}`);
      setArticle(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Combine thumbnail + all images untuk lightbox
  const allImages = article ? [
    { id: 'main', thumbnail: article.thumbnail, image_url: article.thumbnail },
    ...(article.images || [])
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={48} className="animate-spin text-gold" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Artikel tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => {}} onOpenVisualSearch={() => {}} />
      
      {lightboxOpen && (
        <Lightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      <div className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-gold hover:text-gold-dark flex items-center gap-1 mb-6 font-medium">
            <ChevronLeft size={20} /> Kembali ke Beranda
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                <div className="relative cursor-pointer group" onClick={() => openLightbox(0)}>
                  {article.is_video && article.video_url ? (
                    <div className="aspect-video">
                      <iframe src={article.video_url} className="w-full h-full" allowFullScreen title={article.title} />
                    </div>
                  ) : (
                    <>
                      <img src={article.thumbnail} alt={article.title} className="w-full max-h-[500px] object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                        <div className="bg-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition transform scale-75 group-hover:scale-100">
                          <ZoomIn size={32} className="text-navy" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-navy mb-4">{article.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} className="text-gold" />
                      {article.province_name || "Indonesia"}{article.city_name && `, ${article.city_name}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={16} /> {article.total_view?.toLocaleString()} views
                    </span>
                    {article.category && (
                      <span className="bg-gold/20 text-navy px-3 py-1 rounded-full font-medium">{article.category}</span>
                    )}
                  </div>

                  {article.content && (
                    <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: article.content }} />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Gallery Images */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-32">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Images size={20} className="text-gold" />
                    Galeri ({allImages.length} Gambar)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <div key={img.id || idx} onClick={() => openLightbox(idx)}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group">
                      <img src={img.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                        <div className="bg-gold text-navy p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                          <ZoomIn size={16} />
                        </div>
                      </div>
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-gold text-navy text-xs px-2 py-1 rounded font-medium">Utama</span>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={() => openLightbox(0)}
                  className="w-full mt-4 bg-gold hover:bg-gold-dark text-navy py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-md">
                  <Download size={20} /> Download Semua Gambar
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="mt-8 bg-white rounded-xl p-6 shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.split(",").map((tag, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gold/20 cursor-pointer transition">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// GALLERY PAGE
// ============================================
const GalleryPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadArticles();
  }, [page]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/articles?limit=24&offset=${page * 24}`);
      setArticles(prev => page === 0 ? res.data : [...prev, ...res.data]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => {}} onOpenVisualSearch={() => {}} />
      
      <div className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-navy mb-2">Galeri Foto</h1>
          <p className="text-gray-500 mb-8">Klik gambar untuk melihat detail dan download</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>

          {loading && <div className="flex justify-center py-8"><Loader2 size={40} className="animate-spin text-gold" /></div>}
          
          {!loading && (
            <div className="text-center mt-10">
              <button onClick={() => setPage(p => p + 1)}
                className="bg-navy text-white px-8 py-3 rounded-full hover:bg-navy-light transition font-medium">
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// APP ROUTER
// ============================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<GalleryPage />} />
        <Route path="/stats" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
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
  Upload,
  Images,
  ZoomIn,
  ArrowRight,
  Filter,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Indonesia GeoJSON URL - working URL
// GeoJSON lokal untuk load lebih cepat
const INDONESIA_TOPO = "/indonesia-province.json";

// Province coordinates mapping
const PROVINCE_COORDS = {
  "Aceh": [96.7, 4.7], "Sumatera Utara": [99.5, 2.1], "Sumatera Barat": [100.4, -0.9],
  "Riau": [102.1, 0.5], "Jambi": [103.6, -1.6], "Sumatera Selatan": [104.8, -3.3],
  "Bengkulu": [102.3, -3.8], "Lampung": [105.0, -4.6], "Kepulauan Bangka Belitung": [106.4, -2.7],
  "Kepulauan Riau": [104.5, 1.1], "DKI Jakarta": [106.8, -6.2], "Jawa Barat": [107.6, -6.9],
  "Jawa Tengah": [110.4, -7.2], "DI Yogyakarta": [110.4, -7.8], "Jawa Timur": [112.8, -7.5],
  "Banten": [106.1, -6.4], "Bali": [115.2, -8.4], "Nusa Tenggara Barat": [117.4, -8.7],
  "Nusa Tenggara Timur": [121.1, -8.7], "Kalimantan Barat": [110.0, 0.0],
  "Kalimantan Tengah": [113.4, -1.7], "Kalimantan Selatan": [115.3, -3.1],
  "Kalimantan Timur": [116.4, 0.5], "Kalimantan Utara": [117.4, 3.1],
  "Sulawesi Utara": [124.8, 1.5], "Sulawesi Tengah": [121.4, -1.4],
  "Sulawesi Selatan": [120.0, -3.7], "Sulawesi Tenggara": [122.5, -4.1],
  "Gorontalo": [122.4, 0.7], "Sulawesi Barat": [119.4, -2.8],
  "Maluku": [128.1, -3.2], "Maluku Utara": [127.8, 1.6],
  "Papua Barat": [133.2, -1.4], "Papua": [138.9, -4.3],
};

// Map province names to database names
const PROVINCE_NAME_MAP = {
  "Aceh": "ACEH", "Sumatera Utara": "SUMATERA UTARA", "Sumatera Barat": "SUMATERA BARAT",
  "Riau": "RIAU", "Jambi": "JAMBI", "Sumatera Selatan": "SUMATERA SELATAN",
  "Bengkulu": "BENGKULU", "Lampung": "LAMPUNG", "Kepulauan Bangka Belitung": "KEPULAUAN BANGKA BELITUNG",
  "Kepulauan Riau": "KEPULAUAN RIAU", "DKI Jakarta": "DKI JAKARTA", "Jawa Barat": "JAWA BARAT",
  "Jawa Tengah": "JAWA TENGAH", "DI Yogyakarta": "DI YOGYAKARTA", "Jawa Timur": "JAWA TIMUR",
  "Banten": "BANTEN", "Bali": "BALI", "Nusa Tenggara Barat": "NUSA TENGGARA BARAT",
  "Nusa Tenggara Timur": "NUSA TENGGARA TIMUR", "Kalimantan Barat": "KALIMANTAN BARAT",
  "Kalimantan Tengah": "KALIMANTAN TENGAH", "Kalimantan Selatan": "KALIMANTAN SELATAN",
  "Kalimantan Timur": "KALIMANTAN TIMUR", "Kalimantan Utara": "KALIMANTAN UTARA",
  "Sulawesi Utara": "SULAWESI UTARA", "Sulawesi Tengah": "SULAWESI TENGAH",
  "Sulawesi Selatan": "SULAWESI SELATAN", "Sulawesi Tenggara": "SULAWESI TENGGARA",
  "Gorontalo": "GORONTALO", "Sulawesi Barat": "SULAWESI BARAT",
  "Maluku": "MALUKU", "Maluku Utara": "MALUKU UTARA",
  "Papua Barat": "PAPUA BARAT", "Papua": "PAPUA",
};

// Format number
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K+";
  return num?.toLocaleString() || "0";
};

// ============================================
// HEADER
// ============================================
const Header = ({ onOpenSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.svg/120px-Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.svg.png"
              alt="Kemenpar"
              className="h-12 w-12 object-contain"
              onError={(e) => { e.target.src = "https://woni.sklmb.co/kemenpar.png"; }}
            />
            <div className="hidden sm:block">
              <h1 style={{ color: "#002F6C" }} className="font-bold text-lg leading-tight">Kementerian Pariwisata</h1>
              <p style={{ color: "#002F6C", opacity: 0.6 }} className="text-xs">Galeri Wonderful Indonesia</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" label="Beranda" />
            <NavLink to="/gallery" label="Galeri" />
            <NavLink to="/videos" label="Video" />
          </nav>

          <button onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy px-5 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition">
            <Sparkles size={18} />
            Pencarian AI
          </button>

          <button className="md:hidden text-navy p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
          <Link to="/" className="block py-2 text-navy hover:text-gold">Beranda</Link>
          <Link to="/gallery" className="block py-2 text-navy hover:text-gold">Galeri</Link>
          <Link to="/videos" className="block py-2 text-navy hover:text-gold">Video</Link>
          <button onClick={onOpenSearch} className="w-full mt-2 bg-gold text-navy py-2 rounded-lg font-semibold">
            Pencarian AI
          </button>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, label }) => (
  <Link to={to} className="px-4 py-2 text-navy hover:text-gold transition text-sm font-medium">{label}</Link>
);

// ============================================
// STATISTICS SECTION
// ============================================
const StatsSection = ({ stats }) => {
  if (!stats) return null;
  
  const items = [
    { icon: <Images size={28} />, value: formatNumber(stats.total_images), label: "Foto HD" },
    { icon: <Video size={28} />, value: formatNumber(stats.total_videos), label: "Video" },
    { icon: <Eye size={28} />, value: formatNumber(stats.total_views), label: "Views" },
    { icon: <Download size={28} />, value: formatNumber(stats.total_downloads), label: "Downloads" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-navy rounded-xl p-5 text-white shadow-lg text-center"
        >
          <div className="flex justify-center mb-2">{item.icon}</div>
          <p className="text-3xl font-bold">{item.value}</p>
          <p className="text-white/80 text-sm">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// AI SEARCH MODAL (DOMINANT)
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
        className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: -30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header - Fixed */}
          <div className="bg-navy p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gold p-2.5 rounded-xl">
                  <Sparkles size={24} className="text-navy" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Pencarian Cerdas AI</h2>
                  <p className="text-white/70 text-sm">Temukan destinasi impian dengan bahasa natural</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            <div className="relative">
              <input type="text"
                placeholder='Coba: "pantai sunset di Bali" atau "candi bersejarah di Jawa"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-5 py-3.5 pr-14 rounded-xl text-navy text-base placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gold/50 shadow-lg bg-white"
                autoFocus
              />
              <button onClick={handleSearch} disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-navy p-2.5 rounded-lg hover:bg-gold-dark transition disabled:opacity-50 shadow-md">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Pantai Bali", "Candi Jawa", "Raja Ampat", "Danau Toba", "Komodo"].map((tag) => (
                <button key={tag} onClick={() => { setQuery(tag); }}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm transition font-medium">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {results ? (
              <div>
                {results.interpreted_query && (
                  <div className="mb-4 p-3 bg-navy/5 rounded-lg border border-navy/10">
                    <p className="text-sm text-navy">
                      <span className="font-semibold">AI memahami:</span>{" "}
                      {[results.interpreted_query.province, results.interpreted_query.category, results.interpreted_query.keywords].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                )}
                {results.articles?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {results.articles.map((article) => (
                      <div key={article.id} onClick={() => goToDetail(article.id)}
                        className="cursor-pointer group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition border border-gray-100">
                        <div className="aspect-video overflow-hidden relative">
                          <img src={article.thumbnail} alt={article.title} loading="lazy" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Eye size={10} /> {article.total_view?.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-navy line-clamp-2 group-hover:text-gold transition">{article.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={10} className="text-gold" /> {article.province_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Tidak ditemukan hasil. Coba kata kunci lain.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={40} className="text-gold" />
                </div>
                <p className="text-navy font-medium text-lg">Ketik pencarian dengan bahasa natural</p>
                <p className="text-gray-500 mt-2 text-sm">Contoh: "tempat romantis untuk honeymoon" atau "wisata alam di Sulawesi"</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// INDONESIA MAP (react-simple-maps)
// ============================================
const IndonesiaMap = ({ provinces, onProvinceClick, selectedProvince }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch(INDONESIA_TOPO)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load map:", err));
  }, []);

  const getProvinceData = (geoName) => {
    const dbName = PROVINCE_NAME_MAP[geoName];
    return provinces.find(p => p.name === dbName);
  };

  if (!geoData) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 900, center: [118, -2] }}
        style={{ width: "100%", height: "auto", maxHeight: "500px" }}
        width={800}
        height={400}
      >
        {/* Peta dikunci - tanpa ZoomableGroup untuk disable zoom/pan */}
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const provData = getProvinceData(geo.properties.Propinsi);
              const isSelected = selectedProvince?.name === PROVINCE_NAME_MAP[geo.properties.Propinsi];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => provData && onProvinceClick(provData)}
                  style={{
                    default: {
                      fill: isSelected ? "#FFCC00" : "#D4AF37",
                      stroke: "#002F6C",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#FFCC00",
                      stroke: "#002F6C",
                      strokeWidth: 1,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#C9A227",
                      stroke: "#002F6C",
                      strokeWidth: 1,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
        {/* Markers with article count */}
        {provinces.map((province) => {
          const coords = Object.entries(PROVINCE_NAME_MAP).find(([k, v]) => v === province.name);
          if (!coords) return null;
          const position = PROVINCE_COORDS[coords[0]];
          if (!position) return null;
          
          return (
            <Marker key={province.id} coordinates={position}>
              <g onClick={() => onProvinceClick(province)} style={{ cursor: "pointer" }}>
                <circle r={8} fill="#002F6C" stroke="#FFCC00" strokeWidth={2} />
                <text textAnchor="middle" y={3} style={{ fontSize: 6, fill: "#FFCC00", fontWeight: "bold", pointerEvents: "none" }}>
                  {province.article_count}
                </text>
              </g>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
};

// ============================================
// PROVINCE PANEL
// ============================================
const ProvincePanel = ({ province, recommendation, loading, onClose }) => {
  const navigate = useNavigate();
  if (!province) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-10" style={{ maxHeight: "95%" }}>
      <div className="bg-navy p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">{province.name}</h3>
            <p className="text-gold text-sm font-medium">{province.article_count} destinasi</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded"><X size={20} /></button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto" style={{ maxHeight: "280px" }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-gold" />
          </div>
        ) : (
          <>
            {recommendation?.recommendation && (
              <div className="mb-4 p-3 bg-navy/5 rounded-lg border border-navy/10">
                <p className="text-sm text-navy leading-relaxed">{recommendation.recommendation}</p>
              </div>
            )}
            {recommendation?.articles?.length > 0 && (
              <div className="space-y-3">
                {recommendation.articles.slice(0, 4).map((article) => (
                  <Link key={article.id} to={`/detail/${article.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition group">
                    <img src={article.thumbnail} alt="" loading="lazy" className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy line-clamp-2 group-hover:text-gold">{article.title}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
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
      
      <div className="p-4 bg-gray-50 border-t">
        <button onClick={() => navigate(`/gallery?province=${province.id}`)}
          className="w-full bg-navy text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-navy-light transition">
          Lihat Semua <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// FILTER BAR
// ============================================
const FilterBar = ({ provinces, filter, setFilter }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Province Filter */}
      <select
        value={filter.provinceId || ""}
        onChange={(e) => setFilter(f => ({ ...f, provinceId: e.target.value || null }))}
        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <option value="">Semua Provinsi</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Sort Filter */}
      <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button onClick={() => setFilter(f => ({ ...f, sortBy: "recent" }))}
          className={`px-4 py-2 text-sm flex items-center gap-1 transition ${filter.sortBy === "recent" ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-50"}`}>
          <Clock size={14} /> Terbaru
        </button>
        <button onClick={() => setFilter(f => ({ ...f, sortBy: "popular" }))}
          className={`px-4 py-2 text-sm flex items-center gap-1 transition ${filter.sortBy === "popular" ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-50"}`}>
          <TrendingUp size={14} /> Populer
        </button>
        <button onClick={() => setFilter(f => ({ ...f, sortBy: "downloads" }))}
          className={`px-4 py-2 text-sm flex items-center gap-1 transition ${filter.sortBy === "downloads" ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-50"}`}>
          <Download size={14} /> Downloads
        </button>
      </div>

      {/* Media Type Filter */}
      <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button onClick={() => setFilter(f => ({ ...f, isVideo: null }))}
          className={`px-4 py-2 text-sm transition ${filter.isVideo === null ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-50"}`}>
          Semua
        </button>
        <button onClick={() => setFilter(f => ({ ...f, isVideo: false }))}
          className={`px-4 py-2 text-sm flex items-center gap-1 transition ${filter.isVideo === false ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-50"}`}>
          <Camera size={14} /> Foto
        </button>
        <button onClick={() => setFilter(f => ({ ...f, isVideo: true }))}
          className={`px-4 py-2 text-sm flex items-center gap-1 transition ${filter.isVideo === true ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-50"}`}>
          <Video size={14} /> Video
        </button>
      </div>
    </div>
  );
};

// ============================================
// ARTICLE CARD
// ============================================
const ArticleCard = ({ article }) => {
  return (
    <Link to={`/detail/${article.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={article.thumbnail} alt={article.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        {article.is_video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white/90 p-3 rounded-full"><Play size={24} className="text-navy" /></div>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Eye size={10} /> {article.total_view?.toLocaleString()}
          </span>
          {article.total_download > 0 && (
            <span className="bg-gold/90 text-navy text-xs px-2 py-1 rounded flex items-center gap-1 font-medium">
              <Download size={10} /> {article.total_download?.toLocaleString()}
            </span>
          )}
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
// LIGHTBOX
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
      
      <div className="flex items-center justify-between p-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
        <span className="text-gray-300 text-sm font-medium">{currentIndex + 1} / {images.length}</span>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} disabled={downloading}
            className="bg-gold hover:bg-gold-dark text-navy px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg">
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download HD
          </button>
          <button onClick={onClose} className="text-gray-300 hover:text-white p-2 bg-white/10 rounded-lg"><X size={24} /></button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-16" onClick={(e) => e.stopPropagation()}>
        {currentIndex > 0 && (
          <button onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition">
            <ChevronLeft size={32} />
          </button>
        )}
        <img src={currentImage.image_url || currentImage.thumbnail} alt="" loading="lazy"
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl" />
        {currentIndex < images.length - 1 && (
          <button onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition">
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      <div className="p-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center gap-2 overflow-x-auto max-w-4xl mx-auto scrollbar-hide">
          {images.slice(0, 10).map((img, idx) => (
            <button key={img.id || idx} onClick={() => onNavigate(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all
                ${idx === currentIndex ? 'ring-2 ring-gold scale-110' : 'opacity-50 hover:opacity-80'}`}>
              <img src={img.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
          {images.length > 10 && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-navy/80 flex items-center justify-center text-white text-sm font-medium">
              +{images.length - 10}
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
  const [filter, setFilter] = useState({ sortBy: "recent", isVideo: null, provinceId: null });
  const [loadingArticles, setLoadingArticles] = useState(false);

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
      if (filter.provinceId) params.append("province_id", filter.provinceId);
      const res = await axios.get(`${API}/articles?${params.toString()}`);
      setArticles(res.data);
    } catch (e) { console.error(e); }
    setLoadingArticles(false);
  };

  const handleProvinceClick = async (province) => {
    setSelectedProvince(province);
    // Set filter untuk provinsi yang diklik
    setFilter(f => ({ ...f, provinceId: province.id.toString() }));
    setRecLoading(true);
    try {
      const res = await axios.get(`${API}/ai/recommend/${province.id}`);
      setRecommendation(res.data);
    } catch (e) { console.error(e); }
    setRecLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <AISearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-navy via-navy-light to-navy">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gold">
            Galeri Wonderful Indonesia
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-gold/80 text-lg mb-8 max-w-2xl mx-auto">
            Download gratis foto & video pariwisata Indonesia berkualitas tinggi
          </motion.p>

          {/* AI Search Bar - DOMINANT */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-10">
            <div onClick={() => setSearchOpen(true)}
              className="bg-white rounded-2xl p-2 shadow-2xl cursor-pointer hover:shadow-3xl transition group">
              <div className="flex items-center gap-4 p-3">
                <div className="bg-gold p-3 rounded-xl group-hover:scale-105 transition">
                  <Sparkles size={24} className="text-navy" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-navy font-semibold">Pencarian Cerdas AI</p>
                  <p className="text-gray-500 text-sm">Coba: "pantai sunset bali" atau "wisata alam sulawesi"</p>
                </div>
                <div className="bg-navy text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-navy-light transition">
                  Cari
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatsSection stats={stats} />
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">Jelajahi Peta Indonesia</h2>
            <p className="text-gray-600">Klik provinsi untuk melihat rekomendasi destinasi</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-2 md:p-4 relative shadow-inner overflow-hidden">
            <IndonesiaMap provinces={provinces} onProvinceClick={handleProvinceClick} selectedProvince={selectedProvince} />
            <AnimatePresence>
              {selectedProvince && (
                <ProvincePanel province={selectedProvince} recommendation={recommendation} loading={recLoading}
                  onClose={() => setSelectedProvince(null)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy">Galeri</h2>
              <p className="text-gray-600 text-sm">Klik untuk melihat detail & download gambar HD</p>
            </div>
            <FilterBar provinces={provinces} filter={filter} setFilter={setFilter} />
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
              <img src="https://woni.sklmb.co/wonderful-indonesia.svg" alt="Wonderful Indonesia" className="h-10 mb-4" />
              <p className="text-gray-300 text-sm">Galeri Resmi Kementerian Pariwisata Republik Indonesia</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gold">Tautan</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><Link to="/" className="hover:text-gold transition">Beranda</Link></li>
                <li><Link to="/gallery" className="hover:text-gold transition">Galeri</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gold">Ikuti Kami</h4>
              <div className="flex gap-4 text-gray-300 text-sm">
                <a href="https://www.facebook.com/KemenPariwisata" className="hover:text-gold transition">Facebook</a>
                <a href="http://instagram.com/kemenpar.ri" className="hover:text-gold transition">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 Galeri Kementerian Pariwisata Republik Indonesia. Download gratis untuk semua.
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// DETAIL PAGE
// ============================================
const DetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => { loadArticle(); }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/articles/${id}`);
      setArticle(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const allImages = article ? [
    { id: 'main', thumbnail: article.thumbnail, image_url: article.thumbnail },
    ...(article.images || [])
  ] : [];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={48} className="animate-spin text-gold" /></div>;
  }

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Artikel tidak ditemukan</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => {}} />
      
      {lightboxOpen && (
        <Lightbox images={allImages} currentIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} onNavigate={setLightboxIndex} />
      )}

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-gold hover:text-gold-dark mb-6 font-medium">
            <ChevronLeft size={20} /> Kembali
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative cursor-pointer group" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                  <img src={article.thumbnail} alt={article.title} loading="lazy" loading="lazy" className="w-full max-h-[500px] object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                    <div className="bg-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition"><ZoomIn size={32} className="text-navy" /></div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-navy mb-4">{article.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin size={16} className="text-gold" />
                      {article.province_name || "Indonesia"}{article.city_name && `, ${article.city_name}`}
                    </span>
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      <Eye size={14} /> {article.total_view?.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      <Download size={14} /> {article.total_download?.toLocaleString() || 0} downloads
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

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Images size={20} className="text-gold" />
                    Galeri ({allImages.length})
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <div key={img.id || idx} onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group">
                      <img src={img.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                        <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      {idx === 0 && <span className="absolute top-1 left-1 bg-gold text-navy text-xs px-2 py-0.5 rounded font-medium">Utama</span>}
                    </div>
                  ))}
                </div>

                <button onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                  className="w-full mt-4 bg-gold hover:bg-gold-dark text-navy py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-md">
                  <Download size={20} /> Lihat & Download HD
                </button>
              </div>
            </div>
          </div>
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
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ sortBy: "recent", isVideo: null, provinceId: null });
  const [page, setPage] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => { loadProvinces(); }, []);
  useEffect(() => { setPage(0); loadArticles(true); }, [filter]);

  const loadProvinces = async () => {
    try {
      const res = await axios.get(`${API}/provinces`);
      setProvinces(res.data);
    } catch (e) { console.error(e); }
  };

  const loadArticles = async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("sort_by", filter.sortBy);
      params.append("limit", "24");
      params.append("offset", reset ? 0 : page * 24);
      if (filter.isVideo !== null) params.append("is_video", filter.isVideo);
      if (filter.provinceId) params.append("province_id", filter.provinceId);
      const res = await axios.get(`${API}/articles?${params.toString()}`);
      setArticles(prev => reset ? res.data : [...prev, ...res.data]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadMore = () => {
    setPage(p => p + 1);
    loadArticles(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <AISearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy">Galeri Foto & Video</h1>
              <p className="text-gray-500">Download gratis untuk semua keperluan</p>
            </div>
            <FilterBar provinces={provinces} filter={filter} setFilter={setFilter} />
          </div>
          
          {loading && articles.length === 0 ? (
            <div className="flex justify-center py-12"><Loader2 size={40} className="animate-spin text-gold" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <button onClick={loadMore} disabled={loading}
              className="bg-navy text-white px-8 py-3 rounded-full hover:bg-navy-light transition font-medium disabled:opacity-50">
              {loading ? <Loader2 size={20} className="animate-spin inline mr-2" /> : null}
              Muat Lebih Banyak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// APP
// ============================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<GalleryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  Info,
  Share2,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Indonesia Map SVG Component with clickable provinces
const IndonesiaMap = ({ provinces, onProvinceClick, selectedProvince }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full max-h-[500px]"
        style={{ filter: "drop-shadow(0 4px 20px rgba(212, 175, 55, 0.3))" }}
      >
        {/* Simplified Indonesia Map Path */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#B8962E" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sumatra */}
        <path
          d="M80,120 L120,80 L140,90 L160,130 L170,180 L160,230 L140,280 L110,320 L80,300 L70,250 L60,200 L70,150 Z"
          fill="url(#goldGradient)"
          stroke="#002F6C"
          strokeWidth="1"
          className="hover:brightness-110 transition-all cursor-pointer"
        />

        {/* Kalimantan */}
        <path
          d="M280,100 L340,80 L380,100 L400,150 L390,200 L350,230 L300,220 L270,180 L260,140 Z"
          fill="url(#goldGradient)"
          stroke="#002F6C"
          strokeWidth="1"
          className="hover:brightness-110 transition-all cursor-pointer"
        />

        {/* Sulawesi */}
        <path
          d="M420,120 L450,100 L480,110 L490,140 L470,170 L490,200 L480,240 L450,250 L430,220 L440,180 L420,150 Z"
          fill="url(#goldGradient)"
          stroke="#002F6C"
          strokeWidth="1"
          className="hover:brightness-110 transition-all cursor-pointer"
        />

        {/* Jawa */}
        <path
          d="M180,280 L220,270 L280,275 L340,280 L380,290 L360,310 L300,315 L240,310 L190,300 Z"
          fill="url(#goldGradient)"
          stroke="#002F6C"
          strokeWidth="1"
          className="hover:brightness-110 transition-all cursor-pointer"
        />

        {/* Bali & Nusa Tenggara */}
        <path
          d="M390,300 L410,295 L440,300 L470,305 L500,310 L490,325 L450,320 L410,315 L395,310 Z"
          fill="url(#goldGradient)"
          stroke="#002F6C"
          strokeWidth="1"
          className="hover:brightness-110 transition-all cursor-pointer"
        />

        {/* Maluku */}
        <path
          d="M520,180 L550,170 L570,190 L560,220 L540,230 L520,210 Z"
          fill="url(#goldGradient)"
          stroke="#002F6C"
          strokeWidth="1"
          className="hover:brightness-110 transition-all cursor-pointer"
        />

        {/* Papua */}
        <path
          d="M600,140 L680,120 L740,150 L750,200 L720,250 L660,260 L620,240 L600,200 L590,170 Z"
          fill="url(#goldGradient)"
          stroke="#002F6C"
          strokeWidth="1"
          className="hover:brightness-110 transition-all cursor-pointer"
        />

        {/* Province Markers */}
        {provinces.map((province) => {
          // Convert lat/lng to SVG coordinates (simplified mapping)
          const x = ((province.lng - 95) / 46) * 700 + 50;
          const y = ((-province.lat + 6) / 16) * 300 + 80;
          
          if (x < 50 || x > 780 || y < 50 || y > 380) return null;
          
          return (
            <g
              key={province.id}
              onClick={() => onProvinceClick(province)}
              className="cursor-pointer"
              filter={selectedProvince?.id === province.id ? "url(#glow)" : ""}
            >
              <circle
                cx={x}
                cy={y}
                r={selectedProvince?.id === province.id ? 12 : 8}
                fill="#002F6C"
                stroke="#FFCC00"
                strokeWidth="2"
                className="hover:r-12 transition-all"
              />
              <text
                x={x}
                y={y + 4}
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

// Header Component
const Header = ({ onOpenSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* Top utility bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.svg/120px-Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.svg.png"
                alt="Kemenpar"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.target.src = "https://woni.sklmb.co/kemenpar.png";
                }}
              />
              <div>
                <h1 className="text-navy font-bold text-lg leading-tight">
                  Kementerian Pariwisata
                </h1>
                <p className="text-navy/70 text-sm">Republik Indonesia</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Maximize2 size={20} className="text-navy" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Sun size={20} className="text-navy" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Search size={20} className="text-navy" />
              </button>
              <button className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition">
                <Globe size={20} className="text-navy" />
                <span className="text-sm text-navy">ID</span>
                <ChevronDown size={14} className="text-navy" />
              </button>
            </div>

            <button
              className="md:hidden text-navy p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-navy">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="hidden md:flex items-center gap-1">
              <NavItem icon={<HomeIcon size={16} />} label="Beranda" active />
              <NavItem icon={<ImageIcon size={16} />} label="Galeri Foto" />
              <NavItem icon={<Play size={16} />} label="Video" />
              <NavItem icon={<MapPin size={16} />} label="Destinasi" />
              <NavItem icon={<Filter size={16} />} label="Kategori" hasDropdown />
            </div>

            <button
              onClick={onOpenSearch}
              className="bg-gold hover:bg-gold-dark text-navy px-4 py-2 rounded-full flex items-center gap-2 transition font-semibold text-sm shadow-lg hover:shadow-xl"
              data-testid="ai-search-btn"
            >
              <Sparkles size={16} />
              <span>Pencarian AI</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <div className="bg-gold py-2">
        <div className="container mx-auto px-4 text-center">
          <p className="text-navy font-medium text-sm">
            Selamat datang di Galeri Resmi Kementerian Pariwisata RI - Download Gratis untuk Semua
          </p>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy px-4 py-3">
          <a href="/" className="block py-2 text-white hover:text-gold">
            Beranda
          </a>
          <a href="/gallery" className="block py-2 text-white hover:text-gold">
            Galeri Foto
          </a>
          <a href="/videos" className="block py-2 text-white hover:text-gold">
            Video
          </a>
        </div>
      )}
    </header>
  );
};

const NavItem = ({ icon, label, active, hasDropdown }) => (
  <button
    className={`flex items-center gap-2 px-4 py-3 text-sm transition ${
      active ? "text-gold" : "text-white hover:text-gold"
    }`}
  >
    {icon}
    <span>{label}</span>
    {hasDropdown && <ChevronDown size={14} />}
  </button>
);

// AI Search Modal - PREMIUM VERSION
const AISearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
      >
        <div
          className="absolute inset-0 bg-navy/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border-2 border-gold/30"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy to-navy-light p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gold p-2 rounded-xl">
                    <Sparkles size={24} className="text-navy" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Pencarian Cerdas AI</h2>
                    <p className="text-white/70 text-sm">Temukan destinasi impian Anda</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white bg-white/10 p-2 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder='Contoh: "pantai indah di Bali" atau "wisata budaya Yogyakarta"'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-5 py-4 pr-14 rounded-xl text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold shadow-lg"
                  data-testid="ai-search-input"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-navy p-3 rounded-lg hover:bg-gold-dark transition disabled:opacity-50 shadow-md"
                  data-testid="ai-search-submit"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-6 overflow-y-auto max-h-[50vh] bg-gray-50">
            {results ? (
              <div>
                {results.interpreted_query && (
                  <div className="mb-4 p-3 bg-navy/5 rounded-lg border border-navy/10">
                    <p className="text-sm text-navy/70">
                      <span className="font-semibold">AI memahami:</span>{" "}
                      {results.interpreted_query.province && `Provinsi: ${results.interpreted_query.province}`}
                      {results.interpreted_query.category && ` | Kategori: ${results.interpreted_query.category}`}
                      {results.interpreted_query.keywords && ` | Keywords: ${results.interpreted_query.keywords}`}
                    </p>
                  </div>
                )}
                {results.articles?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {results.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} compact />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Tidak ditemukan hasil. Coba kata kunci lain.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={40} className="text-gold" />
                </div>
                <p className="text-navy font-medium">Ketik pencarian dengan bahasa natural</p>
                <p className="text-sm text-gray-500 mt-2">
                  Contoh: "tempat romantis untuk honeymoon" atau "wisata alam di Sulawesi"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Province Recommendation Panel
const ProvincePanel = ({ province, recommendation, loading, onClose }) => {
  if (!province) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gold/20"
    >
      <div className="bg-gradient-to-br from-navy to-navy-light p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">{province.name}</h3>
            <p className="text-gold text-sm">{province.article_count} destinasi</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100%-80px)]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-gold" />
          </div>
        ) : (
          <>
            {recommendation?.recommendation && (
              <div className="mb-4 p-3 bg-gold/10 rounded-lg border border-gold/20">
                <p className="text-sm text-navy leading-relaxed">
                  {recommendation.recommendation}
                </p>
              </div>
            )}
            {recommendation?.articles?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-navy/60 uppercase tracking-wider">
                  Destinasi Populer
                </h4>
                {recommendation.articles.slice(0, 4).map((article) => (
                  <a
                    key={article.id}
                    href={`/detail/${article.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy line-clamp-2 group-hover:text-gold transition">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Eye size={10} /> {article.total_view?.toLocaleString()}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// Article Card Component
const ArticleCard = ({ article, compact = false }) => {
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(article.thumbnail);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(article.thumbnail, '_blank');
    }
  };

  return (
    <motion.a
      href={`/detail/${article.id}`}
      className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 ${compact ? '' : ''}`}
      whileHover={{ y: -4 }}
      data-testid={`article-card-${article.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        {article.is_video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white/90 p-3 rounded-full">
              <Play size={24} className="text-navy" />
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-navy/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Eye size={12} /> {article.total_view?.toLocaleString()}
        </div>
        
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute bottom-2 right-2 bg-gold hover:bg-gold-dark text-navy p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
          title="Download Gambar"
        >
          <Download size={18} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-navy line-clamp-2 group-hover:text-gold transition text-sm">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <MapPin size={12} className="text-gold" />
          <span className="truncate">{article.province_name || "Indonesia"}</span>
        </div>
      </div>
    </motion.a>
  );
};

// Main Home Component
const HomePage = () => {
  const [provinces, setProvinces] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState({ sortBy: "recent", isVideo: null });
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [filter]);

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
    } catch (e) {
      console.error("Error loading data:", e);
    }
  };

  const loadArticles = async () => {
    setLoadingArticles(true);
    try {
      const params = new URLSearchParams();
      params.append("sort_by", filter.sortBy);
      params.append("limit", "12");
      if (filter.isVideo !== null) {
        params.append("is_video", filter.isVideo);
      }
      if (filter.provinceId) {
        params.append("province_id", filter.provinceId);
      }
      const res = await axios.get(`${API}/articles?${params.toString()}`);
      setArticles(res.data);
    } catch (e) {
      console.error("Error loading articles:", e);
    }
    setLoadingArticles(false);
  };

  const handleProvinceClick = async (province) => {
    setSelectedProvince(province);
    setRecLoading(true);
    setRecommendation(null);

    try {
      const res = await axios.get(`${API}/ai/recommend/${province.id}`);
      setRecommendation(res.data);
    } catch (e) {
      console.error("Error getting recommendation:", e);
    }
    setRecLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <AISearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Hero Section with Map */}
      <section className="pt-36 pb-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-2">
              Jelajahi Keindahan Indonesia
            </h2>
            <p className="text-gray-600">
              Klik pada peta untuk melihat rekomendasi destinasi wisata
            </p>
          </div>

          {/* AI Search CTA */}
          <div className="max-w-2xl mx-auto mb-8">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full bg-white border-2 border-gold/30 rounded-2xl p-4 flex items-center gap-4 hover:border-gold hover:shadow-lg transition group"
            >
              <div className="bg-gold/10 p-3 rounded-xl group-hover:bg-gold/20 transition">
                <Sparkles size={24} className="text-gold" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-navy">Pencarian Cerdas AI</p>
                <p className="text-sm text-gray-500">Ketik dalam bahasa natural, misal: "pantai tenang untuk liburan keluarga"</p>
              </div>
              <div className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium">
                Cari
              </div>
            </button>
          </div>

          {/* Map Section */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="relative h-[500px]">
              <IndonesiaMap
                provinces={provinces}
                onProvinceClick={handleProvinceClick}
                selectedProvince={selectedProvince}
              />
              
              <AnimatePresence>
                {selectedProvince && (
                  <ProvincePanel
                    province={selectedProvince}
                    recommendation={recommendation}
                    loading={recLoading}
                    onClose={() => setSelectedProvince(null)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Stats */}
            {stats && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Camera className="text-gold" />}
                    value={stats.total_photos?.toLocaleString()}
                    label="Foto"
                  />
                  <StatCard
                    icon={<Video className="text-gold" />}
                    value={stats.total_videos?.toLocaleString()}
                    label="Video"
                  />
                  <StatCard
                    icon={<MapPin className="text-gold" />}
                    value={stats.total_provinces}
                    label="Provinsi"
                  />
                  <StatCard
                    icon={<Download className="text-gold" />}
                    value="Gratis"
                    label="Download"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-navy font-semibold whitespace-nowrap">Kategori:</span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gold/20 hover:text-navy transition whitespace-nowrap text-sm border border-transparent hover:border-gold/30"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy">Galeri Destinasi</h2>
              <p className="text-gray-500 text-sm">Download gratis untuk semua keperluan</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setFilter((f) => ({ ...f, sortBy: "recent" }))}
                  className={`px-4 py-2 flex items-center gap-2 text-sm transition ${
                    filter.sortBy === "recent"
                      ? "bg-navy text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Clock size={14} /> Terbaru
                </button>
                <button
                  onClick={() => setFilter((f) => ({ ...f, sortBy: "popular" }))}
                  className={`px-4 py-2 flex items-center gap-2 text-sm transition ${
                    filter.sortBy === "popular"
                      ? "bg-navy text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <TrendingUp size={14} /> Populer
                </button>
              </div>
              <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setFilter((f) => ({ ...f, isVideo: null }))}
                  className={`px-4 py-2 text-sm transition ${
                    filter.isVideo === null
                      ? "bg-navy text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilter((f) => ({ ...f, isVideo: false }))}
                  className={`px-4 py-2 flex items-center gap-1 text-sm transition ${
                    filter.isVideo === false
                      ? "bg-navy text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Camera size={14} />
                </button>
                <button
                  onClick={() => setFilter((f) => ({ ...f, isVideo: true }))}
                  className={`px-4 py-2 flex items-center gap-1 text-sm transition ${
                    filter.isVideo === true
                      ? "bg-navy text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Video size={14} />
                </button>
              </div>
            </div>
          </div>

          {loadingArticles ? (
            <div className="flex justify-center py-12">
              <Loader2 size={40} className="animate-spin text-gold" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <button className="bg-navy text-white px-8 py-3 rounded-full hover:bg-navy-light transition font-medium shadow-lg hover:shadow-xl">
              Muat Lebih Banyak
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img
                src="https://woni.sklmb.co/wonderful-indonesia.svg"
                alt="Wonderful Indonesia"
                className="h-12 mb-4"
              />
              <p className="text-gray-400 text-sm">
                Galeri Resmi Kementerian Pariwisata Republik Indonesia
              </p>
              <p className="text-gold text-sm mt-2">
                Semua foto dan video gratis untuk diunduh
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gold">Tautan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/" className="hover:text-gold transition">Beranda</a></li>
                <li><a href="/gallery" className="hover:text-gold transition">Galeri</a></li>
                <li><a href="/privacy-policy" className="hover:text-gold transition">Kebijakan Privasi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gold">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/KemenPariwisata" className="text-gray-400 hover:text-gold transition">Facebook</a>
                <a href="http://instagram.com/kemenpar.ri" className="text-gray-400 hover:text-gold transition">Instagram</a>
                <a href="https://x.com/KemenPariwisata" className="text-gray-400 hover:text-gold transition">Twitter</a>
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

// Stat Card Component
const StatCard = ({ icon, value, label }) => (
  <div className="text-center p-4 bg-gray-50 rounded-xl">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-2xl font-bold text-navy">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

// Detail Page Component
const DetailPage = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const articleId = window.location.pathname.split("/").pop();

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      const res = await axios.get(`${API}/articles/${articleId}`);
      setArticle(res.data);
    } catch (e) {
      console.error("Error loading article:", e);
    }
    setLoading(false);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

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
      <Header onOpenSearch={() => {}} />
      <div className="pt-40 pb-12">
        <div className="container mx-auto px-4">
          <a
            href="/"
            className="text-gold hover:text-gold-dark flex items-center gap-1 mb-6 font-medium"
          >
            ← Kembali ke Beranda
          </a>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="relative">
              {article.is_video && article.video_url ? (
                <div className="aspect-video">
                  <iframe
                    src={article.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={article.title}
                  />
                </div>
              ) : (
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full max-h-[60vh] object-cover"
                />
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                    {article.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} className="text-gold" />
                      {article.province_name || "Indonesia"}
                      {article.city_name && `, ${article.city_name}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {article.total_view?.toLocaleString()} views
                    </span>
                    {article.category && (
                      <span className="bg-gold/20 text-navy px-3 py-1 rounded-full font-medium">
                        {article.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(article.thumbnail, `${article.title}.jpg`)}
                  className="bg-gold hover:bg-gold-dark text-navy px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
                >
                  <Download size={20} />
                  Download Gambar
                </button>
              </div>

              {article.content && (
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

              {article.images?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-navy mb-4">Galeri Foto</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {article.images.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.thumbnail}
                          alt=""
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                        <button
                          onClick={() => handleDownload(img.image_url, `image_${img.id}.jpg`)}
                          className="absolute inset-0 bg-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg"
                        >
                          <div className="bg-gold text-navy p-3 rounded-full">
                            <Download size={24} />
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {article.tags && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.split(",").map((tag, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/gallery" element={<HomePage />} />
          <Route path="/videos" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

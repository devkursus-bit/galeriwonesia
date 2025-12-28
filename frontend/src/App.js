import { useState, useEffect } from "react";
import "@/App.css";
import "leaflet/dist/leaflet.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Search,
  MapPin,
  Camera,
  Video,
  Eye,
  X,
  ChevronRight,
  Sparkles,
  Globe,
  Menu,
  Home as HomeIcon,
  Image as ImageIcon,
  Play,
  Loader2,
  Filter,
  Clock,
  TrendingUp,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon
const createCustomIcon = (count) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div class="marker-pin"><span>${count}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// Map center controller
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

// Header Component
const Header = ({ onOpenSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-700 to-red-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="https://woni.sklmb.co/kemenpar.png"
              alt="Kemenpar"
              className="h-10 bg-white rounded p-1"
            />
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg leading-tight">
                Wonderful Indonesia
              </h1>
              <p className="text-red-100 text-xs">Image Gallery</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-white hover:text-red-200 transition flex items-center gap-1"
            >
              <HomeIcon size={16} />
              Home
            </a>
            <a
              href="/gallery"
              className="text-white hover:text-red-200 transition flex items-center gap-1"
            >
              <ImageIcon size={16} />
              Gallery
            </a>
            <a
              href="/videos"
              className="text-white hover:text-red-200 transition flex items-center gap-1"
            >
              <Play size={16} />
              Videos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition"
              data-testid="ai-search-btn"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">Cari Cerdas</span>
            </button>
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-red-800 px-4 py-3">
          <a
            href="/"
            className="block py-2 text-white hover:text-red-200"
          >
            Home
          </a>
          <a
            href="/gallery"
            className="block py-2 text-white hover:text-red-200"
          >
            Gallery
          </a>
          <a
            href="/videos"
            className="block py-2 text-white hover:text-red-200"
          >
            Videos
          </a>
        </div>
      )}
    </header>
  );
};

// AI Search Modal
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden animate-slideDown">
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={24} />
              <h2 className="text-xl font-bold">Pencarian Cerdas</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder='Coba: "pantai indah di Bali" atau "wisata kuliner Jawa Timur"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-5 py-4 pr-14 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              data-testid="ai-search-input"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
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

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {results ? (
            <div>
              {results.interpreted_query && (
                <p className="text-sm text-gray-500 mb-4">
                  Mencari:{" "}
                  {results.interpreted_query.keywords ||
                    results.interpreted_query.province ||
                    "Semua"}
                </p>
              )}
              {results.articles?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {results.articles.map((article) => (
                    <a
                      key={article.id}
                      href={`/detail/${article.id}`}
                      className="group"
                    >
                      <div className="aspect-video rounded-lg overflow-hidden mb-2">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-red-600">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {article.province_name}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Tidak ditemukan hasil. Coba kata kunci lain.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Sparkles size={48} className="mx-auto mb-4 text-red-300" />
              <p>
                Ketik pencarian dengan bahasa natural, seperti:
              </p>
              <p className="text-sm mt-2">
                "pantai romantis untuk honeymoon" atau "wisata alam di Sulawesi"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Province Recommendation Popup
const ProvincePopup = ({ province, recommendation, articles, loading }) => {
  return (
    <div className="min-w-[300px] max-w-[350px]">
      <h3 className="font-bold text-lg text-red-700 mb-2">{province}</h3>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={24} className="animate-spin text-red-500" />
        </div>
      ) : (
        <>
          {recommendation && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {recommendation}
            </p>
          )}
          {articles?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Destinasi Populer:
              </p>
              {articles.slice(0, 3).map((article) => (
                <a
                  key={article.id}
                  href={`/detail/${article.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
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
  const [mapCenter, setMapCenter] = useState([-2.5, 118]);
  const [mapZoom, setMapZoom] = useState(5);
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

    // Center map on province
    if (province.lat && province.lng) {
      setMapCenter([province.lat, province.lng]);
      setMapZoom(8);
    }

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
      <section className="pt-16">
        <div className="relative h-[70vh] bg-gray-900">
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            {provinces.map(
              (province) =>
                province.lat &&
                province.lng && (
                  <Marker
                    key={province.id}
                    position={[province.lat, province.lng]}
                    icon={createCustomIcon(province.article_count)}
                    eventHandlers={{
                      click: () => handleProvinceClick(province),
                    }}
                  >
                    <Popup maxWidth={400}>
                      <ProvincePopup
                        province={province.name}
                        recommendation={recommendation?.recommendation}
                        articles={recommendation?.articles}
                        loading={
                          recLoading && selectedProvince?.id === province.id
                        }
                      />
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>

          {/* Overlay Content */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            <div className="container mx-auto">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">
                Jelajahi Indonesia
              </h2>
              <p className="text-white/80 text-lg">
                Klik marker pada peta untuk melihat rekomendasi destinasi
              </p>
            </div>
          </div>

          {/* Stats Overlay */}
          {stats && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="container mx-auto">
                <div className="flex flex-wrap justify-center gap-6 text-white">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {stats.total_photos?.toLocaleString()}
                    </p>
                    <p className="text-sm text-white/70 flex items-center gap-1">
                      <Camera size={14} /> Foto
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {stats.total_videos?.toLocaleString()}
                    </p>
                    <p className="text-sm text-white/70 flex items-center gap-1">
                      <Video size={14} /> Video
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {stats.total_provinces}
                    </p>
                    <p className="text-sm text-white/70 flex items-center gap-1">
                      <MapPin size={14} /> Provinsi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Search Floating Button (Mobile) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden absolute bottom-20 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition"
            data-testid="ai-search-float-btn"
          >
            <Sparkles size={24} />
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-gray-500 font-medium whitespace-nowrap">
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition whitespace-nowrap text-sm"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter & Articles Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Galeri Destinasi
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-lg border overflow-hidden">
                <button
                  onClick={() =>
                    setFilter((f) => ({ ...f, sortBy: "recent" }))
                  }
                  className={`px-4 py-2 flex items-center gap-1 text-sm transition ${
                    filter.sortBy === "recent"
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Clock size={14} /> Terbaru
                </button>
                <button
                  onClick={() =>
                    setFilter((f) => ({ ...f, sortBy: "popular" }))
                  }
                  className={`px-4 py-2 flex items-center gap-1 text-sm transition ${
                    filter.sortBy === "popular"
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <TrendingUp size={14} /> Populer
                </button>
              </div>
              <div className="flex items-center bg-white rounded-lg border overflow-hidden">
                <button
                  onClick={() => setFilter((f) => ({ ...f, isVideo: null }))}
                  className={`px-4 py-2 text-sm transition ${
                    filter.isVideo === null
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilter((f) => ({ ...f, isVideo: false }))}
                  className={`px-4 py-2 flex items-center gap-1 text-sm transition ${
                    filter.isVideo === false
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Camera size={14} />
                </button>
                <button
                  onClick={() => setFilter((f) => ({ ...f, isVideo: true }))}
                  className={`px-4 py-2 flex items-center gap-1 text-sm transition ${
                    filter.isVideo === true
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Video size={14} />
                </button>
              </div>
            </div>
          </div>

          {loadingArticles ? (
            <div className="flex justify-center py-12">
              <Loader2 size={40} className="animate-spin text-red-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={`/detail/${article.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300"
                  data-testid={`article-card-${article.id}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      loading="lazy"
                    />
                    {article.is_video && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="bg-white/90 p-3 rounded-full">
                          <Play size={24} className="text-red-600" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Eye size={12} /> {article.total_view?.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 line-clamp-2 group-hover:text-red-600 transition">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      <span className="truncate">
                        {article.province_name || "Indonesia"}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition font-medium">
              Muat Lebih Banyak
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img
                src="https://woni.sklmb.co/wonderful-indonesia.svg"
                alt="Wonderful Indonesia"
                className="h-12 mb-4"
              />
              <p className="text-gray-400 text-sm">
                Wonderful Image by The Ministry of Tourism
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Tautan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="/" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/gallery" className="hover:text-white">
                    Gallery
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/KemenPariwisata"
                  className="text-gray-400 hover:text-white"
                >
                  Facebook
                </a>
                <a
                  href="http://instagram.com/kemenpar.ri"
                  className="text-gray-400 hover:text-white"
                >
                  Instagram
                </a>
                <a
                  href="https://x.com/KemenPariwisata"
                  className="text-gray-400 hover:text-white"
                >
                  Twitter
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 Wonderful Image by The Ministry of Tourism. All photos and
            videos are free to use.
          </div>
        </div>
      </footer>
    </div>
  );
};

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-red-500" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Artikel tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSearch={() => {}} />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <a
            href="/"
            className="text-red-600 hover:text-red-700 flex items-center gap-1 mb-6"
          >
            ← Kembali ke Beranda
          </a>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {article.province_name || "Indonesia"}
                  {article.city_name && `, ${article.city_name}`}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {article.total_view?.toLocaleString()} views
                </span>
                {article.category && (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                )}
              </div>

              {article.content && (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

              {article.images?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Galeri Foto
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {article.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={img.thumbnail}
                          alt=""
                          className="w-full h-full object-cover hover:scale-110 transition duration-300"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {article.tags && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Tags:
                  </h3>
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

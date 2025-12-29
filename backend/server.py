from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from openai import OpenAI
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# PostgreSQL connection
def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get('PG_HOST'),
        port=os.environ.get('PG_PORT'),
        database=os.environ.get('PG_DATABASE'),
        user=os.environ.get('PG_USER'),
        password=os.environ.get('PG_PASSWORD'),
        cursor_factory=RealDictCursor
    )

# OpenAI client
openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class Province(BaseModel):
    id: int
    name: str
    article_count: Optional[int] = 0
    lat: Optional[float] = 0
    lng: Optional[float] = 0

class Article(BaseModel):
    id: int
    title: str
    thumbnail: str
    is_video: bool
    total_view: int
    total_download: Optional[int] = 0
    province_name: Optional[str] = None
    city_name: Optional[str] = None
    tags: Optional[str] = None
    posting_date: Optional[str] = None
    category: Optional[str] = None

class ArticleDetail(BaseModel):
    id: int
    title: str
    thumbnail: str
    is_video: bool
    video_url: Optional[str] = None
    total_view: int
    total_download: Optional[int] = 0
    province_name: Optional[str] = None
    city_name: Optional[str] = None
    tags: Optional[str] = None
    posting_date: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    images: List[dict] = []

class SearchRequest(BaseModel):
    query: str

class ArticlesResponse(BaseModel):
    articles: List[Article]
    total: int
    has_more: bool

class AIRecommendation(BaseModel):
    recommendation: str
    articles: List[Article]

# Province coordinates for map
PROVINCE_COORDINATES = {
    "ACEH": {"lat": 4.6951, "lng": 96.7494},
    "SUMATERA UTARA": {"lat": 2.1154, "lng": 99.5451},
    "SUMATERA BARAT": {"lat": -0.7399, "lng": 100.8000},
    "RIAU": {"lat": 0.2933, "lng": 101.7068},
    "JAMBI": {"lat": -1.4852, "lng": 102.4381},
    "SUMATERA SELATAN": {"lat": -3.3194, "lng": 103.9144},
    "BENGKULU": {"lat": -3.5778, "lng": 102.3464},
    "LAMPUNG": {"lat": -4.5586, "lng": 105.4068},
    "KEPULAUAN BANGKA BELITUNG": {"lat": -2.7411, "lng": 106.4406},
    "KEPULAUAN RIAU": {"lat": 3.9457, "lng": 108.1429},
    "DKI JAKARTA": {"lat": -6.2088, "lng": 106.8456},
    "JAWA BARAT": {"lat": -6.9175, "lng": 107.6191},
    "JAWA TENGAH": {"lat": -7.1510, "lng": 110.1403},
    "DI YOGYAKARTA": {"lat": -7.7956, "lng": 110.3695},
    "JAWA TIMUR": {"lat": -7.5361, "lng": 112.2384},
    "BANTEN": {"lat": -6.4058, "lng": 106.0640},
    "BALI": {"lat": -8.3405, "lng": 115.0920},
    "NUSA TENGGARA BARAT": {"lat": -8.6529, "lng": 117.3616},
    "NUSA TENGGARA TIMUR": {"lat": -8.6574, "lng": 121.0794},
    "KALIMANTAN BARAT": {"lat": -0.2788, "lng": 111.4753},
    "KALIMANTAN TENGAH": {"lat": -1.6815, "lng": 113.3824},
    "KALIMANTAN SELATAN": {"lat": -3.0926, "lng": 115.2838},
    "KALIMANTAN TIMUR": {"lat": 1.6407, "lng": 116.4194},
    "KALIMANTAN UTARA": {"lat": 3.0731, "lng": 116.0413},
    "SULAWESI UTARA": {"lat": 0.6247, "lng": 123.9750},
    "SULAWESI TENGAH": {"lat": -1.4300, "lng": 121.4456},
    "SULAWESI SELATAN": {"lat": -3.6688, "lng": 119.9741},
    "SULAWESI TENGGARA": {"lat": -4.1449, "lng": 122.1746},
    "GORONTALO": {"lat": 0.6999, "lng": 122.4467},
    "SULAWESI BARAT": {"lat": -2.8442, "lng": 119.2321},
    "MALUKU": {"lat": -3.2385, "lng": 130.1453},
    "MALUKU UTARA": {"lat": 1.5710, "lng": 127.8088},
    "PAPUA": {"lat": -4.2699, "lng": 138.0804},
    "PAPUA BARAT": {"lat": -1.3361, "lng": 133.1747},
    "PAPUA TENGAH": {"lat": -3.5896, "lng": 135.8027},
    "PAPUA PEGUNUNGAN": {"lat": -4.0898, "lng": 138.9399},
    "PAPUA SELATAN": {"lat": -6.5000, "lng": 140.0000},
    "PAPUA BARAT DAYA": {"lat": -2.5000, "lng": 132.0000},
}

# Routes
@api_router.get("/")
async def root():
    return {"message": "Wonderful Indonesia API"}

@api_router.get("/provinces", response_model=List[Province])
async def get_provinces():
    """Get all provinces with article count"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT p.id, p.name, COALESCE(COUNT(a.id), 0) as article_count
            FROM "Province" p
            LEFT JOIN "Article" a ON p.id = a.id_province AND a.is_active = true
            GROUP BY p.id, p.name
            ORDER BY p.name
        """)
        
        provinces = []
        for row in cur.fetchall():
            coords = PROVINCE_COORDINATES.get(row['name'], {"lat": 0, "lng": 0})
            provinces.append({
                "id": row['id'],
                "name": row['name'],
                "article_count": row['article_count'] if row['article_count'] is not None else 0,
                "lat": coords['lat'],
                "lng": coords['lng']
            })
        
        cur.close()
        conn.close()
        return provinces
    except Exception as e:
        return []

@api_router.get("/articles", response_model=List[Article])
async def get_articles(
    province_id: Optional[int] = None,
    category_id: Optional[int] = None,
    is_video: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = Query("recent", enum=["recent", "popular", "downloads"]),
    limit: int = 20,
    offset: int = 0
):
    """Get articles with filters"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
        SELECT a.id, a.title, a.thumbnail, a.is_video, a.total_view,
               p.name as province_name, c.name as city_name, 
               a.tags_csv as tags, a.posting_date, cat.label as category,
               COALESCE((SELECT SUM(total_download) FROM "ArticleContentImage" WHERE id_article = a.id), 0) as total_download
        FROM "Article" a
        LEFT JOIN "Province" p ON a.id_province = p.id
        LEFT JOIN "City" c ON a.id_city = c.id
        LEFT JOIN "Category" cat ON a.id_category = cat.id
        WHERE a.is_active = true
    """
    params = []
    
    if province_id:
        query += " AND a.id_province = %s"
        params.append(province_id)
    
    if category_id:
        query += " AND a.id_category = %s"
        params.append(category_id)
    
    if is_video is not None:
        query += " AND a.is_video = %s"
        params.append(is_video)
    
    if search:
        query += " AND (LOWER(a.title) LIKE LOWER(%s) OR LOWER(a.tags_csv) LIKE LOWER(%s))"
        search_param = f"%{search}%"
        params.extend([search_param, search_param])
    
    if sort_by == "popular":
        query += " ORDER BY a.total_view DESC"
    elif sort_by == "downloads":
        query += " ORDER BY total_download DESC"
    else:
        query += " ORDER BY a.posting_date DESC"
    
    query += " LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    articles = cur.fetchall()
    
    cur.close()
    conn.close()
    return articles

@api_router.get("/articles/paginated", response_model=ArticlesResponse)
async def get_articles_paginated(
    province_id: Optional[int] = None,
    category_id: Optional[int] = None,
    is_video: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = Query("recent", enum=["recent", "popular", "downloads"]),
    limit: int = 24,
    offset: int = 0
):
    """Get articles with pagination info"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Build WHERE clause
    where_clause = "WHERE a.is_active = true"
    params = []
    
    if province_id:
        where_clause += " AND a.id_province = %s"
        params.append(province_id)
    
    if category_id:
        where_clause += " AND a.id_category = %s"
        params.append(category_id)
    
    if is_video is not None:
        where_clause += " AND a.is_video = %s"
        params.append(is_video)
    
    if search:
        where_clause += " AND (LOWER(a.title) LIKE LOWER(%s) OR LOWER(a.tags_csv) LIKE LOWER(%s))"
        search_param = f"%{search}%"
        params.extend([search_param, search_param])
    
    # Get total count
    count_query = f'SELECT COUNT(*) as total FROM "Article" a {where_clause}'
    cur.execute(count_query, params)
    count_result = cur.fetchone()
    total = count_result['total'] if count_result else 0
    
    # Get articles
    query = f"""
        SELECT a.id, a.title, a.thumbnail, a.is_video, a.total_view,
               p.name as province_name, c.name as city_name, 
               a.tags_csv as tags, a.posting_date, cat.label as category,
               COALESCE((SELECT SUM(total_download) FROM "ArticleContentImage" WHERE id_article = a.id), 0) as total_download
        FROM "Article" a
        LEFT JOIN "Province" p ON a.id_province = p.id
        LEFT JOIN "City" c ON a.id_city = c.id
        LEFT JOIN "Category" cat ON a.id_category = cat.id
        {where_clause}
    """
    
    if sort_by == "popular":
        query += " ORDER BY a.total_view DESC"
    elif sort_by == "downloads":
        query += " ORDER BY total_download DESC"
    else:
        query += " ORDER BY a.posting_date DESC"
    
    query += " LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    articles = cur.fetchall()
    
    cur.close()
    conn.close()
    
    has_more = (offset + len(articles)) < total
    
    return ArticlesResponse(articles=articles, total=total, has_more=has_more)

@api_router.get("/articles/{article_id}", response_model=ArticleDetail)
async def get_article_detail(article_id: int):
    """Get article detail with content and images"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get article
    cur.execute("""
        SELECT a.id, a.title, a.thumbnail, a.is_video, a.video_url, a.total_view,
               p.name as province_name, c.name as city_name, 
               a.tags_csv as tags, a.posting_date, cat.label as category
        FROM "Article" a
        LEFT JOIN "Province" p ON a.id_province = p.id
        LEFT JOIN "City" c ON a.id_city = c.id
        LEFT JOIN "Category" cat ON a.id_category = cat.id
        WHERE a.id = %s AND a.is_active = true
    """, [article_id])
    
    article = cur.fetchone()
    if not article:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get content
    cur.execute("""
        SELECT content FROM "ArticleContent" WHERE id_article = %s
    """, [article_id])
    content_row = cur.fetchone()
    content = content_row['content'] if content_row else None
    
    # Get images
    cur.execute("""
        SELECT id, thumbnail, image_url, total_download
        FROM "ArticleContentImage" WHERE id_article = %s
    """, [article_id])
    images = cur.fetchall()
    
    # Calculate total downloads for this article
    cur.execute("""
        SELECT COALESCE(SUM(total_download), 0) as total FROM "ArticleContentImage" WHERE id_article = %s
    """, [article_id])
    total_download = cur.fetchone()['total']
    
    # Increment view count
    cur.execute("""
        UPDATE "Article" SET total_view = total_view + 1 WHERE id = %s
    """, [article_id])
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        **dict(article),
        "content": content,
        "images": [dict(img) for img in images],
        "total_download": total_download
    }

@api_router.post("/images/{image_id}/download")
async def increment_download(image_id: int):
    """Increment download count for an image"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Update download count
        cur.execute("""
            UPDATE "ArticleContentImage" 
            SET total_download = COALESCE(total_download, 0) + 1 
            WHERE id = %s
            RETURNING total_download
        """, (image_id,))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if result:
            return {"success": True, "new_count": result['total_download']}
        return {"success": False, "message": "Image not found"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@api_router.get("/categories")
async def get_categories():
    """Get all categories"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT c.id, c.label, c.slug, c.thumbnail, COUNT(a.id) as article_count
        FROM "Category" c
        LEFT JOIN "Article" a ON c.id = a.id_category AND a.is_active = true
        GROUP BY c.id, c.label, c.slug, c.thumbnail
        ORDER BY c.label
    """)
    
    categories = cur.fetchall()
    cur.close()
    conn.close()
    return categories

@api_router.get("/popular-tags")
async def get_popular_tags():
    """Get popular tags"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT tag, count FROM "PopularTag" ORDER BY count DESC LIMIT 20
    """)
    
    tags = cur.fetchall()
    cur.close()
    conn.close()
    return tags

@api_router.get("/stats")
async def get_stats():
    """Get statistics"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Total articles
        cur.execute("SELECT COUNT(*) as total FROM \"Article\" WHERE is_active = true")
        result = cur.fetchone()
        total_articles = result['total'] if result and result['total'] is not None else 0
        
        # Total photos (non-video)
        cur.execute("SELECT COUNT(*) as total FROM \"Article\" WHERE is_active = true AND is_video = false")
        result = cur.fetchone()
        total_photos = result['total'] if result and result['total'] is not None else 0
        
        # Total videos
        cur.execute("SELECT COUNT(*) as total FROM \"Article\" WHERE is_active = true AND is_video = true")
        result = cur.fetchone()
        total_videos = result['total'] if result and result['total'] is not None else 0
        
        # Total provinces
        cur.execute("SELECT COUNT(*) as total FROM \"Province\"")
        result = cur.fetchone()
        total_provinces = result['total'] if result and result['total'] is not None else 0
        
        # Total high-res images
        cur.execute("SELECT COUNT(*) as total FROM \"ArticleContentImage\"")
        result = cur.fetchone()
        total_images = result['total'] if result and result['total'] is not None else 0
        
        # Total views
        cur.execute("SELECT COALESCE(SUM(total_view), 0) as total FROM \"Article\" WHERE is_active = true")
        result = cur.fetchone()
        total_views = int(result['total']) if result and result['total'] is not None else 0
        
        # Total downloads
        cur.execute("SELECT COALESCE(SUM(total_download), 0) as total FROM \"ArticleContentImage\"")
        result = cur.fetchone()
        total_downloads = int(result['total']) if result and result['total'] is not None else 0
        
        cur.close()
        conn.close()
        
        return {
            "total_articles": total_articles,
            "total_photos": total_photos,
            "total_videos": total_videos,
            "total_provinces": total_provinces,
            "total_images": total_images,
            "total_views": total_views,
            "total_downloads": total_downloads
        }
    except Exception as e:
        # Return default values on error
        return {
            "total_articles": 0,
            "total_photos": 0,
            "total_videos": 0,
            "total_provinces": 0,
            "total_images": 0,
            "total_views": 0,
            "total_downloads": 0
        }

@api_router.post("/ai/search")
async def ai_search(request: SearchRequest):
    """AI-powered natural language search"""
    try:
        # Get all provinces and categories for context
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT name FROM \"Province\"")
        provinces = [row['name'] for row in cur.fetchall()]
        
        cur.execute("SELECT label FROM \"Category\"")
        categories = [row['label'] for row in cur.fetchall()]
        
        # Use AI to understand the query
        system_prompt = f"""Kamu adalah asisten pencarian wisata Indonesia. 
Tugasmu adalah menganalisis query pencarian dan mengekstrak:
1. province: nama provinsi yang dimaksud (harus salah satu dari: {', '.join(provinces)}) atau null
2. category: kategori wisata (harus salah satu dari: {', '.join(categories)}) atau null  
3. keywords: kata kunci pencarian yang relevan (bisa berupa nama tempat, aktivitas, dll)
4. is_video: true jika mencari video, false jika foto, null jika tidak spesifik

Jawab dalam format JSON:
{{"province": "...", "category": "...", "keywords": "...", "is_video": null}}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.query}
            ],
            response_format={"type": "json_object"},
            max_tokens=200
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        
        # Build search query - prioritize province match
        query = """
            SELECT a.id, a.title, a.thumbnail, a.is_video, a.total_view,
                   p.name as province_name, c.name as city_name, 
                   a.tags_csv as tags, a.posting_date, cat.label as category
            FROM "Article" a
            LEFT JOIN "Province" p ON a.id_province = p.id
            LEFT JOIN "City" c ON a.id_city = c.id
            LEFT JOIN "Category" cat ON a.id_category = cat.id
            WHERE a.is_active = true
        """
        params = []
        has_filter = False
        
        if ai_result.get('province'):
            query += " AND LOWER(p.name) LIKE LOWER(%s)"
            params.append(f"%{ai_result['province']}%")
            has_filter = True
        
        if ai_result.get('category'):
            query += " AND LOWER(cat.label) LIKE LOWER(%s)"
            params.append(f"%{ai_result['category']}%")
            has_filter = True
        
        if ai_result.get('is_video') is not None:
            query += " AND a.is_video = %s"
            params.append(ai_result['is_video'])
        
        query += " ORDER BY a.total_view DESC LIMIT 12"
        
        cur.execute(query, params)
        articles = cur.fetchall()
        
        # If no results with province filter, try keyword search
        if len(articles) == 0 and ai_result.get('keywords'):
            query2 = """
                SELECT a.id, a.title, a.thumbnail, a.is_video, a.total_view,
                       p.name as province_name, c.name as city_name, 
                       a.tags_csv as tags, a.posting_date, cat.label as category
                FROM "Article" a
                LEFT JOIN "Province" p ON a.id_province = p.id
                LEFT JOIN "City" c ON a.id_city = c.id
                LEFT JOIN "Category" cat ON a.id_category = cat.id
                WHERE a.is_active = true
                AND (LOWER(a.title) LIKE LOWER(%s) OR LOWER(a.tags_csv) LIKE LOWER(%s))
                ORDER BY a.total_view DESC LIMIT 12
            """
            keywords = f"%{ai_result['keywords']}%"
            cur.execute(query2, [keywords, keywords])
            articles = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            "interpreted_query": ai_result,
            "articles": [dict(a) for a in articles]
        }
        
    except Exception as e:
        logging.error(f"AI search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/recommend/{province_id}")
async def ai_recommend(province_id: int):
    """Get AI recommendations for a province"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get province info
        cur.execute("SELECT name FROM \"Province\" WHERE id = %s", [province_id])
        province_row = cur.fetchone()
        if not province_row:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Province not found")
        
        province_name = province_row['name']
        
        # Get top articles from this province
        cur.execute("""
            SELECT a.id, a.title, a.thumbnail, a.is_video, a.total_view,
                   p.name as province_name, c.name as city_name, 
                   a.tags_csv as tags, a.posting_date, cat.label as category
            FROM "Article" a
            LEFT JOIN "Province" p ON a.id_province = p.id
            LEFT JOIN "City" c ON a.id_city = c.id
            LEFT JOIN "Category" cat ON a.id_category = cat.id
            WHERE a.is_active = true AND a.id_province = %s
            ORDER BY a.total_view DESC
            LIMIT 8
        """, [province_id])
        
        articles = [dict(a) for a in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        # Generate AI recommendation
        if articles:
            article_titles = [a['title'] for a in articles[:5]]
            
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Kamu adalah pemandu wisata Indonesia yang ramah dan informatif. Berikan rekomendasi singkat dan menarik dalam 2-3 kalimat."},
                    {"role": "user", "content": f"Berikan rekomendasi wisata singkat untuk provinsi {province_name}. Beberapa destinasi populer di sana: {', '.join(article_titles)}"}
                ],
                max_tokens=150
            )
            
            recommendation = response.choices[0].message.content
        else:
            recommendation = f"Jelajahi keindahan {province_name}! Provinsi ini menyimpan banyak destinasi wisata menarik yang menunggu untuk ditemukan."
        
        return {
            "province_name": province_name,
            "recommendation": recommendation,
            "articles": articles
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"AI recommend error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

// ==========================================
// 1. استيراد المكتبات الأساسية وأدوات الأيقونات
// ==========================================
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import { ArrowRight, Menu, Moon, Sun, X, LogOut, ZoomIn, ZoomOut, ExternalLink, Layers } from 'lucide-react';
import { useLocation } from 'wouter';
import * as pdfjsLib from 'pdfjs-dist';

// استيراد دالة جلب عميل Supabase المدعوم بالتوكن
import { getSupabaseClient } from './lib/supabase';

// استيراد صور اللوجو الخاصة بالـ Light Mode والـ Dark Mode
import logoImageLight from "./logoImagelightmode.png";
import logoImageDark from "./logoImagedarkmode.png";

// ==========================================
// 2. متغيرات البيئة للبيانات الشخصية وسرية التطبيق
// ==========================================
const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || '';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || '';
const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || '';
const LINKEDIN_URL = import.meta.env.VITE_LINKEDIN_URL || '';
const ENGINEER_NAME = import.meta.env.VITE_ENGINEER_NAME || 'HVAC Engineer';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Engineering Firm';

// ==========================================
// 3. إعداد ملف الـ Worker الخاص بمكتبة قراءة ملفات الـ PDF
// ==========================================
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function resolveAssetPath(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${basePath}${path}`;
  }
  return `${basePath}/${path}`;
}

// ==========================================
// 4. تعريف الهياكل والأنواع (TypeScript Types)
// ==========================================

type ProjectTab = {
  title: string;
  description?: string;
  pdfPath?: string;
  driveUrl?: string;
  images?: string[];
};

type Project = {
  number: string;
  name: string;
  category: string;
  description: string;
  scope?: string;
  images?: string[];
  pdfPath?: string;
  driveUrl?: string;
  tabs?: ProjectTab[];
};

type ProfileTransform = {
  zoom: number;   // 1.0 – 3.0
  x: number;     // -50 – 50 (%)
  y: number;     // -50 – 50 (%)
};

// ==========================================
// 5. البيانات الافتراضية للموقع (Default Data)
// ==========================================

const DEFAULT_PROJECTS: Project[] = [
  {
    number: '01',
    name: 'PRIME ION',
    category: 'HVAC Design',
    description: 'A coordinated HVAC design study covering load assumptions, air distribution and equipment selection for a contemporary mixed-use environment.',
    pdfPath: '/pdfs/primeion.pdf',
    images: [],
    driveUrl: '',
  },
  { 
    number: '02', 
    name: '31 WEST', 
    category: 'HVAC Design', 
    description: 'A building-services package shaped around clear zoning, efficient duct routing and construction-ready coordination across occupied spaces.', 
    pdfPath: '',
    driveUrl: '',
    tabs: [
      { 
        title: 'SIDE VILLA', 
        description: 'Detailed HVAC design and airflow distribution for Type A layout.', 
        pdfPath: '/pdfs/31 west/side-villa.pdf', 
        driveUrl: '', 
        images: [] 
      },
      { 
        title: 'TWIN VILLA', 
        description: 'Ventilation and equipment selection strategy for Type B configuration.', 
        pdfPath: '/pdfs/31 west/twin-villa.pdf', 
        driveUrl: '', 
        images: [] 
      },
      { 
        title: 'TOWN HOUSE', 
        description: 'Duct routing and zoning analysis for Type C spaces.', 
        pdfPath: '/pdfs/TOWNHOUSE.pdf', 
        driveUrl: '', 
        images: [] 
      }
    ]
  },
  {
    number: '03',
    name: 'MIST',
    category: 'HVAC Design',
    description: 'A comfort-focused design exploring ventilation strategy, room-by-room loads and a disciplined path from calculations to coordinated layouts.',
    pdfPath: '/pdfs/NEW CAVES.pdf',
    driveUrl: ''
  },
  {
    number: '04',
    name: 'NEW CAVES',
    category: 'HVAC Design',
    description: 'A detailed HVAC concept balancing fresh-air requirements, exhaust paths and equipment selection against a compact architectural plan.',
    pdfPath: '/pdfs/new chalets.pdf',
    driveUrl: ''
  },
  {
    number: '05',
    name: 'MARAKEZ CLUB HOUSE',
    category: 'HVAC Design',
    description: 'A hospitality and recreation project where load calculations, occupant comfort and discreet distribution come together as one system.',
    pdfPath: '/pdfs/clubhouse.pdf',
    driveUrl: ''
  },
  {
    number: '06',
    name: 'AKAM-RA NC',
    category: 'HVAC Design',
    description: 'A residential development design with coordinated supply, return and ventilation routes built around practical site and ceiling constraints.',
    pdfPath: '',
    driveUrl: ''
  },
  {
    number: '07',
    name: 'SADFCO WAREHOUSE',
    category: 'HVAC Design — Industrial',
    description: 'An industrial HVAC design focused on robust ventilation, clear service zones and the airflow logic required for a large warehouse footprint.',
    pdfPath: '/pdfs/sadfco.pdf',
    driveUrl: ''
  },
  {
    number: '08',
    name: 'QAIRAWAN RESORT',
    category: 'HVAC Design — Hospitality',
    description: 'A resort systems study connecting thermal comfort, fresh air and equipment strategy across guest-facing and back-of-house environments.',
    pdfPath: '/pdfs/RESORT PROJECT.pdf',
    driveUrl: ''
  },
];

const DEFAULT_SKILLS = [
  { title: 'Load Calculations', description: 'Full HVAC cooling and heating load calculations that set the basis for every equipment decision.' },
  { title: 'Duct Design', description: 'Supply, return and exhaust duct sizing and routing, balanced for airflow and space constraints.' },
  { title: 'Ventilation', description: 'Fresh air and exhaust strategy for occupied and mechanical spaces, matched to code requirements.' },
  { title: 'Unit Selection', description: 'Selecting chillers, AHUs, FCUs and package units sized correctly against the calculated loads.' },
];

const DEFAULT_TOOLS = ['Revit', 'AutoCAD', 'HAP', 'Duct Design', 'Ventilation Systems', 'Unit Selection'];

const DEFAULT_ABOUT = {
  intro: `${ENGINEER_NAME} is an HVAC Design Engineer currently with ${COMPANY_NAME}, working across residential, commercial, hospitality and industrial projects — from the load calculation stage through duct layouts, ventilation strategy and final equipment selection.`,
  detail: 'Design work runs on Revit and AutoCAD, with HAP used to validate system-level assumptions before they are carried into construction documents.',
};

const DEFAULT_TRANSFORM: ProfileTransform = { zoom: 1, x: 0, y: 0 };
const DEFAULT_HERO = { company: COMPANY_NAME, experience: '2 Years', coreTools: 'Revit · AutoCAD · HAP' };

// ==========================================
// 6. مفاتيح التخزين المحلي (LocalStorage Keys)
// ==========================================
const KEY_PROJECTS   = 'mt-projects';
const KEY_PROFILE    = 'mt-profile-image';
const KEY_LOGO       = 'mt-logo-image';
const KEY_TRANSFORM  = 'mt-profile-transform';
const KEY_ABOUT      = 'mt-about';
const KEY_SKILLS     = 'mt-skills';
const KEY_TOOLS      = 'mt-tools';
const KEY_THEME      = 'mt-theme';
const KEY_HERO       = 'mt-hero';

// ==========================================
// 7. دوال جلب واسترجاع البيانات
// ==========================================
function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function loadSkills() {
  const s = loadJson<typeof DEFAULT_SKILLS>(KEY_SKILLS, []);
  return Array.isArray(s) && s.length > 0 ? s : DEFAULT_SKILLS;
}
function loadTools() {
  const t = loadJson<string[]>(KEY_TOOLS, []);
  return Array.isArray(t) && t.length > 0 ? t : DEFAULT_TOOLS;
}
function loadAbout() {
  const a = loadJson<typeof DEFAULT_ABOUT>(KEY_ABOUT, DEFAULT_ABOUT);
  return {
    intro: typeof a.intro === 'string' ? a.intro : DEFAULT_ABOUT.intro,
    detail: typeof a.detail === 'string' ? a.detail : DEFAULT_ABOUT.detail,
  };
}
function loadTransform(): ProfileTransform {
  return loadJson<ProfileTransform>(KEY_TRANSFORM, DEFAULT_TRANSFORM);
}
function loadHero() {
  const h = loadJson<typeof DEFAULT_HERO>(KEY_HERO, DEFAULT_HERO);
  return {
    company:    typeof h.company    === 'string' ? h.company    : DEFAULT_HERO.company,
    experience: typeof h.experience === 'string' ? h.experience : DEFAULT_HERO.experience,
    coreTools:  typeof h.coreTools  === 'string' ? h.coreTools  : DEFAULT_HERO.coreTools,
  };
}

// ==========================================
// 8. دوال مساعدة لمعالجة الصور وملفات الـ PDF
// ==========================================
function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const MAX_IMG_PX = 1200;
const IMG_QUALITY = 0.72;

function compressImage(source: HTMLImageElement | HTMLCanvasElement): string {
  const w = source instanceof HTMLImageElement ? source.naturalWidth  : source.width;
  const h = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const scale = Math.min(1, MAX_IMG_PX / Math.max(w, h, 1));
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', IMG_QUALITY);
}

function generateSquareFavicon(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const scale = Math.min(size / w, size / h) * 3;
      const nw = w * scale;
      const nh = h * scale;
      const nx = (size - nw) / 2;
      const ny = (size - nh) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, nx, ny, nw, nh);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

async function pdfToImages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;
    images.push(compressImage(canvas));
  }
  return images;
}

async function loadPdfImagesFromPath(path: string): Promise<string[]> {
  try {
    const resolvedPath = resolveAssetPath(path);
    const pdf = await pdfjsLib.getDocument(resolvedPath).promise;
    const images: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;
      images.push(compressImage(canvas));
    }
    return images;
  } catch (e) {
    console.error('Error loading PDF from path:', path, e);
    return [];
  }
}

async function processUploadedFiles(files: File[]): Promise<string[]> {
  const results: string[] = [];
  for (const file of files) {
    if (file.type === 'application/pdf') {
      const pages = await pdfToImages(file);
      results.push(...pages);
    } else {
      const dataUrl = await readFileAsDataUrl(file);
      const img = new Image();
      await new Promise<void>((res) => { img.onload = () => res(); img.src = dataUrl; });
      results.push(compressImage(img));
    }
  }
  return results;
}

// ==========================================
// 9. مكون رسم المعاينة الهندسي (DrawingPreview)
// ==========================================
function DrawingPreview({ project }: { project: Project }) {
  return (
    <div className="drawing-preview" aria-label={`${project.name} conceptual drawing`}>
      <div className="drawing-toolbar">
        <span>HVAC / PLAN VIEW</span>
        <span>DWG-{project.number}</span>
      </div>
      <div className="drawing-sheet" aria-hidden="true">
        <div className="drawing-grid" />
        <div className="drawing-room room-a"><span>ZONE A</span></div>
        <div className="drawing-room room-b"><span>ZONE B</span></div>
        <div className="drawing-room room-c"><span>ZONE C</span></div>
        <div className="drawing-duct duct-main" />
        <div className="drawing-duct duct-branch-a" />
        <div className="drawing-duct duct-branch-b" />
        <div className="drawing-equipment equipment-a"><span>AHU</span></div>
        <div className="drawing-equipment equipment-b"><span>FCU</span></div>
        <div className="drawing-arrow arrow-a">→</div>
        <div className="drawing-arrow arrow-b">→</div>
        <div className="drawing-dimension dimension-a"><span>8.40 m</span></div>
        <div className="drawing-stamp">MT<br /><small>HVAC</small></div>
      </div>
      <div className="drawing-caption">Conceptual drawing preview · Supply / return / exhaust layout</div>
    </div>
  );
}

// ==========================================
// 10. نافذة عرض تفاصيل المشروع (ProjectModal)
// ==========================================
function ProjectModal({ project, onClose, onUpdateProject }: { project: Project; onClose: () => void; onUpdateProject: (num: string, updates: Partial<Project>) => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const galleryRef     = useRef<HTMLDivElement>(null);
  const dragStart      = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [activeImg, setActiveImg]     = useState(0);
  const [imgZoom, setImgZoom]         = useState(1);
  const [imgPan, setImgPan]           = useState({ x: 0, y: 0 });
  const [dragging, setDragging]       = useState(false);
  const [loadingPdfPath, setLoadingPdfPath] = useState(false);

  useEffect(() => { closeButtonRef.current?.focus(); }, []);
  useEffect(() => { setImgZoom(1); setImgPan({ x: 0, y: 0 }); setActiveImg(0); }, [activeTabIdx]);
  useEffect(() => { setImgZoom(1); setImgPan({ x: 0, y: 0 }); }, [activeImg]);
  useEffect(() => { if (imgZoom <= 1) setImgPan({ x: 0, y: 0 }); }, [imgZoom]);

  const hasTabs = project.tabs && project.tabs.length > 0;
  const currentTab = hasTabs ? project.tabs![activeTabIdx] : null;
  const activeImages = currentTab ? (currentTab.images ?? []) : (project.images ?? []);
  const activePdfPath = currentTab ? currentTab.pdfPath : project.pdfPath;
  const activeDriveUrl = currentTab ? currentTab.driveUrl : project.driveUrl;
  const activeDescription = currentTab?.description ?? project.description;

  useEffect(() => {
    let isMounted = true;
    if (activePdfPath && activeImages.length === 0) {
      setLoadingPdfPath(true);
      loadPdfImagesFromPath(activePdfPath).then((imgs) => {
        if (isMounted && imgs.length > 0) {
          if (hasTabs) {
            const updatedTabs = [...project.tabs!];
            updatedTabs[activeTabIdx] = { ...updatedTabs[activeTabIdx], images: imgs };
            onUpdateProject(project.number, { tabs: updatedTabs });
          } else {
            onUpdateProject(project.number, { images: imgs });
          }
        }
        if (isMounted) setLoadingPdfPath(false);
      });
    }
    return () => { isMounted = false; };
  }, [activePdfPath, activeTabIdx, project.number]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setImgZoom((z) => Math.min(5, Math.max(1, z - e.deltaY * 0.006)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zoomStep  = (delta: number) => setImgZoom((z) => Math.min(5, Math.max(1, parseFloat((z + delta).toFixed(2)))));
  const resetZoom = () => { setImgZoom(1); setImgPan({ x: 0, y: 0 }); };

  const onGalleryMouseDown = (e: React.MouseEvent) => {
    if (imgZoom <= 1) return;
    e.preventDefault();
    dragStart.current = { mx: e.clientX, my: e.clientY, px: imgPan.x, py: imgPan.y };
    setDragging(true);
  };
  const onGalleryMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    setImgPan({ x: dragStart.current.px + e.clientX - dragStart.current.mx, y: dragStart.current.py + e.clientY - dragStart.current.my });
  };
  const onGalleryMouseUp = () => { dragStart.current = null; setDragging(false); };

  const getEmbedDriveUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/view') || url.includes('/edit')) {
      return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview');
    }
    return url;
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <div>
            <div className="modal-index mono">Project {project.number}</div>
            <h2 className="modal-title display" id="modal-title">{project.name}</h2>
            <div className="modal-category">{project.category}</div>
          </div>
          <button ref={closeButtonRef} className="modal-close" type="button" aria-label="Close" onClick={onClose}>
            <X size={17} strokeWidth={1.8} />
          </button>
        </div>

        {hasTabs && (
          <div className="modal-tabs-bar" style={{ display: 'flex', gap: '8px', padding: '12px 24px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
            {project.tabs!.map((tab, idx) => (
              <button
                key={idx}
                type="button"
                className={`modal-tab-btn ${idx === activeTabIdx ? 'active' : ''}`}
                onClick={() => setActiveTabIdx(idx)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--line)',
                  borderBottom: idx === activeTabIdx ? '2px solid var(--accent)' : '1px solid var(--line)',
                  borderRadius: '8px 8px 0 0',
                  background: idx === activeTabIdx ? 'var(--bg-soft)' : 'transparent',
                  color: idx === activeTabIdx ? 'var(--accent)' : 'var(--gray)',
                  fontWeight: idx === activeTabIdx ? 600 : 400,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={14} />
                {tab.title}
              </button>
            ))}
          </div>
        )}

        <div className="modal-body">
          <p className="modal-description">{activeDescription}</p>
          {project.scope && <p className="modal-scope"><strong>Scope:</strong> {project.scope}</p>}

          {activeDriveUrl ? (
            <div className="drive-embed-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Google Drive Document / Drawing</span>
                <a 
                  href={activeDriveUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                >
                  Open in Google Drive <ExternalLink size={14} />
                </a>
              </div>
              <div style={{ width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)', background: '#fff' }}>
                <iframe
                  src={getEmbedDriveUrl(activeDriveUrl)}
                  title={currentTab?.title || project.name}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay"
                />
              </div>
            </div>
          ) : loadingPdfPath ? (
            <div className="pdf-loading" style={{ position: 'relative', margin: '20px auto', display: 'flex', justifyContent: 'center' }}>
              <div className="pdf-spinner" />
              Loading PDF from path…
            </div>
          ) : activeImages.length > 0 ? (
            <div className="gallery-wrap">
              <div
                ref={galleryRef}
                className={`gallery-main${imgZoom > 1 ? ' is-zoomed' : ''}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                onMouseDown={onGalleryMouseDown}
                onMouseMove={onGalleryMouseMove}
                onMouseUp={onGalleryMouseUp}
                onMouseLeave={onGalleryMouseUp}
              >
                <img
                  key={activeImg}
                  src={activeImages[activeImg]}
                  alt={`${project.name} image ${activeImg + 1}`}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transform: `scale(${imgZoom}) translate(${imgPan.x / imgZoom}px, ${imgPan.y / imgZoom}px)`,
                    cursor: imgZoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
                    transition: dragging ? 'none' : 'transform .22s ease',
                  }}
                  onClick={() => { if (!dragging) { imgZoom > 1 ? resetZoom() : zoomStep(1.5); } }}
                />
                <div className="img-zoom-bar">
                  <button className="img-zoom-btn" type="button" aria-label="Zoom out"
                    onClick={(e) => { e.stopPropagation(); zoomStep(-0.5); }}>
                    <ZoomOut size={13} />
                  </button>
                  <span className="img-zoom-pct mono">{Math.round(imgZoom * 100)}%</span>
                  <button className="img-zoom-btn" type="button" aria-label="Zoom in"
                    onClick={(e) => { e.stopPropagation(); zoomStep(0.5); }}>
                    <ZoomIn size={13} />
                  </button>
                  {imgZoom > 1 && (
                    <button className="img-zoom-reset" type="button"
                      onClick={(e) => { e.stopPropagation(); resetZoom(); }}>
                      Reset
                    </button>
                  )}
                </div>
              </div>
              {activeImages.length > 1 && (
                <div className="gallery-thumbs" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {activeImages.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`gallery-thumb${i === activeImg ? ' active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={src} alt="" draggable={false} onContextMenu={(e) => e.preventDefault()} style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : <DrawingPreview project={project} />}
        </div>
        <div className="modal-foot mono">Technical preview / {project.category}</div>
      </div>
    </div>
  );
}

// ==========================================
// 11. مكون عرض الصورة الشخصية (ProfilePhoto)
// ==========================================
function ProfilePhoto({ src, transform }: { src: string; transform: ProfileTransform }) {
  const style = {
    transform: `scale(${transform.zoom}) translate(${transform.x}%, ${transform.y}%)`,
    transformOrigin: 'center center',
    transition: 'transform .2s',
    objectPosition: 'center center',
  };

  return (
    <div 
      className="profile-photo-glow-wrapper"
      style={{
        position: 'relative',
        display: 'inline-block',
        borderRadius: '50%',
        padding: '2px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.2))',
        boxShadow: '0 0 35px rgba(37, 99, 235, 0.3), 0 15px 35px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div 
        className="profile-photo-inner"
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#0b0f19',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {src ? (
          <img 
            src={src} 
            alt={ENGINEER_NAME} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              display: 'block',
              margin: 'auto',
              ...style 
            }} 
          />
        ) : (
          <span className="display" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#3b82f6' }}>MT</span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 12. المكون الرئيسي للتطبيق (App Component)
// ==========================================
export default function App() {
  const { isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;

  const [activeProject, setActiveProject]   = useState<Project | null>(null);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [editorOpen, setEditorOpen]         = useState(false);
  const [darkMode, setDarkMode]             = useState(() => {
    const saved = window.localStorage.getItem(KEY_THEME);
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [projects, setProjects]     = useState<Project[]>(() => {
    const saved = window.localStorage.getItem(KEY_PROJECTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return DEFAULT_PROJECTS;
  });
  
  // جلب المشاريع من Supabase تلقائياً عند التحميل
  useEffect(() => {
    async function fetchProjectsFromSupabase() {
      try {
        const client = getSupabaseClient(getToken);
        const { data, error } = await client.from('projects').select('*');
        if (!error && data && data.length > 0) {
          setProjects(data);
        }
      } catch (err) {
        console.error('Error fetching projects from Supabase:', err);
      }
    }
    fetchProjectsFromSupabase();
  }, [getToken]);
  
  const [skills, setSkills]         = useState(loadSkills);
  const [tools, setTools]           = useState(loadTools);
  const [about, setAbout]           = useState(loadAbout);
  const [heroMeta, setHeroMeta]     = useState(loadHero);
  
  const [profileImage, setProfileImage]   = useState(() => {
    return window.localStorage.getItem(KEY_PROFILE) ?? resolveAssetPath('/picture.png');
  });

  const [logoImage, setLogoImage] = useState(() => {
    return window.localStorage.getItem(KEY_LOGO) ?? '';
  });

  const currentLogo = logoImage || (darkMode ? logoImageDark : logoImageLight);

  useEffect(() => {
    if (!currentLogo) return;
    let isMounted = true;
    generateSquareFavicon(currentLogo).then((squareIconUrl) => {
      if (!isMounted) return;
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/png';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = squareIconUrl;
    });
    return () => {
      isMounted = false;
    };
  }, [currentLogo]);

  const [transform, setTransform]   = useState<ProfileTransform>(loadTransform);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [storageError, setStorageError] = useState('');
  const [isDirty, setIsDirty]           = useState(false);
  const [saveFlash, setSaveFlash]       = useState(false);
  const firstRender = useRef(true);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  function safeSet(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      setStorageError('Storage full — some images could not be saved. Try removing unused images.');
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    safeSet(KEY_THEME, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setIsDirty(true);
  }, [projects, skills, tools, about, heroMeta, profileImage, logoImage, transform]);

  async function saveAll() {
    safeSet(KEY_PROJECTS, JSON.stringify(projects));
    safeSet(KEY_SKILLS, JSON.stringify(skills));
    safeSet(KEY_TOOLS, JSON.stringify(tools));
    safeSet(KEY_ABOUT, JSON.stringify(about));
    safeSet(KEY_HERO, JSON.stringify(heroMeta));
    safeSet(KEY_TRANSFORM, JSON.stringify(transform));
    if (profileImage) safeSet(KEY_PROFILE, profileImage);
    else window.localStorage.removeItem(KEY_PROFILE);
    if (logoImage) safeSet(KEY_LOGO, logoImage);
    else window.localStorage.removeItem(KEY_LOGO);

    // مزامنة البيانات وتحديث الجدول في Supabase عند الضغط على الحفظ باستخدام التوكن
    try {
      const client = getSupabaseClient(getToken);
      const { error } = await client.from('projects').upsert(projects, { onConflict: 'number' });
      if (error) {
        console.error('Supabase sync error:', error);
        setStorageError('Saved locally, but failed to sync with Supabase database.');
      }
    } catch (err) {
      console.error('Supabase upsert exception:', err);
    }

    setIsDirty(false);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1800);
  }

  useEffect(() => {
    if (!activeProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveProject(null); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [activeProject]);

  useEffect(() => { if (!isSignedIn || !isOwner) setEditorOpen(false); }, [isSignedIn, isOwner]);

  const openProject = (p: Project, e: MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = e.currentTarget;
    setActiveProject(p);
  };

  const updateProject = (num: string, updates: Partial<Project>) =>
    setProjects((ps) => ps.map((p) => (p.number === num ? { ...p, ...updates } : p)));

  const addProject = () => {
    const next = String(Math.max(0, ...projects.map((p) => Number(p.number) || 0)) + 1).padStart(2, '0');
    setProjects((ps) => [...ps, { number: next, name: 'New project', category: 'HVAC Design', description: 'Add a short description.', scope: '', images: [], pdfPath: '', driveUrl: '', tabs: [] }]);
  };

  const removeProject = (num: string) => {
    setProjects((ps) => ps.filter((p) => p.number !== num));
    if (activeProject?.number === num) setActiveProject(null);
  };

  const addProjectTab = (num: string) => {
    const cur = projects.find((p) => p.number === num);
    if (!cur) return;
    const currentTabs = cur.tabs ?? [];
    const newTab: ProjectTab = { title: `Tab ${currentTabs.length + 1}`, description: '', driveUrl: '', pdfPath: '', images: [] };
    updateProject(num, { tabs: [...currentTabs, newTab] });
  };

  const updateProjectTab = (num: string, tabIdx: number, updates: Partial<ProjectTab>) => {
    const cur = projects.find((p) => p.number === num);
    if (!cur || !cur.tabs) return;
    const updatedTabs = [...cur.tabs];
    updatedTabs[tabIdx] = { ...updatedTabs[tabIdx], ...updates };
    updateProject(num, { tabs: updatedTabs });
  };

  const removeProjectTab = (num: string, tabIdx: number) => {
    const cur = projects.find((p) => p.number === num);
    if (!cur || !cur.tabs) return;
    const updatedTabs = cur.tabs.filter((_, i) => i !== tabIdx);
    updateProject(num, { tabs: updatedTabs });
  };

  const handleProjectFilesUpload = async (num: string, e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';
    setPdfLoading(true);
    try {
      const newImages = await processUploadedFiles(files);
      const cur = projects.find((p) => p.number === num);
      updateProject(num, { images: [...(cur?.images ?? []), ...newImages] });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleLoadPdfFromPath = async (num: string, path: string) => {
    if (!path) return;
    setPdfLoading(true);
    try {
      const imgs = await loadPdfImagesFromPath(path);
      const cur = projects.find((p) => p.number === num);
      updateProject(num, { images: [...(cur?.images ?? []), ...imgs] });
    } finally {
      setPdfLoading(false);
    }
  };

  const removeProjectImage = (num: string, idx: number) => {
    const cur = projects.find((p) => p.number === num);
    updateProject(num, { images: (cur?.images ?? []).filter((_, i) => i !== idx) });
  };

  const handleProfileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(await readFileAsDataUrl(file));
    e.target.value = '';
    setTransform(DEFAULT_TRANSFORM);
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoImage(await readFileAsDataUrl(file));
    e.target.value = '';
  };

  const adjustZoom = (delta: number) =>
    setTransform((t) => ({ ...t, zoom: Math.min(3, Math.max(1, Math.round((t.zoom + delta) * 10) / 10)) }));

  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const onPreviewMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!profileImage) return;
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    e.preventDefault();
  }, [profileImage, transform.x, transform.y]);

  const onPreviewMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = ((e.clientX - dragStart.current.x) / 104) * 100;
    const dy = ((e.clientY - dragStart.current.y) / 104) * 100;
    setTransform((t) => ({
      ...t,
      x: Math.min(50, Math.max(-50, Math.round((dragStart.current!.tx + dx) * 10) / 10)),
      y: Math.min(50, Math.max(-50, Math.round((dragStart.current!.ty + dy) * 10) / 10)),
    }));
  }, []);

  const onPreviewMouseUp = useCallback(() => { dragStart.current = null; }, []);

  const updateSkill = (i: number, u: Partial<(typeof skills)[number]>) =>
    setSkills((ss) => ss.map((s, j) => (j === i ? { ...s, ...u } : s)));
  const addSkill    = () => setSkills((ss) => [...ss, { title: 'New skill', description: 'Add a description.' }]);
  const removeSkill = (i: number) => setSkills((ss) => ss.filter((_, j) => j !== i));

  const updateTool = (i: number, val: string) =>
    setTools((ts) => ts.map((t, j) => (j === i ? val : t)));
  const addTool    = () => setTools((ts) => [...ts, 'New tool']);
  const removeTool = (i: number) => setTools((ts) => ts.filter((_, j) => j !== i));

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="portfolio">
      {storageError && (
        <div className="storage-toast" role="alert">
          <span>{storageError}</span>
          <button onClick={() => setStorageError('')} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* ==========================================
          13. شريط التنقل العلوي (Navigation Bar)
          ========================================== */}
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="wrap nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a className="brand" href="#top" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', minWidth: 0 }}>
            {currentLogo ? (
              <img 
                src={currentLogo} 
                alt="Logo" 
                className="brand-logo-img" 
                style={{ width: '80px', height: '80px', objectFit: 'contain', objectPosition: 'center', flexShrink: 0, display: 'block' }} 
              />
            ) : (
              <span className="brand-mark" aria-hidden="true" style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>MT</span>
            )}
            <span className="brand-copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, overflow: 'visible' }}>
              <span className="brand-name" style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '1.05rem', whiteSpace: 'nowrap', lineHeight: '1.2' }}>{ENGINEER_NAME}</span>
              <span className="brand-role" style={{ fontSize: '0.78rem', color: 'var(--gray)', whiteSpace: 'nowrap', lineHeight: '1.2', marginTop: '2px' }}>HVAC Design Engineer</span>
            </span>
          </a>

          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            <a href="#skills" onClick={closeMenu}>Skills</a>
            <a href="#projects" onClick={closeMenu}>Projects</a>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#contact" onClick={closeMenu}>Contact</a>

            <SignedIn>
              {isOwner && (
                <button
                  className="editor-toggle"
                  type="button"
                  aria-expanded={editorOpen}
                  onClick={() => { setEditorOpen((o) => !o); closeMenu(); }}
                >
                  {editorOpen ? 'Close editor' : 'Edit portfolio'}
                </button>
              )}
              <button
                className="editor-toggle signout-btn"
                type="button"
                onClick={() => signOut({ redirectUrl: basePath || '/' })}
              >
                <LogOut size={13} />
                Sign out
              </button>
            </SignedIn>
          </div>

          <div className="nav-controls">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="editor-toggle"
                  style={{ backgroundColor: 'var(--accent, #2563eb)', color: '#fff', border: 'none' }}
                >
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>

            <button
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button
              className="theme-toggle"
              type="button"
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
              aria-pressed={darkMode}
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ==========================================
          14. القسم الرئيسي الترحيبي (Hero Section)
          ========================================== */}
      <div id="top" className="hero" style={{ padding: '60px 0 40px' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '820px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <ProfilePhoto src={profileImage} transform={transform} />
            <div 
              className="mono" 
              style={{ 
                fontSize: '0.75rem', 
                letterSpacing: '0.08em',
                padding: '10px 20px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px',
                borderRadius: '9999px',
                border: darkMode ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(37, 99, 235, 0.3)',
                background: darkMode ? 'rgba(11, 15, 25, 0.85)' : 'rgba(241, 245, 249, 0.9)',
                color: darkMode ? '#60a5fa' : '#2563eb',
                boxShadow: darkMode ? '0 0 25px rgba(37, 99, 235, 0.25)' : '0 4px 15px rgba(37, 99, 235, 0.1)',
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              <span 
                className="status-dot" 
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: darkMode ? '#3b82f6' : '#2563eb',
                  boxShadow: darkMode ? '0 0 10px #3b82f6' : '0 0 8px rgba(37, 99, 235, 0.4)'
                }} 
              /> 
              Available for HVAC design work
            </div>
          </div>

          <div className="hero-content" style={{ maxWidth: '780px' }}>
            <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', lineHeight: 1.15, marginBottom: '20px' }}>
              HVAC Design Engineer <span className="hero-light" style={{ opacity: 0.65 }}>— cooling, ventilation, airflow, done right.</span>
            </h1>
            <p className="hero-lede" style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '30px', opacity: 0.9 }}>
              Currently designing mechanical systems at <strong>{COMPANY_NAME}</strong> — from load calculations to duct layouts, ventilation strategy and final equipment selection.
            </p>
            <div className="hero-meta" style={{ display: 'flex', gap: '35px', flexWrap: 'wrap' }}>
              <div className="meta-item"><span className="meta-value" style={{ display: 'block', fontWeight: 700, fontSize: '1.15rem' }}>{heroMeta.company}</span><span className="meta-label" style={{ fontSize: '0.82rem', opacity: 0.7 }}>Company</span></div>
              <div className="meta-item"><span className="meta-value" style={{ display: 'block', fontWeight: 700, fontSize: '1.15rem' }}>{heroMeta.experience}</span><span className="meta-label" style={{ fontSize: '0.82rem', opacity: 0.7 }}>Experience</span></div>
              <div className="meta-item"><span className="meta-value" style={{ display: 'block', fontWeight: 700, fontSize: '1.15rem' }}>{heroMeta.coreTools}</span><span className="meta-label" style={{ fontSize: '0.82rem', opacity: 0.7 }}>Core tools</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          15. لوحة التحكم والتعديل (Editor Section)
          ========================================== */}
      {isSignedIn && isOwner && editorOpen && (
        <section className="editor-section" aria-label="Portfolio editor">
          <div className="wrap">
            <div className="editor-heading">
              <div>
                <div className="section-kicker mono">Portfolio editor</div>
                <h2 className="section-title display">Update your profile and projects.</h2>
                <p className="editor-save-hint">
                  {isDirty
                    ? <span className="save-hint-dirty">● Unsaved changes</span>
                    : saveFlash
                      ? <span className="save-hint-ok">✓ Saved successfully</span>
                      : <span className="save-hint-idle">All changes saved</span>}
                </p>
              </div>
              <div className="editor-heading-actions">
                <button
                  className={`btn-save${isDirty ? ' has-changes' : ''}${saveFlash ? ' flash' : ''}`}
                  type="button"
                  disabled={!isDirty}
                  onClick={saveAll}
                >
                  {saveFlash ? '✓ Saved' : 'Save changes'}
                </button>
                <button className="editor-close" type="button" onClick={() => setEditorOpen(false)}>Done</button>
              </div>
            </div>

            <div className="editor-card editor-hero-meta">
              <h3 className="display">Hero details</h3>
              <div className="editor-fields editor-fields-row">
                <label>Company
                  <input value={heroMeta.company} onChange={(e) => setHeroMeta((h) => ({ ...h, company: e.target.value }))} placeholder="e.g. Company Name" />
                </label>
                <label>Experience
                  <input value={heroMeta.experience} onChange={(e) => setHeroMeta((h) => ({ ...h, experience: e.target.value }))} placeholder="e.g. 2 years" />
                </label>
                <label>Core tools
                  <input value={heroMeta.coreTools} onChange={(e) => setHeroMeta((h) => ({ ...h, coreTools: e.target.value }))} placeholder="e.g. Revit · AutoCAD · HAP" />
                </label>
              </div>
            </div>

            <div className="editor-grid">
              <div className="editor-profile editor-card">
                <h3 className="display">Navbar Logo (Auto Theme Switch &amp; Favicon)</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '15px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'var(--bg-soft)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 700 }}>
                    {currentLogo ? <img src={currentLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} /> : <span className="mono">MT</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="upload-button" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                      {logoImage ? 'Change custom logo' : 'Upload custom logo'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {logoImage && (
                      <button className="text-button" type="button" style={{ fontSize: '0.8rem', textAlign: 'left' }} onClick={() => setLogoImage('')}>
                        Reset to default mode logos
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="display" style={{ marginTop: '24px' }}>Profile photo</h3>
                <div
                  className={`editor-profile-preview${profileImage ? ' has-image draggable' : ''}`}
                  onMouseDown={onPreviewMouseDown}
                  onMouseMove={onPreviewMouseMove}
                  onMouseUp={onPreviewMouseUp}
                  onMouseLeave={onPreviewMouseUp}
                  title={profileImage ? 'Drag to pan' : ''}
                >
                  {profileImage
                    ? <img src={profileImage} alt="Profile" style={{ transform: `scale(${transform.zoom}) translate(${transform.x}%, ${transform.y}%)`, transformOrigin: 'center', transition: 'transform .15s' }} />
                    : <span>MT</span>}
                </div>

                {profileImage && (
                  <div className="zoom-controls">
                    <button type="button" className="zoom-btn" onClick={() => adjustZoom(-0.1)} aria-label="Zoom out"><ZoomOut size={14} /></button>
                    <input
                      type="range" min="1" max="3" step="0.05"
                      value={transform.zoom}
                      className="zoom-slider"
                      aria-label="Zoom level"
                      onChange={(e) => setTransform((t) => ({ ...t, zoom: Number(e.target.value) }))}
                    />
                    <button type="button" className="zoom-btn" onClick={() => adjustZoom(0.1)} aria-label="Zoom in"><ZoomIn size={14} /></button>
                    <span className="zoom-label">{Math.round(transform.zoom * 100)}%</span>
                  </div>
                )}

                {profileImage && (
                  <div className="pan-controls">
                    <span className="pan-label">Or drag photo to reposition</span>
                    <button className="text-button" type="button" onClick={() => setTransform(DEFAULT_TRANSFORM)}>Reset position</button>
                  </div>
                )}

                <label className="upload-button">
                  {profileImage ? 'Change photo' : 'Upload photo'}
                  <input type="file" accept="image/*" onChange={handleProfileUpload} />
                </label>
                {profileImage && (
                  <button className="text-button" type="button" onClick={() => { setProfileImage(''); setTransform(DEFAULT_TRANSFORM); }}>
                    Remove photo
                  </button>
                )}
              </div>

              <div className="editor-projects">
                <div className="editor-projects-heading">
                  <h3 className="display">Projects ({projects.length})</h3>
                  <button className="add-project-button" type="button" onClick={addProject}>+ Add project</button>
                </div>
                <div className="editor-project-list">
                  {projects.map((project) => (
                    <article className="editor-project editor-card" key={project.number}>
                      <div className="editor-project-top">
                        <span className="editor-project-number">{project.number}</span>
                        <button className="delete-project" type="button" onClick={() => removeProject(project.number)}>Delete project</button>
                      </div>
                      <div className="editor-fields">
                        <label>Project name<input value={project.name} onChange={(e) => updateProject(project.number, { name: e.target.value })} /></label>
                        <label>Category<input value={project.category} onChange={(e) => updateProject(project.number, { category: e.target.value })} /></label>
                        <label>Scope<input value={project.scope ?? ''} placeholder="e.g. Load calc, duct design" onChange={(e) => updateProject(project.number, { scope: e.target.value })} /></label>
                        <label>Google Drive Link (Main)<input value={project.driveUrl ?? ''} placeholder="https://drive.google.com/..." onChange={(e) => updateProject(project.number, { driveUrl: e.target.value })} /></label>
                        <label className="editor-description">Description<textarea value={project.description} rows={2} onChange={(e) => updateProject(project.number, { description: e.target.value })} /></label>
                      </div>

                      <div className="editor-tabs-section" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink)' }}>Project Tabs (Optional)</span>
                          <button type="button" className="upload-small" onClick={() => addProjectTab(project.number)}>+ Add Tab</button>
                        </div>
                        {project.tabs && project.tabs.map((tab, tabIdx) => (
                          <div key={tabIdx} style={{ background: 'var(--bg-soft)', padding: '10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--line)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600 }}>Tab #{tabIdx + 1}</span>
                              <button type="button" className="delete-project" onClick={() => removeProjectTab(project.number, tabIdx)}>Delete Tab</button>
                            </div>
                            <div className="editor-fields" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '4px' }}>
                              <label>Tab Title<input value={tab.title} onChange={(e) => updateProjectTab(project.number, tabIdx, { title: e.target.value })} /></label>
                              <label>Tab Drive Link<input value={tab.driveUrl ?? ''} placeholder="Google Drive Link" onChange={(e) => updateProjectTab(project.number, tabIdx, { driveUrl: e.target.value })} /></label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="editor-images">
                        <div className="editor-images-heading">
                          <span>Images &amp; drawings</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {project.pdfPath && (
                              <button
                                type="button"
                                className="upload-small"
                                onClick={() => handleLoadPdfFromPath(project.number, project.pdfPath!)}
                                disabled={pdfLoading}
                              >
                                {pdfLoading ? 'Loading…' : 'Load PDF from path'}
                              </button>
                            )}
                            <label className="upload-small">
                              {pdfLoading ? 'Processing…' : '+ Upload images / PDF'}
                              <input type="file" accept="image/*,.pdf,application/pdf" multiple onChange={(e) => handleProjectFilesUpload(project.number, e)} disabled={pdfLoading} />
                            </label>
                          </div>
                        </div>
                        {project.images && project.images.length > 0 ? (
                          <div className="editor-image-list">
                            {project.images.map((img, idx) => (
                              <div className="editor-image" key={`${img.slice(0, 20)}-${idx}`}>
                                <img src={img} alt="" />
                                <button type="button" aria-label={`Remove image ${idx + 1}`} onClick={() => removeProjectImage(project.number, idx)}><X size={13} /></button>
                              </div>
                            ))}
                          </div>
                        ) : <span className="editor-empty">No images yet. Upload images or use Google Drive links above.</span>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="editor-content-grid">
              <div className="editor-content-block editor-card">
                <div className="editor-block-heading">
                  <div>
                    <div className="section-kicker mono">About</div>
                    <h3 className="display">Edit about section</h3>
                  </div>
                </div>
                <div className="editor-fields editor-about-fields">
                  <label>Introduction<textarea value={about.intro} rows={6} onChange={(e) => setAbout((a) => ({ ...a, intro: e.target.value }))} /></label>
                  <label>Additional details<textarea value={about.detail} rows={6} onChange={(e) => setAbout((a) => ({ ...a, detail: e.target.value }))} /></label>
                </div>
              </div>

              <div className="editor-content-block editor-card">
                <div className="editor-block-heading">
                  <div>
                    <div className="section-kicker mono">What I do</div>
                    <h3 className="display">Edit design skills</h3>
                  </div>
                  <button className="add-project-button" type="button" onClick={addSkill}>+ Add skill</button>
                </div>
                <div className="editor-skill-list">
                  {skills.map((skill, i) => (
                    <div className="editor-skill-row" key={`${skill.title}-${i}`}>
                      <span className="editor-skill-number">{String(i + 1).padStart(2, '0')}</span>
                      <input aria-label={`Skill ${i + 1} name`} value={skill.title} onChange={(e) => updateSkill(i, { title: e.target.value })} />
                      <textarea aria-label={`Skill ${i + 1} description`} value={skill.description} rows={2} onChange={(e) => updateSkill(i, { description: e.target.value })} />
                      <button className="delete-project" type="button" onClick={() => removeSkill(i)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-content-block editor-card">
                <div className="editor-block-heading">
                  <div>
                    <div className="section-kicker mono">Software</div>
                    <h3 className="display">Edit tools &amp; software</h3>
                  </div>
                  <button className="add-project-button" type="button" onClick={addTool}>+ Add tool</button>
                </div>
                <div className="editor-tools-list">
                  {tools.map((tool, i) => (
                    <div className="editor-tool-row" key={`tool-${i}`}>
                      <input
                        aria-label={`Tool ${i + 1}`}
                        value={tool}
                        onChange={(e) => updateTool(i, e.target.value)}
                      />
                      <button className="delete-project" type="button" onClick={() => removeTool(i)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          16. قسم المهارات والأدوات (Skills Section)
          ========================================== */}
      <section className="section" id="skills">
        <div className="wrap">
          <div className="section-heading">
            <div className="section-kicker mono">What I do</div>
            <div><h2 className="section-title display">Design Skills</h2></div>
          </div>
          <div className="skills-layout">
            <div className="skills-grid">
              {skills.map(({ title, description }) => (
                <article className="skill-card" key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <aside className="tool-panel">
              <h3 className="display">Tools in the workflow</h3>
              <div className="tool-list">
                {tools.map((tool) => (
                  <span className="tool" key={tool}>{tool}</span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ==========================================
          17. قسم عرض المشاريع (Projects Section)
          ========================================== */}
      <section className="section projects-section" id="projects">
        <div className="wrap">
          <div className="section-heading">
            <div className="section-kicker mono">Selected work</div>
            <div><h2 className="section-title display">Projects</h2></div>
          </div>
          <div className="projects-grid">
            {projects.map((project) => (
              <button
                className="project-card"
                type="button"
                key={project.number}
                onClick={(e) => openProject(project, e)}
              >
                <div className="project-idx mono">{project.number}</div>
                <div className="project-name">{project.name}</div>
                <div className="project-tag">{project.category}</div>
                <div className="project-open-hint">
                  <span>Open</span><span className="hint-arrow" aria-hidden="true"><ArrowRight size={15} /></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          18. قسم نبذة عني والإحصائيات (About Section)
          ========================================== */}
      <section className="section" id="about">
        <div className="wrap">
          <div className="section-heading">
            <div className="section-kicker mono">Background</div>
            <div><h2 className="section-title display">About</h2></div>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <p>{about.intro}</p>
              <p>{about.detail}</p>
            </div>
            <div className="stats">
              <div className="stat"><div className="stat-number display">2</div><div className="stat-label">Years experience</div></div>
              <div className="stat"><div className="stat-number display">{projects.length}</div><div className="stat-label">Projects listed</div></div>
              <div className="stat"><div className="stat-number display">3</div><div className="stat-label">CAD / BIM tools</div></div>
              <div className="stat"><div className="stat-number display">5</div><div className="stat-label">Design disciplines</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          19. تذيل الصفحة ومعلومات التواصل (Footer)
          ========================================== */}
      <footer className="site-footer" id="contact">
        <div className="wrap">
          <div className="contact-box">
            <h2 className="display">Let's talk about your next HVAC project.</h2>
            <div className="contact-note">
              <strong>Get in touch</strong>
              <div className="contact-links">
                {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>}
                {CONTACT_PHONE && <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a>}
                {LINKEDIN_URL && <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn profile</a>}
              </div>
            </div>
          </div>
          <div className="foot-note">
            <span>{ENGINEER_NAME} — HVAC Design Engineer</span>
            <span>{COMPANY_NAME} / Portfolio</span>
          </div>
        </div>
      </footer>

      {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} onUpdateProject={updateProject} />}

      {pdfLoading && (
        <div className="pdf-loading" role="status" aria-live="polite">
          <div className="pdf-spinner" />
          Processing PDF…
        </div>
      )}
    </main>
  );
}

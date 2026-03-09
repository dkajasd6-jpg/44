
import React, { useState } from 'react';
import { User, UserRole, ConstructionSite, SiteCategory, UploadedFile, SafetyReport } from './types';
import { INITIAL_SITES, DEFAULT_CATEGORIES } from './constants';
import { 
  Plus, 
  ChevronRight, 
  FileUp, 
  LogOut, 
  Building2, 
  X, 
  FileText, 
  ImageIcon, 
  FileSpreadsheet,
  ArrowLeft,
  Download,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Share2,
  Check,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Zap,
  Camera,
  Edit2,
  LayoutGrid,
  Settings,
  Shield,
  FileBox,
  FileStack,
  Presentation
} from 'lucide-react';

// --- Types of Views ---
type ViewState = 'AUTH' | 'SITES' | 'SITE_DASHBOARD' | 'ADD_SITE' | 'EDIT_SITE' | 'CATEGORY_DETAIL' | 'REPORT_FORM' | 'SUB_CATEGORY_LIST';

const PRIMARY_TEAL = '#0097b2';
const LOGO_URL = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('AUTH');
  const [sites, setSites] = useState<ConstructionSite[]>(INITIAL_SITES);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeParentCategoryId, setActiveParentCategoryId] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([
    { id: 'w1', name: '김철수', role: 'Worker', email: 'chulsoo@gss.com', siteId: '1', evaluation: '성실하고 안전 수칙을 잘 준수함.', birthDate: '1985-05-12' },
    { id: 'w2', name: '이영희', role: 'Worker', email: 'younghee@gss.com', siteId: '1', evaluation: '작업 전 점검이 철저함.', birthDate: '1990-08-24' },
    { id: 'w3', name: '최진우', role: 'Worker', email: 'jinwoo@gss.com', siteId: '1', evaluation: '현장 정리정돈 상태가 매우 양호함.', birthDate: '1988-11-03' },
    { id: 'w4', name: '박민수', role: 'Worker', email: 'minsu@gss.com', siteId: '2', evaluation: '안전 보호구 착용 상태가 우수함.', birthDate: '1992-02-15' },
    { id: 'w5', name: '정다은', role: 'Worker', email: 'daeun@gss.com', siteId: '2', evaluation: '위험 요소 발견 시 즉시 보고하는 습관이 있음.', birthDate: '1995-07-30' }
  ]);

  const handleLogin = (user: User) => {
    setRegisteredUsers(prev => {
      const exists = prev.find(u => u.name === user.name && u.role === user.role);
      if (exists) return prev;
      return [...prev, user];
    });
    setCurrentUser(user);
    setView('SITES');
  };

  const updateUserEvaluation = (userId: string, evaluation: string) => {
    setRegisteredUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, evaluation } : u
    ));
  };

  const handleSiteClick = (id: string) => {
    setActiveSiteId(id);
    setView('SITE_DASHBOARD');
  };

  const addSite = (name: string, manager: string, supervisor: string) => {
    const newSite: ConstructionSite = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      manager,
      supervisor,
      categories: DEFAULT_CATEGORIES.map(cat => ({
        id: Math.random().toString(36).substr(2, 9),
        name: cat.name,
        files: [],
        reports: [],
        subCategories: cat.subCategories?.map(subName => ({
          id: Math.random().toString(36).substr(2, 9),
          name: subName,
          files: [],
          reports: []
        }))
      }))
    };
    setSites([...sites, newSite]);
    setView('SITES');
  };

  const updateSite = (id: string, name: string, manager: string, supervisor: string) => {
    setSites(prev => prev.map(site => 
      site.id === id ? { ...site, name, manager, supervisor } : site
    ));
    setView('SITE_DASHBOARD');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeSiteId || !activeCategoryId || !currentUser) return;

    const newFiles: UploadedFile[] = (Array.from(files) as File[]).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toLocaleString('ko-KR'),
      uploadedBy: currentUser.name,
      uploaderRole: currentUser.role,
      url: URL.createObjectURL(file)
    }));

    updateSitesData(activeSiteId, activeCategoryId, (cat) => ({
      ...cat,
      files: [...cat.files, ...newFiles]
    }));
  };

  const handleReportSubmit = (report: Omit<SafetyReport, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploaderRole'>) => {
    if (!activeSiteId || !activeCategoryId || !currentUser) return;

    const newReport: SafetyReport = {
      ...report,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toLocaleString('ko-KR'),
      uploadedBy: currentUser.name,
      uploaderRole: currentUser.role
    };

    updateSitesData(activeSiteId, activeCategoryId, (cat) => ({
      ...cat,
      reports: [...(cat.reports || []), newReport]
    }));
    setView('CATEGORY_DETAIL');
  };

  const updateSitesData = (siteId: string, catId: string, updateFn: (cat: SiteCategory) => SiteCategory) => {
    setSites(prev => prev.map(site => {
      if (site.id !== siteId) return site;
      
      const updateCategories = (categories: SiteCategory[]): SiteCategory[] => {
        return categories.map(cat => {
          if (cat.id === catId) return updateFn(cat);
          if (cat.subCategories) {
            return { ...cat, subCategories: updateCategories(cat.subCategories) };
          }
          return cat;
        });
      };

      return {
        ...site,
        categories: updateCategories(site.categories)
      };
    }));
  };

  const deleteItem = (id: string, type: 'file' | 'report') => {
    if (!activeSiteId || !activeCategoryId) return;
    updateSitesData(activeSiteId, activeCategoryId, (cat) => ({
      ...cat,
      files: type === 'file' ? cat.files.filter(f => f.id !== id) : cat.files,
      reports: type === 'report' ? (cat.reports || []).filter(r => r.id !== id) : (cat.reports || [])
    }));
  };

  const AppLogo = ({ className = "h-12" }: { className?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-[#0097b2] p-1.5 rounded-xl shadow-lg shadow-[#0097b2]/20">
        <ShieldCheck className="text-white" size={24} />
      </div>
      <span className="font-black text-[#0097b2] text-xl tracking-tighter">GSS SAFE</span>
    </div>
  );

  const FileIconRenderer = ({ file }: { file: UploadedFile }) => {
    const fileName = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    if (type.includes('image')) {
      return <img src={file.url} className="w-full h-full object-cover" alt="Preview" />;
    }
    if (type.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FileText size={24} className="text-red-500" />;
    }
    if (type.includes('presentation') || type.includes('powerpoint') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return <Presentation size={24} className="text-orange-500" />;
    }
    if (type.includes('sheet') || type.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return <FileSpreadsheet size={24} className="text-green-600" />;
    }
    if (fileName.endsWith('.hwp')) {
      return <FileBox size={24} className="text-blue-600" />;
    }
    if (type.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return <FileText size={24} className="text-blue-500" />;
    }
    return <FileText size={24} className="text-slate-400" />;
  };

  const AuthScreen = () => {
    const [isReg, setIsReg] = useState(false);
    const [role, setRole] = useState<UserRole>('Worker');
    const [name, setName] = useState('');
    const [selectedSiteId, setSelectedSiteId] = useState<string>('');
    const [adminCode, setAdminCode] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleAuthAction = () => {
      if (role === 'Admin' && isReg && adminCode !== '1') {
        alert('관리자 코드명이 올바르지 않습니다.');
        return;
      }
      const userId = Math.random().toString(36).substr(2, 9);
      handleLogin({ 
        id: userId, 
        name: name || '사용자', 
        role, 
        email: 'user@gss.com',
        siteId: role === 'Worker' ? selectedSiteId : undefined,
        birthDate: role === 'Worker' ? birthDate : undefined
      });
      
      if (role === 'Worker' && selectedSiteId) {
        setActiveSiteId(selectedSiteId);
        setView('SITE_DASHBOARD');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/60 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-full mb-8 flex justify-center">
              <AppLogo className="h-16" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">GSS 안전관리</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">현장 맞춤형 스마트 안전 솔루션</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-3">사용자 유형 선택</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setRole('Worker')} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-3xl font-bold text-sm transition-all border-2 ${role === 'Worker' ? 'border-[#0097b2] bg-[#f0f9fb] text-[#0097b2]' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                  <UserIcon size={24} />
                  <span>근로자용</span>
                </button>
                <button onClick={() => setRole('Admin')} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-3xl font-bold text-sm transition-all border-2 ${role === 'Admin' ? 'border-[#0097b2] bg-[#f0f9fb] text-[#0097b2]' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                  <ShieldCheck size={24} />
                  <span>관리자용</span>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group">
                <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">성함</label>
                <input type="text" placeholder="이름을 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] focus:ring-4 focus:ring-[#0097b2]/5 transition-all" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              
              {role === 'Worker' && isReg && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">소속 현장 선택</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] focus:ring-4 focus:ring-[#0097b2]/5 transition-all cursor-pointer"
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                    >
                      <option value="">현장을 선택하세요</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">생년월일</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] focus:ring-4 focus:ring-[#0097b2]/5 transition-all" 
                      value={birthDate} 
                      onChange={(e) => setBirthDate(e.target.value)} 
                    />
                  </div>
                </>
              )}

              {role === 'Admin' && isReg && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">관리자 코드명</label>
                  <input 
                    type="text" 
                    placeholder="관리자 코드를 입력하세요" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] focus:ring-4 focus:ring-[#0097b2]/5 transition-all" 
                    value={adminCode} 
                    onChange={(e) => setAdminCode(e.target.value)} 
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">비밀번호</label>
                <input type="password" placeholder="비밀번호를 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] focus:ring-4 focus:ring-[#0097b2]/5 transition-all" />
              </div>
            </div>
            <button 
              onClick={handleAuthAction} 
              disabled={!name || (role === 'Worker' && isReg && (!selectedSiteId || !birthDate)) || (role === 'Admin' && isReg && !adminCode)}
              className="w-full bg-[#0097b2] text-white p-5 rounded-3xl font-bold shadow-xl shadow-[#0097b2]/20 active:scale-[0.98] transition-all mt-4 hover:bg-[#008199] disabled:opacity-50"
            >
              {isReg ? '회원가입 완료' : '로그인'}
            </button>
            <div className="pt-2 text-center">
              <button onClick={() => setIsReg(!isReg)} className="text-slate-400 text-xs font-semibold py-2">
                {isReg ? '이미 계정이 있으신가요? 로그인' : '처음 방문하셨나요? 계정 만들기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SiteListScreen = () => {
    return (
      <div className="flex flex-col h-screen bg-[#fafbfc]">
        <div className="bg-white px-5 pt-8 pb-4 shrink-0 shadow-sm border-b border-slate-100 flex justify-between items-center">
          <AppLogo />
          <button onClick={() => setCurrentUser(null)} className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl">
            <LogOut size={20}/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">현장 목록</h2>
              <p className="text-sm text-slate-400 font-medium">관리 중인 모든 현장을 확인하세요</p>
            </div>
            {currentUser?.role === 'Admin' && (
              <button onClick={() => setView('ADD_SITE')} className="bg-[#0097b2] text-white p-3 rounded-2xl shadow-lg shadow-[#0097b2]/20">
                <Plus size={24}/>
              </button>
            )}
          </div>
          <div className="grid gap-4">
            {sites.map(site => (
              <button key={site.id} onClick={() => handleSiteClick(site.id)} className="w-full text-left bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-[#0097b2]/50 hover:shadow-xl transition-all active:scale-[0.98] group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-[#f0f9fb] rounded-3xl group-hover:bg-[#0097b2] transition-colors">
                    <Building2 className="text-[#0097b2] group-hover:text-white" size={28} />
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0097b2] transition-colors">{site.name}</h3>
                <div className="flex gap-4 mt-4">
                  <div className="text-[11px] font-bold text-slate-400">
                    <span className="uppercase block opacity-60">현장소장</span>
                    <span className="text-slate-700 text-sm mt-0.5 block">{site.manager}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">
                    <span className="uppercase block opacity-60">관리감독자</span>
                    <span className="text-slate-700 text-sm mt-0.5 block">{site.supervisor}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SiteDashboardScreen = () => {
    const site = sites.find(s => s.id === activeSiteId);
    if (!site) return null;

    const visibleCategories = site.categories.filter(cat => {
      if (currentUser?.role === 'Admin') return true;
      return [
        '현장 안전 점검', 
        '위험발굴/작업중지',
        '위험성평가'
      ].includes(cat.name);
    });

    return (
      <div className="flex flex-col h-screen bg-[#fafbfc]">
        <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between shrink-0">
          <button onClick={() => setView('SITES')} className="p-2.5 -ml-2 text-slate-400 hover:text-[#0097b2] rounded-2xl flex items-center gap-1">
            <ArrowLeft size={24}/>
            {currentUser?.role === 'Worker' && <span className="text-xs font-bold">현장 이동</span>}
          </button>
          <div className="flex-1 px-4">
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border-none text-sm font-bold text-slate-900 rounded-xl py-2 px-3 pr-8 appearance-none focus:ring-2 focus:ring-[#0097b2]/20 cursor-pointer truncate"
                value={activeSiteId || ''}
                onChange={(e) => setActiveSiteId(e.target.value)}
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">현장 대시보드</p>
          </div>
          {currentUser?.role === 'Admin' && (
            <button onClick={() => setView('EDIT_SITE')} className="p-2.5 -mr-2 text-slate-400 hover:text-[#0097b2] rounded-2xl">
              <Settings size={22}/>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-tighter">현장소장</p>
                <p className="text-base font-bold text-slate-700">{site.manager}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-tighter">관리감독자</p>
                <p className="text-base font-bold text-slate-700">{site.supervisor}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">관리 항목 리스트</h3>
              <span className="text-[10px] bg-[#f0f9fb] text-[#0097b2] font-bold px-2 py-0.5 rounded-full border border-[#0097b2]/10">
                {site.categories.length} CATEGORIES
              </span>
            </div>
            <div className="grid gap-3">
              {visibleCategories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => { 
                    if (cat.subCategories && cat.subCategories.length > 0) {
                      setActiveParentCategoryId(cat.id);
                      setView('SUB_CATEGORY_LIST');
                    } else {
                      setActiveCategoryId(cat.id); 
                      setView('CATEGORY_DETAIL'); 
                    }
                  }} 
                  className="w-full flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:border-[#0097b2]/40 hover:shadow-xl transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#f0f9fb] transition-colors">
                      <FileText size={22} className="text-slate-400 group-hover:text-[#0097b2]" />
                    </div>
                    <span className="font-bold text-slate-700 text-lg group-hover:text-[#0097b2] transition-colors tracking-tight">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {(cat.files.length + (cat.reports?.length || 0)) > 0 && (
                      <span className="bg-[#0097b2] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        {cat.files.length + (cat.reports?.length || 0)}
                      </span>
                    )}
                    <ChevronRight size={22} className="text-slate-300 group-hover:text-[#0097b2] group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddSiteScreen = () => {
    const [name, setName] = useState('');
    const [manager, setManager] = useState('');
    const [supervisor, setSupervisor] = useState('');

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">새 현장 등록</h2>
            <button onClick={() => setView('SITES')} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">현장명</label>
              <input type="text" placeholder="현장 이름을 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] transition-all" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">현장소장</label>
              <input type="text" placeholder="현장소장 성함을 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] transition-all" value={manager} onChange={(e) => setManager(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">관리감독자</label>
              <input type="text" placeholder="관리감독자 성함을 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] transition-all" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} />
            </div>
            <button onClick={() => { if (name && manager && supervisor) addSite(name, manager, supervisor); }} disabled={!name || !manager || !supervisor} className="w-full bg-[#0097b2] text-white p-5 rounded-3xl font-bold shadow-xl shadow-[#0097b2]/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50">
              현장 등록 완료
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditSiteScreen = () => {
    const site = sites.find(s => s.id === activeSiteId);
    const [name, setName] = useState(site?.name || '');
    const [manager, setManager] = useState(site?.manager || '');
    const [supervisor, setSupervisor] = useState(site?.supervisor || '');

    if (!site) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">현장 정보 수정</h2>
            <button onClick={() => setView('SITE_DASHBOARD')} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">현장명</label>
              <input type="text" placeholder="현장 이름을 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] transition-all" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">현장소장</label>
              <input type="text" placeholder="현장소장 성함을 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] transition-all" value={manager} onChange={(e) => setManager(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">관리감독자</label>
              <input type="text" placeholder="관리감독자 성함을 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#0097b2] transition-all" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} />
            </div>
            <button onClick={() => { if (name && manager && supervisor) updateSite(site.id, name, manager, supervisor); }} disabled={!name || !manager || !supervisor} className="w-full bg-[#0097b2] text-white p-5 rounded-3xl font-bold shadow-xl shadow-[#0097b2]/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50">
              수정 완료
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReportFormScreen = () => {
    const site = sites.find(s => s.id === activeSiteId);
    const category = site ? (function findCat(cats: SiteCategory[]): SiteCategory | undefined {
      for (const c of cats) {
        if (c.id === activeCategoryId) return c;
        if (c.subCategories) {
          const found = findCat(c.subCategories);
          if (found) return found;
        }
      }
      return undefined;
    })(site.categories) : undefined;

    const isInspection = category?.name === '현장 안전 점검';
    const isSpecialEducation = category?.name === '특별안전교육';

    const [type, setType] = useState<SafetyReport['type']>(
      isInspection ? '현장안전점검' : isSpecialEducation ? '특별안전교육' : '위험발굴'
    );
    const [inspectionStatus, setInspectionStatus] = useState<SafetyReport['inspectionStatus']>('일일점검');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [issue, setIssue] = useState('');
    const [action, setAction] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      
      const remainingSlots = 6 - images.length;
      const filesToProcess = (Array.from(files) as File[]).slice(0, remainingSlots);
      
      const newImageUrls = filesToProcess.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImageUrls]);
    };

    const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <div className="flex items-center p-5 border-b border-slate-100 shrink-0">
          <button onClick={() => setView('CATEGORY_DETAIL')} className="p-2.5 -ml-2 text-slate-400 hover:text-[#0097b2] rounded-2xl">
            <X size={24}/>
          </button>
          <h2 className="text-xl font-bold ml-2 text-slate-800 tracking-tight">
            {isInspection ? '현장 안전 점검 등록' : isSpecialEducation ? '특별안전교육 등록' : '안전 활동 등록'}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-lg mx-auto w-full">
          {!isInspection && !isSpecialEducation && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-3">유형 선택</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setType('위험발굴')} className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border-2 ${type === '위험발굴' ? 'border-[#0097b2] bg-[#f0f9fb] text-[#0097b2]' : 'border-slate-50 text-slate-400'}`}>
                  <AlertTriangle size={20}/> 위험발굴
                </button>
                <button onClick={() => setType('작업중지')} className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border-2 ${type === '작업중지' ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-50 text-slate-400'}`}>
                  <Zap size={20}/> 작업중지
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">
              {isSpecialEducation ? '교육 날짜' : '날짜'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input type="date" className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0097b2]" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          {isInspection && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-3">점검 상태</label>
              <div className="grid grid-cols-2 gap-3">
                {(['일일점검', '휴가', '외근', '현장작업 없음'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setInspectionStatus(status)}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border-2 ${
                      inspectionStatus === status
                        ? 'border-[#0097b2] bg-[#f0f9fb] text-[#0097b2]'
                        : 'border-slate-50 text-slate-400'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isInspection ? (
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">점검 내용</label>
              <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0097b2] min-h-[120px]" placeholder="오늘의 현장 점검 내용을 상세히 기록하세요" value={content} onChange={e => setContent(e.target.value)} />
            </div>
          ) : isSpecialEducation ? (
            <div>
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">특별교육 내용</label>
              <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0097b2] min-h-[120px]" placeholder="특별안전교육 내용을 상세히 기록하세요" value={content} onChange={e => setContent(e.target.value)} />
            </div>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">부적합 내용</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0097b2] min-h-[100px]" placeholder="발견된 위험 요소나 부적합 사항을 입력하세요" value={issue} onChange={e => setIssue(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">조치 내용</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0097b2] min-h-[100px]" placeholder="수행된 또는 필요한 조치 사항을 입력하세요" value={action} onChange={e => setAction(e.target.value)} />
              </div>
            </>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest block">
                {isSpecialEducation ? '교육 사진' : '첨부 사진'} ({images.length}/6)
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img src={img} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                    <X size={14}/>
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:border-[#0097b2] hover:bg-[#f0f9fb] transition-all">
                  <Camera size={24} className="text-slate-300" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
                </label>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => handleReportSubmit({ 
              type, 
              date, 
              inspectionStatus: isInspection ? inspectionStatus : undefined,
              issue: (isInspection || isSpecialEducation) ? undefined : issue, 
              action: (isInspection || isSpecialEducation) ? undefined : action, 
              content: (isInspection || isSpecialEducation) ? content : undefined,
              imageUrls: images.length > 0 ? images : undefined 
            })} 
            disabled={(isInspection || isSpecialEducation) ? (!content && inspectionStatus === '일일점검') : (!issue || !action)}
            className="w-full bg-[#0097b2] text-white p-5 rounded-3xl font-bold shadow-xl shadow-[#0097b2]/20 active:scale-95 transition-all text-lg disabled:opacity-50"
          >
            등록 완료
          </button>
        </div>
      </div>
    );
  };

  const SubCategoryListScreen = () => {
    const site = sites.find(s => s.id === activeSiteId);
    const parentCategory = site?.categories.find(c => c.id === activeParentCategoryId);
    if (!parentCategory) return null;

    return (
      <div className="flex flex-col h-screen bg-[#fafbfc]">
        <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between shrink-0">
          <button onClick={() => { setActiveParentCategoryId(null); setView('SITE_DASHBOARD'); }} className="p-2.5 -ml-2 text-slate-400 hover:text-[#0097b2] rounded-2xl">
            <ArrowLeft size={24}/>
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-bold text-slate-900 leading-none truncate px-4">{parentCategory.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">하위 항목 선택</p>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="grid gap-3">
            {parentCategory.subCategories?.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCategoryId(cat.id); setView('CATEGORY_DETAIL'); }} className="w-full flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:border-[#0097b2]/40 hover:shadow-xl transition-all active:scale-[0.99] group">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#f0f9fb] transition-colors">
                    <FileText size={22} className="text-slate-400 group-hover:text-[#0097b2]" />
                  </div>
                  <span className="font-bold text-slate-700 text-lg group-hover:text-[#0097b2] transition-colors tracking-tight">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {(cat.files.length + (cat.reports?.length || 0)) > 0 && (
                    <span className="bg-[#0097b2] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                      {cat.files.length + (cat.reports?.length || 0)}
                    </span>
                  )}
                  <ChevronRight size={22} className="text-slate-300 group-hover:text-[#0097b2] group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CategoryDetailScreen = () => {
    const site = sites.find(s => s.id === activeSiteId);
    
    const findCategory = (categories: SiteCategory[]): SiteCategory | undefined => {
      for (const cat of categories) {
        if (cat.id === activeCategoryId) return cat;
        if (cat.subCategories) {
          const found = findCategory(cat.subCategories);
          if (found) return found;
        }
      }
      return undefined;
    };

    const category = site ? findCategory(site.categories) : undefined;
    const isSpecialCategory = category?.name === '위험발굴/작업중지' || category?.name === '현장 안전 점검' || category?.name === '특별안전교육';
    const isWorkerManagement = category?.name === '근로자 관리대장';

    if (!category) return null;

    const siteWorkers = registeredUsers.filter(u => u.role === 'Worker' && u.siteId === activeSiteId);

    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center min-w-0">
            <button 
              onClick={() => {
                if (activeParentCategoryId) {
                  setView('SUB_CATEGORY_LIST');
                } else {
                  setView('SITE_DASHBOARD');
                }
              }} 
              className="p-2.5 -ml-2 text-slate-400 hover:text-[#0097b2] rounded-2xl"
            >
              <ArrowLeft size={24}/>
            </button>
            <div className="ml-3 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 leading-none truncate tracking-tight">{category.name}</h2>
              <p className="text-[10px] font-bold text-[#0097b2] mt-1.5 uppercase tracking-widest truncate">{site?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isSpecialCategory ? (
              <button onClick={() => setView('REPORT_FORM')} className="bg-[#0097b2] text-white px-5 py-3 rounded-2xl shadow-lg shadow-[#0097b2]/20 font-bold flex items-center gap-2 hover:bg-[#008199] active:scale-95 transition-all">
                <Plus size={20}/> 등록하기
              </button>
            ) : currentUser?.role === 'Admin' ? (
              <label className="bg-[#0097b2] text-white p-3 rounded-[1.25rem] shadow-xl shadow-[#0097b2]/20 cursor-pointer active:scale-90 transition-all hover:bg-[#008199]">
                <FileUp size={24} />
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.hwp,image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isWorkerManagement ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {siteWorkers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm mb-6 border border-slate-50">
                    <UserIcon size={64} className="text-[#0097b2] opacity-20" />
                  </div>
                  <p className="font-bold text-slate-400 text-lg">등록된 근로자가 없습니다</p>
                </div>
              ) : (
                siteWorkers.map(worker => (
                  <div key={worker.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f0f9fb] rounded-2xl flex items-center justify-center text-[#0097b2]">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{worker.name}</h3>
                        <p className="text-xs text-slate-400 font-medium">생년월일: {worker.birthDate || '미등록'}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-50">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">근로자 평가</label>
                      {currentUser?.role === 'Admin' ? (
                        <textarea 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0097b2] min-h-[80px] text-sm"
                          placeholder="근로자에 대한 평가를 입력하세요"
                          value={worker.evaluation || ''}
                          onChange={(e) => updateUserEvaluation(worker.id, e.target.value)}
                        />
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl min-h-[60px]">
                          <p className="text-sm text-slate-600 italic">
                            {worker.evaluation || '아직 등록된 평가가 없습니다.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (!category.files.length && !(category.reports?.length)) ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm mb-6 border border-slate-50">
                <ClipboardList size={64} className="text-[#0097b2] opacity-20" />
              </div>
              <p className="font-bold text-slate-400 text-lg">등록된 데이터가 없습니다</p>
              <p className="text-xs mt-2 font-semibold text-slate-400 bg-slate-200/50 px-4 py-1.5 rounded-full uppercase tracking-tighter">
                {isSpecialCategory ? '상단의 등록하기 버튼을 눌러주세요' : '파일(PDF, PPT, HWP 등)을 추가하여 관리하세요'}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Structured Reports Render */}
              {category.reports?.map(report => (
                <div key={report.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        report.type === '위험발굴' ? 'bg-[#f0f9fb] text-[#0097b2]' : 
                        report.type === '현장안전점검' ? 'bg-amber-50 text-amber-600' : 
                        report.type === '특별안전교육' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {report.type === '현장안전점검' ? '안전점검' : report.type}
                      </span>
                      <span className="text-sm font-bold text-slate-400">{report.date}</span>
                    </div>
                    <button onClick={() => deleteItem(report.id, 'report')} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                  
                  {report.type === '현장안전점검' || report.type === '특별안전교육' ? (
                    <div className="space-y-4">
                      {report.inspectionStatus && report.type === '현장안전점검' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#0097b2] bg-[#f0f9fb] px-3 py-1 rounded-lg border border-[#0097b2]/10">
                            {report.inspectionStatus}
                          </span>
                        </div>
                      )}
                      {report.content && (
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            {report.type === '특별안전교육' ? '교육 내용' : '점검 내용'}
                          </p>
                          <p className="text-[15px] font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">{report.content}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">부적합 내용</p>
                        <p className="text-[15px] font-medium text-slate-800 leading-relaxed">{report.issue}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#0097b2] uppercase tracking-widest">조치 내용</p>
                        <p className="text-[15px] font-medium text-slate-800 leading-relaxed">{report.action}</p>
                      </div>
                    </div>
                  )}

                  {report.imageUrls && report.imageUrls.length > 0 && (
                    <div className={`grid gap-2 ${report.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                      {report.imageUrls.map((url, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                          <img src={url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-white bg-slate-400 px-2 py-0.5 rounded-full uppercase">
                        {report.uploaderRole === 'Admin' ? '관리자' : '근로자'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">{report.uploadedBy}</span>
                    </div>
                    <span className="text-[10px] text-slate-300">{report.uploadedAt}</span>
                  </div>
                </div>
              ))}

              {/* Files Render */}
              {category.files.map(file => (
                <div key={file.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-[#0097b2]/40 transition-all">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="shrink-0 w-14 h-14 flex items-center justify-center bg-slate-50 rounded-[1.25rem] group-hover:bg-[#f0f9fb] transition-colors overflow-hidden border border-slate-50">
                      <FileIconRenderer file={file} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[15px] font-bold text-slate-800 truncate leading-tight mb-2 tracking-tight">{file.name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[9px] font-extrabold text-white bg-[#0097b2] px-2 py-0.5 rounded-full uppercase tracking-tighter">{file.uploaderRole === 'Admin' ? '관리자' : '근로자'}</span>
                        <span className="text-[11px] font-bold text-slate-600">{file.uploadedBy}</span>
                        <span className="text-slate-200 text-xs">•</span>
                        <span className="text-[11px] text-slate-400 font-medium">{file.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <a href={file.url} download={file.name} className="p-3 text-[#0097b2] hover:bg-[#f0f9fb] rounded-2xl transition-all" title="다운로드"><Download size={20} /></a>
                    {(currentUser?.role === 'Admin' || currentUser?.name === file.uploadedBy) && (
                      <button onClick={() => deleteItem(file.id, 'file')} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="삭제"><Trash2 size={20} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (view === 'AUTH') return <AuthScreen />;
  if (view === 'SITES') return <SiteListScreen />;
  if (view === 'SITE_DASHBOARD') return <SiteDashboardScreen />;
  if (view === 'ADD_SITE') return <AddSiteScreen />;
  if (view === 'EDIT_SITE') return <EditSiteScreen />;
  if (view === 'REPORT_FORM') return <ReportFormScreen />;
  if (view === 'SUB_CATEGORY_LIST') return <SubCategoryListScreen />;
  if (view === 'CATEGORY_DETAIL') return <CategoryDetailScreen />;
  return <SiteListScreen />;
}

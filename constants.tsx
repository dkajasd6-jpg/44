
export const DEFAULT_CATEGORIES = [
  {
    name: '위험성평가',
    subCategories: ['최초위험성평가등록', '정기 위험성평가 등록', '수시 위험성평가']
  },
  {
    name: '안전교육',
    subCategories: ['사고사례 모음', '특별안전교육']
  },
  {
    name: '건강관리',
    subCategories: ['일반건강검진', '배치전건강검진']
  },
  { name: '근로자 관리대장' },
  { name: '현장 안전 점검' }, 
  { name: '위험발굴/작업중지' }
];

export const INITIAL_SITES = [
  {
    id: '1',
    name: '평택여염공원',
    manager: '이상엽',
    supervisor: '박성배',
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
  },
  {
    id: '2',
    name: '호반천안일봉 2BL',
    manager: '강문호',
    supervisor: '김덕현',
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
  }
];

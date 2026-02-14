export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5050';

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
  },
  campaigns: {
    list: '/api/campaigns',
    create: '/api/campaigns',
    get: (id: string) => `/api/campaigns/${id}`,
    public: (id: string) => `/api/campaigns/${id}/public`,
    publicByOrgSlug: (org: string, slug: string) => `/api/public/${org}/${slug}`,
    update: (id: string) => `/api/campaigns/${id}`,
    delete: (id: string) => `/api/campaigns/${id}`,
    progress: (id: string) => `/api/campaigns/${id}/progress`,
    media: (id: string) => `/api/campaigns/${id}/media`,
    drawWinner: (id: string) => `/api/campaigns/${id}/draw-winner`,
    giveawayLogs: (id: string) => `/api/campaigns/${id}/giveaway-logs`,
  },
  pageLayout: {
    get: (id: string) => `/api/campaigns/${id}/page-layout`,
    put: (id: string) => `/api/campaigns/${id}/page-layout`,
    schema: '/api/page-layout/schema',
  },
  media: {
    signedUrl: '/api/media/signed-url',
    persist: '/api/media',
    upload: '/api/media/upload',
  },
  donations: {
    checkout: '/api/donations/checkout',
    get: (id: string) => `/api/donations/${id}`,
  },
  orgs: {
    list: '/api/orgs',
    create: '/api/orgs',
    get: (id: string) => `/api/orgs/${id}`,
  },
};

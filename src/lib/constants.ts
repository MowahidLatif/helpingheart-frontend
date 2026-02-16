export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5050';

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    changePassword: '/api/auth/change-password',
  },
  me: {
    profile: '/api/me/profile',
    info: '/api/me',
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
    tasks: (id: string) => `/api/campaigns/${id}/tasks`,
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
    update: (id: string) => `/api/orgs/${id}`,
    subdomain: (id: string) => `/api/orgs/${id}/subdomain`,
    members: (id: string) => `/api/orgs/${id}/members`,
    createMember: (id: string) => `/api/orgs/${id}/members/create`,
    memberPermissions: (orgId: string, userId: string) =>
      `/api/orgs/${orgId}/members/${userId}/permissions`,
    taskStatuses: (id: string) => `/api/orgs/${id}/task-statuses`,
  },
};

/** Permission codes for org members (must match backend ALL_PERMISSIONS). */
export const ORG_PERMISSIONS = [
  'campaign:create',
  'campaign:edit',
  'campaign:delete',
  'tasks:create',
  'tasks:assign',
  'tasks:edit_any',
] as const;

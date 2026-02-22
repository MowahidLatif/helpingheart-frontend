export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5050';

export const API_ENDPOINTS = {
  contact: '/api/contact',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    changePassword: '/api/auth/change-password',
    deleteAccount: '/api/auth/delete-account',
    twoFaSetup: '/api/auth/2fa/setup',
    twoFaVerify: '/api/auth/2fa/verify',
    twoFaDisable: '/api/auth/2fa/disable',
    twoFaConfirmLogin: '/api/auth/2fa/confirm-login',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
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
    patch: (id: string) => `/api/campaigns/${id}`,
    delete: (id: string) => `/api/campaigns/${id}`,
    progress: (id: string) => `/api/campaigns/${id}/progress`,
    media: (id: string) => `/api/campaigns/${id}/media`,
    drawWinner: (id: string) => `/api/campaigns/${id}/draw-winner`,
    giveawayLogs: (id: string) => `/api/campaigns/${id}/giveaway-logs`,
    tasks: (id: string) => `/api/campaigns/${id}/tasks`,
    task: (campaignId: string, taskId: string) => `/api/campaigns/${campaignId}/tasks/${taskId}`,
    donations: (id: string) => `/api/campaigns/${id}/donations`,
    donationsExportCsv: (id: string) => `/api/campaigns/${id}/donations/export.csv`,
    comments: (id: string) => `/api/campaigns/${id}/comments`,
    comment: (campaignId: string, commentId: string) =>
      `/api/campaigns/${campaignId}/comments/${commentId}`,
    updates: (id: string) => `/api/campaigns/${id}/updates`,
    update: (campaignId: string, updateId: string) =>
      `/api/campaigns/${campaignId}/updates/${updateId}`,
    receipts: (id: string) => `/api/campaigns/${id}/receipts`,
    receiptPreview: (campaignId: string, receiptId: string) =>
      `/api/campaigns/${campaignId}/receipts/${receiptId}/preview`,
    receiptResend: (campaignId: string, receiptId: string) =>
      `/api/campaigns/${campaignId}/receipts/${receiptId}/resend`,
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
    delete: (id: string) => `/api/media/${id}`,
  },
  donations: {
    checkout: '/api/donations/checkout',
    get: (id: string) => `/api/donations/${id}`,
  },
  orgs: {
    list: '/api/orgs',
    get: (id: string) => `/api/orgs/${id}`,
    update: (id: string) => `/api/orgs/${id}`,
    subdomain: (id: string) => `/api/orgs/${id}/subdomain`,
    members: (id: string) => `/api/orgs/${id}/members`,
    addMember: (id: string) => `/api/orgs/${id}/members`,
    createMember: (id: string) => `/api/orgs/${id}/members/create`,
    memberPermissions: (orgId: string, userId: string) =>
      `/api/orgs/${orgId}/members/${userId}/permissions`,
    memberRole: (orgId: string, userId: string) => `/api/orgs/${orgId}/members/${userId}`,
    deleteMember: (orgId: string, userId: string) => `/api/orgs/${orgId}/members/${userId}`,
    taskStatuses: (id: string) => `/api/orgs/${id}/task-statuses`,
    taskStatus: (orgId: string, statusId: string) => `/api/orgs/${orgId}/task-statuses/${statusId}`,
    emailSettings: (id: string) => `/api/orgs/${id}/email-settings`,
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

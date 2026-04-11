export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5050';

export const API_ENDPOINTS = {
  contact: '/api/contact',
  admin: {
    metrics: '/admin/metrics',
  },
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
    logout: '/api/auth/logout',
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
    taskComments: (campaignId: string, taskId: string) =>
      `/api/campaigns/${campaignId}/tasks/${taskId}/comments`,
    taskCommentReactions: (campaignId: string, taskId: string, commentId: string) =>
      `/api/campaigns/${campaignId}/tasks/${taskId}/comments/${commentId}/reactions`,
    taskChecklist: (campaignId: string, taskId: string) =>
      `/api/campaigns/${campaignId}/tasks/${taskId}/checklist`,
    taskChecklistItem: (campaignId: string, taskId: string, checklistId: string) =>
      `/api/campaigns/${campaignId}/tasks/${taskId}/checklist/${checklistId}`,
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
    stripeEvents: (id: string) => `/api/campaigns/${id}/webhooks/stripe-events`,
  },
  pageLayout: {
    get: (id: string) => `/api/campaigns/${id}/page-layout`,
    put: (id: string) => `/api/campaigns/${id}/page-layout`,
    schema: '/api/page-layout/schema',
  },
  aiSite: {
    generate: (campaignId: string) => `/api/campaigns/${campaignId}/ai-site/generate`,
    job: (campaignId: string, jobId: string) =>
      `/api/campaigns/${campaignId}/ai-site/jobs/${jobId}`,
  },
  platform: {
    aiGenerationCheckout: '/api/platform/ai-generation/checkout',
  },
  media: {
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
    tasks: (id: string) => `/api/orgs/${id}/tasks`,
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

export const TASK_COMMENT_TYPES = [
  "text",
  "blocked",
  "decision_needed",
  "escalation",
  "deadline_extension",
  "time_log",
  "reassignment",
] as const;

export const TASK_TITLE_SUGGESTIONS = [
  {
    category: "Maintenance & upkeep",
    items: [
      "Clean or tidy an area",
      "Repair or fix something",
      "Perform a routine check",
      "Replace or swap out equipment",
    ],
  },
  {
    category: "Administrative",
    items: [
      "Record or log information",
      "Submit a form or request",
      "Schedule or book something",
      "Review and approve something",
    ],
  },
  {
    category: "People & coordination",
    items: [
      "Onboard or orient someone",
      "Cover a shift or role",
      "Assist a team member",
      "Train or demonstrate something",
    ],
  },
  {
    category: "Safety & compliance",
    items: [
      "Conduct an inspection",
      "Report a hazard or issue",
      "Verify something meets a standard",
      "Complete a required checklist",
    ],
  },
  {
    category: "Project & task work",
    items: [
      "Research or gather information",
      "Build or create something",
      "Test or evaluate something",
      "Complete a milestone or deliverable",
    ],
  },
  {
    category: "Outreach & engagement",
    items: [
      "Reach out to a new contact",
      "Follow up with a member or client",
      "Promote an event or initiative",
      "Welcome or greet someone",
    ],
  },
  {
    category: "Finance & resources",
    items: [
      "Process a payment or donation",
      "Track or record an expense",
      "Request or allocate a budget",
      "Reconcile or audit records",
    ],
  },
  {
    category: "Events & planning",
    items: [
      "Organize or plan an event",
      "Coordinate volunteers or staff",
      "Prepare materials or resources",
      "Follow up after an event",
    ],
  },
  {
    category: "Learning & development",
    items: [
      "Complete a training or course",
      "Share knowledge with the team",
      "Review a policy or guideline",
      "Attend a meeting or session",
    ],
  },
  {
    category: "Monitoring & reporting",
    items: [
      "Track progress on a goal",
      "Compile a status update",
      "Flag an issue or blocker",
      "Document an outcome or result",
    ],
  },
  {
    category: "Community & support",
    items: [
      "Support a person in need",
      "Connect someone to a resource",
      "Check in on a member",
      "Coordinate a care or aid effort",
    ],
  },
  {
    category: "Content & media",
    items: [
      "Create or publish content",
      "Review or edit a submission",
      "Capture photos or media",
      "Update a website or platform",
    ],
  },
  {
    category: "Research & evaluation",
    items: [
      "Survey or gather feedback",
      "Analyze data or results",
      "Compare options or vendors",
      "Summarize findings",
    ],
  },
  {
    category: "Purchasing & procurement",
    items: [
      "Source or find a vendor",
      "Place or track an order",
      "Compare quotes or proposals",
      "Return or exchange an item",
    ],
  },
  {
    category: "Legal & documentation",
    items: [
      "Prepare or file a document",
      "Obtain a signature or approval",
      "Store or archive a record",
      "Review a contract or agreement",
    ],
  },
  {
    category: "Technology & systems",
    items: [
      "Set up a device or account",
      "Troubleshoot a technical issue",
      "Update software or settings",
      "Back up or migrate data",
    ],
  },
  {
    category: "Fundraising & donations",
    items: [
      "Solicit a donation or contribution",
      "Acknowledge or thank a donor",
      "Track a fundraising goal",
      "Apply for a grant or funding",
    ],
  },
  {
    category: "Volunteer & member management",
    items: [
      "Recruit or invite a new member",
      "Assign a role or responsibility",
      "Recognize or reward a contributor",
      "Offboard or transition someone out",
    ],
  },
  {
    category: "Worship & spiritual care (religious orgs)",
    items: [
      "Prepare for a service or ceremony",
      "Coordinate a pastoral visit",
      "Arrange spiritual materials or resources",
      "Follow up with a congregation member",
    ],
  },
  {
    category: "Advocacy & awareness",
    items: [
      "Distribute materials or information",
      "Represent the organization publicly",
      "Collect signatures or pledges",
      "Attend an external meeting or hearing",
    ],
  },
  {
    category: "Data & records management",
    items: [
      "Enter or update a record",
      "Clean or verify existing data",
      "Export or share a dataset",
      "Perform a data audit",
    ],
  },
] as const;

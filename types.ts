export enum CandidateStatus {
    APPLIED = 'Ứng tuyển/Lọc hồ sơ',
    SCREENED = 'Sơ vấn',
    SENT_TO_DIRECTOR = 'Đẩy hồ sơ cho BGĐ',
    INTERVIEW_SCHEDULED = 'Hẹn phỏng vấn',
    SALARY_PROPOSED = 'Làm đề xuất lương',
    SALARY_APPROVED = 'Duyệt đề xuất lương',
    OFFER_SENT = 'Thông báo trúng tuyển',
    HIRED = 'Đã tuyển', 
    REJECTED = 'Từ chối',
}


export enum JobStatus {
    POSTING = 'Đang đăng',
    PAUSED = 'Tạm dừng',
    FILLED = 'Đã đủ người',
    DRAFT = 'Bản nháp',
}

export enum JobType {
    FULL_TIME = 'Toàn thời gian',
    PART_TIME = 'Bán thời gian',
    INTERN = 'Thực tập sinh',
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}

export interface Project {
    id: string;
    name: string;
    address: string;
    investor: string;
    manager: string;
    phone: string;
    images: string[];
    updatedAt: string;
}

export interface JobPosting {
    id: string;
    jobCode: string;
    title: string;
    department: string;
    projectId: string;
    projectName: string;
    location: string;
    jobType: JobType;
    status: JobStatus;
    deadline: string; // YYYY-MM-DD
    description: string;
    requirements: string;
    benefits: string;
    createdAt: string;
    updatedAt: string;
    candidateCount: number;
}


export interface StatusLog {
    status: CandidateStatus;
    updatedBy: string;
    updatedAt: string;
}

export interface Candidate {
    id: string;
    candidateCode: string; // Mã ứng viên: "XD.XXXX"
    name: string;
    phone: string;
    email: string;
    dateOfBirth?: string; // YYYY-MM-DD
    major?: string;
    sourceId?: string;
    classificationId?: string;
    positionId?: string;
    jobId?: string; // Link to a specific job posting
    projectId?: string;
    probationarySalary: number;
    officialSalary: number;
    onboardingDate?: string;
    followUpDate?: string; // Ngày liên hệ lại
    status: CandidateStatus;
    statusLogs: StatusLog[];
    createdAt: string;
    updatedAt: string;
    cvUrl?: string;
    aiSummary?: string;
    aiScore?: number;
    note?: string;

    // For display purposes, will be populated by API
    sourceName?: string;
    classificationName?: string;
    positionName?: string;
    projectName?: string;
}


export type ActivityLogAction = 'create' | 'update' | 'delete' | 'status_change';
export type ActivityLogEntity = 'project' | 'job_posting' | 'candidate' | 'source' | 'classification' | 'position';

export interface ActivityLog {
    id: string;
    actor: string; // User email
    action: ActivityLogAction;
    entity: ActivityLogEntity;
    entityId: string;
    entityName: string; // The name of the project, candidate, etc. for quick reference
    timestamp: string; // ISO 8601 format
    details: {
        before: Record<string, any> | null;
        after: Record<string, any> | null;
    };
}


export interface SettingItem {
    id: string;
    name: string;
}

export interface AppSettings {
    endpointUpload: string;
    enableSync: boolean;
}

export interface FunnelData {
    screening: number;
    interview: number;
    offer: number;
    hired: number;
}

export interface ChartDataPoint {
    label: string;
    value: number;
}

export interface DashboardData {
    newThisWeek: number;
    funnel: FunnelData;
    openJobs: number;
    topSource: string;
    profilesByWeek: ChartDataPoint[];
    profilesBySource: ChartDataPoint[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface ProjectPerformanceData {
    name: string;
    count: number;
}

export interface ReportData {
    totalProfiles: number;
    profilesOverTime: ChartDataPoint[];
    funnel: FunnelData;
    sourceDistribution: ChartDataPoint[];
    topProjects?: ProjectPerformanceData[];
}
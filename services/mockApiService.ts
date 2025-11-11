import { MOCK_PROJECTS, MOCK_JOBS, MOCK_CANDIDATES, MOCK_ACTIVITY_LOGS, MOCK_CANDIDATE_SOURCES, MOCK_TAGS, MOCK_POSITIONS, MOCK_USER, MOCK_CLASSIFICATIONS, MOCK_SETTINGS } from '../data/mockData';
import { Project, JobPosting, Candidate, ActivityLog, SettingItem, User, CandidateStatus, JobStatus, DashboardData, PaginatedResponse, ActivityLogAction, ActivityLogEntity, ReportData, ChartDataPoint, FunnelData, ProjectPerformanceData, AppSettings } from '../types';
import { GoogleGenAI, Type } from '@google/genai';


let mockProjects = MOCK_PROJECTS;
let mockJobs = MOCK_JOBS;
let mockCandidates = MOCK_CANDIDATES;
let mockActivityLogs = MOCK_ACTIVITY_LOGS;
let mockCandidateSources = MOCK_CANDIDATE_SOURCES;
let mockClassifications = MOCK_CLASSIFICATIONS;
let mockPositions = MOCK_POSITIONS;
let mockSettings = MOCK_SETTINGS;
let nextCandidateCode = 1005;

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(data)));
        }, 800 + Math.random() * 400); // Increased delay
    });
};

const addActivityLog = (logData: {
    action: ActivityLogAction;
    entity: ActivityLogEntity;
    entityId: string;
    entityName: string;
    details: {
        before: Record<string, any> | null;
        after: Record<string, any> | null;
    };
}) => {
    const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        actor: MOCK_USER.email,
        timestamp: new Date().toISOString(),
        ...logData,
    };
    mockActivityLogs.unshift(newLog);
};

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

const syncMock = (entity: string, entityName: string): Promise<string> => {
    const message = `[SYNC] Đồng bộ ${entity} "${entityName}"...`;
    console.log(message);
    return Promise.resolve(message);
};

export const api = {
    login: (email: string, pass: string): Promise<{ user: User }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'hr@dangson.vn' && pass === '12345678') {
                    resolve({ user: MOCK_USER });
                } else {
                    reject(new Error('Email hoặc mật khẩu không chính xác.'));
                }
            }, 500 + Math.random() * 300);
        });
    },
    getUser: (): Promise<User> => simulateDelay(MOCK_USER),
    
    // Project APIs
    getProjects: (
        { page = 1, limit = 10, search = '', investor = '' }
    ): Promise<PaginatedResponse<Project>> => {
        let filteredProjects = [...mockProjects];

        if (search) {
            const searchTerm = search.toLowerCase();
            filteredProjects = filteredProjects.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.address.toLowerCase().includes(searchTerm) ||
                p.investor.toLowerCase().includes(searchTerm)
            );
        }

        if (investor) {
            filteredProjects = filteredProjects.filter(p => p.investor === investor);
        }

        const total = filteredProjects.length;
        const data = filteredProjects.slice((page - 1) * limit, page * limit);

        return simulateDelay({ data, total, page, limit });
    },
    getProjectById: (id: string): Promise<Project | undefined> => {
        const project = mockProjects.find(p => p.id === id);
        return simulateDelay(project);
    },
    createProject: async (projectData: Omit<Project, 'id' | 'updatedAt'>): Promise<Project> => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            ...projectData,
            updatedAt: toISODateString(new Date()),
        };
        mockProjects.unshift(newProject);
        addActivityLog({
            action: 'create',
            entity: 'project',
            entityId: newProject.id,
            entityName: newProject.name,
            details: { before: null, after: newProject }
        });
        if (mockSettings.enableSync) {
            await syncMock('dự án', newProject.name);
        }
        return simulateDelay(newProject);
    },
    updateProject: async (id: string, projectData: Partial<Omit<Project, 'id'>>): Promise<Project> => {
        const originalProject = mockProjects.find(p => p.id === id);
        if (!originalProject) return Promise.reject(new Error('Project not found'));
        
        let updatedProject: Project | undefined;
        mockProjects = mockProjects.map(p => {
            if (p.id === id) {
                updatedProject = { ...p, ...projectData, updatedAt: toISODateString(new Date()) };
                return updatedProject;
            }
            return p;
        });

        if (updatedProject) {
            addActivityLog({
                action: 'update',
                entity: 'project',
                entityId: id,
                entityName: updatedProject.name,
                details: { before: originalProject, after: updatedProject }
            });
            if (mockSettings.enableSync) {
                await syncMock('dự án', updatedProject.name);
            }
            return simulateDelay(updatedProject);
        }
        return Promise.reject(new Error('Project not found'));
    },
    deleteProject: (id: string): Promise<{ id: string }> => {
        const projectToDelete = mockProjects.find(p => p.id === id);
        if (projectToDelete) {
            mockProjects = mockProjects.filter(p => p.id !== id);
            addActivityLog({
                action: 'delete',
                entity: 'project',
                entityId: id,
                entityName: projectToDelete.name,
                details: { before: projectToDelete, after: null }
            });
            return simulateDelay({ id });
        }
        return Promise.reject(new Error('Project not found'));
    },
    getAllProjects: (): Promise<Project[]> => simulateDelay(mockProjects),
    getInvestors: (): Promise<string[]> => {
        const investors = [...new Set(mockProjects.map(p => p.investor))];
        return simulateDelay(investors.sort());
    },
    uploadImage: (file: File): Promise<{ url: string }> => {
        if (!mockSettings.endpointUpload) {
            const errorMsg = "Chưa cấu hình endpoint lưu tệp";
            console.warn(errorMsg);
            return Promise.reject(new Error(errorMsg));
        } else {
            console.log(`Simulating upload to ${mockSettings.endpointUpload} for ${file.name}`);
        }
        return new Promise(resolve => {
            setTimeout(() => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({ url: reader.result as string });
                };
                reader.readAsDataURL(file);
            }, 500);
        });
    },

    // Job APIs
    getJobs: (filters: any): Promise<PaginatedResponse<JobPosting>> => {
        let results = [...mockJobs];

        if (filters.search) {
            const s = filters.search.toLowerCase();
            results = results.filter(j => j.title.toLowerCase().includes(s) || j.jobCode.toLowerCase().includes(s));
        }

        ['projectId', 'department', 'location', 'jobType', 'status'].forEach(key => {
            if (filters[key]) {
                results = results.filter((j: any) => j[key] === filters[key]);
            }
        });

        const total = results.length;
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const data = results.slice((page - 1) * limit, page * limit);
        
        return simulateDelay({ data, total, page, limit });
    },
    getJobById: (id: string): Promise<JobPosting | undefined> => {
        const job = mockJobs.find(j => j.id === id);
        return simulateDelay(job);
    },
    createJob: async (jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'candidateCount' | 'projectName'>): Promise<JobPosting> => {
        const now = new Date();
        const project = mockProjects.find(p => p.id === jobData.projectId);
        const newJob: JobPosting = {
            id: `job-${Date.now()}`,
            ...jobData,
            projectName: project?.name || 'N/A',
            candidateCount: 0,
            createdAt: toISODateString(now),
            updatedAt: toISODateString(now),
        };
        mockJobs.unshift(newJob);
        addActivityLog({
            action: 'create',
            entity: 'job_posting',
            entityId: newJob.id,
            entityName: `${newJob.jobCode} - ${newJob.title}`,
            details: { before: null, after: newJob }
        });
        if (mockSettings.enableSync) {
            await syncMock('tin tuyển dụng', `${newJob.jobCode} - ${newJob.title}`);
        }
        return simulateDelay(newJob);
    },
    updateJob: async (id: string, jobData: Partial<Omit<JobPosting, 'id'>>): Promise<JobPosting> => {
        const originalJob = mockJobs.find(j => j.id === id);
        if (!originalJob) return Promise.reject(new Error('Job not found'));

        let updatedJob: JobPosting | undefined;
        const project = jobData.projectId ? mockProjects.find(p => p.id === jobData.projectId) : undefined;
        
        mockJobs = mockJobs.map(j => {
            if (j.id === id) {
                updatedJob = { 
                    ...j, 
                    ...jobData, 
                    projectName: project?.name || j.projectName,
                    updatedAt: toISODateString(new Date()) 
                };
                return updatedJob;
            }
            return j;
        });
        if (updatedJob) {
            addActivityLog({
                action: 'update',
                entity: 'job_posting',
                entityId: id,
                entityName: `${updatedJob.jobCode} - ${updatedJob.title}`,
                details: { before: originalJob, after: updatedJob }
            });
            if (mockSettings.enableSync) {
                await syncMock('tin tuyển dụng', `${updatedJob.jobCode} - ${updatedJob.title}`);
            }
            return simulateDelay(updatedJob);
        }
        return Promise.reject(new Error('Job not found'));
    },

    // Candidate APIs
     getCandidatesByJobId: (jobId: string): Promise<Candidate[]> => {
        const candidates = mockCandidates.filter(c => c.jobId === jobId);
        const candidatesWithNames = candidates.map(c => ({
            ...c,
            positionName: mockPositions.find(p => p.id === c.positionId)?.name,
        }));
        return simulateDelay(candidatesWithNames);
    },
    getCandidates: (filters: any): Promise<PaginatedResponse<Candidate>> => {
        let results = [...mockCandidates];
        if (filters.search) {
            const s = filters.search.toLowerCase();
            results = results.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.email.toLowerCase().includes(s));
        }
        ['sourceId', 'classificationId', 'positionId', 'projectId', 'status'].forEach(key => {
            if (filters[key]) {
                results = results.filter((c: any) => c[key] === filters[key]);
            }
        });
        if (filters.startDate) {
             results = results.filter(c => new Date(c.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
             results = results.filter(c => new Date(c.createdAt) <= new Date(filters.endDate));
        }

        const dataWithNames = results.map(c => ({
            ...c,
            sourceName: mockCandidateSources.find(s => s.id === c.sourceId)?.name,
            classificationName: mockClassifications.find(cl => cl.id === c.classificationId)?.name,
            positionName: mockPositions.find(p => p.id === c.positionId)?.name,
            projectName: mockProjects.find(p => p.id === c.projectId)?.name,
        }));

        const total = dataWithNames.length;
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const data = dataWithNames.slice((page - 1) * limit, page * limit);
        
        return simulateDelay({ data, total, page, limit });
    },
    getCandidateById: (id: string): Promise<Candidate | undefined> => {
         const candidate = mockCandidates.find(c => c.id === id);
         if (candidate) {
            const detailedCandidate = {
                ...candidate,
                sourceName: mockCandidateSources.find(s => s.id === candidate.sourceId)?.name,
                classificationName: mockClassifications.find(cl => cl.id === candidate.classificationId)?.name,
                positionName: mockPositions.find(p => p.id === candidate.positionId)?.name,
                projectName: mockProjects.find(p => p.id === candidate.projectId)?.name,
            }
            return simulateDelay(detailedCandidate);
         }
        return simulateDelay(undefined);
    },
    createCandidate: async (data: Omit<Candidate, 'id' | 'candidateCode' | 'statusLogs' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Candidate> => {
        const now = new Date();
        const candidateCode = `XD.${nextCandidateCode++}`;
        const newCandidate: Candidate = {
            id: `cand-${Date.now()}`,
            candidateCode: candidateCode,
            ...data,
            probationarySalary: Number(data.probationarySalary) || 0,
            officialSalary: Number(data.officialSalary) || 0,
            status: CandidateStatus.APPLIED,
            statusLogs: [{ status: CandidateStatus.APPLIED, updatedBy: MOCK_USER.name, updatedAt: toISODateString(now) }],
            createdAt: toISODateString(now),
            updatedAt: toISODateString(now),
        };
        
        if (data.cvUrl) {
            const cvFileName = `${candidateCode} - ${data.name}.pdf`;
            newCandidate.cvUrl = data.cvUrl.replace(/[^/]*$/, cvFileName);
        }

        mockCandidates.unshift(newCandidate);
        addActivityLog({
            action: 'create',
            entity: 'candidate',
            entityId: newCandidate.id,
            entityName: newCandidate.name,
            details: { before: null, after: newCandidate }
        });
        if (mockSettings.enableSync) {
            await syncMock('ứng viên', newCandidate.name);
        }
        return simulateDelay(newCandidate);
    },
     updateCandidate: async (id: string, data: Partial<Omit<Candidate, 'id'>>): Promise<Candidate> => {
        const originalCandidate = mockCandidates.find(c => c.id === id);
        if (!originalCandidate) return Promise.reject(new Error('Candidate not found'));
        
        let updatedCandidate: Candidate | undefined;
        mockCandidates = mockCandidates.map(c => {
            if (c.id === id) {
                updatedCandidate = { ...c, ...data, updatedAt: toISODateString(new Date()) };
                if (data.followUpDate === '') {
                    updatedCandidate.followUpDate = undefined;
                }
                return updatedCandidate;
            }
            return c;
        });
        if (updatedCandidate) {
            addActivityLog({
                action: 'update',
                entity: 'candidate',
                entityId: id,
                entityName: updatedCandidate.name,
                details: { before: originalCandidate, after: updatedCandidate }
            });
            if (mockSettings.enableSync) {
                await syncMock('ứng viên', updatedCandidate.name);
            }
            return simulateDelay(updatedCandidate);
        }
        return Promise.reject(new Error('Candidate not found'));
    },
    updateCandidateStatus: (id: string, status: CandidateStatus): Promise<Candidate> => {
        const originalCandidate = mockCandidates.find(c => c.id === id);
        if (!originalCandidate) return Promise.reject(new Error('Candidate not found'));

        let updatedCandidate: Candidate | undefined;
        mockCandidates = mockCandidates.map(c => {
            if (c.id === id) {
                const newLog = { status, updatedBy: MOCK_USER.name, updatedAt: toISODateString(new Date()) };
                updatedCandidate = { 
                    ...c, 
                    status, 
                    statusLogs: [newLog, ...c.statusLogs],
                    updatedAt: toISODateString(new Date()),
                };
                return updatedCandidate;
            }
            return c;
        });
         if (updatedCandidate) {
            addActivityLog({
                action: 'status_change',
                entity: 'candidate',
                entityId: id,
                entityName: updatedCandidate.name,
                details: { before: { status: originalCandidate.status }, after: { status: updatedCandidate.status } }
            });
            return simulateDelay(updatedCandidate);
        }
        return Promise.reject(new Error('Candidate not found'));
    },
    getTodaysFollowUpCandidates: (): Promise<Candidate[]> => {
        const today = toISODateString(new Date());
        const todaysCandidates = mockCandidates.filter(c => c.followUpDate === today);
        return simulateDelay(todaysCandidates);
    },
    exportCandidatesToCSV: async (filters: any): Promise<string> => {
        const { data } = await api.getCandidates({ ...filters, limit: 9999, page: 1 }); // Get all filtered data
        const headers = ['Mã UV', 'Họ tên', 'SĐT', 'Email', 'Ngày sinh', 'Chuyên ngành', 'Nguồn', 'Phân loại', 'Vị trí', 'Dự án', 'Lương thử việc', 'Lương chính thức', 'Ngày đi làm', 'Ngày liên hệ lại', 'Trạng thái', 'Ghi chú'];
        const rows = data.map(c => [
            c.candidateCode, c.name, c.phone, c.email,
            c.dateOfBirth || '', c.major || '',
            c.sourceName, c.classificationName, c.positionName, c.projectName,
            c.probationarySalary, c.officialSalary, c.onboardingDate || '', c.followUpDate || '', c.status,
            c.note || ''
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        return simulateDelay(csvContent);
    },
    uploadCvToDrive: (file: File): Promise<{ url: string }> => {
        if (!mockSettings.endpointUpload) {
            const errorMsg = "Chưa cấu hình endpoint lưu tệp";
            console.warn(errorMsg);
            return Promise.reject(new Error(errorMsg));
        } else {
             console.log(`Simulating upload to ${mockSettings.endpointUpload} for ${file.name}`);
        }
        return simulateDelay({ url: `${mockSettings.endpointUpload}/${Date.now()}-${file.name}` });
    },
    parseCvWithGemini: async (fileData: { base64: string, mimeType: string }): Promise<{ name: string; email: string; phone: string; major: string; dateOfBirth: string }> => {
        try {
            // This is a mock. In a real scenario, this would call the Gemini API.
            await new Promise(res => setTimeout(res, 1000 + Math.random() * 500));
            
            // Simulate potential errors
            if (fileData.mimeType.includes('msword')) {
                // throw new Error("Định dạng .doc cũ không được hỗ trợ tốt, vui lòng dùng .docx hoặc .pdf");
            }
            
            return {
                name: 'Nguyễn Văn Test',
                email: 'test.nv@gemini-mock.com',
                phone: '0987654321',
                major: 'Kỹ sư Xây dựng Công trình Giao thông',
                dateOfBirth: '1995-10-20'
            };

        } catch (error) {
            console.error("Error parsing CV with Gemini:", error);
            throw new Error("Không thể trích xuất thông tin từ CV. Vui lòng thử lại hoặc nhập thủ công.");
        }
    },
    summarizeCv: (cvFile: File): Promise<string> => {
        console.log(`AI summarizing ${cvFile.name}`);
        const summary = `• Ứng viên có kinh nghiệm ${Math.floor(Math.random() * 5) + 2} năm trong lĩnh vực liên quan.\n• Kỹ năng nổi bật: Quản lý dự án, làm việc nhóm, thành thạo phần mềm ABC.\n• Mong muốn mức lương cạnh tranh và cơ hội phát triển tại công ty.`;
        return simulateDelay(summary);
    },
    scoreMatch: (candidateData: Partial<Candidate>, jobId?: string): Promise<number> => {
        console.log(`AI scoring match for ${candidateData.name}`);
        const score = Math.floor(Math.random() * 30) + 65; // Score between 65 and 95
        return simulateDelay(score);
    },


    // Other APIs
    getActivityLogs: (filters: any): Promise<PaginatedResponse<ActivityLog>> => {
        let results = [...mockActivityLogs];
        
        if (filters.actor) {
            results = results.filter(log => log.actor === filters.actor);
        }
        if (filters.entity) {
            results = results.filter(log => log.entity === filters.entity);
        }
        if (filters.startDate) {
             results = results.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
             results = results.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
        }

        const total = results.length;
        const page = filters.page || 1;
        const limit = filters.limit || 15;
        const data = results.slice((page - 1) * limit, page * limit);

        return simulateDelay({ data, total, page, limit });
    },
    getLogActors: (): Promise<string[]> => {
         const actors = [...new Set(mockActivityLogs.map(log => log.actor))];
         return simulateDelay(actors.sort());
    },
    getDashboardData: (): Promise<DashboardData> => {
        const funnelStatuses = [CandidateStatus.HIRED, CandidateStatus.OFFER_SENT, CandidateStatus.INTERVIEW_SCHEDULED, CandidateStatus.SCREENED];
        const screeningCount = mockCandidates.filter(c => funnelStatuses.includes(c.status)).length;
        const interviewCount = mockCandidates.filter(c => funnelStatuses.slice(0, 3).includes(c.status)).length;
        const offerCount = mockCandidates.filter(c => funnelStatuses.slice(0, 2).includes(c.status)).length;
        const hiredCount = mockCandidates.filter(c => c.status === CandidateStatus.HIRED).length;
        const funnel = { screening: screeningCount, interview: interviewCount, offer: offerCount, hired: hiredCount };

        return simulateDelay({
            newThisWeek: 5,
            funnel,
            openJobs: mockJobs.filter(j => j.status === JobStatus.POSTING).length,
            topSource: 'TopCV',
            profilesByWeek: [ { label: 'Tuần 30', value: 15 }],
            profilesBySource: [ { label: 'TopCV', value: 10 }]
        });
    },
    getReportData: (filters: { timeRange: string; projectId?: string }): Promise<ReportData> => {
        const { timeRange, projectId } = filters;
    
        const generateRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
        let totalProfiles = 0;
        const profilesOverTime: ChartDataPoint[] = [];
        const labels: { [key: string]: string[] } = {
            week: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            month: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
            quarter: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
        };
    
        (labels[timeRange] || []).forEach(label => {
            const value = generateRandom(5, 25);
            totalProfiles += value;
            profilesOverTime.push({ label, value });
        });
    
        const funnel: FunnelData = {
            screening: totalProfiles,
            interview: Math.floor(totalProfiles * generateRandom(40, 60) / 100),
            offer: Math.floor(totalProfiles * generateRandom(15, 25) / 100),
            hired: Math.floor(totalProfiles * generateRandom(5, 10) / 100),
        };
        
        const sources = MOCK_CANDIDATE_SOURCES.slice(0, 5);
        const sourceDistribution: ChartDataPoint[] = sources.map(source => ({
            label: source.name,
            value: generateRandom(10, 50),
        }));
    
        const topProjects: ProjectPerformanceData[] | undefined = projectId ? undefined :
            MOCK_PROJECTS.slice(0, 5).map(p => ({
                name: p.name,
                count: generateRandom(5, 30),
            })).sort((a, b) => b.count - a.count);
        
        if(projectId) {
            totalProfiles = generateRandom(20, 80);
        }
        
        const data: ReportData = {
            totalProfiles,
            profilesOverTime,
            funnel,
            sourceDistribution,
            topProjects
        };
    
        return simulateDelay(data);
    },

    // Category APIs
    createCategoryItem: (entity: ActivityLogEntity, data: { name: string }): Promise<SettingItem> => {
        let collection: SettingItem[];
        let prefix: string;
        switch (entity) {
            case 'source': collection = mockCandidateSources; prefix = 'src'; break;
            case 'classification': collection = mockClassifications; prefix = 'cls'; break;
            case 'position': collection = mockPositions; prefix = 'pos'; break;
            default: return Promise.reject(new Error('Invalid category type'));
        }
        
        const newItem: SettingItem = { id: `${prefix}-${Date.now()}`, name: data.name };
        collection.push(newItem);

        addActivityLog({
            action: 'create', entity, entityId: newItem.id, entityName: newItem.name,
            details: { before: null, after: newItem }
        });

        return simulateDelay(newItem);
    },
    updateCategoryItem: (entity: ActivityLogEntity, id: string, data: { name: string }): Promise<SettingItem> => {
        let collection: SettingItem[];
        switch (entity) {
            case 'source': collection = mockCandidateSources; break;
            case 'classification': collection = mockClassifications; break;
            case 'position': collection = mockPositions; break;
            default: return Promise.reject(new Error('Invalid category type'));
        }

        const originalItem = collection.find(item => item.id === id);
        if (!originalItem) return Promise.reject(new Error('Item not found'));

        let updatedItem: SettingItem | undefined;
        collection = collection.map(item => {
            if (item.id === id) {
                updatedItem = { ...item, ...data };
                return updatedItem;
            }
            return item;
        });

        // This won't work because `collection` is a local variable. We need to reassign the mockData array.
        switch (entity) {
            case 'source': mockCandidateSources = collection; break;
            case 'classification': mockClassifications = collection; break;
            case 'position': mockPositions = collection; break;
        }

        if (updatedItem) {
             addActivityLog({
                action: 'update', entity, entityId: id, entityName: updatedItem.name,
                details: { before: originalItem, after: updatedItem }
            });
            return simulateDelay(updatedItem);
        }
        return Promise.reject(new Error('Item not found'));
    },
    deleteCategoryItem: (entity: ActivityLogEntity, id: string): Promise<{ id: string }> => {
        let collection: SettingItem[];
        let originalSize: number;
        switch (entity) {
            case 'source': collection = mockCandidateSources; originalSize = mockCandidateSources.length; break;
            case 'classification': collection = mockClassifications; originalSize = mockClassifications.length; break;
            case 'position': collection = mockPositions; originalSize = mockPositions.length; break;
            default: return Promise.reject(new Error('Invalid category type'));
        }

        const itemToDelete = collection.find(item => item.id === id);
        if (!itemToDelete) return Promise.reject(new Error('Item not found'));

        const newCollection = collection.filter(item => item.id !== id);
        
        if (newCollection.length < originalSize) {
            switch (entity) {
                case 'source': mockCandidateSources = newCollection; break;
                case 'classification': mockClassifications = newCollection; break;
                case 'position': mockPositions = newCollection; break;
            }
             addActivityLog({
                action: 'delete', entity, entityId: id, entityName: itemToDelete.name,
                details: { before: itemToDelete, after: null }
            });
            return simulateDelay({ id });
        }
        return Promise.reject(new Error('Item not found'));
    },

    getCandidateSources: (): Promise<SettingItem[]> => simulateDelay(mockCandidateSources),
    createSource: (data: { name: string }): Promise<SettingItem> => api.createCategoryItem('source', data),
    updateSource: (id: string, data: { name: string }): Promise<SettingItem> => api.updateCategoryItem('source', id, data),
    deleteSource: (id: string): Promise<{ id: string }> => api.deleteCategoryItem('source', id),

    getClassifications: (): Promise<SettingItem[]> => simulateDelay(mockClassifications),
    createClassification: (data: { name: string }): Promise<SettingItem> => api.createCategoryItem('classification', data),
    updateClassification: (id: string, data: { name: string }): Promise<SettingItem> => api.updateCategoryItem('classification', id, data),
    deleteClassification: (id: string): Promise<{ id: string }> => api.deleteCategoryItem('classification', id),

    getPositions: (): Promise<SettingItem[]> => simulateDelay(mockPositions),
    createPosition: (data: { name: string }): Promise<SettingItem> => api.createCategoryItem('position', data),
    updatePosition: (id: string, data: { name: string }): Promise<SettingItem> => api.updateCategoryItem('position', id, data),
    deletePosition: (id: string): Promise<{ id: string }> => api.deleteCategoryItem('position', id),
    
    getTags: (): Promise<SettingItem[]> => simulateDelay(MOCK_TAGS),

    // Settings APIs
    getSettings: (): Promise<AppSettings> => simulateDelay(mockSettings),
    updateSettings: (newSettings: AppSettings): Promise<AppSettings> => {
        mockSettings = { ...mockSettings, ...newSettings };
        console.log("Updated settings:", mockSettings);
        return simulateDelay(mockSettings);
    },
};
import { Project, JobPosting, Candidate, ActivityLog, CandidateStatus, JobStatus, SettingItem, User, JobType, AppSettings } from '../types';

export const MOCK_USER: User = {
    id: 'user-1',
    name: 'HR Admin',
    email: 'hr@dangson.vn',
    avatarUrl: 'https://i.pravatar.cc/150?u=hr.admin'
};

const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export let MOCK_PROJECTS: Project[] = [
    { 
        id: 'proj-1', 
        name: 'Vinhomes Grand Park', 
        address: 'Đường Nguyễn Xiển, Long Thạnh Mỹ, Quận 9, TP.HCM',
        investor: 'Vingroup',
        manager: 'Lê Minh Tuấn',
        phone: '0987654321',
        images: ['https://picsum.photos/seed/proj1-1/800/600', 'https://picsum.photos/seed/proj1-2/800/600', 'https://picsum.photos/seed/proj1-3/800/600'],
        updatedAt: '2024-07-28'
    },
    { 
        id: 'proj-2', 
        name: 'Ecopark Grand - The Island', 
        address: 'KĐT Ecopark, Văn Giang, Hưng Yên',
        investor: 'Ecopark',
        manager: 'Trần Hùng Anh',
        phone: '0912345678',
        images: ['https://picsum.photos/seed/proj2-1/800/600'],
        updatedAt: '2024-07-25'
    },
    { 
        id: 'proj-3', 
        name: 'Sun Grand City Feria', 
        address: 'Đường Hạ Long, Bãi Cháy, TP. Hạ Long, Quảng Ninh',
        investor: 'Sun Group',
        manager: 'Phạm Thị Hoa',
        phone: '0905111222',
        images: ['https://picsum.photos/seed/proj3-1/800/600', 'https://picsum.photos/seed/proj3-2/800/600'],
        updatedAt: '2024-07-22'
    },
    { 
        id: 'proj-4', 
        name: 'The Matrix One', 
        address: 'Đường Lê Quang Đạo, Mễ Trì, Nam Từ Liêm, Hà Nội',
        investor: 'MIK Group',
        manager: 'Vũ Mạnh Dũng',
        phone: '0933444555',
        images: ['https://picsum.photos/seed/proj4-1/800/600', 'https://picsum.photos/seed/proj4-2/800/600', 'https://picsum.photos/seed/proj4-3/800/600', 'https://picsum.photos/seed/proj4-4/800/600'],
        updatedAt: '2024-07-20'
    },
    { 
        id: 'proj-5', 
        name: 'Aqua City', 
        address: 'Long Hưng, TP. Biên Hòa, Đồng Nai',
        investor: 'Novaland',
        manager: 'Lê Minh Tuấn',
        phone: '0988999000',
        images: ['https://picsum.photos/seed/proj5-1/800/600', 'https://picsum.photos/seed/proj5-2/800/600'],
        updatedAt: '2024-07-18'
    },
];

export let MOCK_JOBS: JobPosting[] = [
    { 
        id: 'job-1', 
        jobCode: 'XD.045',
        title: 'Kỹ sư QS', 
        department: 'Phòng Kỹ thuật',
        projectId: 'proj-1', 
        projectName: 'Vinhomes Grand Park',
        status: JobStatus.POSTING, 
        location: 'TP.HCM', 
        jobType: JobType.FULL_TIME,
        deadline: '2024-08-30',
        description: 'Chịu trách nhiệm bóc tách khối lượng, lập dự toán, quản lý hợp đồng với nhà thầu phụ.',
        requirements: '- Tốt nghiệp ĐH chuyên ngành Xây dựng.\n- Có ít nhất 3 năm kinh nghiệm ở vị trí tương đương.\n- Thành thạo các phần mềm dự toán.',
        benefits: '- Lương cạnh tranh\n- BHXH, BHYT đầy đủ\n- Thưởng dự án, thưởng Lễ, Tết.',
        createdAt: '2024-07-25',
        updatedAt: '2024-07-28',
        candidateCount: 5
    },
    { 
        id: 'job-2', 
        jobCode: 'XD.046',
        title: 'Giám sát hiện trường', 
        department: 'Phòng Thi công',
        projectId: 'proj-2', 
        projectName: 'Ecopark Grand - The Island',
        status: JobStatus.POSTING, 
        location: 'Hưng Yên', 
        jobType: JobType.FULL_TIME,
        deadline: '2024-09-15',
        description: 'Giám sát chất lượng và tiến độ thi công tại công trường, đảm bảo an toàn lao động.',
        requirements: '- Có chứng chỉ giám sát.\n- Tối thiểu 2 năm kinh nghiệm.\n- Có thể làm việc tại công trường.',
        benefits: '- Phụ cấp công trường\n- Chỗ ở (nếu cần)\n- Bảo hiểm tai nạn 24/7.',
        createdAt: '2024-07-20',
        updatedAt: '2024-07-25',
        candidateCount: 3
    },
    { 
        id: 'job-3', 
        jobCode: 'VP.012',
        title: 'Thực tập sinh nhân sự', 
        department: 'Phòng Hành chính Nhân sự',
        projectId: 'proj-4', 
        projectName: 'The Matrix One',
        status: JobStatus.FILLED, 
        location: 'Hà Nội', 
        jobType: JobType.INTERN,
        deadline: '2024-07-15',
        description: 'Hỗ trợ công tác tuyển dụng, chấm công, và các công việc hành chính khác.',
        requirements: '- Sinh viên năm cuối các trường ĐH.\n- Nhanh nhẹn, cẩn thận, ham học hỏi.',
        benefits: '- Hỗ trợ thực tập\n- Cơ hội trở thành nhân viên chính thức.',
        createdAt: '2024-06-20',
        updatedAt: '2024-07-18',
        candidateCount: 12
    },
      { 
        id: 'job-4', 
        jobCode: 'XD.048',
        title: 'Kỹ sư vật tư', 
        department: 'Phòng Vật tư',
        projectId: 'proj-3', 
        projectName: 'Sun Grand City Feria',
        status: JobStatus.PAUSED, 
        location: 'Quảng Ninh', 
        jobType: JobType.FULL_TIME,
        deadline: '2024-08-20',
        description: 'Quản lý, cấp phát, điều phối vật tư tại công trường.',
        requirements: '- Có kinh nghiệm làm vật tư công trình xây dựng.',
        benefits: '- Môi trường làm việc năng động.',
        createdAt: '2024-07-10',
        updatedAt: '2024-07-22',
        candidateCount: 1
    },
];

export let MOCK_CANDIDATES: Candidate[] = [
    { 
        id: 'cand-1', 
        candidateCode: 'XD.1001',
        name: 'Nguyễn Văn A', 
        email: 'a.nv@email.com', 
        phone: '0987654321', 
        dateOfBirth: '1992-05-15',
        major: 'Kỹ sư QS',
        sourceId: 'src-1',
        classificationId: 'cls-1',
        positionId: 'pos-6', // Kỹ sư QS
        jobId: 'job-1',
        projectId: 'proj-1',
        probationarySalary: 25000000,
        officialSalary: 30000000,
        onboardingDate: '2024-08-15',
        followUpDate: getFutureDate(5),
        status: CandidateStatus.INTERVIEW_SCHEDULED, 
        statusLogs: [
            { status: CandidateStatus.INTERVIEW_SCHEDULED, updatedBy: 'An Nguyễn', updatedAt: '2024-07-28' },
            { status: CandidateStatus.SCREENED, updatedBy: 'An Nguyễn', updatedAt: '2024-07-27' },
            { status: CandidateStatus.APPLIED, updatedBy: 'System', updatedAt: '2024-07-26' },
        ],
        createdAt: '2024-07-26',
        updatedAt: '2024-07-28',
        note: 'Ứng viên tiềm năng, cần theo dõi sát.',
    },
    { 
        id: 'cand-2', 
        candidateCode: 'XD.1002',
        name: 'Trần Thị B', 
        email: 'b.tt@email.com', 
        phone: '0912345678', 
        dateOfBirth: '1996-11-20',
        major: 'Kỹ thuật Xây dựng',
        sourceId: 'src-2',
        classificationId: 'cls-2',
        positionId: 'pos-7', // Giám sát hiện trường
        jobId: 'job-2',
        projectId: 'proj-2',
        probationarySalary: 28000000,
        officialSalary: 32000000,
        onboardingDate: undefined,
        followUpDate: getFutureDate(1), // Due tomorrow
        status: CandidateStatus.APPLIED, 
        statusLogs: [
            { status: CandidateStatus.APPLIED, updatedBy: 'System', updatedAt: '2024-07-29' },
        ],
        createdAt: '2024-07-29',
        updatedAt: '2024-07-29',
    },
     { 
        id: 'cand-3', 
        candidateCode: 'XD.1003',
        name: 'Lê Văn C', 
        email: 'c.lv@email.com', 
        phone: '0905123456', 
        dateOfBirth: '1990-01-30',
        major: 'Kinh tế Xây dựng',
        sourceId: 'src-3',
        classificationId: 'cls-1',
        positionId: 'pos-6', // Kỹ sư QS
        jobId: 'job-1',
        projectId: 'proj-1',
        probationarySalary: 45000000,
        officialSalary: 50000000,
        onboardingDate: '2024-08-20',
        followUpDate: getFutureDate(0), // Due today
        status: CandidateStatus.OFFER_SENT, 
        statusLogs: [
             { status: CandidateStatus.OFFER_SENT, updatedBy: 'Minh Trần', updatedAt: '2024-07-29' },
             { status: CandidateStatus.SALARY_APPROVED, updatedBy: 'Hồng Phạm', updatedAt: '2024-07-28' },
             { status: CandidateStatus.SALARY_PROPOSED, updatedBy: 'Minh Trần', updatedAt: '2024-07-28' },
             { status: CandidateStatus.SENT_TO_DIRECTOR, updatedBy: 'Minh Trần', updatedAt: '2024-07-27' },
             { status: CandidateStatus.SCREENED, updatedBy: 'Minh Trần', updatedAt: '2024-07-26' },
             { status: CandidateStatus.APPLIED, updatedBy: 'System', updatedAt: '2024-07-25' },
        ],
        createdAt: '2024-07-25',
        updatedAt: '2024-07-29',
        note: 'Đã có kinh nghiệm làm việc với Vingroup.',
    },
    { 
        id: 'cand-4', 
        candidateCode: 'XD.1004',
        name: 'Phạm Thị D', 
        email: 'd.pt@email.com', 
        phone: '0933112233', 
        dateOfBirth: '1998-07-07',
        major: 'Quản lý xây dựng',
        sourceId: 'src-1',
        classificationId: 'cls-1',
        positionId: 'pos-8',
        jobId: undefined,
        projectId: 'proj-4',
        probationarySalary: 0,
        officialSalary: 0,
        onboardingDate: undefined,
        followUpDate: getFutureDate(10),
        status: CandidateStatus.SCREENED, 
        statusLogs: [
            { status: CandidateStatus.SCREENED, updatedBy: 'An Nguyễn', updatedAt: '2024-07-30' },
            { status: CandidateStatus.APPLIED, updatedBy: 'System', updatedAt: '2024-07-29' },
        ],
        createdAt: '2024-07-29',
        updatedAt: '2024-07-30',
    },
];

export let MOCK_ACTIVITY_LOGS: ActivityLog[] = [];

export let MOCK_CANDIDATE_SOURCES: SettingItem[] = [
    { id: 'src-1', name: 'TopCV' },
    { id: 'src-2', name: 'LinkedIn' },
    { id: 'src-3', name: 'Giới thiệu nội bộ' },
    { id: 'src-4', name: 'VietnamWorks' },
    { id: 'src-5', name: 'Website công ty' },
    { id: 'src-6', name: 'Vieclam24h' },
    { id: 'src-7', name: 'Facebook' },
];

export let MOCK_CLASSIFICATIONS: SettingItem[] = [
    { id: 'cls-1', name: 'Ứng tuyển' },
    { id: 'cls-2', name: 'Lọc hồ sơ' },
];

export const MOCK_TAGS: SettingItem[] = [
    { id: 'tag-1', name: 'React' },
    { id: 'tag-2', name: 'TypeScript' },
    { id: 'tag-3', name: 'Node.js' },
    { id: 'tag-4', name: 'AWS' },
    { id: 'tag-5', name: 'UI/UX' },
    { id: 'tag-6', name: 'Agile' },
];

export let MOCK_POSITIONS: SettingItem[] = [
    { id: 'pos-1', name: 'Frontend Developer' },
    { id: 'pos-2', name: 'Backend Developer' },
    { id: 'pos-3', name: 'Fullstack Developer' },
    { id: 'pos-4', name: 'Project Manager' },
    { id: 'pos-5', name: 'Data Scientist' },
    { id: 'pos-6', name: 'Kỹ sư QS' },
    { id: 'pos-7', name: 'Giám sát hiện trường' },
    { id: 'pos-8', name: 'QAQC' },
    { id: 'pos-9', name: 'Kỹ sư vật tư' },
];

export let MOCK_SETTINGS: AppSettings = {
    endpointUpload: 'https://mock-storage.dangson.vn/upload',
    enableSync: false,
};
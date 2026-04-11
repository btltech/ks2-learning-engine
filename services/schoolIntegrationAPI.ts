/**
 * School Integration API
 * Connects KS2 Learning Engine with school information systems
 * Supports data sync, SSO, and webhooks
 */

export interface SchoolConfig {
  schoolId: string;
  schoolName: string;
  apiEndpoint: string;
  apiKey: string;
  sisType: 'google-classroom' | 'microsoft-teams' | 'canvas' | 'schoology' | 'custom';
  features: {
    sso: boolean;
    gradeSync: boolean;
    rosterSync: boolean;
    assignmentSync: boolean;
  };
  webhooks: string[];
  createdAt: string;
  lastSyncAt?: string;
}

export interface RosterData {
  classes: Array<{
    classId: string;
    className: string;
    grade: string;
    teacherId: string;
    students: string[];
  }>;
  teachers: Array<{
    teacherId: string;
    name: string;
    email: string;
    classes: string[];
  }>;
  students: Array<{
    studentId: string;
    name: string;
    email: string;
    grade: string;
    classIds: string[];
  }>;
}

export interface GradeExport {
  studentId: string;
  studentName: string;
  subject: string;
  assignments: Array<{
    assignmentId: string;
    title: string;
    score: number;
    maxScore: number;
    completedAt: string;
  }>;
  averageScore: number;
  letterGrade: string;
}

export interface WebhookPayload {
  event: 'grade.updated' | 'assignment.completed' | 'roster.changed' | 'student.enrolled';
  timestamp: string;
  schoolId: string;
  data: any;
}

class SchoolIntegrationAPI {
  private readonly API_VERSION = 'v1';
  
  /**
   * Register new school with the platform
   */
  public async registerSchool(config: Omit<SchoolConfig, 'createdAt' | 'lastSyncAt'>): Promise<SchoolConfig> {
    // Validate API endpoint
    if (!this.isValidUrl(config.apiEndpoint)) {
      throw new Error('Invalid API endpoint');
    }
    
    const schoolConfig: SchoolConfig = {
      ...config,
      createdAt: new Date().toISOString(),
    };
    
    // Store configuration
    this.saveSchoolConfig(schoolConfig);
    
    // Test connection
    await this.testConnection(schoolConfig);
    
    return schoolConfig;
  }
  
  /**
   * Sync roster data from school information system
   */
  public async syncRoster(schoolId: string): Promise<RosterData> {
    const config = this.getSchoolConfig(schoolId);
    
    if (!config.features.rosterSync) {
      throw new Error('Roster sync not enabled for this school');
    }
    
    try {
      // Call school API to get roster
      const rosterData = await this.fetchRosterData(config);
      
      // Store locally
      this.saveRosterData(schoolId, rosterData);
      
      // Update last sync time
      config.lastSyncAt = new Date().toISOString();
      this.saveSchoolConfig(config);
      
      // Trigger webhook
      this.triggerWebhook(config, 'roster.changed', rosterData);
      
      return rosterData;
    } catch (error) {
      console.error('Roster sync failed:', error);
      throw new Error('Failed to sync roster data');
    }
  }
  
  /**
   * Export student grades to school system
   */
  public async exportGrades(schoolId: string, studentIds: string[]): Promise<void> {
    const config = this.getSchoolConfig(schoolId);
    
    if (!config.features.gradeSync) {
      throw new Error('Grade sync not enabled for this school');
    }
    
    const gradesData: GradeExport[] = [];
    
    // Collect grades for each student
    for (const studentId of studentIds) {
      const grades = this.getStudentGrades(studentId);
      gradesData.push(grades);
    }
    
    try {
      // Send to school API
      await this.pushGradesToSchool(config, gradesData);
      
      // Log success
      console.log(`Exported grades for ${studentIds.length} students`);
      
      // Trigger webhook
      this.triggerWebhook(config, 'grade.updated', { studentCount: studentIds.length });
    } catch (error) {
      console.error('Grade export failed:', error);
      throw new Error('Failed to export grades');
    }
  }
  
  /**
   * Sync assignments to school system
   */
  public async syncAssignments(schoolId: string, homeworkIds: string[]): Promise<void> {
    const config = this.getSchoolConfig(schoolId);
    
    if (!config.features.assignmentSync) {
      throw new Error('Assignment sync not enabled for this school');
    }
    
    const assignments = homeworkIds.map(id => this.getHomework(id));
    
    try {
      await this.pushAssignmentsToSchool(config, assignments);
      
      console.log(`Synced ${assignments.length} assignments`);
    } catch (error) {
      console.error('Assignment sync failed:', error);
      throw new Error('Failed to sync assignments');
    }
  }
  
  /**
   * Handle Single Sign-On (SSO) authentication
   */
  public async authenticateSSO(schoolId: string, token: string): Promise<{
    userId: string;
    email: string;
    name: string;
    role: 'student' | 'teacher' | 'admin';
  }> {
    const config = this.getSchoolConfig(schoolId);
    
    if (!config.features.sso) {
      throw new Error('SSO not enabled for this school');
    }
    
    try {
      // Verify token with school's auth provider
      const userData = await this.verifyToken(config, token);
      
      // Create or update local user
      this.syncUser(userData);
      
      return userData;
    } catch (error) {
      console.error('SSO authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }
  
  /**
   * Setup webhook endpoint
   */
  public registerWebhook(schoolId: string, webhookUrl: string): void {
    const config = this.getSchoolConfig(schoolId);
    
    if (!config.webhooks.includes(webhookUrl)) {
      config.webhooks.push(webhookUrl);
      this.saveSchoolConfig(config);
    }
  }
  
  /**
   * Get integration status and health
   */
  public getIntegrationStatus(schoolId: string): {
    isActive: boolean;
    lastSyncAt?: string;
    features: SchoolConfig['features'];
    health: 'healthy' | 'degraded' | 'down';
    errorCount: number;
  } {
    const config = this.getSchoolConfig(schoolId);
    const errors = this.getRecentErrors(schoolId);
    
    const health = errors.length === 0 ? 'healthy'
                 : errors.length < 5 ? 'degraded'
                 : 'down';
    
    return {
      isActive: true,
      lastSyncAt: config.lastSyncAt,
      features: config.features,
      health,
      errorCount: errors.length,
    };
  }
  
  /**
   * Generate API documentation
   */
  public generateApiDocs(): string {
    return `
# KS2 Learning Engine - School Integration API

## Base URL
\`https://api.ks2learning.com/${this.API_VERSION}\`

## Authentication
Include API key in header:
\`Authorization: Bearer YOUR_API_KEY\`

## Endpoints

### POST /schools/register
Register a new school integration.

### GET /schools/{schoolId}/roster
Get current roster data.

### POST /schools/{schoolId}/sync-roster
Trigger roster sync from school system.

### POST /schools/{schoolId}/export-grades
Export student grades to school system.

**Body:**
\`\`\`json
{
  "studentIds": ["student1", "student2"]
}
\`\`\`

### POST /schools/{schoolId}/sync-assignments
Sync homework assignments to school system.

### POST /auth/sso
Authenticate user via Single Sign-On.

**Body:**
\`\`\`json
{
  "token": "SSO_TOKEN_FROM_SCHOOL"
}
\`\`\`

### POST /webhooks/register
Register webhook endpoint for events.

## Webhooks

Events triggered:
- \`grade.updated\` - When grades are exported
- \`assignment.completed\` - When student completes homework
- \`roster.changed\` - When roster is updated
- \`student.enrolled\` - When new student is added

## Rate Limits
- 100 requests per minute per school
- 10,000 requests per day per school

## Support
Contact: api-support@ks2learning.com
    `.trim();
  }
  
  // Helper methods
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  private getSchoolConfig(schoolId: string): SchoolConfig {
    const key = `ks2_school_config_${schoolId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      throw new Error('School configuration not found');
    }
    
    return JSON.parse(data);
  }
  
  private saveSchoolConfig(config: SchoolConfig): void {
    const key = `ks2_school_config_${config.schoolId}`;
    localStorage.setItem(key, JSON.stringify(config));
  }
  
  private async testConnection(config: SchoolConfig): Promise<void> {
    // Simulate API test
    console.log(`Testing connection to ${config.schoolName}...`);
    
    // In production, make actual API call
    // const response = await fetch(`${config.apiEndpoint}/health`, {
    //   headers: { 'Authorization': `Bearer ${config.apiKey}` }
    // });
    
    return Promise.resolve();
  }
  
  private async fetchRosterData(config: SchoolConfig): Promise<RosterData> {
    // Simulate fetching roster data
    // In production, call actual school API based on sisType
    
    console.log(`Fetching roster from ${config.sisType}...`);
    
    // Mock data for demo
    return {
      classes: [
        {
          classId: 'class1',
          className: 'Year 3A',
          grade: 'Year 3',
          teacherId: 'teacher1',
          students: ['student1', 'student2', 'student3'],
        },
      ],
      teachers: [
        {
          teacherId: 'teacher1',
          name: 'Ms. Johnson',
          email: 'johnson@school.com',
          classes: ['class1'],
        },
      ],
      students: [
        {
          studentId: 'student1',
          name: 'John Doe',
          email: 'john@school.com',
          grade: 'Year 3',
          classIds: ['class1'],
        },
      ],
    };
  }
  
  private saveRosterData(schoolId: string, data: RosterData): void {
    const key = `ks2_roster_${schoolId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  private getStudentGrades(studentId: string): GradeExport {
    // Fetch student's quiz history and homework submissions
    const sessions = this.getQuizSessions(studentId);
    const homework = this.getHomeworkSubmissions(studentId);
    
    // Calculate average score
    const allScores = [...sessions.map(s => s.score), ...homework.map(h => h.score)];
    const averageScore = allScores.length > 0 
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;
    
    const letterGrade = averageScore >= 90 ? 'A'
                      : averageScore >= 80 ? 'B'
                      : averageScore >= 70 ? 'C'
                      : averageScore >= 60 ? 'D'
                      : 'F';
    
    return {
      studentId,
      studentName: 'Student Name', // Get from user data
      subject: 'All Subjects',
      assignments: homework.map(h => ({
        assignmentId: h.homeworkId,
        title: h.title || 'Homework',
        score: h.score,
        maxScore: 100,
        completedAt: h.submittedAt,
      })),
      averageScore: Math.round(averageScore),
      letterGrade,
    };
  }
  
  private async pushGradesToSchool(config: SchoolConfig, grades: GradeExport[]): Promise<void> {
    // In production, send to school API
    console.log(`Pushing ${grades.length} grade reports to ${config.sisType}...`);
    return Promise.resolve();
  }
  
  private getHomework(homeworkId: string): any {
    const key = 'ks2_homework';
    const data = localStorage.getItem(key);
    const allHomework = data ? JSON.parse(data) : [];
    return allHomework.find((h: any) => h.id === homeworkId);
  }
  
  private async pushAssignmentsToSchool(config: SchoolConfig, assignments: any[]): Promise<void> {
    console.log(`Pushing ${assignments.length} assignments to ${config.sisType}...`);
    return Promise.resolve();
  }
  
  private async verifyToken(config: SchoolConfig, token: string): Promise<any> {
    // In production, verify with school's OAuth provider
    console.log(`Verifying SSO token with ${config.sisType}...`);
    
    // Mock user data
    return {
      userId: 'user123',
      email: 'user@school.com',
      name: 'User Name',
      role: 'student' as const,
    };
  }
  
  private syncUser(userData: any): void {
    const key = `ks2_user_${userData.userId}`;
    localStorage.setItem(key, JSON.stringify(userData));
  }
  
  private triggerWebhook(config: SchoolConfig, event: string, data: any): void {
    const payload: WebhookPayload = {
      event: event as any,
      timestamp: new Date().toISOString(),
      schoolId: config.schoolId,
      data,
    };
    
    // In production, POST to each webhook URL
    config.webhooks.forEach(url => {
      console.log(`Triggering webhook: ${url}`, payload);
      // fetch(url, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
    });
  }
  
  private getRecentErrors(schoolId: string): any[] {
    const key = `ks2_integration_errors_${schoolId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  private getQuizSessions(studentId: string): any[] {
    const key = `ks2_quiz_sessions_${studentId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  private getHomeworkSubmissions(studentId: string): any[] {
    const key = 'ks2_homework_submissions';
    const data = localStorage.getItem(key);
    const allSubmissions = data ? JSON.parse(data) : [];
    return allSubmissions.filter((s: any) => s.studentId === studentId);
  }
}

export const schoolIntegrationAPI = new SchoolIntegrationAPI();
export default schoolIntegrationAPI;

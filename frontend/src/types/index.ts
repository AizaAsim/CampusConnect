// User types
export enum Role {
  STUDENT = 'STUDENT',
  CLUB_ADMIN = 'CLUB_ADMIN',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
  fullName: string;
  role: Role;
};

// Post types
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author?: User;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  _count?: {
    comments: number;
  };
}

export type CreatePostDto = {
  title: string;
  content: string;
};

export type UpdatePostDto = Partial<CreatePostDto>;

// Comment types
export interface Comment {
  id: number;
  content: string;
  postId: number;
  post?: Post;
  authorId: number;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export type CreateCommentDto = {
  content: string;
  postId: number;
};

// Club types
export interface Club {
  id: number;
  name: string;
  description: string;
  category?: string;
  meetingTime?: string;
  adminId: number;
  admin?: User;
  createdAt: string;
  updatedAt: string;
  members?: ClubMember[];
  events?: Event[];
  _count?: {
    members: number;
    events: number;
  };
}

export type CreateClubDto = {
  name: string;
  description: string;
  category?: string;
  meetingTime?: string;
};

export type UpdateClubDto = Partial<CreateClubDto>;

// ClubMember types
export interface ClubMember {
  id: number;
  clubId: number;
  club?: Club;
  userId: number;
  user?: User;
  isAdmin: boolean;
  joinedAt: string;
  updatedAt: string;
}

export type CreateClubMemberDto = {
  clubId: number;
};

export type UpdateClubMemberDto = {
  isAdmin: boolean;
};

// Event types
export enum Status {
  GOING = 'GOING',
  INTERESTED = 'INTERESTED',
  NOT_GOING = 'NOT_GOING',
}

export interface Event {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  organizerId: number;
  organizer?: User;
  clubId?: number;
  club?: Club;
  createdAt: string;
  updatedAt: string;
  attendees?: EventAttendee[];
  _count?: {
    attendees: number;
  };
}

export type CreateEventDto = {
  title: string;
  description: string;
  dateTime: string;
  location: string;
  clubId?: number;
};

export type UpdateEventDto = Partial<CreateEventDto>;

// EventAttendee types
export interface EventAttendee {
  id: number;
  eventId: number;
  event?: Event;
  userId: number;
  user?: User;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export type CreateEventAttendeeDto = {
  eventId: number;
  status: Status;
};

export type UpdateEventAttendeeDto = {
  status: Status;
};

// Notification types
export interface Notification {
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read?: boolean;
  id?: string; // Client-side ID for managing notifications
}

// Statistics types
export interface OverviewStatistics {
  totalUsers: number;
  totalClubs: number;
  totalEvents: number;
  totalPosts: number;
  upcomingEvents: number;
  activeClubs: number;
  postsLastWeek: number;
  eventsLastWeek: number;
  eventsPerCategory?: { category: string; count: number }[];
}

export interface UserStatistics {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
  clubCount: number;
  clubAdminCount: number;
  eventCount: number;
  eventOrganizedCount: number;
  postCount: number;
  commentCount: number;
  upcomingEvents: {
    id: number;
    title: string;
    dateTime: string;
    status: Status;
  }[];
  recentActivity: {
    type: 'post' | 'comment' | 'event' | 'club' | 'attendance';
    id: number;
    title: string;
    createdAt: string;
  }[];
}

// Widget types for dashboard customization
export type WidgetType =
  | "welcome"
  | "quickStats"
  | "recentActivity"
  | "upcomingEvents"
  | "myClubs"
  | "clubAnalytics"
  | "eventCalendar"
  | "weather"
  | "activityTrend"
  | "quickLinks"
  | "notes";

export interface Widget {
  id: string;
  type: WidgetType;
  order: number;
  colSpan?: 1 | 2 | 3 | 4;
}

export interface DashboardLayout {
  widgets: Widget[];
}
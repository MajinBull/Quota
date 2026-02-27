export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isPremium: boolean;
  backtestExecutionCount: number;
  createdAt: Date;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  incrementBacktestCount: () => Promise<void>;
  canRunBacktest: () => boolean;
}

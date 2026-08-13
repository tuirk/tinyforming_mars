export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  authProvider: 'email' | 'google' | 'anonymous';
  stats: {
    wins: number;
    losses: number;
    totalGames: number;
  };
  tutorialCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

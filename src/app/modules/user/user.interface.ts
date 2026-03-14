export interface IUser {

  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  isPasswordChanged: boolean;
  role: 'superAdmin' | 'admin' | 'trainingManager' | 'mentor' | 'student' | 'parent';
  status: 'active' | 'blocked' | 'pending';
  isDeleted: boolean;

}

import { Types } from 'mongoose';

export interface ICourse {
  id: number;
  title: string;
  slug: string;

  // শুধু category এর রেফারেন্স (ObjectId)
  category: Types.ObjectId;

  type: string;
  image: string;
  fee: string;
  offerPrice?: string;
  rating: number;
  totalRating: number;
  totalStudentsEnroll: number;

  // শুধু Mentor এর রেফারেন্স (ObjectId)
  mentor: Types.ObjectId;

  technology: string;
  courseStart: string;
  durationMonth: number;
  lectures: number;
  totalExam: number;
  totalProject: number;
  details: string;
  courseOverview: string;
  curriculum: string[];
  courseIncludes: { icon: string; text: string }[];
  softwareYoullLearn: string[];
  jobPositions: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

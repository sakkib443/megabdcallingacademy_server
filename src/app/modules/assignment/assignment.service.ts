import { Assignment, AssignmentSubmission } from './assignment.model';

// ═══ ASSIGNMENT CRUD ════════════════════════════════════════

const create = async (payload: any) => Assignment.create(payload);

const getAll = async (query: { courseId?: string; moduleId?: string }) => {
  const filter: any = { isDeleted: false };
  if (query.courseId) filter.courseId = query.courseId;
  if (query.moduleId) filter.moduleId = query.moduleId;
  return Assignment.find(filter)
    .populate('courseId', 'title')
    .populate('createdBy', 'firstName lastName')
    .sort({ deadline: 1 });
};

const getOne = async (id: string) => Assignment.findById(id).populate('courseId', 'title');
const update = async (id: string, payload: any) => Assignment.findByIdAndUpdate(id, payload, { new: true });
const remove = async (id: string) => Assignment.findByIdAndUpdate(id, { isDeleted: true });

// ═══ SUBMISSION ═════════════════════════════════════════════

const submit = async (payload: { assignmentId: string; studentId: string; text?: string; fileUrl?: string; fileName?: string }) => {
  // Check deadline
  const assignment = await Assignment.findById(payload.assignmentId);
  if (!assignment) throw new Error('Assignment not found');
  if (new Date() > new Date(assignment.deadline)) throw new Error('Deadline passed');

  // Check existing
  const existing = await AssignmentSubmission.findOne({
    assignmentId: payload.assignmentId, studentId: payload.studentId, isDeleted: false,
  });
  if (existing) {
    existing.text = payload.text;
    existing.fileUrl = payload.fileUrl;
    existing.fileName = payload.fileName;
    existing.submittedAt = new Date();
    existing.status = 'submitted';
    return existing.save();
  }

  return AssignmentSubmission.create({ ...payload, submittedAt: new Date() });
};

// ═══ GET SUBMISSIONS ════════════════════════════════════════

const getSubmissions = async (assignmentId: string) => {
  return AssignmentSubmission.find({ assignmentId, isDeleted: false })
    .populate('studentId', 'firstName lastName email phoneNumber')
    .sort({ submittedAt: -1 });
};

const getStudentSubmissions = async (studentId: string) => {
  return AssignmentSubmission.find({ studentId, isDeleted: false })
    .populate({ path: 'assignmentId', select: 'title courseId deadline totalMarks', populate: { path: 'courseId', select: 'title' } })
    .sort({ submittedAt: -1 });
};

// ═══ GRADING ════════════════════════════════════════════════

const grade = async (submissionId: string, marks: number, feedback: string, gradedBy: string) => {
  const submission = await AssignmentSubmission.findById(submissionId);
  if (!submission) throw new Error('Submission not found');

  submission.marks = marks;
  submission.feedback = feedback;
  submission.status = 'graded';
  submission.gradedAt = new Date();
  submission.gradedBy = gradedBy as any;
  return submission.save();
};

// ═══ STUDENT ASSIGNMENTS (with status) ══════════════════════

const getStudentAssignments = async (studentId: string, courseId: string) => {
  const assignments = await Assignment.find({ courseId, isDeleted: false, isPublished: true }).sort({ deadline: 1 });

  const result = await Promise.all(assignments.map(async (a) => {
    const submission = await AssignmentSubmission.findOne({ assignmentId: a._id, studentId, isDeleted: false });
    return {
      ...a.toObject(),
      submission: submission ? submission.toObject() : null,
      isOverdue: new Date() > new Date(a.deadline) && !submission,
    };
  }));

  return result;
};

export const AssignmentService = {
  create, getAll, getOne, update, remove,
  submit, getSubmissions, getStudentSubmissions,
  grade, getStudentAssignments,
};

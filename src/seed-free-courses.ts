/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seed Script: 3 Free Recorded Courses
 * Each with 10 modules, 3-4 lessons per module, MCQ exams, Final Exam
 * Run: npx ts-node -r tsconfig-paths/register src/seed-free-courses.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Course } from './app/modules/courses/course.model';
import { CourseModule } from './app/modules/courseModule/courseModule.model';
import { Lesson } from './app/modules/lesson/lesson.model';
import { Exam, Question } from './app/modules/exam/exam.model';
import { Category } from './app/modules/courseCategory/courseCategory.model';
import { Mentor } from './app/modules/mentor/mentor.model';

const DB_URL = process.env.DATABASE_URL || '';

// YouTube video links (real educational videos)
const youtubeVideos = [
  'https://www.youtube.com/watch?v=PkZNo7MFNFg', // JS tutorial
  'https://www.youtube.com/watch?v=hdI2bqOjy3c', // JS Crash Course
  'https://www.youtube.com/watch?v=W6NZfCO5SIk', // JS Tutorial
  'https://www.youtube.com/watch?v=pN6jk0uUrfo', // Python Tutorial
  'https://www.youtube.com/watch?v=rfscVS0vtbw', // Python Full Course
  'https://www.youtube.com/watch?v=kqtD5dpn9C8', // Python Crash Course
  'https://www.youtube.com/watch?v=w7ejDZ8SWv8', // React JS
  'https://www.youtube.com/watch?v=Ke90Tje7VS0', // React Tutorial
  'https://www.youtube.com/watch?v=4UZrsTqkcW4', // React Full Course
  'https://www.youtube.com/watch?v=bMknfKXIFA8', // React Crash Course
  'https://www.youtube.com/watch?v=Oe421EPjeBE', // Node JS
  'https://www.youtube.com/watch?v=fBNz5xF-Kx4', // Node JS Crash
  'https://www.youtube.com/watch?v=iLWTnMzWtj4', // GraphQL
  'https://www.youtube.com/watch?v=ed8SzALpx1Q', // CSS
  'https://www.youtube.com/watch?v=1Rs2ND1ryYc', // CSS Flexbox
  'https://www.youtube.com/watch?v=0fKg7e37bQE', // MongoDB
  'https://www.youtube.com/watch?v=ofme2o29ngU', // MongoDB Crash
  'https://www.youtube.com/watch?v=ExcRbA7fy_A', // Express
  'https://www.youtube.com/watch?v=lY6icfhap2o', // TypeScript
  'https://www.youtube.com/watch?v=BwuLxPH8IDs', // TypeScript Full
  'https://www.youtube.com/watch?v=gp5H0Vw39yw', // Next.js
  'https://www.youtube.com/watch?v=mTz0GXj8NN0', // Next.js Full
  'https://www.youtube.com/watch?v=ZVnjOPwW4ZA', // Git & GitHub
  'https://www.youtube.com/watch?v=RGOj5yH7evk', // Git Tutorial
  'https://www.youtube.com/watch?v=HXV3zeQKqGY', // SQL Tutorial
  'https://www.youtube.com/watch?v=qw--VYLpxG4', // PostgreSQL
  'https://www.youtube.com/watch?v=c-I5S_zTwAc', // REST API
  'https://www.youtube.com/watch?v=GZvSYJDk-us', // Docker
  'https://www.youtube.com/watch?v=fqMOX6JJhGo', // Docker Compose
  'https://www.youtube.com/watch?v=3c-iBn73dDE', // Docker Full
  'https://www.youtube.com/watch?v=a7EhkjNSTOg', // JWT Auth
  'https://www.youtube.com/watch?v=Zx5fB1JGjW0', // Socket.io
  'https://www.youtube.com/watch?v=1PnVor36_40', // Socket.io
  'https://www.youtube.com/watch?v=YS4e4q9oBaU', // Data Structures
  'https://www.youtube.com/watch?v=8hly31xKli0', // Algorithms
  'https://www.youtube.com/watch?v=pTBZFGGx3SI', // DSA
  'https://www.youtube.com/watch?v=CBYHwZcbD-s', // Tailwind CSS
  'https://www.youtube.com/watch?v=dFgzHOX84xQ', // Tailwind Full
  'https://www.youtube.com/watch?v=oFbGsG2E2v0', // Bootstrap
  'https://www.youtube.com/watch?v=Wvt368L0tFo', // Firebase
];

// ═══════ Course Definitions ═══════
const coursesData = [
  {
    id: 5001,
    title: 'Complete Web Development with JavaScript',
    slug: 'complete-web-development-javascript',
    type: 'Recorded',
    image: 'https://img.freepik.com/free-vector/javascript-frameworks-concept-illustration_114360-735.jpg',
    fee: '15000৳',
    offerPrice: '12000৳',
    rating: 4.8,
    totalRating: 230,
    totalStudentsEnroll: 450,
    technology: 'JavaScript, HTML, CSS, React, Node.js',
    courseStart: 'Anytime',
    durationMonth: 3,
    lectures: 35,
    totalExam: 10,
    totalProject: 5,
    details: 'Learn full-stack web development from scratch. This comprehensive course covers HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB. Build real-world projects and become a professional web developer.',
    courseOverview: 'This free recorded course takes you from absolute beginner to a competent full-stack web developer. You will learn to build responsive websites, create dynamic web applications with React, and develop backend APIs with Node.js and Express.',
    curriculum: [
      'HTML5 Fundamentals & Semantic Markup',
      'CSS3 & Responsive Design',
      'JavaScript ES6+ Core Concepts',
      'DOM Manipulation & Events',
      'Asynchronous JavaScript & APIs',
      'React.js Fundamentals',
      'React Hooks & State Management',
      'Node.js & Express.js',
      'MongoDB & Mongoose',
      'Full-Stack Project Development',
    ],
    courseIncludes: [
      { icon: '📹', text: '35+ Video Lessons' },
      { icon: '📝', text: '10 Module Quizzes' },
      { icon: '🚀', text: '5 Real Projects' },
      { icon: '🏆', text: 'Certificate of Completion' },
      { icon: '💬', text: 'Community Support' },
      { icon: '📚', text: 'Lifetime Access' },
    ],
    softwareYoullLearn: ['VS Code', 'Chrome DevTools', 'Git', 'MongoDB Compass', 'Postman'],
    jobPositions: ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Web Developer'],
    modules: [
      {
        title: 'Module 1: HTML5 Fundamentals',
        lessons: [
          { title: 'Introduction to HTML', description: 'Learn the basics of HTML structure and elements' },
          { title: 'HTML Forms & Input Elements', description: 'Creating interactive forms with various input types' },
          { title: 'Semantic HTML & Accessibility', description: 'Writing clean, semantic, and accessible HTML' },
          { title: 'HTML5 Media Elements', description: 'Working with audio, video, and canvas elements' },
        ],
      },
      {
        title: 'Module 2: CSS3 & Responsive Design',
        lessons: [
          { title: 'CSS Selectors & Properties', description: 'Understanding CSS selectors and styling properties' },
          { title: 'CSS Flexbox Layout', description: 'Building flexible layouts with Flexbox' },
          { title: 'CSS Grid System', description: 'Creating complex grid layouts' },
          { title: 'Responsive Design & Media Queries', description: 'Making websites responsive for all devices' },
        ],
      },
      {
        title: 'Module 3: JavaScript Basics',
        lessons: [
          { title: 'Variables, Data Types & Operators', description: 'JavaScript fundamentals' },
          { title: 'Functions & Scope', description: 'Understanding functions, closures, and scope' },
          { title: 'Arrays & Objects', description: 'Working with arrays and objects in JavaScript' },
        ],
      },
      {
        title: 'Module 4: DOM Manipulation',
        lessons: [
          { title: 'Selecting & Modifying Elements', description: 'DOM selection and manipulation techniques' },
          { title: 'Event Handling', description: 'Adding interactivity with event listeners' },
          { title: 'Dynamic Content Creation', description: 'Creating and inserting elements dynamically' },
        ],
      },
      {
        title: 'Module 5: Asynchronous JavaScript',
        lessons: [
          { title: 'Callbacks & Promises', description: 'Understanding asynchronous patterns' },
          { title: 'Async/Await', description: 'Modern async programming with async/await' },
          { title: 'Fetch API & HTTP Requests', description: 'Making API calls with Fetch' },
          { title: 'Error Handling', description: 'Handling errors in async operations' },
        ],
      },
      {
        title: 'Module 6: React.js Fundamentals',
        lessons: [
          { title: 'Introduction to React', description: 'Understanding React and JSX' },
          { title: 'Components & Props', description: 'Building reusable React components' },
          { title: 'State Management with useState', description: 'Managing component state' },
        ],
      },
      {
        title: 'Module 7: Advanced React',
        lessons: [
          { title: 'React Hooks Deep Dive', description: 'useEffect, useContext, useRef, useMemo' },
          { title: 'React Router', description: 'Client-side routing with React Router' },
          { title: 'State Management Libraries', description: 'Context API and Redux basics' },
          { title: 'Building a React Project', description: 'Hands-on project development' },
        ],
      },
      {
        title: 'Module 8: Node.js & Express',
        lessons: [
          { title: 'Node.js Introduction', description: 'Understanding Node.js runtime' },
          { title: 'Express.js Framework', description: 'Building REST APIs with Express' },
          { title: 'Middleware & Routing', description: 'Express middleware and route handling' },
        ],
      },
      {
        title: 'Module 9: MongoDB & Database',
        lessons: [
          { title: 'MongoDB Fundamentals', description: 'NoSQL database concepts and MongoDB' },
          { title: 'Mongoose ODM', description: 'Schema design and data modeling' },
          { title: 'CRUD Operations', description: 'Creating, reading, updating, and deleting data' },
          { title: 'Data Relationships', description: 'Handling references and embedded documents' },
        ],
      },
      {
        title: 'Module 10: Full-Stack Project',
        lessons: [
          { title: 'Project Planning & Architecture', description: 'Designing the full-stack application' },
          { title: 'Building the Backend API', description: 'Implementing the REST API' },
          { title: 'Building the Frontend', description: 'Creating the React frontend' },
          { title: 'Deployment & Launch', description: 'Deploying to production' },
        ],
      },
    ],
  },
  {
    id: 5002,
    title: 'Python Programming Masterclass',
    slug: 'python-programming-masterclass',
    type: 'Recorded',
    image: 'https://img.freepik.com/free-vector/programmer-working-web-development-code-engineer-programming-python-php-java-script-computer_90220-249.jpg',
    fee: '12000৳',
    offerPrice: '9500৳',
    rating: 4.9,
    totalRating: 310,
    totalStudentsEnroll: 680,
    technology: 'Python, Django, Flask, PostgreSQL',
    courseStart: 'Anytime',
    durationMonth: 3,
    lectures: 38,
    totalExam: 10,
    totalProject: 6,
    details: 'Master Python programming from beginner to advanced. Learn data structures, algorithms, OOP, web development with Django, automation, and data analysis. Build real-world projects.',
    courseOverview: 'This free Python masterclass covers everything from basic syntax to advanced topics like web frameworks, APIs, database integration, and automation scripts. Perfect for beginners and intermediate programmers.',
    curriculum: [
      'Python Basics & Data Types',
      'Control Flow & Functions',
      'Object-Oriented Programming',
      'File Handling & Error Management',
      'Data Structures & Algorithms',
      'Python Modules & Packages',
      'Web Scraping & Automation',
      'Django Web Framework',
      'REST API Development',
      'Final Project & Deployment',
    ],
    courseIncludes: [
      { icon: '📹', text: '38+ Video Lessons' },
      { icon: '📝', text: '10 Module Quizzes' },
      { icon: '🚀', text: '6 Real Projects' },
      { icon: '🏆', text: 'Certificate of Completion' },
      { icon: '🐍', text: 'Python Best Practices' },
      { icon: '📚', text: 'Lifetime Access' },
    ],
    softwareYoullLearn: ['VS Code', 'PyCharm', 'Git', 'PostgreSQL', 'Django'],
    jobPositions: ['Python Developer', 'Backend Developer', 'Data Analyst', 'Automation Engineer'],
    modules: [
      { title: 'Module 1: Python Basics', lessons: [
        { title: 'Introduction to Python', description: 'Installing Python and writing your first program' },
        { title: 'Variables & Data Types', description: 'Strings, numbers, booleans, and type casting' },
        { title: 'Input/Output & String Formatting', description: 'User input and f-strings' },
        { title: 'Operators & Expressions', description: 'Arithmetic, comparison, and logical operators' },
      ]},
      { title: 'Module 2: Control Flow', lessons: [
        { title: 'If/Elif/Else Statements', description: 'Conditional logic in Python' },
        { title: 'For & While Loops', description: 'Iteration and loop control' },
        { title: 'List Comprehensions', description: 'Writing concise list operations' },
      ]},
      { title: 'Module 3: Functions', lessons: [
        { title: 'Defining Functions', description: 'Creating reusable functions' },
        { title: 'Parameters & Return Values', description: 'Function arguments and return statements' },
        { title: 'Lambda Functions', description: 'Anonymous functions and functional programming' },
        { title: 'Decorators', description: 'Advanced function decoration patterns' },
      ]},
      { title: 'Module 4: Data Structures', lessons: [
        { title: 'Lists & Tuples', description: 'Ordered collections in Python' },
        { title: 'Dictionaries & Sets', description: 'Key-value pairs and unique collections' },
        { title: 'Stacks, Queues & Linked Lists', description: 'Implementing common data structures' },
      ]},
      { title: 'Module 5: OOP in Python', lessons: [
        { title: 'Classes & Objects', description: 'Object-oriented programming basics' },
        { title: 'Inheritance & Polymorphism', description: 'Code reuse and method overriding' },
        { title: 'Encapsulation & Abstraction', description: 'Hiding complexity in your code' },
        { title: 'Magic Methods', description: 'Dunder methods in Python' },
      ]},
      { title: 'Module 6: File Handling', lessons: [
        { title: 'Reading & Writing Files', description: 'Working with text and CSV files' },
        { title: 'JSON & XML Processing', description: 'Parsing structured data formats' },
        { title: 'Error Handling with Try/Except', description: 'Graceful error management' },
      ]},
      { title: 'Module 7: Modules & Packages', lessons: [
        { title: 'Built-in Modules', description: 'Using os, sys, math, datetime' },
        { title: 'Installing Packages with pip', description: 'Managing third-party dependencies' },
        { title: 'Creating Your Own Modules', description: 'Organizing code into packages' },
      ]},
      { title: 'Module 8: Web Scraping & Automation', lessons: [
        { title: 'Web Scraping with BeautifulSoup', description: 'Extracting data from websites' },
        { title: 'Selenium Automation', description: 'Browser automation with Selenium' },
        { title: 'Building Automation Scripts', description: 'Automating daily tasks with Python' },
        { title: 'Working with APIs', description: 'Consuming REST APIs with requests' },
      ]},
      { title: 'Module 9: Django Framework', lessons: [
        { title: 'Django Setup & Architecture', description: 'Getting started with Django' },
        { title: 'Models & Database', description: 'Django ORM and migrations' },
        { title: 'Views & Templates', description: 'Building web pages with Django' },
        { title: 'Django REST Framework', description: 'Building APIs with DRF' },
      ]},
      { title: 'Module 10: Final Project', lessons: [
        { title: 'Project Planning', description: 'Designing the final project' },
        { title: 'Building the Application', description: 'Full development session' },
        { title: 'Testing & Debugging', description: 'Unit testing and bug fixing' },
        { title: 'Deployment', description: 'Deploying Python apps to production' },
      ]},
    ],
  },
  {
    id: 5003,
    title: 'Data Structures & Algorithms in JavaScript',
    slug: 'data-structures-algorithms-javascript',
    type: 'Recorded',
    image: 'https://img.freepik.com/free-vector/gradient-algorithm-concept_23-2149230942.jpg',
    fee: '10000৳',
    offerPrice: '8000৳',
    rating: 4.7,
    totalRating: 180,
    totalStudentsEnroll: 320,
    technology: 'JavaScript, Problem Solving, LeetCode',
    courseStart: 'Anytime',
    durationMonth: 2,
    lectures: 32,
    totalExam: 10,
    totalProject: 3,
    details: 'Master data structures and algorithms using JavaScript. Solve 100+ coding problems, learn time complexity analysis, and prepare for technical interviews at top companies.',
    courseOverview: 'This course covers all fundamental data structures and algorithms needed for coding interviews. Each topic includes visual explanations, code walkthroughs, and practice problems.',
    curriculum: [
      'Big O Notation & Time Complexity',
      'Arrays & Strings',
      'Linked Lists',
      'Stacks & Queues',
      'Hash Tables & Maps',
      'Trees & Binary Search Trees',
      'Graphs & Graph Algorithms',
      'Sorting Algorithms',
      'Dynamic Programming',
      'Mock Interview & Final Exam',
    ],
    courseIncludes: [
      { icon: '📹', text: '32+ Video Lessons' },
      { icon: '📝', text: '10 Module Quizzes' },
      { icon: '🧩', text: '100+ Coding Problems' },
      { icon: '🏆', text: 'Certificate' },
      { icon: '💡', text: 'Interview Prep' },
      { icon: '📚', text: 'Lifetime Access' },
    ],
    softwareYoullLearn: ['VS Code', 'LeetCode', 'HackerRank', 'JavaScript Console'],
    jobPositions: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Technical Lead'],
    modules: [
      { title: 'Module 1: Big O Notation', lessons: [
        { title: 'What is Big O?', description: 'Understanding time and space complexity' },
        { title: 'Common Complexities', description: 'O(1), O(n), O(n²), O(log n) explained' },
        { title: 'Analyzing Algorithms', description: 'How to calculate complexity of your code' },
      ]},
      { title: 'Module 2: Arrays & Strings', lessons: [
        { title: 'Array Operations', description: 'Insertion, deletion, searching in arrays' },
        { title: 'Two Pointer Technique', description: 'Solving problems with two pointers' },
        { title: 'Sliding Window', description: 'The sliding window pattern' },
        { title: 'String Manipulation', description: 'Common string algorithms' },
      ]},
      { title: 'Module 3: Linked Lists', lessons: [
        { title: 'Singly Linked List', description: 'Implementation and operations' },
        { title: 'Doubly Linked List', description: 'Implementation with backward traversal' },
        { title: 'Linked List Problems', description: 'Reverse, detect cycle, merge lists' },
      ]},
      { title: 'Module 4: Stacks & Queues', lessons: [
        { title: 'Stack Implementation', description: 'LIFO data structure' },
        { title: 'Queue Implementation', description: 'FIFO data structure' },
        { title: 'Stack/Queue Problems', description: 'Balanced parentheses, min stack, etc.' },
      ]},
      { title: 'Module 5: Hash Tables', lessons: [
        { title: 'Hash Table Implementation', description: 'Collision handling and hash functions' },
        { title: 'Map & Set in JavaScript', description: 'Using built-in hash structures' },
        { title: 'Hash Table Problems', description: 'Two sum, group anagrams, frequency counting' },
      ]},
      { title: 'Module 6: Trees', lessons: [
        { title: 'Binary Tree Fundamentals', description: 'Tree structure and traversals' },
        { title: 'Binary Search Tree', description: 'BST operations and balancing' },
        { title: 'Tree Problems', description: 'Max depth, lowest common ancestor, path sum' },
        { title: 'Heap & Priority Queue', description: 'Min/max heaps and their applications' },
      ]},
      { title: 'Module 7: Graphs', lessons: [
        { title: 'Graph Representation', description: 'Adjacency list and matrix' },
        { title: 'BFS & DFS', description: 'Graph traversal algorithms' },
        { title: 'Shortest Path Algorithms', description: "Dijkstra's and BFS shortest path" },
      ]},
      { title: 'Module 8: Sorting', lessons: [
        { title: 'Bubble, Selection & Insertion Sort', description: 'Basic sorting algorithms' },
        { title: 'Merge Sort', description: 'Divide and conquer sorting' },
        { title: 'Quick Sort', description: 'Partition-based sorting' },
        { title: 'Sorting Analysis', description: 'Comparing sorting algorithms' },
      ]},
      { title: 'Module 9: Dynamic Programming', lessons: [
        { title: 'DP Introduction', description: 'Memoization and tabulation' },
        { title: 'Classic DP Problems', description: 'Fibonacci, climbing stairs, coin change' },
        { title: 'Advanced DP', description: 'Knapsack, LCS, matrix chain' },
      ]},
      { title: 'Module 10: Mock Interview', lessons: [
        { title: 'Mock Interview Session 1', description: 'Solving problems under pressure' },
        { title: 'Mock Interview Session 2', description: 'System design basics' },
        { title: 'Interview Tips & Strategies', description: 'How to ace coding interviews' },
      ]},
    ],
  },
];

// MCQ Questions per module
const generateMCQs = (moduleTitle: string, courseTitle: string) => {
  const baseQuestions = [
    {
      questionText: `What is the main topic covered in "${moduleTitle}"?`,
      options: [
        { text: `Core concepts of ${moduleTitle}`, isCorrect: true },
        { text: 'Marketing strategies', isCorrect: false },
        { text: 'Graphic design principles', isCorrect: false },
        { text: 'Music theory', isCorrect: false },
      ],
    },
    {
      questionText: `Which of the following is a key concept in "${moduleTitle}"?`,
      options: [
        { text: 'Cooking recipes', isCorrect: false },
        { text: `Fundamental principles of ${moduleTitle.replace(/Module \d+: /, '')}`, isCorrect: true },
        { text: 'Weather forecasting', isCorrect: false },
        { text: 'Sports analytics', isCorrect: false },
      ],
    },
    {
      questionText: `In "${courseTitle}", what skill does "${moduleTitle}" primarily develop?`,
      options: [
        { text: `Technical proficiency in ${moduleTitle.replace(/Module \d+: /, '')}`, isCorrect: true },
        { text: 'Social media management', isCorrect: false },
        { text: 'Public speaking', isCorrect: false },
        { text: 'Accounting', isCorrect: false },
      ],
    },
    {
      questionText: `What is the expected outcome after completing "${moduleTitle}"?`,
      options: [
        { text: 'No practical skills', isCorrect: false },
        { text: 'Basic understanding only', isCorrect: false },
        { text: `Applied knowledge of ${moduleTitle.replace(/Module \d+: /, '')}`, isCorrect: true },
        { text: 'Theoretical knowledge only', isCorrect: false },
      ],
    },
    {
      questionText: `Which prerequisite is most important for "${moduleTitle}"?`,
      options: [
        { text: 'Previous modules in this course', isCorrect: true },
        { text: 'A degree in medicine', isCorrect: false },
        { text: 'Advanced mathematics PhD', isCorrect: false },
        { text: 'Professional cooking certification', isCorrect: false },
      ],
    },
  ];
  return baseQuestions;
};

async function seed() {
  console.log('🔄 Connecting to database...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected to MongoDB');

  // Get or create category
  let category = await Category.findOne({});
  if (!category) {
    category = await Category.create({ id: 1, name: 'Programming' });
    console.log('✅ Created category: Programming');
  }

  // Get or create mentor
  let mentor = await Mentor.findOne({});
  if (!mentor) {
    mentor = await Mentor.create({
      id: 'mentor-001',
      name: 'Ashraf Hossain',
      email: 'ashraf@bdcalling.com',
      phone: '01335202802',
      designation: 'Senior Software Engineer',
      subject: 'Full-Stack Development',
      specialized_area: ['JavaScript', 'React', 'Node.js', 'Python'],
      education_qualification: ['BSc in CSE', 'MSc in Software Engineering'],
      work_experience: ['5+ years at BdCalling IT', '3 years at Tech Corp'],
      training_experience: { years: '8', students: '5000' },
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      details: 'Experienced developer with 10+ years in web development. Expert in JavaScript, React, Node.js, and Python.',
      lifeJourney: 'Started programming at university, worked at multiple tech companies, now training the next generation of developers.',
    });
    console.log('✅ Created mentor: Ashraf Hossain');
  }

  let videoIndex = 0;

  for (const courseData of coursesData) {
    console.log(`\n📚 Creating course: ${courseData.title}`);

    // Check if course already exists
    const existing = await Course.findOne({ id: courseData.id });
    if (existing) {
      console.log(`   ⏭️ Course already exists, skipping...`);
      continue;
    }

    // Create course
    const course = await Course.create({
      id: courseData.id,
      title: courseData.title,
      slug: courseData.slug,
      category: category._id,
      type: courseData.type,
      status: 'published',
      image: courseData.image,
      fee: courseData.fee,
      offerPrice: courseData.offerPrice,
      rating: courseData.rating,
      totalRating: courseData.totalRating,
      totalStudentsEnroll: courseData.totalStudentsEnroll,
      mentor: mentor._id,
      technology: courseData.technology,
      courseStart: courseData.courseStart,
      durationMonth: courseData.durationMonth,
      lectures: courseData.lectures,
      totalExam: courseData.totalExam,
      totalProject: courseData.totalProject,
      details: courseData.details,
      courseOverview: courseData.courseOverview,
      curriculum: courseData.curriculum,
      courseIncludes: courseData.courseIncludes,
      softwareYoullLearn: courseData.softwareYoullLearn,
      jobPositions: courseData.jobPositions,
    });

    console.log(`   ✅ Course created: ${course._id}`);

    // Create modules, lessons, exams
    for (let mi = 0; mi < courseData.modules.length; mi++) {
      const modData = courseData.modules[mi];

      const courseModule = await CourseModule.create({
        courseId: course._id,
        title: modData.title,
        description: `Learn ${modData.title.replace(/Module \d+: /, '')} in depth`,
        order: mi + 1,
        isPublished: true,
      });
      console.log(`   📦 Module: ${modData.title}`);

      // Create lessons
      for (let li = 0; li < modData.lessons.length; li++) {
        const lessonData = modData.lessons[li];
        const ytUrl = youtubeVideos[videoIndex % youtubeVideos.length];
        videoIndex++;

        await Lesson.create({
          moduleId: courseModule._id,
          courseId: course._id,
          title: lessonData.title,
          description: lessonData.description,
          type: 'video',
          videoUrl: ytUrl,
          videoDuration: Math.floor(Math.random() * 30 + 10) * 60 , // 10-40 min in seconds
          order: li + 1,
          isFree: false,
          isLocked: false,
          isPublished: true,
        });
      }
      console.log(`      📹 ${modData.lessons.length} lessons created`);

      // Create MCQ Exam for each module
      const exam = await Exam.create({
        courseId: course._id,
        moduleId: courseModule._id,
        title: `${modData.title} - Quiz`,
        description: `Test your knowledge of ${modData.title.replace(/Module \d+: /, '')}`,
        type: 'mcq',
        duration: 15,
        totalMarks: 25,
        passingMarks: 15,
        isPublished: true,
        allowReview: true,
        shuffleQuestions: true,
        maxAttempts: 3,
        createdBy: mentor._id as any,
      });

      // Create 5 MCQ questions
      const mcqs = generateMCQs(modData.title, courseData.title);
      for (let qi = 0; qi < mcqs.length; qi++) {
        await Question.create({
          examId: exam._id,
          questionText: mcqs[qi].questionText,
          questionType: 'mcq',
          options: mcqs[qi].options,
          marks: 5,
          order: qi + 1,
        });
      }
      console.log(`      ✅ Quiz created (5 MCQs)`);
    }

    // Create Final Exam
    const finalExam = await Exam.create({
      courseId: course._id,
      title: `${courseData.title} - Final Exam`,
      description: `Comprehensive final examination for ${courseData.title}`,
      type: 'mcq',
      duration: 45,
      totalMarks: 100,
      passingMarks: 60,
      isPublished: true,
      allowReview: true,
      shuffleQuestions: true,
      maxAttempts: 2,
      createdBy: mentor._id as any,
    });

    // Create 20 final exam questions
    for (let qi = 0; qi < 20; qi++) {
      const modIdx = qi % courseData.modules.length;
      const modTitle = courseData.modules[modIdx].title;
      await Question.create({
        examId: finalExam._id,
        questionText: `Final Exam Q${qi + 1}: In the context of "${modTitle}", which of the following best describes the key principle?`,
        questionType: 'mcq',
        options: [
          { text: `Core understanding of ${modTitle.replace(/Module \d+: /, '')}`, isCorrect: true },
          { text: 'An unrelated concept from another field', isCorrect: false },
          { text: 'A deprecated methodology', isCorrect: false },
          { text: 'None of the above', isCorrect: false },
        ],
        marks: 5,
        order: qi + 1,
      });
    }
    console.log(`   🏆 Final Exam created (20 MCQs, 100 marks)`);
  }

  console.log('\n🎉 Seeding complete! 3 Free Recorded Courses created successfully!');
  await mongoose.disconnect();
  console.log('🔌 Database disconnected');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

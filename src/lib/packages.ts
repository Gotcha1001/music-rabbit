// // lib/packages.ts

// export const PACKAGE_DEFINITIONS = [
//   {
//     id: "10-once",
//     name: "10 Min Lessons - Once Weekly",
//     minutesPerLesson: 10,
//     lessonsPerWeek: 1,
//     totalMinutesPerMonth: 40,
//     monthlyPrice: 29.99,
//     description: "Perfect for beginners - 4 lessons per month",
//   },
//   {
//     id: "10-twice",
//     name: "10 Min Lessons - Twice Weekly",
//     minutesPerLesson: 10,
//     lessonsPerWeek: 2,
//     totalMinutesPerMonth: 80,
//     monthlyPrice: 49.99,
//     description: "Consistent practice - 8 lessons per month",
//   },
//   {
//     id: "20-once",
//     name: "20 Min Lessons - Once Weekly",
//     minutesPerLesson: 20,
//     lessonsPerWeek: 1,
//     totalMinutesPerMonth: 80,
//     monthlyPrice: 49.99,
//     description: "Standard learning - 4 lessons per month",
//   },
//   {
//     id: "20-twice",
//     name: "20 Min Lessons - Twice Weekly",
//     minutesPerLesson: 20,
//     lessonsPerWeek: 2,
//     totalMinutesPerMonth: 160,
//     monthlyPrice: 89.99,
//     description: "Accelerated progress - 8 lessons per month",
//   },
//   {
//     id: "30-once",
//     name: "30 Min Lessons - Once Weekly",
//     minutesPerLesson: 30,
//     lessonsPerWeek: 1,
//     totalMinutesPerMonth: 120,
//     monthlyPrice: 69.99,
//     description: "Deep learning - 4 lessons per month",
//   },
//   {
//     id: "30-twice",
//     name: "30 Min Lessons - Twice Weekly",
//     minutesPerLesson: 30,
//     lessonsPerWeek: 2,
//     totalMinutesPerMonth: 240,
//     monthlyPrice: 129.99,
//     description: "Intensive training - 8 lessons per month",
//   },
// ] as const;

// export type PackageId = (typeof PACKAGE_DEFINITIONS)[number]["id"];
// lib/packages.ts

export const PACKAGE_DEFINITIONS = [
  {
    id: "10-once",
    name: "10 Min Lessons - Once Weekly",
    minutesPerLesson: 10,
    lessonsPerWeek: 1,
    totalMinutesPerMonth: 40,
    monthlyPrice: 299.99, // Use ZAR (e.g., R299.99)
    description: "Perfect for beginners - 4 lessons per month",
  },
  {
    id: "10-twice",
    name: "10 Min Lessons - Twice Weekly",
    minutesPerLesson: 10,
    lessonsPerWeek: 2,
    totalMinutesPerMonth: 80,
    monthlyPrice: 499.99,
    description: "Consistent practice - 8 lessons per month",
  },
  {
    id: "20-once",
    name: "20 Min Lessons - Once Weekly",
    minutesPerLesson: 20,
    lessonsPerWeek: 1,
    totalMinutesPerMonth: 80,
    monthlyPrice: 499.99,
    description: "Standard learning - 4 lessons per month",
  },
  {
    id: "20-twice",
    name: "20 Min Lessons - Twice Weekly",
    minutesPerLesson: 20,
    lessonsPerWeek: 2,
    totalMinutesPerMonth: 160,
    monthlyPrice: 899.99,
    description: "Accelerated progress - 8 lessons per month",
  },
  {
    id: "30-once",
    name: "30 Min Lessons - Once Weekly",
    minutesPerLesson: 30,
    lessonsPerWeek: 1,
    totalMinutesPerMonth: 120,
    monthlyPrice: 699.99,
    description: "Deep learning - 4 lessons per month",
  },
  {
    id: "30-twice",
    name: "30 Min Lessons - Twice Weekly",
    minutesPerLesson: 30,
    lessonsPerWeek: 2,
    totalMinutesPerMonth: 240,
    monthlyPrice: 1299.99,
    description: "Intensive training - 8 lessons per month",
  },
] as const;

// This creates a proper union type of all packages
export type MusicPackage = (typeof PACKAGE_DEFINITIONS)[number];

// Optional: Export just the IDs if needed elsewhere
export type PackageId = MusicPackage["id"];

const fs = require("node:fs");
const path = require("node:path");

function getAverageGrade(student) {
  const grades = Array.isArray(student?.grades)
    ? student.grades
    : Object.values(student?.grades || {});

  const validGrades = grades.filter((grade) => typeof grade === "number");

  if (validGrades.length === 0) {
    return 0;
  }

  const total = validGrades.reduce((sum, grade) => sum + grade, 0);
  return Number((total / validGrades.length).toFixed(2));
}

function getTopStudents(students, n) {
  return [...students]
    .sort((firstStudent, secondStudent) => {
      return getAverageGrade(secondStudent) - getAverageGrade(firstStudent);
    })
    .slice(0, n)
    .map((student) => ({
      ...student,
      average: getAverageGrade(student),
    }));
}

function groupByCourse(students) {
  return students.reduce((groups, student) => {
    const course = student.course || "Unassigned";

    groups[course] = [
      ...(groups[course] || []),
      { ...student },
    ];

    return groups;
  }, {});
}

function getEnrolledCount(students) {
  const enrolledStudents = students.filter((student) => student.enrolled === true);
  const notEnrolledStudents = students.filter(
    (student) => student.enrolled !== true,
  );

  return {
    enrolled: enrolledStudents.length,
    notEnrolled: notEnrolledStudents.length,
  };
}

function findStudent(students, name) {
  const searchName = String(name || "").trim().toLowerCase();

  return (
    students.find(
      (student) =>
        typeof student.name === "string" &&
        student.name.trim().toLowerCase() === searchName,
    ) || null
  );
}

function getCourseAverages(students) {
  const groupedStudents = groupByCourse(students);

  return Object.entries(groupedStudents).reduce(
    (courseAverages, [course, courseStudents]) => {
      const totalAverage = courseStudents.reduce(
        (total, student) => total + getAverageGrade(student),
        0,
      );

      courseAverages[course] = Number(
        (totalAverage / courseStudents.length).toFixed(2),
      );

      return courseAverages;
    },
    {},
  );
}

function exportSummary(students) {
  const studentAverages = students.map((student) => getAverageGrade(student));
  const totalAverage = studentAverages.reduce(
    (total, average) => total + average,
    0,
  );

  return {
    totalStudents: students.length,
    overallAverage:
      students.length === 0
        ? 0
        : Number((totalAverage / students.length).toFixed(2)),
    topStudents: getTopStudents(students, 3),
    courseAverages: getCourseAverages(students),
    enrollment: getEnrolledCount(students),
    groupedCourses: groupByCourse(students),
  };
}

function main() {
  try {
    const studentsFilePath = path.join(__dirname, "students.json");
    const students = JSON.parse(fs.readFileSync(studentsFilePath, "utf8"));

    if (!Array.isArray(students)) {
      throw new TypeError("students.json must contain an array of students.");
    }

    const summary = exportSummary(students);
    const topStudents = getTopStudents(students, 3);
    const courseAverages = getCourseAverages(students);
    const enrollment = getEnrolledCount(students);
    const groupedCourses = groupByCourse(students);
    const searchName = "Ana Santos";
    const searchResult = findStudent(students, searchName);

    console.log("=== Student Records Data Processor Report ===");
    console.log(`Total students: ${summary.totalStudents}`);
    console.log(`Overall average: ${summary.overallAverage}`);

    console.log("\nTop students:");
    console.log(
      topStudents.length > 0
        ? topStudents
            .map(
              (student, index) =>
                `${index + 1}. ${student.name} - ${student.average}`,
            )
            .join("\n")
        : "No students found.",
    );

    console.log("\nCourse averages:");
    console.log(
      Object.entries(courseAverages).length > 0
        ? Object.entries(courseAverages)
            .map(([course, average]) => `- ${course}: ${average}`)
            .join("\n")
        : "No course data found.",
    );

    console.log("\nEnrollment counts:");
    console.log(`Enrolled: ${enrollment.enrolled}`);
    console.log(`Not enrolled: ${enrollment.notEnrolled}`);

    console.log("\nGrouped courses:");
    console.log(
      Object.entries(groupedCourses).length > 0
        ? Object.entries(groupedCourses)
            .map(
              ([course, courseStudents]) =>
                `- ${course}: ${courseStudents
                  .map((student) => student.name)
                  .join(", ")}`,
            )
            .join("\n")
        : "No grouped courses found.",
    );

    console.log("\nStudent search result:");
    console.log(
      searchResult
        ? `${searchResult.name} found in ${searchResult.course}.`
        : `${searchName} was not found.`,
    );

    console.log("\nExported summary:");
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(`Unable to process student records: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getAverageGrade,
  getTopStudents,
  groupByCourse,
  getEnrolledCount,
  findStudent,
  getCourseAverages,
  exportSummary,
  main,
};
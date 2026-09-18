const fs = require("node:fs");
const path = require("node:path");

const studentsFilePath = path.join(__dirname, "students.json");

function loadStudents(filePath = studentsFilePath) {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const students = JSON.parse(fileContents);

  if (!Array.isArray(students)) {
    throw new TypeError("students.json must contain an array of student records.");
  }

  return students;
}

function calculateAverage(grades) {
  const gradeValues = Object.values(grades);

  if (gradeValues.length === 0) {
    return 0;
  }

  return gradeValues.reduce((total, grade) => total + grade, 0) / gradeValues.length;
}

function processStudents(students) {
  return students.map((student) => {
    const average = calculateAverage(student.grades);

    return {
      ...student,
      average: Number(average.toFixed(2)),
      status: average >= 75 ? "Passed" : "Needs Improvement",
    };
  });
}

function createSummary(processedStudents) {
  const totalAverage = processedStudents.reduce(
    (total, student) => total + student.average,
    0,
  );
  const passedCount = processedStudents.filter(
    (student) => student.status === "Passed",
  ).length;

  return {
    totalStudents: processedStudents.length,
    passedStudents: passedCount,
    needsImprovement: processedStudents.length - passedCount,
    classAverage:
      processedStudents.length === 0
        ? 0
        : Number((totalAverage / processedStudents.length).toFixed(2)),
  };
}

function displayResults(processedStudents, summary) {
  console.log("\nStudent Records");
  console.log("===============");

  for (const student of processedStudents) {
    console.log(
      `${student.id} | ${student.name} | ${student.course} | ` +
        `Average: ${student.average} | ${student.status}`,
    );
  }

  console.log("\nSummary");
  console.log("-------");
  console.log(`Total students: ${summary.totalStudents}`);
  console.log(`Passed: ${summary.passedStudents}`);
  console.log(`Needs improvement: ${summary.needsImprovement}`);
  console.log(`Class average: ${summary.classAverage}`);
}

function main() {
  try {
    const students = loadStudents();
    const processedStudents = processStudents(students);
    const summary = createSummary(processedStudents);

    displayResults(processedStudents, summary);
  } catch (error) {
    console.error(`Unable to process student records: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  calculateAverage,
  createSummary,
  loadStudents,
  processStudents,
};
export function processAssessmentData(data) {
  // Process dimensional scores for radar chart
  const dimensionalScores = {
    categories: ["Technical", "Process", "People", "Management", "Strategy"],
    scores: data.dimensionalScores || [0, 0, 0, 0, 0],
  }

  // Process category scores for bar chart
  const categoryScores = {
    categories: [
      "Category 1",
      "Category 2",
      "Category 3",
      "Category 4",
      "Category 5",
    ],
    scores: data.categoryScores || [0, 0, 0, 0, 0],
  }

  // Calculate overall maturity score (0-100)
  const overallScore = data.overallScore || 0

  return {
    dimensionalScores,
    categoryScores,
    overallScore,
  }
}

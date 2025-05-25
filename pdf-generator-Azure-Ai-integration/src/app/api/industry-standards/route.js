// src/app/api/industry-standards/route.js
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    console.log(
      "Industry Standards API called - generating in-memory standards"
    )

    // Since there's no IndustryStandard table, generate standards in-memory
    const defaultStandards = []

    // Create default standards for each category
    const categories = [
      "Cloud Strategy",
      "Cloud Cost",
      "Cloud Security",
      "Cloud People",
      "Cloud DevOps",
    ]

    // Standard descriptions for each level
    const levelDescriptions = {
      1: {
        "Cloud Strategy":
          "No formal cloud strategy aligned with business goals",
        "Cloud Cost": "No cost management or tracking in place",
        "Cloud Security": "Ad-hoc security with no formal practices",
        "Cloud People": "Limited cloud skills with no training plan",
        "Cloud DevOps": "Manual processes with little automation",
      },
      2: {
        "Cloud Strategy":
          "Basic cloud strategy with limited business alignment",
        "Cloud Cost": "Basic cost tracking without optimization",
        "Cloud Security":
          "Basic security controls but inconsistent implementation",
        "Cloud People": "Some cloud skills but gaps in expertise",
        "Cloud DevOps": "Some automation but mostly manual processes",
      },
      3: {
        "Cloud Strategy":
          "Defined cloud strategy with clear business alignment",
        "Cloud Cost": "Regular cost reviews with optimization processes",
        "Cloud Security":
          "Standardized security controls across cloud resources",
        "Cloud People": "Good cloud skills with ongoing training",
        "Cloud DevOps": "CI/CD pipelines with good automation",
      },
      4: {
        "Cloud Strategy":
          "Advanced cloud strategy integrated with business planning",
        "Cloud Cost": "Proactive cost optimization with accountability",
        "Cloud Security": "Advanced security with continuous monitoring",
        "Cloud People": "Advanced cloud expertise with specialization",
        "Cloud DevOps": "Mature CI/CD with comprehensive automation",
      },
      5: {
        "Cloud Strategy":
          "Optimized cloud strategy driving business innovation",
        "Cloud Cost": "Fully optimized FinOps practice with excellent ROI",
        "Cloud Security":
          "Industry-leading security practices with proactive measures",
        "Cloud People": "Expert-level cloud skills across the organization",
        "Cloud DevOps": "Elite DevOps practices with continuous optimization",
      },
    }

    // Question text mapping
    const questionTexts = {
      6: "How aligned is your cloud strategy to broader business goals and priorities?",
      7: "How aligned are you with the cloud governance model to guide cloud adoption decisions?",
      8: "What percentage of your applications are hosted in Cloud?",
      9: "How would you rate your organization's cloud cost management practices?",
      10: "How would you rate your organization's cloud FinOps practices and tooling?",
      11: "How would you rate your organization's cloud ROI measurement?",
      12: "How would you rate your organization's cloud security posture?",
      13: "How would you rate your organization's cloud compliance management?",
      14: "How would you rate your organization's identity and access management?",
      15: "How would you rate your team's cloud skills and expertise?",
      16: "How would you rate your organization's cloud training program?",
      17: "How would you rate your organization's cloud culture?",
      18: "How would you rate your organization's implementation of DevOps?",
      19: "How would you rate your organization's cloud monitoring practices?",
    }

    // For each question (6-19), create a standard with score 3 (industry standard)
    for (let questionId = 6; questionId <= 19; questionId++) {
      // Determine which category this question belongs to
      const categoryIndex = Math.floor((questionId - 6) / 3)
      const category =
        categories[categoryIndex < categories.length ? categoryIndex : 0]

      // Create the standard entry
      defaultStandards.push({
        StandardID: questionId,
        QuestionID: questionId,
        QuestionText: questionTexts[questionId] || `Question ${questionId}`,
        StandardText:
          levelDescriptions[3][category] || `Industry Standard Level 3`,
        Score: 3, // Set default industry standard at level 3
        Category: category,
      })
    }

    console.log(
      `Created ${defaultStandards.length} in-memory industry standards`
    )

    return NextResponse.json(defaultStandards)
  } catch (error) {
    console.error("Error generating industry standards:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// src/lib/ingest/mappers/jira.js

/**
 * Maps a Jira CSV row to our normalized schema
 */
export function mapJiraCsvRow(row) {
  return {
    issue_key: row["Issue key"] || row["Key"] || row["issue_key"],
    summary: row["Summary"] || row["summary"],
    status: row["Status"] || row["status"],
    assignee: row["Assignee"] || row["assignee"],
    reporter: row["Reporter"] || row["reporter"],
    created_at: parseJiraDate(row["Created"] || row["created_at"]),
    updated_at: parseJiraDate(row["Updated"] || row["updated_at"]),
    project: row["Project name"] || row["Project"] || row["project"],
    priority: row["Priority"] || row["priority"],
  }
}

/**
 * Maps a Jira API issue response to our normalized schema
 */
export function mapJiraApiIssue(issue) {
  return {
    issue_key: issue.key,
    summary: issue.fields?.summary,
    status: issue.fields?.status?.name,
    assignee:
      issue.fields?.assignee?.displayName ||
      issue.fields?.assignee?.emailAddress,
    reporter:
      issue.fields?.reporter?.displayName ||
      issue.fields?.reporter?.emailAddress,
    created_at: issue.fields?.created,
    updated_at: issue.fields?.updated,
    project: issue.fields?.project?.name,
    priority: issue.fields?.priority?.name,
  }
}

/**
 * Converts various Jira date formats to ISO string
 */
function parseJiraDate(dateStr) {
  if (!dateStr) return null

  try {
    // Handle common Jira date formats
    if (typeof dateStr === "string") {
      // Convert DD/MMM/YY format (e.g., "15/Jan/25")
      if (dateStr.match(/^\d{1,2}\/\w{3}\/\d{2}$/)) {
        const [day, month, year] = dateStr.split("/")
        const monthMap = {
          Jan: "01",
          Feb: "02",
          Mar: "03",
          Apr: "04",
          May: "05",
          Jun: "06",
          Jul: "07",
          Aug: "08",
          Sep: "09",
          Oct: "10",
          Nov: "11",
          Dec: "12",
        }
        const fullYear = year.length === 2 ? `20${year}` : year
        return new Date(
          `${fullYear}-${monthMap[month]}-${day.padStart(2, "0")}`
        ).toISOString()
      }

      // Try parsing as regular date
      const parsed = new Date(dateStr)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }
    }

    return dateStr // Return as-is if we can't parse
  } catch (error) {
    console.warn(`Failed to parse Jira date: ${dateStr}`, error)
    return dateStr
  }
}

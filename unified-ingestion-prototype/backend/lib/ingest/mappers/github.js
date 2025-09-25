// src/lib/ingest/mappers/github.js

/**
 * Maps a GitHub Pull Request from the API response to our normalized schema
 */
export function mapGithubPullRequest(pr) {
  return {
    repo_full_name: pr.base?.repo?.full_name ?? null,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    author_login: pr.user?.login,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    merged_at: pr.merged_at,
    additions: pr.additions ?? null,
    deletions: pr.deletions ?? null,
    changed_files: pr.changed_files ?? null,
  }
}

/**
 * Maps a GitHub Commit from the API response to our normalized schema
 */
export function mapGithubCommit(commit) {
  return {
    sha: commit.sha,
    repo_full_name: commit.repository?.full_name ?? null,
    author_login: commit.author?.login ?? commit.commit?.author?.name,
    author_email: commit.commit?.author?.email,
    message: commit.commit?.message,
    created_at: commit.commit?.author?.date,
    additions: commit.stats?.additions ?? null,
    deletions: commit.stats?.deletions ?? null,
    total_changes: commit.stats?.total ?? null,
  }
}

/**
 * Maps a GitHub Issue from the API response to our normalized schema
 */
export function mapGithubIssue(issue) {
  return {
    repo_full_name: issue.repository?.full_name ?? null,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    author_login: issue.user?.login,
    assignee_login: issue.assignee?.login,
    labels: issue.labels?.map((l) => l.name).join(",") ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    closed_at: issue.closed_at,
  }
}

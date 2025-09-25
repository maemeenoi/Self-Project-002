// test-ingestion.js
// Simple test script to validate the ingestion framework

import { GithubApiIngestor } from "./src/lib/ingest/sources/GithubApiIngestor.js"
import { JiraCsvIngestor } from "./src/lib/ingest/sources/JiraCsvIngestor.js"
import { FocusCsvIngestor } from "./src/lib/ingest/sources/FocusCsvIngestor.js"
import { Logger } from "./src/lib/ingest/base/Logger.js"
import { LocalFsStorage } from "./src/lib/ingest/base/storage/LocalFsStorage.js"
import { SqliteRepository } from "./src/lib/ingest/base/providers/SqliteRepository.js"
import { randomUUID } from "crypto"

async function testIngestionFramework() {
  console.log("🧪 Testing Ingestion Framework Setup...\n")

  try {
    // Test 1: Initialize components
    console.log("1. Testing component initialization...")

    const logger = new Logger({ context: { test: true } })
    const storage = new LocalFsStorage({ root: ".data" })
    const repo = new SqliteRepository({ file: ".data/test.db" })

    logger.info({ message: "Logger initialized successfully" })
    console.log("✅ Logger: OK")

    // Test storage
    await storage.saveJson("test/sample.json", {
      test: true,
      timestamp: new Date(),
    })
    const testData = await storage.readJson("test/sample.json")
    console.log("✅ Storage: OK")

    // Test repository (will create schema)
    await repo.recordRunStart("test-run-id", "test-source")
    const runs = await repo.getRecentRuns(5)
    console.log("✅ Repository: OK")

    console.log("")

    // Test 2: Test ingestor creation
    console.log("2. Testing ingestor instantiation...")

    const testConfig = {
      github: { token: "dummy", org: "test", repo: "test" },
      jira_csv: {},
      focus_csv: {},
    }

    const githubIngestor = new GithubApiIngestor({
      source: "github",
      runId: randomUUID(),
      logger,
      storage,
      repo,
      config: testConfig.github,
    })
    console.log("✅ GitHub Ingestor: OK")

    const jiraCsvIngestor = new JiraCsvIngestor({
      source: "jira_csv",
      runId: randomUUID(),
      logger,
      storage,
      repo,
      config: testConfig.jira_csv,
    })
    console.log("✅ Jira CSV Ingestor: OK")

    const focusIngestor = new FocusCsvIngestor({
      source: "focus_csv",
      runId: randomUUID(),
      logger,
      storage,
      repo,
      config: testConfig.focus_csv,
    })
    console.log("✅ FOCUS CSV Ingestor: OK")

    console.log("")

    // Test 3: Test database schema
    console.log("3. Testing database schema...")

    const testRepo = new SqliteRepository({ file: ".data/finops.db" })
    await testRepo.recordRunStart("schema-test", "test")
    await testRepo.recordRunCompletion(
      "schema-test",
      { rows_read: 100, rows_upserted: 95, rows_skipped: 5 },
      "success"
    )

    const schemaRuns = await testRepo.getRecentRuns(1)
    console.log("✅ Ingestion run tracking: OK")

    // Test sample data insertion
    const samplePullRequest = [
      {
        repo_full_name: "test/repo",
        number: 1,
        title: "Test PR",
        state: "open",
        author_login: "testuser",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        merged_at: null,
        additions: 10,
        deletions: 5,
        changed_files: 2,
      },
    ]

    await testRepo.upsertBatch(
      "operational_github_pull_request",
      samplePullRequest,
      ["repo_full_name", "number"]
    )
    console.log("✅ Sample data insertion: OK")

    console.log("")

    // Test 4: Test API endpoint readiness
    console.log("4. Framework ready for API testing!")
    console.log("")
    console.log("🚀 Next steps:")
    console.log("1. Start your Next.js dev server: npm run dev")
    console.log("2. Test the ingestion API:")
    console.log(
      "   GET  http://localhost:3000/api/ingest - View available sources"
    )
    console.log("   POST http://localhost:3000/api/ingest - Trigger ingestion")
    console.log(
      "   GET  http://localhost:3000/api/ingest/status - View run status"
    )
    console.log("")
    console.log("📝 Example API calls:")
    console.log("")
    console.log("# Get available sources:")
    console.log("curl http://localhost:3000/api/ingest")
    console.log("")
    console.log("# Test with sample data (you need to add a CSV file):")
    console.log("curl -X POST http://localhost:3000/api/ingest \\")
    console.log('  -H "Content-Type: application/json" \\')
    console.log(
      '  -d \'{"source":"jira_csv","input":{"filePath":"bronze/sample.csv"}}\''
    )
    console.log("")
    console.log("# Check ingestion status:")
    console.log("curl http://localhost:3000/api/ingest/status")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testIngestionFramework()
}

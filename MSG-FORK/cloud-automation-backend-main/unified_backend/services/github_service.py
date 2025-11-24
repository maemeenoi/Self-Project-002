"""
GitHub Service for Unified Backend

Handles GitHub API integration:
- Repository data fetching
- Issues, pull requests, commits
- Organization and user data
- Rate limiting and authentication
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Union
import aiohttp
import json

logger = logging.getLogger(__name__)


class GitHubService:
    """
    GitHub API integration service
    """
    
    def __init__(self, token: str):
        """
        Initialize GitHub service with authentication token
        
        Args:
            token: GitHub personal access token or GitHub App token
        """
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "MakeStuffGo-Integration/1.0"
        }
        
    async def test_connection(self) -> bool:
        """Test GitHub API connection and token validity"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with session.get(f"{self.base_url}/user") as response:
                    if response.status == 200:
                        user_data = await response.json()
                        logger.info(f"GitHub connection successful for user: {user_data.get('login')}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"GitHub connection failed: {response.status} - {error_text}")
                        raise Exception(f"GitHub API authentication failed: {response.status}")
        except Exception as e:
            logger.error(f"GitHub connection test failed: {e}")
            raise Exception(f"Failed to connect to GitHub API: {str(e)}")
    
    async def fetch_all_data(self, organization: Optional[str] = None, repositories: Optional[List[str]] = None, days_back: int = 30) -> List[Dict[str, Any]]:
        """
        Fetch all data from GitHub API with performance optimizations
        
        Args:
            organization: GitHub organization name (optional)
            repositories: List of specific repositories to fetch (optional)
            days_back: Only fetch data from last N days (default 30)
            
        Returns:
            List of standardized records
        """
        try:
            all_data = []
            
            logger.info(f"🔍 GITHUB DEBUG: Starting fetch_all_data with org={organization}, repos={repositories}")
            
            # Get repositories to process
            repos_to_process = await self._get_repositories(organization, repositories)
            logger.info(f"🔍 GITHUB DEBUG: Found {len(repos_to_process)} repositories to process")
            
            # Limit repositories for performance
            if len(repos_to_process) > 20:
                logger.info(f"Limiting to 20 most recently updated repositories (out of {len(repos_to_process)})")
                repos_to_process = repos_to_process[:20]
            
            logger.info(f"Processing {len(repos_to_process)} repositories concurrently")
            
            # Process repositories concurrently in batches of 5
            max_concurrent = 5
            semaphore = asyncio.Semaphore(max_concurrent)
            
            async def process_repo_with_semaphore(repo):
                async with semaphore:
                    return await self._fetch_repository_data_optimized(repo, days_back)
            
            # Create tasks for all repositories
            tasks = [process_repo_with_semaphore(repo) for repo in repos_to_process]
            
            # Process concurrently and collect results
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Collect successful results
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.warning(f"Repository {repos_to_process[i]['full_name']} processing failed: {result}")
                else:
                    all_data.extend(result)
                    logger.info(f"🔍 GITHUB DEBUG: Repository {repos_to_process[i]['full_name']} returned {len(result)} records")
            
            logger.info(f"🔍 GITHUB DEBUG: Successfully collected {len(all_data)} total records from GitHub API")
            logger.info(f"🔍 GITHUB DEBUG: Sample of first record: {all_data[0] if all_data else 'NO DATA'}")
            return all_data
            
        except Exception as e:
            logger.error(f"Failed to fetch GitHub data: {e}")
            raise Exception(f"GitHub data fetch failed: {str(e)}")
    
    async def _get_repositories(self, organization: Optional[str] = None, repositories: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get list of repositories to process"""
        try:
            logger.info(f"🔍 GITHUB DEBUG: _get_repositories called with org={organization}, repos={repositories}")
            
            if repositories and len(repositories) > 0:
                # Fetch specific repositories
                logger.info(f"🔍 GITHUB DEBUG: Fetching specific repositories: {repositories}")
                repos = []
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    for repo_name in repositories:
                        async with session.get(f"{self.base_url}/repos/{repo_name}") as response:
                            if response.status == 200:
                                repo_data = await response.json()
                                repos.append(repo_data)
                                logger.info(f"🔍 GITHUB DEBUG: Added repository: {repo_data.get('full_name', repo_name)}")
                            else:
                                logger.warning(f"🔍 GITHUB DEBUG: Failed to fetch repo {repo_name}: {response.status}")
                return repos
            
            elif organization and len(organization.strip()) > 0:
                # Fetch organization repositories (limit for performance)
                logger.info(f"🔍 GITHUB DEBUG: Fetching organization repositories for: {organization}")
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    repos = []
                    page = 1
                    per_page = 100
                    max_pages = 3  # Limit to 300 repos max
                    
                    while page <= max_pages:
                        url = f"{self.base_url}/orgs/{organization}/repos?page={page}&per_page={per_page}&sort=updated&direction=desc"
                        async with session.get(url) as response:
                            if response.status == 200:
                                page_repos = await response.json()
                                if not page_repos:
                                    break
                                repos.extend(page_repos)
                                page += 1
                            else:
                                break
                    return repos[:20]  # Return only 20 most recently updated repos
            
            else:
                # Fetch user's repositories (limit for performance)
                logger.info(f"🔍 GITHUB DEBUG: Fetching user repositories")
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    repos = []
                    page = 1
                    per_page = 100
                    max_pages = 3  # Limit to 300 repos max
                    
                    while page <= max_pages:
                        url = f"{self.base_url}/user/repos?page={page}&per_page={per_page}&sort=updated&direction=desc"
                        logger.info(f"🔍 GITHUB DEBUG: Fetching page {page} from {url}")
                        async with session.get(url) as response:
                            logger.info(f"🔍 GITHUB DEBUG: Page {page} response status: {response.status}")
                            if response.status == 200:
                                page_repos = await response.json()
                                logger.info(f"🔍 GITHUB DEBUG: Page {page} returned {len(page_repos)} repositories")
                                if not page_repos:
                                    break
                                repos.extend(page_repos)
                                page += 1
                            else:
                                error_text = await response.text()
                                logger.error(f"🔍 GITHUB DEBUG: Failed to fetch repos page {page}: {response.status} - {error_text}")
                                break
                    
                    logger.info(f"🔍 GITHUB DEBUG: Total repositories fetched: {len(repos)}")
                    result_repos = repos[:20]  # Return only 20 most recently updated repos
                    logger.info(f"🔍 GITHUB DEBUG: Returning {len(result_repos)} repositories")
                    if result_repos:
                        logger.info(f"🔍 GITHUB DEBUG: First repo: {result_repos[0].get('full_name', 'no name')}")
                    return result_repos
                    
        except Exception as e:
            logger.error(f"Failed to get repositories: {e}")
            raise Exception(f"Failed to fetch repository list: {str(e)}")
    
    async def _fetch_repository_data_optimized(self, repo: Dict[str, Any], days_back: int = 30) -> List[Dict[str, Any]]:
        """Fetch optimized data for a specific repository with recent data focus"""
        repo_name = repo["full_name"]
        all_repo_data = []
        
        # Calculate date filter for recent data
        since_date = (datetime.now(timezone.utc) - timedelta(days=days_back)).isoformat()
        
        try:
            # Use connection pooling for better performance
            connector = aiohttp.TCPConnector(limit=10)
            async with aiohttp.ClientSession(headers=self.headers, connector=connector) as session:
                
                # Create concurrent tasks for different data types
                tasks = []
                
                # Recent issues only (last N days)
                tasks.append(
                    self._fetch_paginated_data_optimized(
                        session, 
                        f"{self.base_url}/repos/{repo_name}/issues",
                        {"state": "all", "since": since_date, "per_page": 100},
                        "issues",
                        repo_name,
                        max_pages=2  # Limit to 2 pages (200 issues max)
                    )
                )
                
                # Recent commits only (removed date filter for testing)
                tasks.append(
                    self._fetch_paginated_data_optimized(
                        session,
                        f"{self.base_url}/repos/{repo_name}/commits",
                        {"per_page": 10},  # No date filter, just get recent commits
                        "commits",
                        repo_name,
                        max_pages=1  # Limit to 1 page (10 commits max)
                    )
                )
                
                # Execute all requests concurrently
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results
                for result in results:
                    if isinstance(result, Exception):
                        logger.warning(f"Failed to fetch data for {repo_name}: {result}")
                    else:
                        all_repo_data.extend(result)
                        
        except Exception as e:
            logger.error(f"Failed to fetch data for repository {repo_name}: {e}")
            
        return all_repo_data
    
    async def _fetch_paginated_data_optimized(self, session: aiohttp.ClientSession, url: str, params: Dict[str, Any], data_type: str, repo_name: str, max_pages: int = 3) -> List[Dict[str, Any]]:
        """
        Optimized paginated data fetching with:
        1. Page limit to prevent over-fetching
        2. Reduced delays
        3. Data standardization
        4. Better error handling
        """
        all_data = []
        page = 1
        
        if not params:
            params = {}
        
        try:
            while page <= max_pages:  # Limit pages to prevent over-fetching
                params["page"] = page
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        page_data = await response.json()
                        if not page_data:
                            break
                        
                        # Add minimal processing metadata - detailed enrichment will be done later
                        for item in page_data:
                            item["_data_type"] = data_type
                            item["_repo_name"] = repo_name
                            
                        all_data.extend(page_data)
                        page += 1
                        
                        # Smart rate limiting - only delay if needed
                        remaining = int(response.headers.get("X-RateLimit-Remaining", 1000))
                        if remaining < 100:  # More conservative threshold
                            await asyncio.sleep(0.05)  # Minimal delay
                        
                    elif response.status == 403:  # Rate limited
                        reset_time = int(response.headers.get("X-RateLimit-Reset", 0))
                        sleep_time = max(1, reset_time - datetime.now().timestamp())
                        logger.warning(f"Rate limited, sleeping for {sleep_time} seconds")
                        await asyncio.sleep(sleep_time)
                        continue
                    else:
                        logger.warning(f"API request failed: {response.status}")
                        break
                        
        except Exception as e:
            logger.error(f"Failed to fetch paginated data from {url}: {e}")
            
        return all_data
    
    def _standardize_github_data(self, raw_data: List[Dict], data_type: str, repo_name: str) -> List[Dict[str, Any]]:
        """Standardize GitHub data based on type"""
        standardized = []
        
        for item in raw_data:
            try:
                if data_type == "issues":
                    standardized_item = {
                        "provider": "github",
                        "item_type": "pull_request" if item.get("pull_request") else "issue",
                        "item_key": f"{repo_name}#{item['number']}",
                        "project_or_repo": repo_name,
                        "title": item.get("title", "")[:500],  # Limit title length
                        "status": item.get("state"),
                        "created_at": item.get("created_at"),
                        "closed_at": item.get("closed_at"),
                        "author": item.get("user", {}).get("login"),
                        "assignee": item.get("assignee", {}).get("login") if item.get("assignee") else None,
                        "labels": [label.get("name") for label in item.get("labels", [])][:10],  # Limit labels
                        "source_url": item.get("html_url"),
                        "raw_data": item  # Keep original for now
                    }
                    
                    # Calculate lead time if closed
                    if item.get("closed_at") and item.get("created_at"):
                        created = datetime.fromisoformat(item["created_at"].replace("Z", "+00:00"))
                        closed = datetime.fromisoformat(item["closed_at"].replace("Z", "+00:00"))
                        lead_time_hours = (closed - created).total_seconds() / 3600
                        standardized_item["lead_time_hours"] = round(lead_time_hours, 2)
                    
                elif data_type == "commits":
                    standardized_item = {
                        "provider": "github",
                        "item_type": "commit",
                        "item_key": f"{repo_name}#{item['sha'][:8]}",
                        "project_or_repo": repo_name,
                        "title": item.get("commit", {}).get("message", "").split('\n')[0][:500],
                        "status": "completed",
                        "created_at": item.get("commit", {}).get("author", {}).get("date"),
                        "author": item.get("commit", {}).get("author", {}).get("name"),
                        "source_url": item.get("html_url"),
                        "raw_data": {
                            "sha": item.get("sha"),
                            "message": item.get("commit", {}).get("message"),
                            "author": item.get("commit", {}).get("author")
                        }  # Store minimal commit data
                    }
                
                standardized.append(standardized_item)
                
            except Exception as e:
                logger.warning(f"Failed to standardize {data_type} item: {e}")
                continue
        
        return standardized
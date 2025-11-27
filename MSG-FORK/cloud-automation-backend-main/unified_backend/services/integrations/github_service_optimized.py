"""
Optimized GitHub Service with concurrent processing and reduced API calls
"""
import asyncio
import aiohttp
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
import json

logger = logging.getLogger(__name__)

class OptimizedGitHubService:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        # Increase concurrent request limit
        self.max_concurrent_repos = 5
        self.max_concurrent_requests = 10
        
    async def fetch_all_data_optimized(self, organization: Optional[str] = None, repositories: Optional[List[str]] = None, days_back: int = 30) -> List[Dict[str, Any]]:
        """
        Fetch GitHub data with optimizations:
        1. Concurrent repository processing
        2. Recent data only (last 30 days by default)
        3. Reduced API calls
        4. Smart rate limiting
        """
        try:
            all_data = []
            
            # Get repositories to process
            repos_to_process = await self._get_repositories(organization, repositories)
            
            logger.info(f"Processing {len(repos_to_process)} repositories concurrently (max {self.max_concurrent_repos} at a time)")
            
            # Process repositories concurrently in batches
            semaphore = asyncio.Semaphore(self.max_concurrent_repos)
            
            async def process_repo_with_semaphore(repo):
                async with semaphore:
                    return await self._fetch_repository_data_optimized(repo, days_back)
            
            # Create tasks for all repositories
            tasks = [process_repo_with_semaphore(repo) for repo in repos_to_process]
            
            # Process in batches and collect results
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Collect successful results
            for result in results:
                if isinstance(result, Exception):
                    logger.warning(f"Repository processing failed: {result}")
                else:
                    all_data.extend(result)
            
            logger.info(f"Fetched {len(all_data)} total records from GitHub (optimized)")
            return all_data
            
        except Exception as e:
            logger.error(f"Failed to fetch GitHub data: {e}")
            raise Exception(f"GitHub data fetch failed: {str(e)}")
    
    async def _fetch_repository_data_optimized(self, repo: Dict[str, Any], days_back: int = 30) -> List[Dict[str, Any]]:
        """Fetch optimized data for a specific repository with recent data focus"""
        repo_name = repo["full_name"]
        all_repo_data = []
        
        # Calculate date filter for recent data
        since_date = (datetime.now(timezone.utc) - timedelta(days=days_back)).isoformat()
        
        try:
            # Use a single session with connection pooling
            connector = aiohttp.TCPConnector(limit=self.max_concurrent_requests)
            async with aiohttp.ClientSession(headers=self.headers, connector=connector) as session:
                
                # Create concurrent tasks for different data types
                tasks = []
                
                # Recent issues only (last 30 days)
                tasks.append(
                    self._fetch_paginated_data_optimized(
                        session, 
                        f"{self.base_url}/repos/{repo_name}/issues",
                        {"state": "all", "since": since_date, "per_page": 100},
                        data_type="issues",
                        repo_name=repo_name
                    )
                )
                
                # Recent commits only (last 30 days)  
                tasks.append(
                    self._fetch_paginated_data_optimized(
                        session,
                        f"{self.base_url}/repos/{repo_name}/commits",
                        {"since": since_date, "per_page": 50},
                        data_type="commits", 
                        repo_name=repo_name
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
        3. Better error handling
        4. Data standardization
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
                        
                        # Standardize data immediately
                        standardized_data = self._standardize_github_data(page_data, data_type, repo_name)
                        all_data.extend(standardized_data)
                        page += 1
                        
                        # Smart rate limiting - only delay if needed
                        remaining = int(response.headers.get("X-RateLimit-Remaining", 1000))
                        if remaining < 50:  # More aggressive threshold
                            await asyncio.sleep(0.05)  # Reduced delay
                        
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
                        "raw_data": json.dumps(item)  # Store as JSON string to reduce size
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
                        "raw_data": json.dumps({
                            "sha": item.get("sha"),
                            "message": item.get("commit", {}).get("message"),
                            "author": item.get("commit", {}).get("author"),
                            "stats": item.get("stats")
                        })  # Store minimal commit data
                    }
                
                standardized.append(standardized_item)
                
            except Exception as e:
                logger.warning(f"Failed to standardize {data_type} item: {e}")
                continue
        
        return standardized
    
    async def _get_repositories(self, organization: Optional[str] = None, repositories: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get list of repositories to process - reuse existing method"""
        try:
            if repositories:
                # Fetch specific repositories
                all_repos = []
                
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    for repo_name in repositories:
                        try:
                            async with session.get(f"{self.base_url}/repos/{repo_name}") as response:
                                if response.status == 200:
                                    repo_data = await response.json()
                                    all_repos.append(repo_data)
                        except Exception as e:
                            logger.warning(f"Failed to fetch repository {repo_name}: {e}")
                
                return all_repos
                
            elif organization:
                # Fetch organization repositories
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    repos = await self._fetch_paginated_data_simple(
                        session,
                        f"{self.base_url}/orgs/{organization}/repos",
                        {"per_page": 100, "sort": "updated", "direction": "desc"}
                    )
                    return repos[:20]  # Limit to 20 most recently updated repos
            else:
                # Fetch user's repositories  
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    repos = await self._fetch_paginated_data_simple(
                        session,
                        f"{self.base_url}/user/repos",
                        {"per_page": 100, "sort": "updated", "direction": "desc"}
                    )
                    return repos[:20]  # Limit to 20 most recently updated repos
                    
        except Exception as e:
            logger.error(f"Failed to get repositories: {e}")
            raise Exception(f"Failed to get repositories: {str(e)}")
    
    async def _fetch_paginated_data_simple(self, session: aiohttp.ClientSession, url: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Simple paginated fetch for repository lists"""
        all_data = []
        page = 1
        max_pages = 3  # Limit repository pages
        
        while page <= max_pages:
            params["page"] = page
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        page_data = await response.json()
                        if not page_data:
                            break
                        all_data.extend(page_data)
                        page += 1
                    else:
                        break
            except Exception as e:
                logger.warning(f"Failed to fetch page {page}: {e}")
                break
                
        return all_data
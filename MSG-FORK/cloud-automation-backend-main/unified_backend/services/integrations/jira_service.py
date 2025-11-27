"""
Jira Service for Unified Backend

Handles Jira API integration:
- Project data fetching
- Issues, sprints, users
- Custom fields and workflows
- Authentication and rate limiting
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Union
import aiohttp
import json
import base64

logger = logging.getLogger(__name__)


class JiraService:
    """
    Jira API integration service
    """
    
    def __init__(self, url: str, email: str, api_token: str):
        """
        Initialize Jira service with authentication
        
        Args:
            url: Jira instance URL (e.g., https://company.atlassian.net)
            email: User email for authentication
            api_token: Jira API token
        """
        self.base_url = url.rstrip('/')
        self.email = email
        self.api_token = api_token
        
        # Create basic auth header
        auth_string = f"{email}:{api_token}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        self.headers = {
            "Authorization": f"Basic {auth_b64}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "MakeStuffGo-Integration/1.0"
        }
        
    async def test_connection(self) -> bool:
        """Test Jira API connection and authentication"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with session.get(f"{self.base_url}/rest/api/3/myself") as response:
                    if response.status == 200:
                        user_data = await response.json()
                        logger.info(f"Jira connection successful for user: {user_data.get('displayName')}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"Jira connection failed: {response.status} - {error_text}")
                        raise Exception(f"Jira API authentication failed: {response.status}")
        except Exception as e:
            logger.error(f"Jira connection test failed: {e}")
            raise Exception(f"Failed to connect to Jira API: {str(e)}")
    
    async def fetch_all_data(self, projects: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Fetch all Jira data for processing
        
        Args:
            projects: List of specific project keys to fetch (optional)
            
        Returns:
            List of standardized data records
        """
        try:
            logger.info(f"🔍 Starting Jira data fetch with projects: {projects}")
            logger.info(f"🔍 Jira URL: {self.base_url}")
            logger.info(f"🔍 Jira Email: {self.email}")
            
            all_data = []
            
            # Test connection first
            await self.test_connection()
            
            # Get projects to process
            projects_to_process = await self._get_projects(projects)
            
            logger.info(f"🔍 Found {len(projects_to_process)} projects to process")
            if projects_to_process:
                for project in projects_to_process:
                    logger.info(f"🔍 Available project: {project.get('key')} - {project.get('name')}")
            
            for project in projects_to_process:
                project_key = project["key"]
                logger.info(f"Fetching data for project: {project_key}")
                
                # Fetch project data
                project_data = await self._fetch_project_data(project)
                logger.info(f"🔍 Project {project_key} returned {len(project_data)} records")
                
                # DEBUGGING: Log sample data structure
                if project_data:
                    logger.info(f"🔍 SAMPLE PROJECT DATA: {project_data[0]}")
                    logger.info(f"🔍 DATA KEYS: {list(project_data[0].keys()) if project_data else 'NO DATA'}")
                else:
                    logger.warning(f"🔍 NO DATA RETURNED FOR PROJECT {project_key}")
                
                all_data.extend(project_data)
                
                # Add delay to respect rate limits
                await asyncio.sleep(0.1)
            
            logger.info(f"Fetched {len(all_data)} total records from Jira")
            logger.info(f"🔍 FINAL ALL_DATA COUNT: {len(all_data)}")
            if all_data:
                logger.info(f"🔍 SAMPLE FINAL DATA: {all_data[0]}")
            
            return all_data
            
        except Exception as e:
            logger.error(f"Failed to fetch Jira data: {e}")
            raise Exception(f"Jira data fetch failed: {str(e)}")
    
    async def _get_projects(self, projects: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get list of projects to process"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                if projects and len(projects) > 0:
                    # Fetch specific projects
                    logger.info(f"🔍 Fetching specific projects: {projects}")
                    project_list = []
                    for project_key in projects:
                        async with session.get(f"{self.base_url}/rest/api/3/project/{project_key}") as response:
                            if response.status == 200:
                                project_data = await response.json()
                                project_list.append(project_data)
                                logger.info(f"🔍 Successfully fetched project: {project_key}")
                            else:
                                error_text = await response.text()
                                logger.warning(f"🔍 Failed to fetch project {project_key}: {response.status} - {error_text}")
                    return project_list
                else:
                    # Fetch all accessible projects
                    logger.info(f"🔍 Fetching all accessible projects")
                    async with session.get(f"{self.base_url}/rest/api/3/project") as response:
                        if response.status == 200:
                            all_projects = await response.json()
                            logger.info(f"🔍 Found {len(all_projects)} total accessible projects")
                            # Limit to first 10 projects for performance
                            return all_projects[:10]
                        else:
                            error_text = await response.text()
                            logger.error(f"🔍 Failed to fetch projects: {response.status} - {error_text}")
                            raise Exception(f"Failed to fetch projects: {response.status}")
                            
        except Exception as e:
            logger.error(f"Failed to get projects: {e}")
            raise Exception(f"Failed to fetch project list: {str(e)}")
    
    async def _fetch_project_data(self, project: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fetch all data for a specific project"""
        project_key = project["key"]
        project_name = project.get("name", project_key)
        all_project_data = []
        
        logger.info(f"Fetching data for project: {project_key}")
        
        try:
            # Create session without default headers since we're adding them explicitly
            async with aiohttp.ClientSession() as session:
                # Try to fetch issues - first try to get the first issue key from the project
                logger.info(f"🔍 Attempting alternative data fetch for project {project_key}")
                
                # Create headers for requests
                request_headers = {
                    **self.headers,
                    "Content-Type": "application/json"
                }
                
                # Try to list issues without JQL search - use the project issues endpoint
                try:
                    async with session.get(
                        f"{self.base_url}/rest/api/3/project/{project_key}/statuses",
                        headers=request_headers
                    ) as status_response:
                        if status_response.status == 200:
                            logger.info(f"🔍 Project {project_key} status fetch successful")
                        else:
                            error_text = await status_response.text()
                            logger.error(f"🔍 Project {project_key} status fetch failed: {status_response.status} - {error_text}")
                except Exception as e:
                    logger.error(f"🔍 Project status check failed: {e}")
                
                # Still try the JQL method
                jql_query = f"project = '{project_key}'"
                issues = await self._fetch_issues_jql(session, jql_query)
                
                # If JQL fails, try to get issues via alternative methods
                if not issues:
                    logger.info(f"🔍 JQL failed, trying alternative approach for {project_key}")
                    issues = await self._try_alternative_issue_fetch(session, project_key, request_headers)
                
                # Return raw comprehensive Jira data (preserve all 100+ fields)
                for issue in issues:
                    # Add metadata for processing but keep all original data
                    issue["_data_type"] = "issue"
                    issue["_project_key"] = project_key
                    all_project_data.append(issue)
                
        except Exception as e:
            logger.error(f"Failed to fetch data for project {project_key}: {e}")
            # Don't fail the entire process for one project
            
        return all_project_data
    
    async def _fetch_issues_jql(self, session: aiohttp.ClientSession, jql: str, max_results: int = 1000) -> List[Dict[str, Any]]:
        """Fetch issues using JQL query with pagination"""
        all_issues = []
        start_at = 0
        page_size = 50
        
        logger.info(f"🔍 Starting JQL search: {jql}")
        
        try:
            while len(all_issues) < max_results:
                # Try simplified payload with minimal fields
                search_payload = {
                    "jql": jql,
                    "startAt": start_at,
                    "maxResults": page_size,
                    "fields": ["summary", "status", "created", "updated", "issuetype"]
                }
                
                logger.info(f"🔍 Searching with payload: startAt={start_at}, maxResults={page_size}")
                logger.info(f"🔍 Request URL: {self.base_url}/rest/api/3/search/jql")
                
                # Create headers with explicit content type
                request_headers = {
                    **self.headers,
                    "Content-Type": "application/json"
                }
                
                # Try GET method with simple parameters
                params = {
                    "jql": jql,
                    "startAt": start_at,
                    "maxResults": page_size,
                    "fields": "summary,status,created,updated,issuetype"
                }
                
                async with session.get(
                    f"{self.base_url}/rest/api/3/search/jql",
                    params=params,
                    headers=request_headers
                ) as response:
                    logger.info(f"🔍 Response status: {response.status}")
                    
                    if response.status == 200:
                        result = await response.json()
                        issues = result.get("issues", [])
                        total = result.get("total", 0)
                        
                        logger.info(f"🔍 JQL search result: {len(issues)} issues on this page, {total} total issues")
                        
                        if not issues:
                            logger.info("🔍 No more issues found, breaking")
                            break
                            
                        all_issues.extend(issues)
                        
                        # Check if we've got all issues
                        if len(all_issues) >= total:
                            logger.info(f"🔍 Retrieved all {total} issues")
                            break
                            
                        start_at += page_size
                    else:
                        error_text = await response.text()
                        logger.error(f"🔍 JQL search failed: {response.status} - {error_text}")
                        logger.error(f"🔍 Request headers: {request_headers}")
                        logger.error(f"🔍 Request params: {params}")
                        
                        # Try to provide more helpful error information
                        if response.status == 410:
                            logger.error("🔍 API endpoint deprecated. This might be due to:")
                            logger.error("🔍 1. API token scope limitations")  
                            logger.error("🔍 2. Account permissions")
                            logger.error("🔍 3. Jira instance configuration")
                        elif response.status == 403:
                            logger.error("🔍 Permission denied - check API token and project access")
                        elif response.status == 401:
                            logger.error("🔍 Authentication failed - check credentials")
                        
                        break
                
                # Add delay between requests
                await asyncio.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Failed to fetch issues with JQL '{jql}': {e}")
            
        logger.info(f"🔍 JQL search completed: {len(all_issues)} total issues retrieved")
        return all_issues
    
    async def _try_alternative_issue_fetch(self, session: aiohttp.ClientSession, project_key: str, headers: Dict[str, str]) -> List[Dict[str, Any]]:
        """Alternative method to fetch issues when search API fails"""
        logger.info(f"🔍 Trying alternative issue fetch for project {project_key}")
        
        try:
            # Try to get project details first
            async with session.get(
                f"{self.base_url}/rest/api/3/project/{project_key}",
                headers=headers
            ) as response:
                if response.status == 200:
                    project_data = await response.json()
                    logger.info(f"🔍 Project {project_key} exists: {project_data.get('name')}")
                    
                    # Try to fetch issues from the project using direct REST API
                    try:
                        async with session.get(
                            f"{self.base_url}/rest/api/3/search/jql",
                            params={
                                "jql": f"project = {project_key}",
                                "maxResults": 100,
                                "expand": "all",
                                "fields": "*all"
                            },
                            headers=headers
                        ) as search_response:
                            if search_response.status == 200:
                                search_result = await search_response.json()
                                issues = search_result.get("issues", [])
                                logger.info(f"🔍 Successfully fetched {len(issues)} real issues from project {project_key}")
                                return issues
                            else:
                                error_text = await search_response.text()
                                logger.error(f"🔍 Failed to fetch issues from project {project_key}: {search_response.status} - {error_text}")
                                return []
                    except Exception as search_error:
                        logger.error(f"🔍 Issue search failed for project {project_key}: {search_error}")
                        return []
                else:
                    logger.error(f"🔍 Failed to get project details: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"🔍 Alternative issue fetch failed: {e}")
            return []
    
    def _determine_issue_type(self, fields: Dict[str, Any]) -> str:
        """Determine standardized issue type from Jira issue type"""
        issue_type = fields.get("issuetype", {}).get("name", "").lower()
        
        type_mapping = {
            "story": "story",
            "user story": "story", 
            "task": "task",
            "sub-task": "subtask",
            "bug": "bug",
            "defect": "bug",
            "epic": "epic",
            "improvement": "improvement",
            "new feature": "feature"
        }
        
        return type_mapping.get(issue_type, "issue")
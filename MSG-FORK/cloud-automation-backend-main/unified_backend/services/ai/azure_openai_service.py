"""
Azure OpenAI Service for generating AI-powered cost optimization recommendations
"""
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from decouple import config

logger = logging.getLogger(__name__)

class AzureOpenAIService:
    def __init__(self):
        self.endpoint = config('AZURE_OPENAI_ENDPOINT', default='')
        self.api_key = config('AZURE_OPENAI_API_KEY', default='')
        self.deployment_name = config('AZURE_OPENAI_DEPLOYMENT_NAME', default='')
        self.api_version = config('AZURE_OPENAI_API_VERSION', default='2025-01-01-preview')
        
        if not all([self.endpoint, self.api_key, self.deployment_name]):
            logger.warning("Azure OpenAI configuration incomplete. AI recommendations will not be available.")
            self.enabled = False
        else:
            self.enabled = True
            logger.info("✅ Azure OpenAI service initialized successfully")

    async def generate_cost_recommendations(self, cost_data: List[Dict[str, Any]], daily_costs: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI-powered cost optimization recommendations using Azure OpenAI"""
        
        if not self.enabled:
            logger.warning("Azure OpenAI not configured - returning empty recommendations")
            return []

        try:
            # Prepare cost analysis for AI
            cost_summary = self._analyze_cost_data(cost_data, daily_costs)
            
            # Create AI prompt
            prompt = self._create_cost_analysis_prompt(cost_summary)
            
            # Call Azure OpenAI
            recommendations = await self._call_azure_openai(prompt)
            
            logger.info(f"✅ Generated {len(recommendations)} AI recommendations using Azure OpenAI")
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Failed to generate AI recommendations: {e}")
            return []

    def _analyze_cost_data(self, cost_data: List[Dict[str, Any]], daily_costs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cost data to create a summary for AI processing"""
        
        # Calculate basic metrics
        costs = daily_costs.get('costs', [])
        total_cost = sum(costs)
        avg_daily_cost = total_cost / len(costs) if costs else 0
        
        # Analyze recent trend
        recent_costs = costs[-7:] if len(costs) >= 7 else costs
        recent_avg = sum(recent_costs) / len(recent_costs) if recent_costs else 0
        trend = "increasing" if recent_avg > avg_daily_cost else "decreasing"
        
        # Service breakdown
        service_costs = {}
        for item in cost_data:
            service = item.get('service', 'Unknown')
            cost = float(item.get('cost', 0))
            service_costs[service] = service_costs.get(service, 0) + cost
        
        top_services = sorted(service_costs.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_cost': total_cost,
            'daily_average': avg_daily_cost,
            'recent_average': recent_avg,
            'trend': trend,
            'days_analyzed': len(costs),
            'top_services': top_services,
            'service_count': len(service_costs),
            'cost_range': {'min': min(costs) if costs else 0, 'max': max(costs) if costs else 0}
        }

    def _create_cost_analysis_prompt(self, cost_summary: Dict[str, Any]) -> str:
        """Create a detailed prompt for Azure OpenAI cost analysis"""
        
        top_services_text = "\n".join([
            f"- {service}: ${cost:.2f} ({(cost/cost_summary['total_cost']*100):.1f}%)" 
            for service, cost in cost_summary['top_services']
        ])
        
        prompt = f"""You are a cloud cost optimization expert. Analyze this AWS/Azure cost data and provide specific, actionable recommendations.

COST DATA ANALYSIS:
- Total Cost: ${cost_summary['total_cost']:.2f}
- Daily Average: ${cost_summary['daily_average']:.2f}
- Recent 7-day Average: ${cost_summary['recent_average']:.2f}
- Trend: {cost_summary['trend']}
- Days Analyzed: {cost_summary['days_analyzed']}
- Services Count: {cost_summary['service_count']}
- Cost Range: ${cost_summary['cost_range']['min']:.2f} - ${cost_summary['cost_range']['max']:.2f}

TOP SERVICES BY COST:
{top_services_text}

Please provide exactly 3-5 specific, actionable cost optimization recommendations in JSON format. Each recommendation should include:
- title: Short, specific title
- description: Detailed explanation of the issue and opportunity
- priority: "high", "medium", or "low"
- action: Specific action to take
- type: Category of optimization (e.g., "Resource Optimization", "Architecture Review", "Cost Control")
- source: "Azure OpenAI Analysis"
- category: Technical category (e.g., "compute", "storage", "networking")

Focus on REAL, PRACTICAL recommendations based on the actual cost patterns shown. Avoid generic advice.

Return ONLY valid JSON array format:
[
  {{
    "title": "Specific Recommendation Title",
    "description": "Detailed analysis and recommendation based on the actual cost data",
    "priority": "high|medium|low",
    "action": "Specific actionable step",
    "type": "Optimization Category",
    "source": "Azure OpenAI Analysis",
    "category": "technical category"
  }}
]"""
        
        return prompt

    async def _call_azure_openai(self, prompt: str) -> List[Dict[str, Any]]:
        """Make API call to Azure OpenAI"""
        
        url = f"{self.endpoint}openai/deployments/{self.deployment_name}/chat/completions?api-version={self.api_version}"
        
        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key
        }
        
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert cloud cost optimization consultant. Provide practical, data-driven recommendations in JSON format only."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "max_tokens": 1500,
            "temperature": 0.7,
            "top_p": 0.9
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                logger.error(f"Azure OpenAI API error: {response.status_code} - {response.text}")
                raise Exception(f"Azure OpenAI API error: {response.status_code}")
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Parse JSON response
            try:
                # Clean up the response (remove any markdown formatting)
                if '```json' in content:
                    content = content.split('```json')[1].split('```')[0]
                elif '```' in content:
                    content = content.split('```')[1].split('```')[0]
                
                recommendations = json.loads(content.strip())
                
                # Validate format
                if not isinstance(recommendations, list):
                    raise ValueError("Response is not a list")
                
                return recommendations
                
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                logger.error(f"Raw response: {content}")
                return []

# Global service instance
azure_openai_service = AzureOpenAIService()

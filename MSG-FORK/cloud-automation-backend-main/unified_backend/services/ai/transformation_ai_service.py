"""
Azure OpenAI Service for Business Transformation Impact Analysis
Extends the base OpenAI service to provide intelligent insights on transformation data
"""
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from decouple import config
from services.ai.azure_openai_service import AzureOpenAIService

logger = logging.getLogger(__name__)

class TransformationAIService(AzureOpenAIService):
    """Enhanced AI service specifically for Business Transformation Impact analysis"""
    
    async def analyze_transformation_impact(
        self, 
        transformation_data: Dict[str, Any],
        financial_data: Dict[str, Any] = None,
        strategic_initiatives: List[Dict[str, Any]] = None,
        workflow_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered Business Transformation Impact analysis
        
        Args:
            transformation_data: Core transformation metrics (speed, reach, cost)
            financial_data: Financial impact data (optional)
            strategic_initiatives: Current initiatives (optional)  
            workflow_data: Workflow efficiency data (optional)
        """
        
        if not self.enabled:
            logger.warning("Azure OpenAI not configured - returning basic analysis")
            return self._fallback_analysis(transformation_data)

        try:
            # Prepare comprehensive analysis prompt
            prompt = self._create_transformation_analysis_prompt(
                transformation_data, financial_data, strategic_initiatives, workflow_data
            )
            
            # Call Azure OpenAI for intelligent analysis
            ai_insights = await self._call_transformation_ai(prompt)
            
            logger.info("✅ Generated AI-powered transformation insights")
            return ai_insights
            
        except Exception as e:
            logger.error(f"❌ Failed to generate transformation insights: {e}")
            return self._fallback_analysis(transformation_data)

    def _create_transformation_analysis_prompt(
        self, 
        transformation_data: Dict[str, Any],
        financial_data: Dict[str, Any] = None,
        strategic_initiatives: List[Dict[str, Any]] = None,
        workflow_data: Dict[str, Any] = None
    ) -> str:
        """Create a comprehensive prompt for transformation impact analysis"""
        
        # Extract transformation outcomes
        outcomes = transformation_data.get('transformation_outcomes', [])
        overall_score = transformation_data.get('overall_transformation_score', 0)
        
        outcomes_text = "\n".join([
            f"- {outcome.get('outcome')}: {outcome.get('value')} ({outcome.get('description')}, trend: {outcome.get('trend')})"
            for outcome in outcomes
        ])
        
        # Add financial context if available
        financial_context = ""
        if financial_data:
            financial_context = f"""
FINANCIAL IMPACT CONTEXT:
- Total Cloud Investment: ${financial_data.get('total_investment', 0):.2f}
- Annual Savings: ${financial_data.get('annual_savings', 0):.2f}
- ROI: {financial_data.get('roi_percentage', 0):.1f}%
- Break-even Period: {financial_data.get('break_even_months', 'N/A')} months
"""
        
        # Add strategic initiatives context if available
        initiatives_context = ""
        if strategic_initiatives:
            high_impact_initiatives = [i for i in strategic_initiatives if i.get('impact_level') == 'High']
            initiatives_context = f"""
STRATEGIC INITIATIVES CONTEXT:
- Total Active Initiatives: {len(strategic_initiatives)}
- High Impact Initiatives: {len(high_impact_initiatives)}
- Key Initiatives: {', '.join([i.get('name', 'Unnamed') for i in strategic_initiatives[:3]])}
"""

        # Add workflow efficiency context if available
        workflow_context = ""
        if workflow_data:
            workflow_context = f"""
WORKFLOW EFFICIENCY CONTEXT:
- Average Cycle Time: {workflow_data.get('avg_cycle_time', 'N/A')} hours
- Workflow Success Rate: {workflow_data.get('success_rate', 0):.1f}%
- Process Efficiency: {workflow_data.get('efficiency_score', 'N/A')}
"""

        prompt = f"""You are a senior business transformation consultant analyzing cloud modernization impact for executive leadership. Provide strategic insights based on actual transformation data.

TRANSFORMATION METRICS ANALYSIS:
Overall Transformation Score: {overall_score}/10

KEY TRANSFORMATION OUTCOMES:
{outcomes_text}

{financial_context}

{initiatives_context}

{workflow_context}

Please provide a comprehensive Business Transformation Impact analysis in JSON format with the following structure:

{{
  "executive_summary": "2-3 sentence high-level assessment for C-suite executives",
  "transformation_insights": [
    {{
      "category": "Speed to Market|Global Reach|Cost Optimisation|Innovation|Risk Management",
      "insight": "Specific data-driven insight",
      "impact": "Strategic business impact description",
      "recommendation": "Actionable executive recommendation"
    }}
  ],
  "strategic_recommendations": [
    {{
      "priority": "high|medium|low",
      "action": "Specific strategic action",
      "rationale": "Business justification based on data",
      "expected_outcome": "Measurable business outcome",
      "timeline": "Recommended timeframe"
    }}
  ],
  "risk_assessment": {{
    "current_risks": ["Risk 1", "Risk 2"],
    "mitigation_priority": "high|medium|low",
    "recommended_actions": ["Action 1", "Action 2"]
  }},
  "success_indicators": [
    {{
      "metric": "Specific measurable indicator",
      "target": "Target value or improvement",
      "timeframe": "Expected timeline"
    }}
  ],
  "ai_confidence_score": 0.0-1.0
}}

Focus on STRATEGIC, EXECUTIVE-LEVEL insights that connect technical transformation metrics to business outcomes. Avoid technical jargon. Provide actionable recommendations that executives can implement.

Return ONLY valid JSON format."""
        
        return prompt

    async def _call_transformation_ai(self, prompt: str) -> Dict[str, Any]:
        """Make API call to Azure OpenAI for transformation analysis"""
        
        url = f"{self.endpoint}openai/deployments/{self.deployment_name}/chat/completions?api-version={self.api_version}"
        
        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key
        }
        
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a senior business transformation consultant with expertise in cloud modernization, digital transformation, and executive strategy. Provide strategic, data-driven insights in JSON format only."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.8,
            "top_p": 0.9
        }
        
        async with httpx.AsyncClient(timeout=45.0) as client:
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
                
                ai_analysis = json.loads(content.strip())
                
                # Add metadata
                ai_analysis['analysis_metadata'] = {
                    'generated_by': 'Azure OpenAI',
                    'model_version': self.deployment_name,
                    'analysis_type': 'Business Transformation Impact',
                    'timestamp': None  # Will be added by the endpoint
                }
                
                return ai_analysis
                
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse transformation AI response: {e}")
                logger.error(f"Raw response: {content}")
                raise Exception("Failed to parse AI analysis")

    def _fallback_analysis(self, transformation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide basic analysis when AI is not available"""
        
        outcomes = transformation_data.get('transformation_outcomes', [])
        overall_score = transformation_data.get('overall_transformation_score', 0)
        
        # Basic rule-based insights
        speed_outcome = next((o for o in outcomes if 'Speed' in o.get('outcome', '')), {})
        reach_outcome = next((o for o in outcomes if 'Reach' in o.get('outcome', '')), {})
        cost_outcome = next((o for o in outcomes if 'Cost' in o.get('outcome', '')), {})
        
        return {
            "executive_summary": f"Transformation score of {overall_score}/10 indicates {'strong' if overall_score >= 7 else 'moderate' if overall_score >= 5 else 'developing'} cloud modernization progress.",
            "transformation_insights": [
                {
                    "category": "Overall Progress",
                    "insight": f"Current transformation maturity: {overall_score}/10",
                    "impact": "Foundational cloud capabilities established",
                    "recommendation": "Continue monitoring key metrics and investment"
                }
            ],
            "strategic_recommendations": [
                {
                    "priority": "medium",
                    "action": "Review transformation metrics monthly",
                    "rationale": "Ensure continued progress tracking",
                    "expected_outcome": "Sustained improvement visibility",
                    "timeline": "Ongoing"
                }
            ],
            "risk_assessment": {
                "current_risks": ["Limited AI analysis available"],
                "mitigation_priority": "low",
                "recommended_actions": ["Configure Azure OpenAI for enhanced insights"]
            },
            "success_indicators": [
                {
                    "metric": "Overall transformation score",
                    "target": f"{min(10, overall_score + 2)}/10",
                    "timeframe": "6 months"
                }
            ],
            "ai_confidence_score": 0.3,
            "analysis_metadata": {
                "generated_by": "Fallback Analysis",
                "model_version": "Rule-based",
                "analysis_type": "Basic Transformation Review",
                "timestamp": None
            }
        }

# Global service instance
transformation_ai_service = TransformationAIService()
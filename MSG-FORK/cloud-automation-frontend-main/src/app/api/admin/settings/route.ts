import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

interface ApiSettings {
  github: {
    token: string
  }
  jira: {
    baseUrl: string
    token: string
    email: string
  }
}

const ENV_FILE_PATH = join(process.cwd(), '.env.local')

// Helper function to read current .env.local file
async function readEnvFile(): Promise<string> {
  try {
    return await readFile(ENV_FILE_PATH, 'utf-8')
  } catch (error) {
    console.error('Error reading .env.local:', error)
    return ''
  }
}

// Helper function to update environment variable in .env.local
async function updateEnvVariable(content: string, key: string, value: string): Promise<string> {
  const lines = content.split('\n')
  let updated = false
  
  const updatedLines = lines.map(line => {
    if (line.startsWith(`${key}=`)) {
      updated = true
      return `${key}=${value}`
    }
    return line
  })
  
  // If the key wasn't found, add it
  if (!updated) {
    updatedLines.push(`${key}=${value}`)
  }
  
  return updatedLines.join('\n')
}

// GET - Retrieve current settings (without exposing full tokens for security)
export async function GET() {
  try {
    const settings: ApiSettings = {
      github: {
        token: process.env.GITHUB_TOKEN ? `${process.env.GITHUB_TOKEN.substring(0, 8)}...` : ''
      },
      jira: {
        baseUrl: process.env.JIRA_BASE_URL || '',
        token: process.env.JIRA_API_TOKEN ? `${process.env.JIRA_API_TOKEN.substring(0, 8)}...` : '',
        email: process.env.JIRA_EMAIL || ''
      }
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error getting settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { github, jira } = body
    
    // Read current .env.local content
    let envContent = await readEnvFile()
    
    // Update GitHub settings
    if (github?.token) {
      envContent = await updateEnvVariable(envContent, 'GITHUB_TOKEN', github.token)
    }
    
    // Update Jira settings
    if (jira?.baseUrl) {
      envContent = await updateEnvVariable(envContent, 'JIRA_URL', jira.baseUrl)
    }
    if (jira?.token) {
      envContent = await updateEnvVariable(envContent, 'JIRA_API_TOKEN', jira.token)
    }
    if (jira?.email) {
      envContent = await updateEnvVariable(envContent, 'JIRA_EMAIL', jira.email)
    }
    
    // Write updated content back to .env.local
    await writeFile(ENV_FILE_PATH, envContent)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully. Please restart the application for changes to take effect.' 
    })
    
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// Test API tokens
export async function PUT(request: NextRequest) {
  try {
    const { service, token, ...config } = await request.json()
    
    if (service === 'github') {
      const testUrl = `https://api.github.com/user`
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'makestuffgo-admin-portal'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ 
          valid: true, 
          message: `GitHub token is valid. User: ${data.login}` 
        })
      } else {
        return NextResponse.json({ 
          valid: false, 
          message: `GitHub token test failed: ${response.status} ${response.statusText}` 
        })
      }
    }
    
    if (service === 'jira') {
      const testUrl = `${config.baseUrl || process.env.JIRA_URL}/rest/api/3/myself`
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.email || process.env.JIRA_EMAIL}:${token}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ 
          valid: true, 
          message: `Jira token is valid. User: ${data.displayName}` 
        })
      } else {
        return NextResponse.json({ 
          valid: false, 
          message: `Jira token test failed: ${response.status} ${response.statusText}` 
        })
      }
    }
    
    return NextResponse.json({ valid: false, message: 'Unknown service' })
    
  } catch (error) {
    console.error('Error testing token:', error)
    return NextResponse.json({ 
      valid: false, 
      message: `Token test failed: ${(error as Error).message}` 
    })
  }
}

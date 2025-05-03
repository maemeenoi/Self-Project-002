import Cookies from "js-cookie"

export const setAuthToken = (token) => {
  Cookies.set("token", token, { expires: 7 }) // Token expires in 7 days
}

export const getAuthToken = () => {
  return Cookies.get("token")
}

export const removeAuthToken = () => {
  Cookies.remove("token")
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

export const login = async (email, password) => {
  try {
    console.log("Attempting login...")
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    // Log the response status
    console.log("Response status:", response.status)

    // Try to get the response text first
    const text = await response.text()
    console.log("Response text:", text)

    // Try to parse as JSON if possible
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      throw new Error("Server returned invalid JSON")
    }

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    setAuthToken(data.token)
    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const register = async (name, email, password, phone) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, phone }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }

    setAuthToken(data.token)
    return data
  } catch (error) {
    throw error
  }
}

export const logout = () => {
  removeAuthToken()
  window.location.href = "/auth/login"
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

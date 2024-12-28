export const getBodyPartLabel = (partId) => {
  const labels = {
    leftArm: 'Left Arm',
    rightArm: 'Right Arm',
    chest: 'Chest',
    waistLine: 'Waistline',
    hips: 'Hips',
    glutes: 'Glutes',
    leftThigh: 'Left Thigh',
    rightThigh: 'Right Thigh',
    shoulders: 'Shoulders',
    leftForearm: 'Left Forearm',
    rightForearm: 'Right Forearm'
  }
  return labels[partId] || partId
}

export const MONTHS = [
  'September 2024',
  'October 2024',
  'November 2024',
  'December 2024',
  'January 2025',
  'February 2025',
  'March 2025',
  'April 2025'
]

export const getCurrentMonth = () => {
  const now = new Date()
  return MONTHS.find(month => {
    const [monthName, year] = month.split(' ')
    return now.getFullYear() === parseInt(year) && now.toLocaleString('default', { month: 'long' }) === monthName
  }) || MONTHS[0]
} 
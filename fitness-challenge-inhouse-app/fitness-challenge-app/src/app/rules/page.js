'use client'

export default function Rules() {
  const rules = [
    {
      id: 1,
      title: "Measurement Guidelines",
      content: "Measurements are in inches. Best time to measure is after waking up, after peeing or pooping and before drinking, showering or eating.",
      icon: "📏"
    },
    {
      id: 2,
      title: "Goal Changes - First Month",
      content: "We may change our goals only until after 1st month. To ensure our goals are realistic and achievable. (Inform the group before changing your goals).",
      icon: "🎯"
    },
    {
      id: 3,
      title: "Goal Changes - Restriction",
      content: "We can never change our goals from 2nd month of challenge onwards.",
      icon: "🚫"
    },
    {
      id: 4,
      title: "Withdrawal",
      content: "If become unfit to continue with the challenge, the decide to withdraw from the challenge.",
      icon: "⚠️"
    },
    {
      id: 5,
      title: "Contribution",
      content: "Each participant will contribute 125nzd to collect a winning prize of 500nzd. Please send your contribution to Gary's account before end of the year 31/12/2024",
      icon: "💰"
    },
    {
      id: 6,
      title: "Prize",
      content: "Only the participant whose results are closer or achieved a better result to the goals set will be given the winning prize of 500nzd.",
      icon: "🏆"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">RULES</h1>
        <p className="text-gray-600">Please read and understand all rules before participating in the challenge.</p>
      </div>

      <div className="space-y-6">
        {rules.map((rule) => (
          <div 
            key={rule.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{rule.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Rule {rule.id}: {rule.title}
                  </h3>
                  <p className="text-gray-700">{rule.content}</p>
                </div>
              </div>
            </div>
            {rule.id === 5 && (
              <div className="bg-yellow-50 p-4 border-t border-yellow-100">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Important:</span> Contribution deadline is December 31st, 2024
                </p>
              </div>
            )}
            {rule.id === 6 && (
              <div className="bg-green-50 p-4 border-t border-green-100">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <span className="font-semibold">Prize Pool:</span>
                  <span className="text-2xl">500nzd</span> 
                  <span className="text-yellow-500 text-2xl">🏆</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Remember</h3>
        <p className="text-blue-800">
          This challenge is about personal improvement and achieving your fitness goals. 
          Stay committed, be honest with your measurements, and support your fellow participants!
        </p>
      </div>
    </div>
  )
} 
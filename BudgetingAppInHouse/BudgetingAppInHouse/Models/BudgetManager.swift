import Foundation
import CoreData

class BudgetManager {
    static let shared = BudgetManager()
    
    private init() {}
    
    // Calculate the start and end dates for a budget period
    func calculatePeriodDates(from date: Date = Date(), period: String) -> (start: Date, end: Date) {
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        
        switch period.lowercased() {
        case "weekly":
            let endDate = calendar.date(byAdding: .day, value: 7, to: startOfDay)!
            return (startOfDay, endDate)
        case "fortnightly":
            let endDate = calendar.date(byAdding: .day, value: 14, to: startOfDay)!
            return (startOfDay, endDate)
        case "monthly":
            let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: startOfDay))!
            let endDate = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startOfMonth)!
            return (startOfMonth, endDate)
        default:
            let endDate = calendar.date(byAdding: .day, value: 14, to: startOfDay)! // Default to fortnightly
            return (startOfDay, endDate)
        }
    }
    
    // Create a new budget period
    func createBudgetPeriod(for budget: Budget, in context: NSManagedObjectContext) {
        let (startDate, endDate) = calculatePeriodDates(from: Date(), period: budget.period ?? "fortnightly")
        
        let newPeriod = BudgetPeriod(context: context)
        newPeriod.id = UUID()
        newPeriod.startDate = startDate
        newPeriod.endDate = endDate
        newPeriod.budget = budget
        
        // If rollover is enabled, calculate the rollover amount from the previous period
        if budget.rollover {
            if let previousPeriod = fetchLatestBudgetPeriod(for: budget, in: context) {
                let totalSpent = calculateTotalSpent(for: previousPeriod)
                let remainingAmount = budget.amount - totalSpent
                if remainingAmount > 0 {
                    newPeriod.rolloverAmount = remainingAmount
                }
            }
        }
        
        do {
            try context.save()
        } catch {
            print("Error saving budget period: \(error)")
        }
    }
    
    // Fetch the current budget period for a budget
    func getCurrentBudgetPeriod(for budget: Budget, in context: NSManagedObjectContext) -> BudgetPeriod? {
        let request: NSFetchRequest<BudgetPeriod> = BudgetPeriod.fetchRequest()
        request.predicate = NSPredicate(
            format: "budget == %@ AND startDate <= %@ AND endDate >= %@",
            budget,
            Date() as NSDate,
            Date() as NSDate
        )
        request.sortDescriptors = [NSSortDescriptor(keyPath: \BudgetPeriod.startDate, ascending: false)]
        request.fetchLimit = 1
        
        return try? context.fetch(request).first
    }
    
    // Fetch the latest budget period for a budget
    private func fetchLatestBudgetPeriod(for budget: Budget, in context: NSManagedObjectContext) -> BudgetPeriod? {
        let request: NSFetchRequest<BudgetPeriod> = BudgetPeriod.fetchRequest()
        request.predicate = NSPredicate(format: "budget == %@", budget)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \BudgetPeriod.endDate, ascending: false)]
        request.fetchLimit = 1
        
        return try? context.fetch(request).first
    }
    
    // Calculate total spent for a budget period
    func calculateTotalSpent(for period: BudgetPeriod) -> Double {
        let expenses = period.expenses?.allObjects as? [Expense] ?? []
        return expenses.reduce(0) { $0 + $1.amount }
    }
    
    // Calculate remaining amount for a budget period
    func calculateRemainingAmount(for period: BudgetPeriod) -> Double {
        guard let budget = period.budget else { return 0 }
        let totalBudget = budget.amount + (period.rolloverAmount)
        let totalSpent = calculateTotalSpent(for: period)
        return max(totalBudget - totalSpent, 0)
    }
    
    // Check if we need to create a new budget period
    func checkAndCreateNewPeriodIfNeeded(for budget: Budget, in context: NSManagedObjectContext) {
        guard let currentPeriod = getCurrentBudgetPeriod(for: budget, in: context) else {
            createBudgetPeriod(for: budget, in: context)
            return
        }
        
        // If current period is ending today or has ended, create a new period
        if currentPeriod.endDate ?? Date() <= Date() {
            createBudgetPeriod(for: budget, in: context)
        }
    }
} 
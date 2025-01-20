import Foundation
import CoreData

class IncomeManager {
    static let shared = IncomeManager()
    
    private init() {}
    
    func createIncome(
        name: String,
        amount: Double,
        source: String,
        date: Date,
        notes: String?,
        isRecurring: Bool,
        recurringFrequency: String?,
        in context: NSManagedObjectContext
    ) {
        let income = Income(context: context)
        income.id = UUID()
        income.name = name
        income.amount = amount
        income.source = source
        income.date = date
        income.notes = notes
        income.isRecurring = isRecurring
        income.recurringFrequency = recurringFrequency
        
        do {
            try context.save()
            if isRecurring {
                scheduleNextRecurringIncome(income: income, in: context)
            }
        } catch {
            let nsError = error as NSError
            fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
        }
    }
    
    func scheduleNextRecurringIncome(income: Income, in context: NSManagedObjectContext) {
        guard income.isRecurring,
              let frequency = income.recurringFrequency,
              let currentDate = income.date else { return }
        
        let calendar = Calendar.current
        var nextDate: Date
        
        switch frequency {
        case "Weekly":
            nextDate = calendar.date(byAdding: .weekOfYear, value: 1, to: currentDate) ?? currentDate
        case "Fortnightly":
            nextDate = calendar.date(byAdding: .weekOfYear, value: 2, to: currentDate) ?? currentDate
        case "Monthly":
            nextDate = calendar.date(byAdding: .month, value: 1, to: currentDate) ?? currentDate
        case "Quarterly":
            nextDate = calendar.date(byAdding: .month, value: 3, to: currentDate) ?? currentDate
        case "Yearly":
            nextDate = calendar.date(byAdding: .year, value: 1, to: currentDate) ?? currentDate
        default:
            return
        }
        
        createIncome(
            name: income.name ?? "",
            amount: income.amount,
            source: income.source ?? "",
            date: nextDate,
            notes: income.notes,
            isRecurring: true,
            recurringFrequency: frequency,
            in: context
        )
    }
    
    func getTotalIncome(for period: DateInterval, in context: NSManagedObjectContext) -> Double {
        let fetchRequest: NSFetchRequest<Income> = Income.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "date >= %@ AND date <= %@", period.start as NSDate, period.end as NSDate)
        
        do {
            let incomes = try context.fetch(fetchRequest)
            return incomes.reduce(0) { $0 + $1.amount }
        } catch {
            print("Error fetching incomes: \(error)")
            return 0
        }
    }
    
    func getAverageMonthlyIncome(for months: Int, in context: NSManagedObjectContext) -> Double {
        let calendar = Calendar.current
        let now = Date()
        guard let startDate = calendar.date(byAdding: .month, value: -months, to: now) else { return 0 }
        
        let period = DateInterval(start: startDate, end: now)
        let total = getTotalIncome(for: period, in: context)
        
        return total / Double(months)
    }
    
    func getIncomeBySource(for period: DateInterval, in context: NSManagedObjectContext) -> [String: Double] {
        let fetchRequest: NSFetchRequest<Income> = Income.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "date >= %@ AND date <= %@", period.start as NSDate, period.end as NSDate)
        
        do {
            let incomes = try context.fetch(fetchRequest)
            var sourceMap: [String: Double] = [:]
            
            for income in incomes {
                let source = income.source ?? "Other"
                sourceMap[source, default: 0] += income.amount
            }
            
            return sourceMap
        } catch {
            print("Error fetching incomes by source: \(error)")
            return [:]
        }
    }
    
    func deleteIncome(_ income: Income, in context: NSManagedObjectContext) {
        context.delete(income)
        
        do {
            try context.save()
        } catch {
            let nsError = error as NSError
            fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
        }
    }
} 
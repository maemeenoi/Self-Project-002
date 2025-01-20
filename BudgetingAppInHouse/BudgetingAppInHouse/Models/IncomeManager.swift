import Foundation
import CoreData

class IncomeManager {
    static let shared = IncomeManager()
    
    private init() {}
    
    // Add new income
    func addIncome(name: String, amount: Double, source: String, date: Date, isRecurring: Bool = false, recurringFrequency: String? = nil, notes: String? = nil, in context: NSManagedObjectContext) {
        let income = Income(context: context)
        income.id = UUID()
        income.name = name
        income.amount = amount
        income.source = source
        income.date = date
        income.isRecurring = isRecurring
        income.recurringFrequency = recurringFrequency
        income.notes = notes
        
        do {
            try context.save()
        } catch {
            print("Error saving income: \(error)")
        }
    }
    
    // Get total income for a period
    func getTotalIncome(from startDate: Date, to endDate: Date, in context: NSManagedObjectContext) -> Double {
        let request: NSFetchRequest<Income> = Income.fetchRequest()
        request.predicate = NSPredicate(
            format: "date >= %@ AND date <= %@",
            startDate as NSDate,
            endDate as NSDate
        )
        
        do {
            let incomes = try context.fetch(request)
            return incomes.reduce(0) { $0 + $1.amount }
        } catch {
            print("Error fetching income: \(error)")
            return 0
        }
    }
    
    // Get income by source
    func getIncomeBySource(from startDate: Date, to endDate: Date, in context: NSManagedObjectContext) -> [String: Double] {
        let request: NSFetchRequest<Income> = Income.fetchRequest()
        request.predicate = NSPredicate(
            format: "date >= %@ AND date <= %@",
            startDate as NSDate,
            endDate as NSDate
        )
        
        do {
            let incomes = try context.fetch(request)
            var sourceMap: [String: Double] = [:]
            
            for income in incomes {
                let source = income.source ?? "Other"
                sourceMap[source, default: 0] += income.amount
            }
            
            return sourceMap
        } catch {
            print("Error fetching income by source: \(error)")
            return [:]
        }
    }
    
    // Get recurring income
    func getRecurringIncome(in context: NSManagedObjectContext) -> [Income] {
        let request: NSFetchRequest<Income> = Income.fetchRequest()
        request.predicate = NSPredicate(format: "isRecurring == YES")
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Income.date, ascending: false)]
        
        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching recurring income: \(error)")
            return []
        }
    }
    
    // Calculate monthly average income
    func calculateMonthlyAverageIncome(for months: Int = 3, in context: NSManagedObjectContext) -> Double {
        let calendar = Calendar.current
        let endDate = Date()
        guard let startDate = calendar.date(byAdding: .month, value: -months, to: endDate) else {
            return 0
        }
        
        let totalIncome = getTotalIncome(from: startDate, to: endDate, in: context)
        return totalIncome / Double(months)
    }
    
    // Get income sources
    func getIncomeSources(in context: NSManagedObjectContext) -> [String] {
        let request: NSFetchRequest<NSFetchRequestResult> = Income.fetchRequest()
        request.propertiesToFetch = ["source"]
        request.returnsDistinctResults = true
        request.resultType = .dictionaryResultType
        
        do {
            let results = try context.fetch(request) as? [[String: String]] ?? []
            return results.compactMap { $0["source"] }.sorted()
        } catch {
            print("Error fetching income sources: \(error)")
            return []
        }
    }
    
    // Delete income
    func deleteIncome(_ income: Income, in context: NSManagedObjectContext) {
        context.delete(income)
        
        do {
            try context.save()
        } catch {
            print("Error deleting income: \(error)")
        }
    }
} 
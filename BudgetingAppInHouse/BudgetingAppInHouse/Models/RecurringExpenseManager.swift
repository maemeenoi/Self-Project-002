import Foundation
import CoreData

class RecurringExpenseManager {
    static let shared = RecurringExpenseManager()
    
    private init() {}
    
    // Calculate the next due date based on frequency
    func calculateNextDueDate(from date: Date, frequency: String) -> Date {
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        
        switch frequency.lowercased() {
        case "daily":
            return calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        case "weekly":
            return calendar.date(byAdding: .weekOfYear, value: 1, to: startOfDay)!
        case "fortnightly":
            return calendar.date(byAdding: .day, value: 14, to: startOfDay)!
        case "monthly":
            return calendar.date(byAdding: .month, value: 1, to: startOfDay)!
        case "yearly":
            return calendar.date(byAdding: .year, value: 1, to: startOfDay)!
        default:
            return calendar.date(byAdding: .month, value: 1, to: startOfDay)! // Default to monthly
        }
    }
    
    // Create a recurring expense
    func createRecurringExpense(name: String, amount: Double, category: String, frequency: String, paymentMethod: String, startDate: Date, in context: NSManagedObjectContext) {
        let recurringExpense = RecurringExpense(context: context)
        recurringExpense.id = UUID()
        recurringExpense.name = name
        recurringExpense.amount = amount
        recurringExpense.category = category
        recurringExpense.frequency = frequency
        recurringExpense.paymentMethod = paymentMethod
        recurringExpense.nextDueDate = startDate
        
        do {
            try context.save()
        } catch {
            print("Error saving recurring expense: \(error)")
        }
    }
    
    // Process due recurring expenses
    func processDueRecurringExpenses(in context: NSManagedObjectContext) {
        let request: NSFetchRequest<RecurringExpense> = RecurringExpense.fetchRequest()
        request.predicate = NSPredicate(format: "nextDueDate <= %@", Date() as NSDate)
        
        do {
            let dueExpenses = try context.fetch(request)
            for recurringExpense in dueExpenses {
                // Create the expense
                let expense = Expense(context: context)
                expense.id = UUID()
                expense.amount = recurringExpense.amount
                expense.category = recurringExpense.category
                expense.date = recurringExpense.nextDueDate
                expense.paymentMethod = recurringExpense.paymentMethod
                expense.isFixed = true
                expense.notes = "Recurring: \(recurringExpense.name ?? "")"
                expense.recurringExpense = recurringExpense
                
                // Update AMEX balance if applicable
                if recurringExpense.paymentMethod == "AMEX" {
                    updateAmexBalance(amount: recurringExpense.amount, in: context)
                }
                
                // Calculate and set next due date
                recurringExpense.lastProcessedDate = recurringExpense.nextDueDate
                recurringExpense.nextDueDate = calculateNextDueDate(
                    from: recurringExpense.nextDueDate ?? Date(),
                    frequency: recurringExpense.frequency ?? "monthly"
                )
            }
            
            try context.save()
        } catch {
            print("Error processing recurring expenses: \(error)")
        }
    }
    
    // Update AMEX balance
    private func updateAmexBalance(amount: Double, in context: NSManagedObjectContext) {
        let request: NSFetchRequest<CreditCard> = CreditCard.fetchRequest()
        request.predicate = NSPredicate(format: "name == %@", "AMEX")
        
        do {
            let cards = try context.fetch(request)
            if let amexCard = cards.first {
                amexCard.currentBalance += amount
                try context.save()
            }
        } catch {
            print("Error updating AMEX balance: \(error)")
        }
    }
    
    // Get upcoming recurring expenses
    func getUpcomingRecurringExpenses(in context: NSManagedObjectContext, limit: Int = 5) -> [RecurringExpense] {
        let request: NSFetchRequest<RecurringExpense> = RecurringExpense.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \RecurringExpense.nextDueDate, ascending: true)]
        request.fetchLimit = limit
        
        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching upcoming recurring expenses: \(error)")
            return []
        }
    }
} 
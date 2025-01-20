import SwiftUI
import CoreData

struct BudgetView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Budget.category, ascending: true)],
        animation: .default)
    private var budgets: FetchedResults<Budget>
    
    @State private var showingAddBudget = false
    @State private var selectedPeriod = "Fortnightly"
    @State private var showingRecurringExpenses = false
    
    let periods = ["Weekly", "Fortnightly", "Monthly"]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Period Summary Card
                    PeriodSummaryCard(budgets: budgets)
                    
                    // Budget Categories
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("💰 Budget Categories")
                                .font(.title3)
                                .bold()
                            Spacer()
                            Button(action: { showingAddBudget = true }) {
                                Label("Add", systemImage: "plus.circle.fill")
                                    .font(.subheadline)
                                    .foregroundColor(.blue)
                                    .padding(8)
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(8)
                            }
                        }
                        
                        if budgets.isEmpty {
                            EmptyBudgetView()
                        } else {
                            ForEach(budgets) { budget in
                                BudgetDetailCard(budget: budget)
                            }
                            .onDelete(perform: deleteBudgets)
                        }
                    }
                    .padding()
                    .background(Color(UIColor.systemBackground))
                    .cornerRadius(15)
                    .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                    
                    // Recurring Expenses Button
                    Button(action: { showingRecurringExpenses = true }) {
                        HStack {
                            Image(systemName: "repeat.circle.fill")
                                .font(.title2)
                            Text("Manage Recurring Expenses")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(15)
                    }
                }
                .padding()
            }
            .navigationTitle("Budget")
            .sheet(isPresented: $showingAddBudget) {
                AddBudgetView()
            }
            .sheet(isPresented: $showingRecurringExpenses) {
                RecurringExpensesView()
            }
        }
    }
    
    private func deleteBudgets(offsets: IndexSet) {
        withAnimation {
            offsets.map { budgets[$0] }.forEach(viewContext.delete)
            do {
                try viewContext.save()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
}

struct PeriodSummaryCard: View {
    let budgets: FetchedResults<Budget>
    @Environment(\.managedObjectContext) private var viewContext
    
    var totalBudget: Double {
        budgets.reduce(0) { total, budget in
            if let period = BudgetManager.shared.getCurrentBudgetPeriod(for: budget, in: viewContext) {
                return total + budget.amount + (period.rolloverAmount)
            }
            return total + budget.amount
        }
    }
    
    var totalSpent: Double {
        budgets.reduce(0) { total, budget in
            if let period = BudgetManager.shared.getCurrentBudgetPeriod(for: budget, in: viewContext) {
                return total + BudgetManager.shared.calculateTotalSpent(for: period)
            }
            return total
        }
    }
    
    var totalRemaining: Double {
        totalBudget - totalSpent
    }
    
    var progress: Double {
        guard totalBudget > 0 else { return 0 }
        return min(totalSpent / totalBudget, 1.0)
    }
    
    var color: Color {
        if progress >= 0.9 { return .red }
        if progress >= 0.7 { return .orange }
        return .green
    }
    
    var body: some View {
        VStack(spacing: 15) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Current Period")
                        .font(.headline)
                    if let firstBudget = budgets.first,
                       let currentPeriod = BudgetManager.shared.getCurrentBudgetPeriod(for: firstBudget, in: viewContext) {
                        Text("\(currentPeriod.startDate ?? Date(), style: .date) - \(currentPeriod.endDate ?? Date(), style: .date)")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                }
                Spacer()
            }
            
            HStack(spacing: 20) {
                VStack(alignment: .leading) {
                    Text("Total Budget")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("$\(totalBudget, specifier: "%.2f")")
                        .font(.headline)
                }
                
                Divider()
                
                VStack(alignment: .leading) {
                    Text("Spent")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("$\(totalSpent, specifier: "%.2f")")
                        .font(.headline)
                        .foregroundColor(.red)
                }
                
                Divider()
                
                VStack(alignment: .leading) {
                    Text("Remaining")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("$\(totalRemaining, specifier: "%.2f")")
                        .font(.headline)
                        .foregroundColor(color)
                }
            }
            
            ProgressView(value: progress)
                .tint(color)
                .background(Color.gray.opacity(0.2))
                .scaleEffect(x: 1, y: 2, anchor: .center)
        }
        .padding()
        .background(Color(UIColor.systemBackground))
        .cornerRadius(15)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct BudgetDetailCard: View {
    let budget: Budget
    @Environment(\.managedObjectContext) private var viewContext
    @State private var showingEditSheet = false
    
    var currentPeriod: BudgetPeriod? {
        BudgetManager.shared.getCurrentBudgetPeriod(for: budget, in: viewContext)
    }
    
    var totalBudget: Double {
        budget.amount + (currentPeriod?.rolloverAmount ?? 0)
    }
    
    var totalSpent: Double {
        if let period = currentPeriod {
            return BudgetManager.shared.calculateTotalSpent(for: period)
        }
        return 0
    }
    
    var remainingAmount: Double {
        totalBudget - totalSpent
    }
    
    var progress: Double {
        guard totalBudget > 0 else { return 0 }
        return min(totalSpent / totalBudget, 1.0)
    }
    
    var color: Color {
        if progress >= 0.9 { return .red }
        if progress >= 0.7 { return .orange }
        return .green
    }
    
    var icon: String {
        switch budget.category {
        case "Food": return "🍽️"
        case "Transport": return "🚗"
        case "Entertainment": return "🎮"
        case "Shopping": return "🛍️"
        case "Bills": return "📱"
        case "Rent": return "🏠"
        default: return "💰"
        }
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("\(icon) \(budget.category ?? "")")
                    .font(.headline)
                Spacer()
                Button(action: { showingEditSheet = true }) {
                    Image(systemName: "pencil.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            
            VStack(spacing: 8) {
                HStack {
                    Text("Base Budget:")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    Spacer()
                    Text("$\(budget.amount, specifier: "%.2f")")
                        .font(.subheadline)
                }
                
                if let rollover = currentPeriod?.rolloverAmount, rollover > 0 {
                    HStack {
                        Text("Rollover:")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                        Spacer()
                        Text("+$\(rollover, specifier: "%.2f")")
                            .font(.subheadline)
                            .foregroundColor(.green)
                    }
                }
                
                HStack {
                    Text("Spent:")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    Spacer()
                    Text("-$\(totalSpent, specifier: "%.2f")")
                        .font(.subheadline)
                        .foregroundColor(.red)
                }
                
                Divider()
                
                HStack {
                    Text("Remaining:")
                        .font(.headline)
                    Spacer()
                    Text("$\(remainingAmount, specifier: "%.2f")")
                        .font(.headline)
                        .foregroundColor(color)
                }
            }
            
            ProgressView(value: 1 - progress)
                .tint(color)
                .background(Color.gray.opacity(0.2))
                .scaleEffect(x: 1, y: 1.5, anchor: .center)
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(color.opacity(0.3), lineWidth: 1)
        )
        .sheet(isPresented: $showingEditSheet) {
            EditBudgetView(budget: budget)
        }
    }
}

struct EmptyBudgetView: View {
    var body: some View {
        VStack(spacing: 15) {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 40))
                .foregroundColor(.blue)
            Text("No budgets set yet")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Add your first budget category to start tracking expenses")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 30)
        .background(Color.blue.opacity(0.05))
        .cornerRadius(15)
    }
}

struct EditBudgetView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    let budget: Budget
    
    @State private var amount: String
    @State private var category: String
    @State private var period: String
    @State private var rollover: Bool
    
    let periods = ["Weekly", "Fortnightly", "Monthly"]
    let categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Rent", "Other"]
    
    init(budget: Budget) {
        self.budget = budget
        _amount = State(initialValue: String(budget.amount))
        _category = State(initialValue: budget.category ?? "")
        _period = State(initialValue: budget.period ?? "Fortnightly")
        _rollover = State(initialValue: budget.rollover)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Budget Details")) {
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                    
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                    
                    Picker("Period", selection: $period) {
                        ForEach(periods, id: \.self) { period in
                            Text(period).tag(period)
                        }
                    }
                    
                    Toggle("Enable Rollover", isOn: $rollover)
                }
                
                Section {
                    Button("Delete Budget", role: .destructive) {
                        deleteBudget()
                    }
                }
            }
            .navigationTitle("Edit Budget")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    updateBudget()
                }
            )
        }
    }
    
    private func updateBudget() {
        guard let amountDouble = Double(amount) else { return }
        
        withAnimation {
            budget.amount = amountDouble
            budget.category = category
            budget.period = period
            budget.rollover = rollover
            
            do {
                try viewContext.save()
                // Create new budget period if needed
                BudgetManager.shared.checkAndCreateNewPeriodIfNeeded(for: budget, in: viewContext)
                dismiss()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    private func deleteBudget() {
        withAnimation {
            viewContext.delete(budget)
            do {
                try viewContext.save()
                dismiss()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
}

#Preview {
    BudgetView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
} 
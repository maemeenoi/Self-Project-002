import SwiftUI
import CoreData

struct DashboardView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Expense.date, ascending: false)],
        animation: .default)
    private var expenses: FetchedResults<Expense>
    
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \CreditCard.name, ascending: true)],
        animation: .default)
    private var creditCards: FetchedResults<CreditCard>
    
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Budget.category, ascending: true)],
        animation: .default)
    private var budgets: FetchedResults<Budget>
    
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \SavingsGoal.name, ascending: true)],
        animation: .default)
    private var savingsGoals: FetchedResults<SavingsGoal>
    
    @State private var selectedCard: CreditCard?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Budget Overview - Now First
                    BudgetSummaryView(budgets: budgets)
                    
                    // Recent Transactions - Second
                    RecentTransactionsView(expenses: Array(expenses.prefix(5)))
                    
                    // Credit Card Summary - If exists
                    if !creditCards.isEmpty {
                        ForEach(creditCards) { card in
                            CreditCardSummaryView(card: card) {
                                selectedCard = card
                            }
                        }
                    }
                    
                    // Savings Goals Progress
                    SavingsGoalsView(savingsGoals: savingsGoals)
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .sheet(item: $selectedCard) { card in
                EditCreditCardView(card: card)
            }
        }
    }
}

struct BudgetSummaryView: View {
    let budgets: FetchedResults<Budget>
    @State private var showingAddBudget = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("💰 Fortnightly Budget")
                    .font(.title2)
                    .bold()
                Spacer()
                NavigationLink(destination: BudgetView()) {
                    Label("Edit Budget", systemImage: "square.and.pencil")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                        .padding(8)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)
                }
            }
            
            if budgets.isEmpty {
                VStack(alignment: .center, spacing: 15) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.blue)
                    Text("No budgets set yet")
                        .font(.headline)
                        .foregroundColor(.gray)
                    NavigationLink(destination: BudgetView()) {
                        Text("Set up your budget")
                            .font(.subheadline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.blue)
                            .cornerRadius(10)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 30)
                .background(Color.blue.opacity(0.05))
                .cornerRadius(15)
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 15) {
                    ForEach(budgets) { budget in
                        BudgetCategoryCard(budget: budget)
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color(UIColor.systemBackground))
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
        )
    }
}

struct CreditCardSummaryView: View {
    let card: CreditCard
    let onEdit: () -> Void
    
    var progress: Double {
        guard card.creditLimit > 0 else { return 0 }
        return min(card.currentBalance / card.creditLimit, 1.0)
    }
    
    var color: Color {
        if progress >= 0.9 { return .red }
        if progress >= 0.7 { return .orange }
        return .blue
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(card.name ?? "Credit Card")
                    .font(.headline)
                Spacer()
                Button(action: onEdit) {
                    Image(systemName: "pencil.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            
            RoundedRectangle(cornerRadius: 15)
                .fill(color.opacity(0.1))
                .frame(height: 100)
                .overlay(
                    VStack(alignment: .leading) {
                        Text("Balance")
                            .font(.subheadline)
                        Text("$\(card.currentBalance, specifier: "%.2f") / $\(card.creditLimit, specifier: "%.2f")")
                            .font(.title2)
                            .bold()
                        ProgressView(value: progress)
                            .tint(color)
                    }
                    .padding()
                )
        }
    }
}

struct EditCreditCardView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    let card: CreditCard
    
    @State private var name: String
    @State private var creditLimit: String
    @State private var currentBalance: String
    @State private var billDate: Date
    
    init(card: CreditCard) {
        self.card = card
        _name = State(initialValue: card.name ?? "")
        _creditLimit = State(initialValue: String(card.creditLimit))
        _currentBalance = State(initialValue: String(card.currentBalance))
        _billDate = State(initialValue: card.billDate ?? Date())
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Card Details")) {
                    TextField("Card Name", text: $name)
                    TextField("Credit Limit", text: $creditLimit)
                        .keyboardType(.decimalPad)
                    TextField("Current Balance", text: $currentBalance)
                        .keyboardType(.decimalPad)
                    DatePicker("Bill Date", selection: $billDate, displayedComponents: .date)
                }
                
                Section {
                    Button("Delete Card", role: .destructive) {
                        deleteCard()
                    }
                }
            }
            .navigationTitle("Edit Credit Card")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    updateCard()
                }
            )
        }
    }
    
    private func updateCard() {
        guard let limitDouble = Double(creditLimit),
              let balanceDouble = Double(currentBalance) else { return }
        
        withAnimation {
            card.name = name
            card.creditLimit = limitDouble
            card.currentBalance = balanceDouble
            card.billDate = billDate
            
            do {
                try viewContext.save()
                dismiss()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    private func deleteCard() {
        withAnimation {
            viewContext.delete(card)
            
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

struct BudgetCategoryCard: View {
    let budget: Budget
    @FetchRequest private var expenses: FetchedResults<Expense>
    
    init(budget: Budget) {
        self.budget = budget
        let request: NSFetchRequest<Expense> = Expense.fetchRequest()
        request.predicate = NSPredicate(format: "category == %@ AND date >= %@", 
                                      budget.category ?? "",
                                      (budget.startDate ?? Date()) as CVarArg)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Expense.date, ascending: true)]
        _expenses = FetchRequest(fetchRequest: request)
    }
    
    var totalSpent: Double {
        expenses.reduce(0) { $0 + $1.amount }
    }
    
    var remainingAmount: Double {
        max(budget.amount - totalSpent, 0)
    }
    
    var progress: Double {
        guard budget.amount > 0 else { return 0 }
        return min(totalSpent / budget.amount, 1.0)
    }
    
    var color: Color {
        if remainingAmount <= (budget.amount * 0.1) { return .red }
        if remainingAmount <= (budget.amount * 0.3) { return .orange }
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
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(icon)
                    .font(.title2)
                Text(budget.category ?? "")
                    .font(.headline)
                    .foregroundColor(.primary)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Remaining:")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("$\(remainingAmount, specifier: "%.2f")")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(color)
            }
            
            ProgressView(value: 1 - progress)
                .tint(color)
                .background(Color.gray.opacity(0.2))
                .scaleEffect(x: 1, y: 1.5, anchor: .center)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(UIColor.secondarySystemBackground))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(color.opacity(0.3), lineWidth: 1)
        )
    }
}

struct RecentTransactionsView: View {
    let expenses: [Expense]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("📊 Recent Transactions")
                    .font(.title3)
                    .bold()
                Spacer()
                NavigationLink(destination: ExpensesView()) {
                    Text("See All")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
            }
            
            if expenses.isEmpty {
                Text("No transactions yet")
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
            } else {
                ForEach(expenses) { expense in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(expense.category ?? "")
                                .font(.headline)
                            Text(expense.date ?? Date(), style: .date)
                                .font(.caption)
                                .foregroundColor(.gray)
                            if let notes = expense.notes, !notes.isEmpty {
                                Text(notes)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                        Spacer()
                        Text("-$\(expense.amount, specifier: "%.2f")")
                            .bold()
                            .foregroundColor(.red)
                    }
                    .padding(.vertical, 8)
                    .padding(.horizontal)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(10)
                }
            }
        }
        .padding()
        .background(Color(UIColor.systemBackground))
        .cornerRadius(15)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct SavingsGoalsView: View {
    let savingsGoals: FetchedResults<SavingsGoal>
    @State private var showingAddGoal = false
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Savings Goals")
                    .font(.headline)
                Spacer()
                Button(action: { showingAddGoal = true }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            
            if savingsGoals.isEmpty {
                Text("No savings goals yet")
                    .foregroundColor(.gray)
                    .padding()
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 15) {
                        ForEach(savingsGoals) { goal in
                            SavingsGoalCard(goal: goal)
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddGoal) {
            AddSavingsGoalView()
        }
    }
}

struct SavingsGoalCard: View {
    let goal: SavingsGoal
    @State private var showingAddProgress = false
    
    var progress: Double {
        guard goal.targetAmount > 0 else { return 0 }
        return min(goal.currentAmount / goal.targetAmount, 1.0)
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(goal.name ?? "")
                    .font(.subheadline)
                Spacer()
                Button(action: { showingAddProgress = true }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            Text("$\(goal.currentAmount, specifier: "%.2f")/$\(goal.targetAmount, specifier: "%.2f")")
                .font(.caption)
            ProgressView(value: progress)
                .tint(.blue)
            if let deadline = goal.deadline {
                Text("Due: \(deadline, style: .date)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .frame(width: 200)
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(10)
        .sheet(isPresented: $showingAddProgress) {
            AddProgressView(goal: goal)
        }
    }
}

#Preview {
    DashboardView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
} 
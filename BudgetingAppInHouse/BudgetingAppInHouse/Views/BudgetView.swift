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
    let periods = ["Weekly", "Fortnightly", "Monthly"]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Period Picker
                VStack(alignment: .leading, spacing: 10) {
                    Text("Select Period")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Picker("Period", selection: $selectedPeriod) {
                        ForEach(periods, id: \.self) { period in
                            Text(period).tag(period)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(15)
                
                // Budget Categories
                VStack(alignment: .leading, spacing: 15) {
                    HStack {
                        Text("💰 Budget Categories")
                            .font(.title2)
                            .bold()
                        Spacer()
                        Button(action: { showingAddBudget = true }) {
                            Label("Add Category", systemImage: "plus.circle.fill")
                                .font(.subheadline)
                                .foregroundColor(.blue)
                                .padding(8)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                    
                    if budgets.isEmpty {
                        VStack(spacing: 15) {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.blue)
                            Text("No budget categories yet")
                                .font(.headline)
                                .foregroundColor(.gray)
                            Button(action: { showingAddBudget = true }) {
                                Text("Add your first category")
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
                        ForEach(budgets) { budget in
                            BudgetRowView(budget: budget)
                        }
                        .onDelete(perform: deleteBudgets)
                    }
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
            }
            .padding()
        }
        .navigationTitle("Budget Setup")
        .sheet(isPresented: $showingAddBudget) {
            AddBudgetView()
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

struct BudgetRowView: View {
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
        VStack(spacing: 12) {
            HStack {
                Text(icon)
                    .font(.title2)
                VStack(alignment: .leading) {
                    Text(budget.category ?? "")
                        .font(.headline)
                    Text(budget.period ?? "")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Text("$\(budget.amount, specifier: "%.2f")")
                    .font(.headline)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Remaining:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("$\(remainingAmount, specifier: "%.2f")")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(color)
                }
                
                ProgressView(value: 1 - progress)
                    .tint(color)
                    .background(Color.gray.opacity(0.2))
                    .scaleEffect(x: 1, y: 1.5, anchor: .center)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(color.opacity(0.3), lineWidth: 1)
        )
    }
}

struct AddBudgetView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var amount: String = ""
    @State private var category: String = ""
    @State private var period: String = "Fortnightly"
    @State private var startDate = Date()
    
    let periods = ["Weekly", "Fortnightly", "Monthly"]
    let categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Rent", "Other"]
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                        .font(.system(size: 34, weight: .bold))
                        .multilineTextAlignment(.center)
                        .padding(.vertical)
                }
                .listRowBackground(Color.clear)
                
                Section(header: Text("Category").textCase(.uppercase)) {
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { category in
                            HStack {
                                Text(categoryIcon(category))
                                Text(category)
                            }.tag(category)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section(header: Text("Period").textCase(.uppercase)) {
                    Picker("Period", selection: $period) {
                        ForEach(periods, id: \.self) { period in
                            Text(period).tag(period)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    DatePicker("Start Date", selection: $startDate, displayedComponents: .date)
                }
            }
            .navigationTitle("New Budget")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveBudget()
                }
                .disabled(amount.isEmpty || category.isEmpty)
            )
        }
    }
    
    private func categoryIcon(_ category: String) -> String {
        switch category {
        case "Food": return "🍽️"
        case "Transport": return "🚗"
        case "Entertainment": return "🎮"
        case "Shopping": return "🛍️"
        case "Bills": return "📱"
        case "Rent": return "🏠"
        default: return "💰"
        }
    }
    
    private func saveBudget() {
        guard let amountDouble = Double(amount), !category.isEmpty else { return }
        
        withAnimation {
            let newBudget = Budget(context: viewContext)
            newBudget.id = UUID()
            newBudget.amount = amountDouble
            newBudget.category = category
            newBudget.period = period
            newBudget.startDate = startDate
            
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
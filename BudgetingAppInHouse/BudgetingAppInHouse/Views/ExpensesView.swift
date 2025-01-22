import SwiftUI
import CoreData

struct ExpensesView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Expense.date, ascending: false)],
        animation: .default)
    private var expenses: FetchedResults<Expense>
    
    @State private var showingAddExpense = false
    @State private var selectedFilter: ExpenseFilter = .all
    
    enum ExpenseFilter: String, CaseIterable {
        case all = "All"
        case fixed = "Fixed"
        case nonFixed = "Non-Fixed"
    }
    
    var filteredExpenses: [Expense] {
        switch selectedFilter {
        case .all:
            return Array(expenses)
        case .fixed:
            return expenses.filter { $0.isFixed }
        case .nonFixed:
            return expenses.filter { !$0.isFixed }
        }
    }
    
    var totalExpenses: Double {
        filteredExpenses.reduce(0) { $0 + $1.amount }
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Total Expenses Summary
                VStack(spacing: 15) {
                    HStack {
                        Text("💸 Total Expenses")
                            .font(.title2)
                            .bold()
                        Spacer()
                        Button(action: { showingAddExpense = true }) {
                            Label("Add Expense", systemImage: "plus.circle.fill")
                                .font(.subheadline)
                                .foregroundColor(.blue)
                                .padding(8)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                    
                    Text("$\(totalExpenses, specifier: "%.2f")")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(.red)
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                
                // Filter
                VStack(alignment: .leading, spacing: 10) {
                    Text("Filter")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Picker("Filter", selection: $selectedFilter) {
                        ForEach(ExpenseFilter.allCases, id: \.self) { filter in
                            Text(filter.rawValue).tag(filter)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(15)
                
                // Expenses List
                VStack(alignment: .leading, spacing: 15) {
                    Text("📝 Transactions")
                        .font(.title2)
                        .bold()
                    
                    if filteredExpenses.isEmpty {
                        VStack(spacing: 15) {
                            Image(systemName: "doc.text.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.blue)
                            Text("No expenses yet")
                                .font(.headline)
                                .foregroundColor(.gray)
                            Button(action: { showingAddExpense = true }) {
                                Text("Add your first expense")
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
                        ForEach(filteredExpenses) { expense in
                            ExpenseRow(expense: expense)
                        }
                        .onDelete(perform: deleteExpenses)
                    }
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
            }
            .padding()
        }
        .navigationTitle("Expenses")
        .sheet(isPresented: $showingAddExpense) {
            AddExpenseView()
        }
    }
    
    private func deleteExpenses(offsets: IndexSet) {
        withAnimation {
            offsets.map { filteredExpenses[$0] }.forEach(viewContext.delete)
            
            do {
                try viewContext.save()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
}

struct ExpenseRow: View {
    let expense: Expense
    
    var icon: String {
        switch expense.category?.lowercased() {
        case "food": return "🍽️"
        case "transport": return "🚗"
        case "entertainment": return "🎮"
        case "shopping": return "🛍️"
        case "bills": return "📱"
        case "rent": return "🏠"
        default: return "💰"
        }
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text(icon)
                    .font(.title2)
                VStack(alignment: .leading) {
                    Text(expense.category ?? "")
                        .font(.headline)
                    Text(expense.date ?? Date(), style: .date)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing) {
                    Text("-$\(expense.amount, specifier: "%.2f")")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.red)
                    Text(expense.paymentMethod ?? "")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            if let notes = expense.notes, !notes.isEmpty {
                HStack {
                    Text("📝")
                        .font(.caption)
                    Text(notes)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
            
            if expense.isFixed {
                HStack {
                    Text("🔄")
                        .font(.caption)
                    Text("Fixed Expense")
                        .font(.caption)
                        .foregroundColor(.blue)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
}

struct AddExpenseView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var amount: String = ""
    @State private var category: String = ""
    @State private var isFixed: Bool = false
    @State private var notes: String = ""
    @State private var paymentMethod: String = "Card"
    @State private var date = Date()
    
    let paymentMethods = ["Card", "Cash", "Bank Transfer", "AMEX"]
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
                
                Section(header: Text("Details").textCase(.uppercase)) {
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { category in
                            HStack {
                                Text(categoryIcon(category))
                                Text(category)
                            }.tag(category)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    
                    Picker("Payment Method", selection: $paymentMethod) {
                        ForEach(paymentMethods, id: \.self) { method in
                            Text(method).tag(method)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
                
                Section(header: Text("Type").textCase(.uppercase)) {
                    Toggle("Fixed Expense", isOn: $isFixed)
                }
                
                Section(header: Text("Notes").textCase(.uppercase)) {
                    TextField("Add notes", text: $notes)
                }
            }
            .navigationTitle("New Expense")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveExpense()
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
    
    private func saveExpense() {
        guard let amountDouble = Double(amount), !category.isEmpty else { return }
        
        withAnimation {
            let newExpense = Expense(context: viewContext)
            newExpense.id = UUID()
            newExpense.amount = amountDouble
            newExpense.category = category
            newExpense.date = date
            newExpense.isFixed = isFixed
            newExpense.notes = notes
            newExpense.paymentMethod = paymentMethod
            
            // Update AMEX card balance if payment method is AMEX
            if paymentMethod == "AMEX" {
                let request: NSFetchRequest<CreditCard> = CreditCard.fetchRequest()
                request.predicate = NSPredicate(format: "name == %@", "AMEX")
                
                do {
                    let cards = try viewContext.fetch(request)
                    if let amexCard = cards.first {
                        amexCard.currentBalance += amountDouble
                    }
                } catch {
                    print("Error fetching AMEX card: \(error)")
                }
            }
            
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
    ExpensesView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
} 
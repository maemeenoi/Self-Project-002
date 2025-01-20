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
    
    var body: some View {
        NavigationView {
            VStack {
                // Filter Picker
                Picker("Filter", selection: $selectedFilter) {
                    ForEach(ExpenseFilter.allCases, id: \.self) { filter in
                        Text(filter.rawValue).tag(filter)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Expenses List
                List {
                    ForEach(filteredExpenses) { expense in
                        ExpenseRow(expense: expense)
                    }
                    .onDelete(perform: deleteExpenses)
                }
            }
            .navigationTitle("Expenses")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddExpense = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddExpense) {
                AddExpenseView()
            }
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
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(expense.category ?? "")
                    .font(.headline)
                Text(expense.date ?? Date(), style: .date)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                if let notes = expense.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text("$\(expense.amount, specifier: "%.2f")")
                    .font(.headline)
                Text(expense.paymentMethod ?? "")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 5)
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
                Section(header: Text("Amount")) {
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                }
                
                Section(header: Text("Details")) {
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                    
                    Toggle("Fixed Expense", isOn: $isFixed)
                    
                    Picker("Payment Method", selection: $paymentMethod) {
                        ForEach(paymentMethods, id: \.self) { method in
                            Text(method).tag(method)
                        }
                    }
                    
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
                
                Section(header: Text("Notes")) {
                    TextField("Notes", text: $notes)
                }
            }
            .navigationTitle("Add Expense")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveExpense()
                }
            )
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
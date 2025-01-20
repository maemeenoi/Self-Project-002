import SwiftUI
import CoreData

struct RecurringExpensesView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \RecurringExpense.nextDueDate, ascending: true)],
        animation: .default)
    private var recurringExpenses: FetchedResults<RecurringExpense>
    
    @State private var showingAddExpense = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Upcoming Expenses Section
                    VStack(alignment: .leading, spacing: 15) {
                        Text("📅 Upcoming Expenses")
                            .font(.title3)
                            .bold()
                        
                        if recurringExpenses.isEmpty {
                            EmptyRecurringView()
                        } else {
                            ForEach(recurringExpenses) { expense in
                                RecurringExpenseCard(expense: expense)
                            }
                        }
                    }
                    .padding()
                    .background(Color(UIColor.systemBackground))
                    .cornerRadius(15)
                    .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                }
                .padding()
            }
            .navigationTitle("Recurring Expenses")
            .navigationBarItems(
                leading: Button("Done") {
                    dismiss()
                },
                trailing: Button(action: { showingAddExpense = true }) {
                    Image(systemName: "plus.circle.fill")
                }
            )
            .sheet(isPresented: $showingAddExpense) {
                AddRecurringExpenseView()
            }
        }
    }
}

struct RecurringExpenseCard: View {
    let expense: RecurringExpense
    @Environment(\.managedObjectContext) private var viewContext
    @State private var showingEditSheet = false
    
    var daysUntilDue: Int {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let dueDate = calendar.startOfDay(for: expense.nextDueDate ?? Date())
        return calendar.dateComponents([.day], from: today, to: dueDate).day ?? 0
    }
    
    var statusColor: Color {
        if daysUntilDue <= 0 { return .red }
        if daysUntilDue <= 3 { return .orange }
        return .green
    }
    
    var icon: String {
        switch expense.category?.lowercased() {
        case "food": return "🍽️"
        case "transport": return "🚗"
        case "entertainment": return "🎮"
        case "shopping": return "🛍️"
        case "bills": return "📱"
        case "rent": return "🏠"
        case "subscription": return "📺"
        default: return "💰"
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("\(icon) \(expense.name ?? "")")
                    .font(.headline)
                Spacer()
                Button(action: { showingEditSheet = true }) {
                    Image(systemName: "pencil.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Amount:")
                        .foregroundColor(.gray)
                    Text("$\(expense.amount, specifier: "%.2f")")
                        .bold()
                }
                
                HStack {
                    Text("Frequency:")
                        .foregroundColor(.gray)
                    Text(expense.frequency ?? "Monthly")
                }
                
                HStack {
                    Text("Next Due:")
                        .foregroundColor(.gray)
                    Text(expense.nextDueDate ?? Date(), style: .date)
                        .foregroundColor(statusColor)
                }
                
                if daysUntilDue <= 3 {
                    HStack {
                        Image(systemName: "exclamationmark.circle.fill")
                            .foregroundColor(statusColor)
                        Text(daysUntilDue <= 0 ? "Due today!" : "Due in \(daysUntilDue) days")
                            .foregroundColor(statusColor)
                            .bold()
                    }
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(statusColor.opacity(0.3), lineWidth: 1)
        )
        .sheet(isPresented: $showingEditSheet) {
            EditRecurringExpenseView(expense: expense)
        }
    }
}

struct EmptyRecurringView: View {
    var body: some View {
        VStack(spacing: 15) {
            Image(systemName: "calendar.badge.plus")
                .font(.system(size: 40))
                .foregroundColor(.blue)
            Text("No recurring expenses")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Add recurring bills, subscriptions, or other regular expenses")
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

struct AddRecurringExpenseView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var name = ""
    @State private var amount = ""
    @State private var category = "Bills"
    @State private var frequency = "Monthly"
    @State private var paymentMethod = "Card"
    @State private var startDate = Date()
    
    let categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Rent", "Subscription", "Other"]
    let frequencies = ["Daily", "Weekly", "Fortnightly", "Monthly", "Yearly"]
    let paymentMethods = ["Card", "Cash", "Bank Transfer", "AMEX"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Expense Details")) {
                    TextField("Name", text: $name)
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                }
                
                Section(header: Text("Category & Frequency")) {
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                    
                    Picker("Frequency", selection: $frequency) {
                        ForEach(frequencies, id: \.self) { frequency in
                            Text(frequency).tag(frequency)
                        }
                    }
                    
                    Picker("Payment Method", selection: $paymentMethod) {
                        ForEach(paymentMethods, id: \.self) { method in
                            Text(method).tag(method)
                        }
                    }
                }
                
                Section(header: Text("Start Date")) {
                    DatePicker("First Due Date", selection: $startDate, displayedComponents: .date)
                }
            }
            .navigationTitle("Add Recurring Expense")
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
        guard let amountDouble = Double(amount), !name.isEmpty else { return }
        
        RecurringExpenseManager.shared.createRecurringExpense(
            name: name,
            amount: amountDouble,
            category: category,
            frequency: frequency,
            paymentMethod: paymentMethod,
            startDate: startDate,
            in: viewContext
        )
        
        dismiss()
    }
}

struct EditRecurringExpenseView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    let expense: RecurringExpense
    
    @State private var name: String
    @State private var amount: String
    @State private var category: String
    @State private var frequency: String
    @State private var paymentMethod: String
    @State private var nextDueDate: Date
    
    let categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Rent", "Subscription", "Other"]
    let frequencies = ["Daily", "Weekly", "Fortnightly", "Monthly", "Yearly"]
    let paymentMethods = ["Card", "Cash", "Bank Transfer", "AMEX"]
    
    init(expense: RecurringExpense) {
        self.expense = expense
        _name = State(initialValue: expense.name ?? "")
        _amount = State(initialValue: String(expense.amount))
        _category = State(initialValue: expense.category ?? "Bills")
        _frequency = State(initialValue: expense.frequency ?? "Monthly")
        _paymentMethod = State(initialValue: expense.paymentMethod ?? "Card")
        _nextDueDate = State(initialValue: expense.nextDueDate ?? Date())
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Expense Details")) {
                    TextField("Name", text: $name)
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                }
                
                Section(header: Text("Category & Frequency")) {
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                    
                    Picker("Frequency", selection: $frequency) {
                        ForEach(frequencies, id: \.self) { frequency in
                            Text(frequency).tag(frequency)
                        }
                    }
                    
                    Picker("Payment Method", selection: $paymentMethod) {
                        ForEach(paymentMethods, id: \.self) { method in
                            Text(method).tag(method)
                        }
                    }
                }
                
                Section(header: Text("Next Due Date")) {
                    DatePicker("Next Due", selection: $nextDueDate, displayedComponents: .date)
                }
                
                Section {
                    Button("Delete Expense", role: .destructive) {
                        deleteExpense()
                    }
                }
            }
            .navigationTitle("Edit Recurring Expense")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    updateExpense()
                }
            )
        }
    }
    
    private func updateExpense() {
        guard let amountDouble = Double(amount) else { return }
        
        withAnimation {
            expense.name = name
            expense.amount = amountDouble
            expense.category = category
            expense.frequency = frequency
            expense.paymentMethod = paymentMethod
            expense.nextDueDate = nextDueDate
            
            do {
                try viewContext.save()
                dismiss()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    private func deleteExpense() {
        withAnimation {
            viewContext.delete(expense)
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
    RecurringExpensesView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
} 